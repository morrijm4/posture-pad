import Foundation
import MQTTNIO
import NIOCore

struct PostureSnapshot: Equatable {
    let deviceId: String?
    let label: String
    let displayLabel: String
    let isLive: Bool
    let updatedAt: Date
    let intensity: Double
}

final class PostureMQTTService {
    private let configuration: WidgetConfiguration
    private let client: MQTTClient
    private let listenerName = "posturepad-widget"
    private var isStarted = false

    var onSnapshot: ((PostureSnapshot) -> Void)?
    var onConnectionStateChange: ((Bool) -> Void)?

    init(configuration: WidgetConfiguration) {
        self.configuration = configuration

        let path = configuration.mqttURL.path.isEmpty ? "/" : configuration.mqttURL.path
        let port = configuration.mqttURL.port ?? (configuration.mqttURL.scheme == "wss" ? 8084 : 8080)
        let host = configuration.mqttURL.host ?? "localhost"

        self.client = MQTTClient(
            host: host,
            port: port,
            identifier: "posturepad-widget-\(UUID().uuidString)",
            eventLoopGroupProvider: .createNew,
            configuration: .init(
                userName: configuration.mqttUsername,
                password: configuration.mqttPassword,
                useSSL: configuration.mqttURL.scheme == "wss",
                useWebSockets: true,
                webSocketURLPath: path
            )
        )
    }

    deinit {
        try? client.syncShutdownGracefully()
    }

    func start() {
        guard !isStarted else {
            return
        }
        isStarted = true

        client.addPublishListener(named: listenerName) { [weak self] result in
            guard let self else {
                return
            }

            switch result {
            case .success(let publish):
                guard publish.topicName.matchesTopicFilter(self.configuration.topicFilter) else {
                    return
                }
                guard let snapshot = self.decodeSnapshot(topic: publish.topicName, payload: publish.payload) else {
                    return
                }
                self.onSnapshot?(snapshot)
            case .failure:
                self.onConnectionStateChange?(false)
            }
        }

        client.connect().whenComplete { [weak self] result in
            guard let self else {
                return
            }

            switch result {
            case .success:
                self.onConnectionStateChange?(true)
                let subscription = MQTTSubscribeInfo(topicFilter: self.configuration.topicFilter, qos: .atLeastOnce)
                self.client.subscribe(to: [subscription]).whenComplete { _ in }
            case .failure:
                self.onConnectionStateChange?(false)
            }
        }
    }

    private func decodeSnapshot(topic: String, payload: ByteBuffer) -> PostureSnapshot? {
        var payload = payload
        guard let jsonString = payload.readString(length: payload.readableBytes),
              let data = jsonString.data(using: .utf8),
              let object = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            return nil
        }

        let label = (object["posture"] as? String) ?? "unknown"
        let deviceId = Self.deviceId(fromTopic: topic)

        return PostureSnapshot(
            deviceId: deviceId,
            label: label,
            displayLabel: Self.displayLabel(for: label),
            isLive: label != "no_seated",
            updatedAt: Date(),
            intensity: Self.intensity(for: label)
        )
    }

    private static func displayLabel(for label: String) -> String {
        switch label {
        case "mega_slouching":
            return "Mega Slouching"
        case "slouching":
            return "Slouching"
        case "good":
            return "Good"
        case "no_seated":
            return "Not Seated"
        case "leaning_left":
            return "Leaning Left"
        case "leaning_right":
            return "Leaning Right"
        default:
            return "Waiting for posture data"
        }
    }

    private static func intensity(for label: String) -> Double {
        switch label {
        case "good":
            return 0.15
        case "leaning_left", "leaning_right":
            return 0.55
        case "slouching":
            return 0.82
        case "mega_slouching":
            return 1
        case "no_seated":
            return 0
        default:
            return 0.35
        }
    }

    private static func deviceId(fromTopic topic: String) -> String? {
        let segments = topic.split(separator: "/")
        guard segments.count >= 3, segments[0] == "devices" else {
            return nil
        }
        return String(segments[1])
    }
}

private extension String {
    func matchesTopicFilter(_ filter: String) -> Bool {
        let topicSegments = split(separator: "/")
        let filterSegments = filter.split(separator: "/")

        var topicIndex = 0
        var filterIndex = 0

        while filterIndex < filterSegments.count {
            let filterSegment = filterSegments[filterIndex]

            if filterSegment == "#" {
                return true
            }

            guard topicIndex < topicSegments.count else {
                return false
            }

            if filterSegment != "+" && filterSegment != topicSegments[topicIndex] {
                return false
            }

            topicIndex += 1
            filterIndex += 1
        }

        return topicIndex == topicSegments.count && filterIndex == filterSegments.count
    }
}
