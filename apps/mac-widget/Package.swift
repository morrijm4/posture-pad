// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "PosturePadWidget",
    platforms: [
        .macOS(.v14),
    ],
    products: [
        .executable(
            name: "PosturePadWidget",
            targets: ["PosturePadWidget"]
        ),
    ],
    dependencies: [
        .package(url: "https://github.com/swift-server-community/mqtt-nio.git", from: "2.13.0"),
    ],
    targets: [
        .executableTarget(
            name: "PosturePadWidget",
            dependencies: [
                .product(name: "MQTTNIO", package: "mqtt-nio"),
            ]
        ),
    ]
)
