// src/config/auth.js - Clean Custom Auth (No Amplify SDK)

// --- CONFIGURATION CONSTANTS (Must match your Cognito setup) ---
export const AUTH_CONFIG = {
    region: 'eu-west-2',
    userPoolId: 'eu-west-2_Xbm29eLke',
    userPoolWebClientId: 'nrck33p87u8mhi68nmjenk8g1',
    
    // 🛑 IMPORTANT: This domain must be created and linked to your User Pool.
    // The bash script will update this value.
    // src/config/auth.js (or wherever your domain is defined)
// Must match the prefix exactly: eu-west-2xbm29elke
    domain: 'kamaisuraksha1761408861.auth.eu-west-2.amazoncognito.com',
    
    // API Gateway endpoint for token exchange (used to save user data on first login)
    tokenExchangeEndpoint: 'https://jrzuzhs5t8.execute-api.eu-west-2.amazonaws.com/prod/v1/auth/callback',
    
    scope: ['openid', 'email', 'profile'],
    responseType: 'code',
};

// Utility to get the correct base URL for redirects
const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
        return window.location.origin;
    }
    return 'http://localhost:5173';
};

// Helper to decode a JWT token (e.g., ID Token)
const decodeToken = (token) => {
    if (!token) return null;
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Failed to decode token:", e);
        return null;
    }
};

const isTokenExpired = (token) => {
    const payload = decodeToken(token);
    if (!payload || !payload.exp) return true; 
    // Check expiration time (with a 60-second buffer for network latency)
    return Date.now() > (payload.exp * 1000) - 60000;
};


// ----------------------------------------------------
// 🔑 CORE AUTH FUNCTIONS
// ----------------------------------------------------

/**
 * Initiates the Cognito Hosted UI redirect for sign-in/sign-up.
 */
export const getLoginUrl = () => {
    const baseUrl = getBaseUrl();
    const params = new URLSearchParams({
        response_type: AUTH_CONFIG.responseType,
        client_id: AUTH_CONFIG.userPoolWebClientId,
        redirect_uri: `${baseUrl}/callback`,
        scope: AUTH_CONFIG.scope.join(' '),
        state: Math.random().toString(36).substring(2) // Recommended for security
    });
    
    const loginUrl = `https://${AUTH_CONFIG.domain}/oauth2/authorize?${params.toString()}`;
    console.log('🔗 Login URL:', loginUrl);
    return loginUrl;
};

/**
 * Redirects the user to the Cognito logout endpoint.
 */
export const logout = () => {
    const baseUrl = getBaseUrl();
    const params = new URLSearchParams({
        client_id: AUTH_CONFIG.userPoolWebClientId,
        logout_uri: `${baseUrl}/logout` // Cognito will redirect here after clearing session
    });
    
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('refresh_token');
    sessionStorage.removeItem('auth_code_pending'); 

    const logoutUrl = `https://${AUTH_CONFIG.domain}/logout?${params.toString()}`;
    window.location.href = logoutUrl;
};

/**
 * Exchanges the Authorization Code for tokens using your custom backend API.
 * This function is used by the Callback component.
 */
export const exchangeCodeForTokens = async (authCode, onboardingData = null) => {
    if (!authCode) throw new Error("Authorization code not provided.");
    
    // Your custom backend logic for data submission on first login
    let requestPayload = {};
    if (onboardingData) {
        // Prepare the user data for the backend API
        const processedFormData = { ...onboardingData };
        if (Array.isArray(processedFormData.gig_platform)) processedFormData.gig_platform = processedFormData.gig_platform.join(", ");
        
        // Remove transient/unnecessary data
        delete processedFormData.age;
        delete processedFormData.worker_id;
        processedFormData.admin = String(processedFormData.admin || false);
        
        requestPayload = processedFormData;
    }

    try {
        const requestBody = {
            code: authCode,
            redirect_uri: `${getBaseUrl()}/callback`, 
            client_id: AUTH_CONFIG.userPoolWebClientId,
            ...requestPayload, 
        };
        
        const response = await fetch(AUTH_CONFIG.tokenExchangeEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
             const errorText = await response.text();
             throw new Error(`Exchange failed with status ${response.status}. Response: ${errorText}`);
        }

        const tokens = await response.json(); 
        
        // Store tokens using your application's naming convention
        localStorage.setItem('id_token', tokens.id_token); 
        localStorage.setItem('access_token', tokens.access_token);
        localStorage.setItem('refresh_token', tokens.refresh_token); 
        
        return tokens;
        
    } catch (error) {
        console.error('Token Exchange/Data Save Error:', error.message);
        throw error;
    }
};

/**
 * Manually attempts to refresh the Access Token using the Cognito Token Endpoint.
 */
export const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) throw new Error("No refresh token available.");
    
    console.log("Attempting to refresh Access Token (Manual Fallback)...");
    
    try {
        const refreshResponse = await fetch(`https://${AUTH_CONFIG.domain}/oauth2/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                client_id: AUTH_CONFIG.userPoolWebClientId,
                refresh_token: refreshToken,
            }).toString(),
        });

        if (!refreshResponse.ok) throw new Error(`Token refresh failed: ${refreshResponse.status}.`);

        const newTokens = await refreshResponse.json();
        
        localStorage.setItem('access_token', newTokens.access_token);
        if (newTokens.id_token) localStorage.setItem('id_token', newTokens.id_token);

        return newTokens.access_token;
        
    } catch (error) {
        console.error("Critical Refresh Error:", error.message);
        throw error;
    }
};

/**
 * Retrieves a valid Access Token, refreshing it if expired.
 */
export const getValidAccessToken = async () => {
    let accessToken = localStorage.getItem('access_token');
    if (!accessToken) return null;

    if (isTokenExpired(accessToken)) {
        try {
            accessToken = await refreshAccessToken();
        } catch (error) {
            // Refresh failed, user must log in again
            return null; 
        }
    }
    return accessToken;
};