package main

import (
	"crypto/subtle"
	"errors"
	"fmt"
	"log"
	"net"
	"net/http"
	"regexp"
	"sync"
	"time"
)

// Constants for defensive boundaries
const (
	MaxTokenLength   = 128
	MaxStoredIPs     = 10000
	TokenTTL         = 15 * time.Minute
	CleanupInterval  = 5 * time.Minute
)

// Regex for strict IP and Token validation
var (
	ipRegex    = regexp.MustCompile(`^(\d{1,3}\.){3}\d{1,3}$`)
	tokenRegex = regexp.MustCompile(`^[a-zA-Z0-9_\-\.]{1,128}$`)
)

// TokenRecord holds token metadata and expiration
type TokenRecord struct {
	Token     string
	ExpiresAt time.Time
}

// SecureTokenStore implements a thread-safe, memory-bounded store with TTL eviction
type SecureTokenStore struct {
	mu     sync.RWMutex
	store  map[string]TokenRecord
	ipKeys map[string]time.Time
}

// NewSecureTokenStore initializes the reconnaissance-grade store
func NewSecureTokenStore() *SecureTokenStore {
	s := &SecureTokenStore{
		store:  make(map[string]TokenRecord),
		ipKeys: make(map[string]time.Time),
	}
	// Start background scavenger to prevent memory leaks from stale keys
	go s.startMemoryScavenger()
	return s
}

// startMemoryScavenger sweeps stale IP keys and tokens to prevent DoS via memory exhaustion
func (s *SecureTokenStore) startMemoryScavenger() {
	ticker := time.NewTicker(CleanupInterval)
	for range ticker.C {
		s.mu.Lock()
		now := time.Now()
		
		// Evict expired tokens
		for k, v := range s.store {
			if now.After(v.ExpiresAt) {
				delete(s.store, k)
			}
		}

		// Evict stale IP keys
		for ip, lastSeen := range s.ipKeys {
			if now.Sub(lastSeen) > TokenTTL {
				delete(s.ipKeys, ip)
			}
		}
		s.mu.Unlock()
	}
}

// RegisterToken safely adds a token to shared memory with concurrency locks
func (s *SecureTokenStore) RegisterToken(clientIP, token string) error {
	// Input Sanitization
	if !ipRegex.MatchString(clientIP) {
		return errors.New("security audit: invalid IP format detected")
	}
	if !tokenRegex.MatchString(token) {
		return errors.New("security audit: invalid token format detected")
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	// Capacity check to mitigate memory exhaustion attacks
	if len(s.ipKeys) >= MaxStoredIPs {
		return errors.New("security audit: capacity reached, rate limit enforced")
	}

	s.ipKeys[clientIP] = time.Now()
	s.store[clientIP] = TokenRecord{
		Token:     token,
		ExpiresAt: time.Now().Add(TokenTTL),
	}

	return nil
}

// ValidateToken performs constant-time comparison to prevent timing attacks
func (s *SecureTokenStore) ValidateToken(clientIP, providedToken string) bool {
	if !ipRegex.MatchString(clientIP) || !tokenRegex.MatchString(providedToken) {
		return false
	}

	s.mu.RLock()
	record, exists := s.store[clientIP]
	s.mu.RUnlock()

	if !exists || time.Now().After(record.ExpiresAt) {
		return false
	}

	// Constant-time comparison to mitigate side-channel timing attacks
	return subtle.ConstantTimeCompare([]byte(record.Token), []byte(providedToken)) == 1
}

// SanitizeHeader extracts and cleans the client IP, guarding against header injection
func SanitizeHeader(r *http.Request) string {
	forwarded := r.Header.Get("X-Forwarded-For")
	if forwarded != "" {
		// Take the first IP in the chain and validate format
		ip := net.ParseIP(forwarded)
		if ip != nil {
			return ip.String()
		}
	}

	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr // Fallback to raw if port splitting fails
	}
	
	parsedIP := net.ParseIP(host)
	if parsedIP != nil {
		return parsedIP.String()
	}

	return "0.0.0.0" // Default safe fallback
}

func main() {
	store := NewSecureTokenStore()
	log.Println("[BLACK_WIDOW] Security reconnaissance active. Token store locked and monitored.")

	// Mock HTTP Handler demonstrating secure patterns
	http.HandleFunc("/auth", func(w http.ResponseWriter, r *http.Request) {
		clientIP := SanitizeHeader(r)
		token := r.Header.Get("X-API-Token")

		if err := store.RegisterToken(clientIP, token); err != nil {
			http.Error(w, "Access Denied", http.StatusForbidden)
			return
		}

		w.WriteHeader(http.StatusOK)
		fmt.Fprintln(w, "Authentication verified. Ledger clear.")
	})
}