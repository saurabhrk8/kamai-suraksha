// src/components/LogoutCleanup.jsx - Complete File

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 

/**
 * Component to ensure the browser lands on the dashboard after any
 * external logout process (e.g., if Cognito redirects here).
 */
const LogoutCleanup = () => {
    const navigate = useNavigate(); 
    
    useEffect(() => {
        // Force an internal redirect back to the root path
        console.log("LogoutCleanup: Landing on cleanup route. Redirecting to Dashboard.");
        
        // This should always push the browser back to the root path
        // which will then trigger App.jsx/DashboardPage to render the public content.
        navigate('/', { replace: true });
    }, [navigate]);

    return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
            <h2>Signing You Out...</h2>
            <p>You are being securely signed out and redirected to the home page.</p>
        </div>
    );
};

export default LogoutCleanup;