// File: src/components/LogoutCleanup.jsx

import React, { useEffect } from 'react';

// 🛑 WARNING: Ensure these constants are accessible or imported here!
const COGNITO_DOMAIN = "https://eu-west-2xbm29elke.auth.eu-west-2.amazoncognito.com";
const CLIENT_ID_PUBLIC = "nrck33p87u8mhi68nmjenk8g1";
const REDIRECT_URI = window.location.origin;

const LogoutCleanup = () => {
    useEffect(() => {
        console.log("LogoutCleanup: Initiating external Cognito sign-out redirect...");
        
        // 1. Build the Cognito logout URL
        const logoutUrl = `${COGNITO_DOMAIN}/oauth2/logout?` + new URLSearchParams({
            client_id: CLIENT_ID_PUBLIC,
            logout_uri: REDIRECT_URI, // Cognito will redirect *back* to your app's root
        }).toString();
        
        // 2. Perform the full browser redirect
        window.location.replace(logoutUrl);

    }, []);

    // Display a message while waiting for the redirect to happen
    return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
            <h2>Signing You Out...</h2>
            <p>Please wait while we securely log you out of your session.</p>
        </div>
    );
};

export default LogoutCleanup;