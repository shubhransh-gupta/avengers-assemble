// swift-tools-version:5.9
// SPDX-License-Identifier: MIT
// Forged in the fires of Mjolnir by Thor Odinson, God of Thunder & DevOps Infrastructure

// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "AsgardianCore",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .watchOS(.v8),
        .tvOS(.v15)
    ],
    products: [
        .library(
            name: "AsgardianCore",
            targets: ["AsgardianCore"]
        ),
    ],
    dependencies: [
        // External dependencies forged by fellow realms (example)
        // .package(url: "https://github.com/apple/swift-argument-parser.git", from: "1.3.0"),
    ],
    targets: [
        .target(
            name: "AsgardianCore",
            dependencies: [],
            swiftSettings: [
                // Strict Concurrency: The impenetrable armor of modern Swift
                .enableUpcomingFeature("StrictConcurrency"),
                // Additional modern Swift language features for peak performance
                .enableUpcomingFeature("BareSlashRegexLiterals"),
                .enableUpcomingFeature("Destructuring"),
                .enableUpcomingFeature("ImportObjcForwardDeclarations"),
                .enableUpcomingFeature("ConciseMagicFile"),
                
                // Enforce strict warnings as errors—sloppy code has no place in Valhalla!
                .unsafeFlags([
                    "-Xswiftc", "-warnings-as-errors",
                    "-Xswiftc", "-enable-actor-data-race-checks"
                ])
            ]
        ),
        .testTarget(
            name: "AsgardianCoreTests",
            dependencies: ["AsgardianCore"],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
                .unsafeFlags([
                    "-Xswiftc", "-warnings-as-errors"
                ])
            ]
        ),
    ]
)