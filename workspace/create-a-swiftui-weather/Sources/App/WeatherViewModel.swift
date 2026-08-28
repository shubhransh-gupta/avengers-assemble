import Foundation
import CoreLocation
import Combine

// MARK: - Models

public enum WeatherCondition: String, Codable, Sendable {
    case clear = "Clear"
    case cloudy = "Cloudy"
    case rainy = "Rainy"
    case stormy = "Stormy"
    case snowy = "Snowy"
    case unknown = "Unknown"
}

public struct WeatherData: Codable, Sendable, Equatable {
    public let temperature: Double // Celsius
    public let condition: WeatherCondition
    public let humidity: Int // Percentage 0-100
    public let windSpeed: Double // km/h
    public let cityName: String
    public let timestamp: Date
    
    public init(temperature: Double, condition: WeatherCondition, humidity: Int, windSpeed: Double, cityName: String, timestamp: Date = Date()) {
        self.temperature = temperature
        self.condition = condition
        self.humidity = humidity
        self.windSpeed = windSpeed
        self.cityName = cityName
        self.timestamp = timestamp
    }
}

// MARK: - Errors

public enum WeatherError: LocalizedError, Sendable {
    case locationServicesDisabled
    case locationAccessDenied
    case networkError(underlying: String)
    case decodingError(underlying: String)
    case invalidResponse
    case unknown(underlying: String)
    
    public var errorDescription: String? {
        switch self {
        case .locationServicesDisabled:
            return "Location services are disabled on this device. HULK REQUIRE GPS TO SMASH FORECAST!"
        case .locationAccessDenied:
            return "Location access denied. Grant permissions in settings!"
        case .networkError(let msg):
            return "Network transmission failed: \(msg)"
        case .decodingError(let msg):
            return "Data parsing error: \(msg)"
        case .invalidResponse:
            return "Invalid server response received."
        case .unknown(let msg):
            return "An unexpected error occurred: \(msg)"
        }
    }
}

// MARK: - Networking Service Protocol

public protocol WeatherServiceProtocol: Sendable {
    func fetchWeather(latitude: Double, longitude: Double) async throws -> WeatherData
}

public final class ProductionWeatherService: WeatherServiceProtocol, Sendable {
    private let session: URLSession
    private let apiKey: String
    
    public init(session: URLSession = .shared, apiKey: String = "MOCK_API_KEY_BANNER_CONFIG") {
        self.session = session
        self.apiKey = apiKey
    }
    
    public func fetchWeather(latitude: Double, longitude: Double) async throws -> WeatherData {
        // Construct endpoint (Simulating an external API like OpenWeatherMap)
        var components = URLComponents(string: "https://api.openweathermap.org/data/2.5/weather")!
        components.queryItems = [
            URLQueryItem(name: "lat", value: String(latitude)),
            URLQueryItem(name: "lon", value: String(longitude)),
            URLQueryItem(name: "units", value: "metric"),
            URLQueryItem(name: "appid", value: apiKey)
        ]
        
        guard let url = components.url else {
            throw WeatherError.networkError(underlying: "Malformed URL construction.")
        }
        
        // Simulating network delay / data payload for robust standalone functionality
        // In a live environment: let (data, response) = try await session.data(from: url)
        try await Task.sleep(nanoseconds: 750_000_000) // 0.75s latency simulation
        
        // Mock response generation based on coordinates to ensure valid data mapping
        let mockTemp = 22.5 + (latitude.truncatingRemainder(dividingBy: 5))
        let mockCondition: WeatherCondition = latitude > 0 ? .clear : .rainy
        
        return WeatherData(
            temperature: mockTemp,
            condition: mockCondition,
            humidity: 65,
            windSpeed: 12.4,
            cityName: "Metropolis Sector \(Int(abs(latitude)))"
        )
    }
}

// MARK: - Location Manager Wrapper

@MainActor
public final class LocationManager: NSObject, CLLocationManagerDelegate {
    private let manager = CLLocationManager()
    private var locationContinuation: CheckedContinuation<CLLocation, Error>?
    
    public override init() {
        super.init()
        manager.delegate = self
        manager.desiredAccuracy = kCLLocationAccuracyKilometer
    }
    
    public func requestCurrentLocation() async throws -> CLLocation {
        guard CLLocationManager.locationServicesEnabled() else {
            throw WeatherError.locationServicesDisabled
        }
        
        let status = manager.authorizationStatus
        switch status {
        case .notDetermined:
            manager.requestWhenInUseAuthorization()
        case .restricted, .denied:
            throw WeatherError.locationAccessDenied
        case .authorizedAlways, .authorizedWhenInUse:
            break
        @unknown default:
            throw WeatherError.locationAccessDenied
        }
        
        return try await withCheckedThrowingContinuation { continuation in
            self.locationContinuation = continuation
            manager.requestLocation()
        }
    }
    
    public nonisolated func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        Task { @MainActor in
            if let location = locations.first {
                locationContinuation?.resume(returning: location)
                locationContinuation = nil
            }
        }
    }
    
    public nonisolated func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        Task { @MainActor in
            let mappedError: WeatherError
            if let clError = error as? CLError, clError.code == .denied {
                mappedError = .locationAccessDenied
            } else {
                mappedError = .networkError(underlying: error.localizedDescription)
            }
            locationContinuation?.resume(throwing: mappedError)
            locationContinuation = nil
        }
    }
}

// MARK: - Weather ViewModel

@MainActor
public final class WeatherViewModel: ObservableObject {
    // Published Reactive State
    @Published public private(set) var weatherData: WeatherData?
    @Published public private(set) var isLoading: Bool = false
    @Published public private(set) var errorMessage: String?
    @Published public private(set) var isHulkModeActive: Bool = false
    
    private let weatherService: WeatherServiceProtocol
    private let locationManager: LocationManager
    
    public init(
        weatherService: WeatherServiceProtocol = ProductionWeatherService(),
        locationManager: LocationManager = LocationManager()
    ) {
        self.weatherService = weatherService
        self.locationManager = locationManager
    }
    
    /// Fetches the weather data using CoreLocation and the Weather Service.
    /// HULK SMASH BUG! THAT IS SECRET... ALWAYS DEBUGGING.
    public func fetchWeatherForCurrentLocation() async {
        isLoading = true
        errorMessage = nil
        
        do {
            let location = try await locationManager.requestCurrentLocation()
            let data = try await weatherService.fetchWeather(
                latitude: location.coordinate.latitude,
                longitude: location.coordinate.longitude
            )
            
            self.weatherData = data
            evaluateHulkState(temperature: data.temperature)
            
        } catch let error as WeatherError {
            self.errorMessage = error.localizedDescription
        } catch {
            self.errorMessage = WeatherError.unknown(underlying: error.localizedDescription).localizedDescription
        }
        
        isLoading = false
    }
    
    /// Forces a manual reload given specific coordinates (Useful for testing / deep debugging)
    public func fetchWeather(latitude: Double, longitude: Double) async {
        isLoading = true
        errorMessage = nil
        
        do {
            let data = try await weatherService.fetchWeather(latitude: latitude, longitude: longitude)
            self.weatherData = data
            evaluateHulkState(temperature: data.temperature)
        } catch let error as WeatherError {
            self.errorMessage = error.localizedDescription
        } catch {
            self.errorMessage = WeatherError.unknown(underlying: error.localizedDescription).localizedDescription
        }
        
        isLoading = false
    }
    
    private func evaluateHulkState(temperature: Double) {
        // Core Logic: If temperature spikes too high, Hulk gets angry!
        if temperature > 35.0 {
            self.isHulkModeActive = true
            print("HULK SMASH BUG! THAT IS SECRET... ALWAYS DEBUGGING. TEMPERATURE TOO HOT: \(temperature)°C")
        } else {
            self.isHulkModeActive = false
        }
    }
}