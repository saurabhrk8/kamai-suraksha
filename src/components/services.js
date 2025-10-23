// services.js

// --- CONFIGURATION CONSTANTS ---
// Your API Gateway base URL (prod/v1 part)
export const API_BASE_URL = 'https://jrzuzhs5t8.execute-api.eu-west-2.amazonaws.com/prod/v1'; 
// Your React application's redirect URI
export const REDIRECT_URI = 'http://localhost:5173';
// Your Cognito App Client ID (Public client)
const CLIENT_ID_PUBLIC = 'nrck33p87u8mhi68nmjenk8g1';

// Endpoint for token exchange (POST)
const TOKEN_EXCHANGE_ENDPOINT = `${API_BASE_URL}/auth/callback`; 
// Endpoint for fetching user data (GET)
const USER_DATA_ENDPOINT = `${API_BASE_URL}/userdata`; 
// -------------------------------


// --- 1. Token Exchange Function ---
// This function is called immediately upon returning from Cognito with the 'code'.
// It must POST the code to your backend, which then exchanges it with Cognito.

export const exchangeCodeForTokens = async (authCode) => {
    try {
        const response = await fetch(TOKEN_EXCHANGE_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // API Gateway Authorization is NONE, so no token/key needed here
            },
            body: JSON.stringify({
                code: authCode,
                redirect_uri: REDIRECT_URI,
                client_id: CLIENT_ID_PUBLIC,
                // Add any other necessary data your Lambda expects here
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error during token exchange.' }));
            throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
        }

        const tokens = await response.json();
        // Tokens should contain: { id_token, access_token, refresh_token }
        
        return { success: true, tokens };

    } catch (error) {
        console.error("Token Exchange Service Error:", error);
        return { success: false, error };
    }
};


// --- 2. User Data Fetch Function ---
// This function is called after the tokens are successfully saved to check if the user is new.
// NOTE: This call MUST be protected by a Cognito Authorizer on the API Gateway.

export const fetchUserData = async () => {
    const accessToken = localStorage.getItem('access_token');

    if (!accessToken) {
        return { success: false, message: "No access token found." };
    }

    try {
        const response = await fetch(USER_DATA_ENDPOINT, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`, // The Access Token for API Gateway
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            // A 404/403/401 here likely means the user is new (data not in DB) 
            // or the token is bad. Handle a new user scenario.
            if (response.status === 404 || response.status === 403) {
                 return { success: false, isNewUser: true, message: "User data not found in DB." };
            }
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const userData = await response.json();
        
        return { success: true, userData };

    } catch (error) {
        console.error("Fetch User Data Service Error:", error);
        return { success: false, message: error.message };
    }
};

// --- End of services.js ---