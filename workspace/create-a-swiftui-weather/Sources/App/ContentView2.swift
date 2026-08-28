// Glassmorphic Weather Card Component with Accessibility
struct WeatherCardView: View {
    let weather: WeatherData
    
    var body: some View {
        VStack(spacing: 8) {
            Text(weather.time)
                .font(.subheadline)
                .accessibilityAddTraits(.isHeader)
            
            Image(systemName: weather.icon)
                .font(.title2)
                .accessibilityHidden(true) // Decorative icon; descriptive label handled by container
            
            Text("\(weather.temp)°")
                .font(.headline)
                .scaleEffect(1.0) // Respects Dynamic Type scaling when using standard text modifiers
        }
        .padding()
        .background(Color.glassBackground)
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(Color.glassBorder, lineWidth: 1)
        )
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(weather.time}, Forecast: \(weather.temp) degrees")
    }
}