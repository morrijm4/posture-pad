import Foundation

struct WidgetConfiguration {
    let mqttURL: URL
    let mqttUsername: String
    let mqttPassword: String
    let topicTemplate: String
    let preferredDeviceId: String?

    var topicFilter: String {
        if let preferredDeviceId, !preferredDeviceId.isEmpty {
            return topicTemplate.replacingOccurrences(of: "{deviceId}", with: preferredDeviceId)
        }
        return topicTemplate.replacingOccurrences(of: "{deviceId}", with: "+")
    }

    static func load() -> WidgetConfiguration? {
        let environment = WidgetEnvironment.load()

        guard let mqttURLString = environment["NEXT_PUBLIC_MQTT_WS_URL"],
              let mqttURL = URL(string: mqttURLString) else {
            return nil
        }

        let username = environment["NEXT_PUBLIC_MQTT_USERNAME"] ?? "mqtt-listener"
        let password = environment["MQTT_PWD"] ?? environment["NEXT_PUBLIC_MQTT_PASSWORD"] ?? ""

        guard !password.isEmpty else {
            return nil
        }

        return WidgetConfiguration(
            mqttURL: mqttURL,
            mqttUsername: username,
            mqttPassword: password,
            topicTemplate: environment["NEXT_PUBLIC_MQTT_TOPIC_TEMPLATE"] ?? "devices/{deviceId}/posture",
            preferredDeviceId: environment["POSTUREPAD_WIDGET_DEVICE_ID"]
        )
    }
}

enum WidgetEnvironment {
    static func load() -> [String: String] {
        var values = ProcessInfo.processInfo.environment

        for fileURL in candidateEnvFiles() {
            guard let contents = try? String(contentsOf: fileURL, encoding: .utf8) else {
                continue
            }

            for line in contents.split(separator: "\n", omittingEmptySubsequences: false) {
                let trimmed = line.trimmingCharacters(in: .whitespacesAndNewlines)
                if trimmed.isEmpty || trimmed.hasPrefix("#") {
                    continue
                }

                guard let separator = trimmed.firstIndex(of: "=") else {
                    continue
                }

                let key = String(trimmed[..<separator])
                let value = String(trimmed[trimmed.index(after: separator)...])

                if values[key] == nil {
                    values[key] = value
                }
            }
        }

        return values
    }

    private static func candidateEnvFiles() -> [URL] {
        let fileManager = FileManager.default
        var urls: [URL] = []

        let cwd = URL(fileURLWithPath: fileManager.currentDirectoryPath)
        urls.append(cwd.appendingPathComponent(".env.local"))
        urls.append(cwd.appendingPathComponent(".env"))

        var current = cwd
        for _ in 0..<6 {
            let packageURL = current.appendingPathComponent("package.json")
            if let contents = try? String(contentsOf: packageURL, encoding: .utf8),
               contents.contains("\"name\": \"posture-pad\"") {
                urls.append(current.appendingPathComponent(".env.local"))
                urls.append(current.appendingPathComponent(".env"))
                break
            }

            let parent = current.deletingLastPathComponent()
            if parent == current {
                break
            }
            current = parent
        }

        return urls
    }
}
