// src/config/auth.js - Production Ready for kamaisuraksha.com

export const AUTH_CONFIG = {
    region: 'eu-west-2',
    userPoolId: 'eu-west-2_Xbm29eLke',
    userPoolWebClientId: 'nrck33p87u8mhi68nmjenk8g1',
    
    // Updated to your specific Cognito Domain
    domain: 'kamaisuraksha1761408861.auth.eu-west-2.amazoncognito.com',
    
    // Your API Gateway endpoint
    tokenExchangeEndpoint: 'https://jrzuzhs5t8.execute-api.eu-west-2.amazonaws.com/prod/v1/auth/callback',
    
    scope: ['openid', 'email', 'profile'],
    responseType: 'code',
};

// HELPER: Ensures the redirect matches your current environment (Local or Prod)
const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
        // This will return https://kamaisuraksha.com in production
        return window.location.origin;
    }
    return 'https://kamaisuraksha.com'; 
};

const decodeToken = (token) => {
    if (!token) return null;
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(window.atob(base64));
    } catch (e) {
        return null;
    }
};

const isTokenExpired = (token) => {
    const payload = decodeToken(token);
    if (!payload || !payload.exp) return true; 
    return Date.now() > (payload.exp * 1000) - 60000;
};

// 🔑 CORE AUTH FUNCTIONS

export const getLoginUrl = () => {
    const baseUrl = getBaseUrl();
    const params = new URLSearchParams({
        response_type: AUTH_CONFIG.responseType,
        client_id: AUTH_CONFIG.userPoolWebClientId,
        redirect_uri: `${baseUrl}/callback`, // Must match Cognito Console EXACTLY
        scope: AUTH_CONFIG.scope.join(' '),
    });
    
    return `https://${AUTH_CONFIG.domain}/oauth2/authorize?${params.toString()}`;
};

export const logout = () => {
    const baseUrl = getBaseUrl();
    const params = new URLSearchParams({
        client_id: AUTH_CONFIG.userPoolWebClientId,
        logout_uri: `${baseUrl}/logout-cleanup` 
    });
    
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('refresh_token');

    window.location.href = `https://${AUTH_CONFIG.domain}/logout?${params.toString()}`;
};

export const exchangeCodeForTokens = async (authCode, onboardingData = null) => {
    if (!authCode) throw new Error("Code missing");
    
    const requestPayload = onboardingData ? { ...onboardingData } : {};
    
    try {
        const response = await fetch(AUTH_CONFIG.tokenExchangeEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({
                code: authCode,
                redirect_uri: `${getBaseUrl()}/callback`, 
                client_id: AUTH_CONFIG.userPoolWebClientId,
                ...requestPayload, 
            }),
        });

        if (!response.ok) throw new Error("Exchange failed");

        const tokens = await response.json(); 
        localStorage.setItem('id_token', tokens.id_token); 
        localStorage.setItem('access_token', tokens.access_token);
        localStorage.setItem('refresh_token', tokens.refresh_token); 
        return tokens;
    } catch (error) {
        throw error;
    }
};

export const getValidAccessToken = async () => {
    let accessToken = localStorage.getItem('access_token');
    if (!accessToken || isTokenExpired(accessToken)) {
        // Add refresh logic here if needed
        return null; 
    }
    return accessToken;
};