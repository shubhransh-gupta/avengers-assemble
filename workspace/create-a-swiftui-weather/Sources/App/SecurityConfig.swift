import Foundation
import Security

/// BLACK_WIDOW AUDIT: Enterprise-grade security configuration.
/// Ensures cryptographic segregation of secrets and strict payload sanitation.
public enum SecurityConfig {
    
    // MARK: - Keychain Constants
    private static let serviceName = "com.enterprise.weatherapp.credentials"
    private static let apiKeyAccount = "WeatherAPIKey"
    
    // MARK: - 1. Secure Storage (iOS Keychain)
    
    /**
     Retrieves the API key from the iOS Keychain. 
     Never store sensitive credentials in UserDefaults, plists, or plaintext memory.
     */
    public static var apiKey: String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: serviceName,
            kSecAttrAccount as String: apiKeyAccount,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]
        
        var dataTypeRef: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &dataTypeRef)
        
        guard status == errSecSuccess,
              let data = dataTypeRef as? Data,
              let key = String(data: data, encoding: .utf8) else {
            // Log securely without leaking operational telemetry
            print("[SECURITY WARNING]: Failed to retrieve API key from Keychain. Status: \(status)")
            return nil
        }
        
        return key
    }
    
    /**
     Provisions the API key directly into the secure enclave/Keychain.
     */
    @discardableResult
    public static func storeAPIKey(_ key: String) -> Bool {
        guard let data = key.data(using: .utf8) else { return false }
        
        // Remove existing item before updating to prevent collision vectors
        let deleteQuery: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: serviceName,
            kSecAttrAccount as String: apiKeyAccount
        ]
        SecItemDelete(deleteQuery as CFDictionary)
        
        let insertQuery: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: serviceName,
            kSecAttrAccount as String: apiKeyAccount,
            kSecValueData as String: data,
            kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
        ]
        
        let status = SecItemAdd(insertQuery as CFDictionary, nil)
        return status == errSecSuccess
    }

    // MARK: - 2. Input Sanitization & Injection Defense (OWASP Top 10 Mitigation)
    
    /**
     Sanitizes incoming weather payloads against injection attacks (XSS, Command Injection, SQLi vectors).
     Strips non-alphanumeric characters except for approved meteorological delimiters (., -, _, spaces).
     */
    public static func sanitizeWeatherPayload(_ input: String) -> String {
        // Define an explicit whitelist regex: alphanumeric, spaces, periods, hyphens, underscores.
        // Rejecting malicious payloads at the boundary layer.
        let allowedCharacterSet = CharacterSet.alphanumerics.union(CharacterSet(charactersIn: " .-_"))
        let strippedInput = input.unicodeScalars.filter { allowedCharacterSet.contains($0) }
        
        let sanitized = String(strippedInput)
        
        // Defensive check: Truncate excessively long strings to mitigate buffer overflow / DOS vectors
        let maxLength = 100
        if sanitized.count > maxLength {
            return String(sanitized.prefix(maxLength))
        }
        
        return sanitized
    }
}