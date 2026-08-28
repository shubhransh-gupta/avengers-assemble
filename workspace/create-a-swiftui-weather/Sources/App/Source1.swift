// Recommended adjustment for glass card labels
Text("\(temp)°")
    .font(.system(.title, design: .rounded))
    .fontWeight(.bold)
    .foregroundColor(.primary) // Automatically adapts for dark/light contrast
    .accessibilityLabel("Temperature: \(temp) degrees")