import AppKit
import Combine
import SwiftUI

final class WidgetWindowController: NSWindowController {
    private static let widgetSize = NSSize(width: 236, height: 78)
    private static let topInset: CGFloat = 6
    private let store: WidgetStateStore
    private var cancellables = Set<AnyCancellable>()

    init(store: WidgetStateStore) {
        self.store = store

        let panel = NSPanel(
            contentRect: NSRect(origin: .zero, size: Self.widgetSize),
            styleMask: [.borderless, .nonactivatingPanel],
            backing: .buffered,
            defer: false
        )

        panel.isOpaque = false
        panel.backgroundColor = .clear
        panel.hasShadow = false
        panel.hidesOnDeactivate = false
        panel.isFloatingPanel = true
        panel.level = .statusBar
        panel.collectionBehavior = [.canJoinAllSpaces, .fullScreenAuxiliary, .stationary]
        panel.ignoresMouseEvents = true
        panel.titleVisibility = .hidden
        panel.titlebarAppearsTransparent = true

        super.init(window: panel)

        let rootView = WidgetRootView()
            .environmentObject(store)
        panel.contentView = NSHostingView(rootView: rootView)

        store.$isEnabled
            .receive(on: RunLoop.main)
            .sink { [weak panel] isEnabled in
                if isEnabled {
                    panel?.orderFrontRegardless()
                } else {
                    panel?.orderOut(nil)
                }
            }
            .store(in: &cancellables)

        positionWindow()

        NotificationCenter.default.addObserver(
            self,
            selector: #selector(positionWindow),
            name: NSApplication.didChangeScreenParametersNotification,
            object: nil
        )
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    deinit {
        NotificationCenter.default.removeObserver(self)
    }

    @objc
    func positionWindow() {
        guard let screen = NSScreen.main ?? NSScreen.screens.first,
              let window else {
            return
        }

        let screenFrame = screen.frame
        let visibleFrame = screen.visibleFrame
        let windowSize = window.frame.size
        let x = screenFrame.midX - (windowSize.width / 2)
        let y = visibleFrame.maxY - windowSize.height - Self.topInset

        window.setFrameOrigin(NSPoint(x: x, y: y))
    }
}
