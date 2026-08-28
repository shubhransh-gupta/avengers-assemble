// SPDX-License-Identifier: MIT
// Forged by Thor Odinson, Master of DevOps & Package Manifests

import swift-tools-version:5.9

let package = Package(
    name: "AsgardianEngine",
    platforms: [
        .iOS(.v16),
        .macOS(.v13)
    ],
    products: [
        .library(
            name: "AsgardianEngine",
            targets: ["AsgardianEngine"]
        )
    ],
    dependencies: [
        // External realms brought under our divine banner
        .package(url: "https://github.com/apple/swift-docc-plugin", from: "1.3.0")
    ],
    targets: [
        .target(
            name: "AsgardianEngine",
            dependencies: [],
            swiftSettings: [
                // Strict compiler flags to banish weak code to Helheim
                .enableUpcomingFeature("StrictConcurrency"),
                .unsafeFlags([
                    "-Xfrontend", "-warn-concurrency",
                    "-Xfrontend", "-strict-memory-safety",
                    "-Werror", // Turn every warning into a crashing thunderbolt
                    "-enable-testing"
                ], .when(configuration: .debug)),
                .unsafeFlags([
                    "-O",
                    "-whole-module-optimization",
                    "-Werror"
                ], .when(configuration: .release))
            ]
        ),
        .testTarget(
            name: "AsgardianEngineTests",
            dependencies: ["AsgardianEngine"],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
                .unsafeFlags(["-Werror"])
            ]
        )
    ]
)