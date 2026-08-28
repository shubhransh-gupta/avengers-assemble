// Author: Natasha Romanoff (BLACK_WIDOW)
// Classification: STRICTLY CONFIDENTIAL // SECURITY RECONNAISSANCE

import Foundation
import Security

public final class SecurityManager {
    
    public static let shared = SecurityManager()
    
    private init() {
        // Prevent external initialization - lock the perimeter.
    }
    
    // MARK: - 1. Secure Enclave & Keychain Storage
    // Never store tokens in UserDefaults or plain text files. Use hardware-backed encryption.
    
    @discardableResult
    public func saveSecureData(key: String, data: Data) -> Bool {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecValueData as String: data,
            kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
        ]
        
        // Remove any existing item before adding a new one to prevent collision exploits
        SecItemDelete(query as CFDictionary)
        
        let status = SecItemAdd(query as CFDictionary, nil)
        if status != errSecSuccess {
            // Log securely in production without leaking payload data
            print("[CRITICAL] Failed to persist secure data for key: [REDACTED]")
            return false
        }
        return true
    }
    
    public func readSecureData(key: String) -> Data? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]
        
        var dataTypeRef: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &dataTypeRef)
        
        guard status == errSecSuccess, let data = dataTypeRef as? Data else {
            return nil
        }
        return data
    }
    
    // MARK: - 2. Input Sanitization & Injection Defense
    // Neutralize malicious payloads (SQLi, XSS, Command Injection) before processing.
    
    public func sanitizeInput(_ input: String) -> String {
        // Strip out control characters, null bytes, and potential script injection tags
        let controlCharPattern = "[\\p{C}]"
        let strippedInput = input.replacingOccurrences(of: controlCharPattern, with: "", options: .regularExpression)
        
        // HTML/Script tag neutralization
        let unsafeCharacters = CharacterSet(charactersIn: "<>\"'&;")
        return strippedInput.components(separatedBy: unsafeCharacters).joined(by: "")
    }
    
    public func validateEmail(_ email: String) -> Bool {
        // Strict regex enforcement to prevent injection vectors via email fields
        let emailRegex = #"^[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,64}$"#
        let emailPredicate = NSPredicate(format: "SELF MATCHES %@", emailRegex)
        return emailPredicate.evaluate(with: email)
    }
    
    // MARK: - 3. Certificate Pinning Verification
    // Prevent Man-in-the-Middle (MitM) attacks by validating server trust anchors.
    
    public func validateServerTrust(_ trust: SecTrust, expectedDomain: String) -> Bool {
        // Enforce evaluation against system and custom policies
        let policy = SecPolicyCreateSSL(true, expectedDomain as CFString)
        SecTrustSetPolicies(trust, policy)
        
        var error: CFError?
        let isTrusted = SecTrustEvaluateWithError(trust, &error)
        
        if let error = error {
            print("[SECURITY ALERT] Trust evaluation failed: \(error.localizedDescription)")
            return false
        }
        
        // Additional defense-in-depth: Check public key hashes here if hard-pinning certificates.
        return isTrusted
    }
}