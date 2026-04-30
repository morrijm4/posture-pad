import SwiftUI

struct WidgetRootView: View {
    @EnvironmentObject private var store: WidgetStateStore

    var body: some View {
        let state = store.state

        HStack(spacing: 0) {
            Text(state.displayLabel)
                .font(.system(size: 15, weight: .semibold, design: .rounded))
                .foregroundStyle(.white)
                .lineLimit(1)
        }
        .padding(.horizontal, 18)
        .padding(.vertical, 14)
        .frame(width: 220, height: 62)
        .background(
            ZStack {
                RoundedRectangle(cornerRadius: 24, style: .continuous)
                    .fill(Color.black.opacity(0.78))

                RoundedRectangle(cornerRadius: 24, style: .continuous)
                    .stroke(state.accentColor.opacity(0.88), lineWidth: 1.2)

                RoundedRectangle(cornerRadius: 24, style: .continuous)
                    .fill(
                        LinearGradient(
                            colors: [
                                state.accentColor.opacity(0.18),
                                Color.clear,
                            ],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
            }
        )
        .overlay(alignment: .top) {
            Capsule()
                .fill(state.accentColor.opacity(0.95))
                .frame(width: 52, height: 3)
                .blur(radius: 0.4)
                .offset(y: -1)
        }
        .padding(8)
        .compositingGroup()
        .shadow(color: Color.black.opacity(0.26), radius: 24, y: 10)
    }
}
