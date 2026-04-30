import Foundation
import SwiftUI

struct WidgetState: Decodable, Equatable {
    let deviceId: String?
    let label: String
    let displayLabel: String
    let isLive: Bool
    let updatedAt: Date
    let intensity: Double
    let edges: WidgetEdges
    let sensors: [String: Double]

    static let disconnected = WidgetState(
        deviceId: nil,
        label: "disconnected",
        displayLabel: "Waiting for posture data",
        isLive: false,
        updatedAt: .distantPast,
        intensity: 0,
        edges: .zero,
        sensors: [:]
    )

    var accentColor: Color {
        if !isLive {
            return Color.white.opacity(0.35)
        }
        return Color(rgb: Self.color(for: intensity))
    }

    var secondaryText: String {
        if !isLive {
            return "Bridge offline"
        }
        if let deviceId {
            return deviceId
        }
        return "Live posture"
    }

    private static func color(for intensity: Double) -> RGBColor {
        let clamped = max(0, min(1, intensity))
        let stops: [(position: Double, color: RGBColor)] = [
            (0.0, RGBColor(red: 34, green: 197, blue: 94)),
            (0.45, RGBColor(red: 59, green: 130, blue: 246)),
            (0.7, RGBColor(red: 250, green: 204, blue: 21)),
            (1.0, RGBColor(red: 239, green: 68, blue: 68)),
        ]

        var lower = stops[0]
        var upper = stops[stops.count - 1]

        for index in 0..<(stops.count - 1) {
            let current = stops[index]
            let next = stops[index + 1]
            if clamped >= current.position && clamped <= next.position {
                lower = current
                upper = next
                break
            }
        }

        let range = max(upper.position - lower.position, 0.0001)
        let progress = (clamped - lower.position) / range

        return RGBColor(
            red: Int(round(Double(lower.color.red) + Double(upper.color.red - lower.color.red) * progress)),
            green: Int(round(Double(lower.color.green) + Double(upper.color.green - lower.color.green) * progress)),
            blue: Int(round(Double(lower.color.blue) + Double(upper.color.blue - lower.color.blue) * progress))
        )
    }
}

struct WidgetEdges: Decodable, Equatable {
    let top: Double
    let bottom: Double
    let left: Double
    let right: Double

    static let zero = WidgetEdges(top: 0, bottom: 0, left: 0, right: 0)
}

struct RGBColor: Equatable {
    let red: Int
    let green: Int
    let blue: Int
}

extension Color {
    init(rgb: RGBColor, opacity: Double = 1) {
        self.init(
            .sRGB,
            red: Double(rgb.red) / 255,
            green: Double(rgb.green) / 255,
            blue: Double(rgb.blue) / 255,
            opacity: opacity
        )
    }
}
