// src/pages/Callback.jsx

import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// 🛑 REMOVED: import { useAuthContext } from '../hooks/useAuthContext'; 
// We are using props passed from App.jsx instead of a context hook.

// The Callback component now accepts all necessary functions as props
const Callback = ({ 
    exchangeCodeForTokens, 
    fetchUserData, 
    setIsLoggedIn, 
    setUserDataChecked, 
    handleSignOut,
    setAuthError,
    onboardingData // Used if you want to pass initial data to exchange, though null is safer
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Use the dummy INITIAL_ONBOARDING_DATA (or null) for the token-only exchange payload
    // Note: The exchangeCodeForTokens function already handles null/empty data correctly
    const DUMMY_INITIAL_DATA = { full_name: 'N/A', admin: false };

    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const authCode = urlParams.get('code');
        const error = urlParams.get('error');

        // 1. Handle Error from Cognito
        if (error) {
            console.error("Cognito Error:", error, urlParams.get('error_description'));
            setAuthError(`Login failed: ${urlParams.get('error_description') || error}`);
            navigate('/', { replace: true });
            return;
        }

        // 2. Handle successful code receipt
        if (authCode) {
            console.log("Callback: Code received. Starting token exchange and user check.");

            // Clear the code from the URL immediately (clean URL)
            if (window.history.replaceState) {
                const cleanUrl = window.location.origin + window.location.pathname;
                window.history.replaceState({}, '', cleanUrl);
            }
            
            const handleAuthFlow = async () => {
                // Exchange code for tokens (send DUMMY_INITIAL_DATA/null payload for token-only exchange)
                const exchangeResult = await exchangeCodeForTokens(null, authCode); 

                if (!exchangeResult.success) {
                    console.error("Callback: Token exchange failed.");
                    handleSignOut(); 
                    return;
                }
                
                // Tokens are now saved, isLoggedIn is true.
                setIsLoggedIn(true); 
                setUserDataChecked(true); 
                
                // Check if user has completed onboarding
                const fetchResult = await fetchUserData(exchangeResult.tokens.access_token);
                
                if (fetchResult.success) {
                    console.log("Callback: User data found. Navigating to Dashboard.");
                    navigate('/dashboard', { replace: true });
                } else {
                    console.log("Callback: New user. Navigating to Onboarding.");
                    // Save code for potential onboarding form submission
                    sessionStorage.setItem('auth_code_pending', authCode); 
                    navigate('/onboarding', { replace: true });
                }
            };
            
            handleAuthFlow();
            
        } else {
             // 3. No code, just an unexpected visit to /callback (e.g., direct navigation)
            console.warn("Callback: Visited without an authorization code.");
            // Only navigate away if we aren't already logged in and checking data
            if (!localStorage.getItem('access_token')) {
                navigate('/', { replace: true });
            }
        }
        
    }, [location, navigate, exchangeCodeForTokens, fetchUserData, handleSignOut, setIsLoggedIn, setUserDataChecked, setAuthError]); 

    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>Processing Login...</h2>
            <p>Please wait while we secure your session and check your profile status.</p>
        </div>
    );
};

export default Callback;