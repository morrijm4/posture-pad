import AppKit
import SwiftUI

@main
struct PosturePadWidgetApp: App {
    @NSApplicationDelegateAdaptor(AppDelegate.self) private var appDelegate

    var body: some Scene {
        Settings {
            EmptyView()
        }
    }
}

final class AppDelegate: NSObject, NSApplicationDelegate {
    private var windowController: WidgetWindowController?

    func applicationDidFinishLaunching(_ notification: Notification) {
        NSApp.setActivationPolicy(.accessory)

        let preferencesPath = WidgetStateStore.defaultPreferencesFilePath()
        let configuration = WidgetConfiguration.load()
        let store = WidgetStateStore(configuration: configuration, preferencesFilePath: preferencesPath)
        let controller = WidgetWindowController(store: store)
        controller.showWindow(self)
        controller.window?.orderFrontRegardless()
        controller.window?.setIsVisible(true)
        DispatchQueue.main.async {
            controller.positionWindow()
        }
        windowController = controller
    }
}
