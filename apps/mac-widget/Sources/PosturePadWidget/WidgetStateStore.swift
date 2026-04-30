import Foundation
import SwiftUI

@MainActor
final class WidgetStateStore: ObservableObject {
    @Published private(set) var state: WidgetState = .disconnected
    @Published private(set) var isEnabled = true

    private let preferencesFilePath: String
    private let mqttService: PostureMQTTService?
    private var timer: Timer?

    init(configuration: WidgetConfiguration?, preferencesFilePath: String) {
        self.preferencesFilePath = preferencesFilePath
        self.mqttService = configuration.map(PostureMQTTService.init)
        self.mqttService?.onSnapshot = { [weak self] snapshot in
            Task { @MainActor in
                self?.apply(snapshot: snapshot)
            }
        }
        self.mqttService?.onConnectionStateChange = { [weak self] isConnected in
            Task { @MainActor in
                self?.applyConnectionState(isConnected: isConnected)
            }
        }
        startPolling()
        self.mqttService?.start()
    }

    static func defaultPreferencesFilePath() -> String {
        let homeDirectory = FileManager.default.homeDirectoryForCurrentUser
        return homeDirectory
            .appendingPathComponent(".posturepad", isDirectory: true)
            .appendingPathComponent("widget-preferences.json", isDirectory: false)
            .path
    }

    private func startPolling() {
        loadState()
        let nextTimer = Timer.scheduledTimer(withTimeInterval: 0.25, repeats: true) { [weak self] _ in
            Task { @MainActor in
                self?.loadState()
            }
        }
        timer = nextTimer
        RunLoop.main.add(nextTimer, forMode: .common)
    }

    private func loadState() {
        loadPreferences()
    }

    private func loadPreferences() {
        let url = URL(fileURLWithPath: preferencesFilePath)

        guard let data = try? Data(contentsOf: url),
              let object = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let nextValue = object["enabled"] as? Bool else {
            if isEnabled != true {
                isEnabled = true
            }
            return
        }

        if isEnabled != nextValue {
            isEnabled = nextValue
        }
    }

    private func apply(snapshot: PostureSnapshot) {
        let nextState = WidgetState(
            deviceId: snapshot.deviceId,
            label: snapshot.label,
            displayLabel: snapshot.displayLabel,
            isLive: snapshot.isLive,
            updatedAt: snapshot.updatedAt,
            intensity: snapshot.intensity,
            edges: .zero,
            sensors: [:]
        )

        if nextState != state {
            withAnimation(.spring(response: 0.35, dampingFraction: 0.82)) {
                state = nextState
            }
        }
    }

    private func applyConnectionState(isConnected: Bool) {
        if isConnected {
            return
        }

        let nextState = WidgetState(
            deviceId: nil,
            label: "disconnected",
            displayLabel: "Waiting for posture data",
            isLive: false,
            updatedAt: Date(),
            intensity: 0,
            edges: .zero,
            sensors: [:]
        )

        if nextState != state {
            withAnimation(.spring(response: 0.35, dampingFraction: 0.82)) {
                state = nextState
            }
        }
    }
}
