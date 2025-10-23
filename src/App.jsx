import React, { useState, useEffect, useCallback } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";

// Components
import DashboardPage from "./components/DashboardPage.jsx";
import OnboardingForm from "./components/OnboardingForm.jsx";
import AdminDashboard from "./components/AdminDashboardPage.jsx";
import PartnerPage from "./components/NBFC_PartnerDashboard.jsx";
import MyApplicationsPage from "./components/MyApplicationsPage.jsx";
import LogoutCleanup from "./components/LogoutCleanup.jsx";

// ===============================================
// 🛑 CRITICAL: API and Cognito Setup 🛑
// ===============================================
const API_BASE_URL = 'https://jrzuzhs5t8.execute-api.eu-west-2.amazonaws.com/prod/v1';
const API_BASE_URL1 = 'https://jrzuzhs5t8.execute-api.eu-west-2.amazonaws.com/prod';
// Endpoint for code exchange + data save (NEW USER ONLY) - NO AUTHORIZATION HEADER
const TOKEN_EXCHANGE_ENDPOINT = `${API_BASE_URL}/auth/callback`; 
// Endpoint for GET (read data) and POST (update existing data) - REQUIRES AUTHORIZATION HEADER
const USER_DATA_ENDPOINT = `${API_BASE_URL1}/userdata`; 
// 🌟 ENDPOINT: Secured by Cognito Authorizer for POST (Save) and GET (History)
const LOAN_APPLICATION_ENDPOINT = `${API_BASE_URL1}/loanapplication`; 

const CLIENT_ID_PUBLIC = "nrck33p87u8mhi68nmjenk8g1";
const COGNITO_DOMAIN = "https://eu-west-2xbm29elke.auth.eu-west-2.amazoncognito.com";
const REDIRECT_URI = window.location.origin;

const INITIAL_ONBOARDING_DATA = {
    // ... existing fields
    full_name: '', age: '', phone_number: '', email_id: '',
    dob: '', gender: '', address: '', city: '',
    aadhaar_number: '', pan_number: '', gig_platform: [],
    work_type: '', work_tenure_months: '', monthly_income: '',
    bank_account_linked: '',
    worker_id: '',
    // Default value for the admin field
    admin: false
};

// ===============================================
// 🔑 UTILITY FUNCTIONS (Unchanged)
// ===============================================
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
    const expirationTimeInSeconds = payload.exp * 1000;
    const currentTimeInSeconds = Date.now(); 
    return currentTimeInSeconds > expirationTimeInSeconds - 60000;
};

const refreshAccessToken = async (refreshToken, setSessionTokens) => {
    console.log("Attempting to refresh Access Token...");
    
    try {
        const refreshResponse = await fetch(`${COGNITO_DOMAIN}/oauth2/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                client_id: CLIENT_ID_PUBLIC,
                refresh_token: refreshToken,
            }).toString(),
        });

        if (!refreshResponse.ok) throw new Error(`Token refresh failed: ${refreshResponse.status}.`);

        const newTokens = await refreshResponse.json();
        localStorage.setItem('access_token', newTokens.access_token);
        if (newTokens.id_token) localStorage.setItem('id_token', newTokens.id_token);

        setSessionTokens(prev => ({
            ...prev,
            id_token: newTokens.id_token || prev.id_token,
            access_token: newTokens.access_token,
        }));
        return newTokens.access_token;
        
    } catch (error) {
        console.error("Critical Refresh Error:", error.message);
        throw error;
    }
};

const performCognitoRedirect = (clientId, cognitoDomain, redirectUri) => {
    sessionStorage.removeItem('exchangeAttempted'); 
    sessionStorage.removeItem('auth_code_pending'); 
    
    const authUrl = `${cognitoDomain}/oauth2/authorize?` + new URLSearchParams({
        response_type: 'code',
        client_id: clientId, 
        redirect_uri: redirectUri,
        scope: 'openid email phone', 
        state: 'some_random_state_value' 
    }).toString();
    
    console.log("Initiating External Redirect:", authUrl);
    window.location.replace(authUrl); 
};


// --- Main Application Component ---
export default function App() {
    const navigate = useNavigate();
    
    // 1. STATE INITIALIZATION
    const initialAccessToken = localStorage.getItem('access_token');
    const initialRefreshToken = localStorage.getItem('refresh_token');
    const hasInitialTokens = !!(initialAccessToken && initialRefreshToken);
    
    const [isLoggedIn, setIsLoggedIn] = useState(hasInitialTokens); 
    const [userDataChecked, setUserDataChecked] = useState(false); 
    
    const [sessionTokens, setSessionTokens] = useState({ 
        id_token: localStorage.getItem('id_token'), 
        access_token: initialAccessToken, 
        refresh_token: initialRefreshToken 
    }); 
    const [authError, setAuthError] = useState(null);
    const [exchangeAttempted, setExchangeAttempted] = useState(false); 
    const [applications, setApplications] = useState([]); // State to hold application history
    const [onboardingData, setOnboardingData] = useState(INITIAL_ONBOARDING_DATA);
    const [userScore, setUserScore] = useState(0);
    const [isAdmin, setIsAdmin] = useState(false);


    // LOGOUT HANDLER
    const handleSignOut = useCallback(() => {
        console.log("--- LOGOUT TRIGGERED ---"); 
        localStorage.removeItem('id_token');
        localStorage.removeItem('access_token'); 
        localStorage.removeItem('refresh_token'); 
        sessionStorage.removeItem('auth_code_pending'); 
        sessionStorage.removeItem('exchangeAttempted'); 
        
        setIsLoggedIn(false); 
        setUserDataChecked(false); 
        setSessionTokens({ id_token: null, access_token: null, refresh_token: null });
        setExchangeAttempted(false);
        setUserScore(0);
        setIsAdmin(false); 
        setOnboardingData(INITIAL_ONBOARDING_DATA); 
        setApplications([]); // Clear applications on logout

        window.location.replace(`${COGNITO_DOMAIN}/logout?client_id=${CLIENT_ID_PUBLIC}&logout_uri=${window.location.origin}`);

    }, []); 

    // Helper to get the correct token
    const getValidAccessToken = useCallback(async () => {
        let accessToken = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (!accessToken) return null;

        if (isTokenExpired(accessToken)) {
            if (!refreshToken) return null; 
            try {
                accessToken = await refreshAccessToken(refreshToken, setSessionTokens);
            } catch (error) {
                return null; 
            }
        }
        return accessToken;
    }, [setSessionTokens]);


    // CORE: fetchUserData (GET) 
    const fetchUserData = useCallback(async (token = null) => {
        console.log("--- fetchUserData: STARTED ---"); 
        let validToken = token;
        let isUserFound = false; 

        if (!validToken) validToken = await getValidAccessToken();
        if (!validToken) {
            console.error("fetchUserData: ABORTED. No token available."); 
            return { success: false, data: null };
        }
        
        try {
            const response = await fetch(USER_DATA_ENDPOINT, {
                method: 'GET',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${validToken}` // Secured by token
                },
                mode: 'cors',
            });
            
            if (response.ok) {
                const data = await response.json();
                
                // Read admin status from the backend, handling string or boolean storage
                const isAdminUser = (data.admin === true || data.Admin === true || data.admin === "true" || data.Admin === "true");
                setIsAdmin(isAdminUser); // Update state for conditional rendering
                
                const hasCompletedOnboarding = data.full_name && 
                                               data.full_name.trim() !== "" &&
                                               data.full_name.toLowerCase() !== "n/a";
                
                if (data.user_id) { 
                    isUserFound = hasCompletedOnboarding; 
                }
                
                const score = parseInt(data.ConfidenceScore || data.confidence_score || 0); 
                setUserScore(score);

                if (data.user_id) { 
                    const cleanValue = (val) => (val && val !== "N/A" && val.trim() !== "") ? val : '';
                    
                    const loadedData = {
                        full_name: cleanValue(data.full_name),
                        age: '', 
                        phone_number: cleanValue(data.phone_number),
                        email_id: cleanValue(data.email_id),
                        dob: cleanValue(data.dob),
                        gender: cleanValue(data.gender),
                        address: cleanValue(data.address),
                        city: cleanValue(data.city),
                        aadhaar_number: cleanValue(data.aadhaar_number),
                        pan_number: cleanValue(data.pan_number),
                        gig_platform: cleanValue(data.gig_platform) ? cleanValue(data.gig_platform).split(',').map(s => s.trim()) : [], 
                        work_type: cleanValue(data.work_type),
                        work_tenure_months: cleanValue(data.work_tenure_months),
                        monthly_income: cleanValue(data.monthly_income),
                        bank_account_linked: cleanValue(data.bank_account_linked),
                        worker_id: data.user_id || '',
                        // Load the admin status back as a boolean
                        admin: isAdminUser,
                        // 🌟 Ensure confidence_score is saved to onboardingData for display in modal
                        confidence_score: score.toString() 
                    };
                    setOnboardingData(prev => ({ ...prev, ...loadedData }));
                }
                
                return { success: isUserFound, data: data }; 

            } else {
                const errorBody = await response.text();
                console.warn(`Failed to fetch user data: HTTP Status ${response.status}`, errorBody);
                if (response.status === 401 || response.status === 403) handleSignOut(); 
                setIsAdmin(false); 
                return { success: false, data: null };
            }

        } catch (error) {
            console.error('Network Error fetching user data:', error);
            setAuthError(`Network Error during ${USER_DATA_ENDPOINT} call.`);
            setIsAdmin(false);
            return { success: false, data: null };
        }
    }, [getValidAccessToken, setOnboardingData, setAuthError, handleSignOut, setUserScore]);


    // CORE FUNCTION: exchangeCodeForTokens 
    const exchangeCodeForTokens = useCallback(async (formData, authCode) => {
        if (sessionStorage.getItem('exchangeAttempted') === 'true' || !authCode) {
            console.warn("Exchange attempt blocked: already attempted or no code provided.");
            return { success: false, tokens: null, workerId: null };
        }
        
        sessionStorage.setItem('exchangeAttempted', 'true');
        setExchangeAttempted(true);
        
        // 1. Determine if this is an actual data submission or just token-only exchange
        const isDataSubmission = Object.entries(formData).some(([key, value]) => 
            key !== 'worker_id' && (Array.isArray(value) ? value.length > 0 : (typeof value === 'string' && value.trim() !== ''))
        );
        
        let requestPayload = {};

        if (isDataSubmission) {
            // Case 1: Final submission with form data (backend will save)
            const processedFormData = { ...formData };
            if (Array.isArray(processedFormData.gig_platform)) processedFormData.gig_platform = processedFormData.gig_platform.join(", ");
            delete processedFormData.age;
            delete processedFormData.worker_id;

            // *** CRITICAL FIX: Convert the boolean 'admin' to a string for the Java backend ***
            processedFormData.admin = String(processedFormData.admin || false);
            
            requestPayload = processedFormData;
            console.log("Exchange: Final data submission payload (New User).");
        } else {
            // Case 2: Token-only exchange on redirect (NEW USER initial login).
            // Request payload MUST BE EMPTY so backend skips saving empty data, 
            // preventing the table from being emptied (the regression fix).
            requestPayload = {}; 
            console.log("Exchange: Token-only payload. Backend should skip data save.");
        }

        try {
            const requestBody = {
                code: authCode,
                redirect_uri: REDIRECT_URI,
                client_id: CLIENT_ID_PUBLIC,
                ...requestPayload, 
            };
            
            console.log("--- exchangeCodeForTokens: REQUEST BODY ---", JSON.stringify(requestBody, null, 2));

            const response = await fetch(TOKEN_EXCHANGE_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }, // NO Authorization header
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) throw new Error(`Exchange failed with status ${response.status}. Response: ${await response.text()}`);

            const tokens = await response.json(); 
            const decodedIdToken = decodeToken(tokens.id_token);
            const workerId = decodedIdToken ? decodedIdToken.sub : null;
            
            if (!workerId) throw new Error("Failed to extract unique user ID from the ID token.");

            localStorage.setItem('id_token', tokens.id_token); 
            localStorage.setItem('access_token', tokens.access_token);
            localStorage.setItem('refresh_token', tokens.refresh_token); 
            
            setSessionTokens({ id_token: tokens.id_token, access_token: tokens.access_token, refresh_token: tokens.refresh_token });
            setIsLoggedIn(true); 

            sessionStorage.removeItem('exchangeAttempted');
            sessionStorage.removeItem('auth_code_pending'); 
            setExchangeAttempted(false);
            setAuthError(null);
            
            return { success: true, tokens, workerId };
            
        } catch (error) {
            console.error('Token Exchange/Data Save Error:', error.message);
            setAuthError(`Authentication Error: ${error.message}`);
            
            sessionStorage.removeItem('exchangeAttempted');
            setExchangeAttempted(false);
            
            return { success: false, tokens: null, workerId: null, error: error.message };
        }
    }, [setAuthError, setSessionTokens, setIsLoggedIn]); 

    
    // 🔑 FIXED CORE FUNCTION: handleOnboardingComplete 
    const handleOnboardingComplete = useCallback(async () => {
        const authCode = sessionStorage.getItem('auth_code_pending');
        
        // 🔑 CASE 1: New User/First Submission (Use /auth/callback with code)
        if (authCode) {
            console.log("SUBMISSION: CASE 1 - New user with pending code. Exchanging code and saving data via auth/callback.");
            // exchangeCodeForTokens will correctly process the filled form data and convert 'admin' to string.
            const result = await exchangeCodeForTokens(onboardingData, authCode); 
            
            if (result.success) {
                 setUserDataChecked(false); 
                 navigate('/dashboard', { replace: true });
            } else {
                alert(`Failed to save data: ${result.error || "Please check your details and try again."}`);
            }
            return;
        }

        // 🔑 CASE 2: Existing User Update (Use /userdata POST with Authorization header)
        if (isLoggedIn) {
            console.log("SUBMISSION: CASE 2 - Existing user. Updating data only via /userdata POST.");
            
            const validToken = await getValidAccessToken();
            if (!validToken) {
                 alert("Session expired. Please log in again to update your data.");
                 handleSignOut();
                 return;
            }
            
            try {
                // Prepare form data for POST request
                const processedFormData = { ...onboardingData };
                if (Array.isArray(processedFormData.gig_platform)) processedFormData.gig_platform = processedFormData.gig_platform.join(", ");
                delete processedFormData.age; // Remove client-only field
                
                // Explicitly ensure the current admin status is included in the update payload
                processedFormData.admin = processedFormData.admin || false; 
                
                // 👇 CRITICAL FIX: Convert the boolean 'admin' to a string for the Java backend
                processedFormData.admin = String(processedFormData.admin); 
                
                const finalBody = { ...processedFormData };
                if (finalBody.worker_id) {
                     finalBody.UserID = finalBody.worker_id; 
                     delete finalBody.worker_id;
                }
                
                // POST to the dedicated USER_DATA_ENDPOINT, secured by the token
                const response = await fetch(USER_DATA_ENDPOINT, {
                    method: 'POST', 
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${validToken}` 
                    },
                    body: JSON.stringify(finalBody),
                });

                if (response.ok) {
                    console.log("SUBMISSION: Data updated successfully via /userdata POST.");
                    setUserDataChecked(false); 
                    navigate('/dashboard', { replace: true });
                } else {
                    const errorBody = await response.text();
                    throw new Error(`Update failed: HTTP Status ${response.status}. Backend response: ${errorBody}`);
                }

            } catch (error) {
                console.error('Data Update Error (Userdata POST):', error.message);
                alert(`Failed to update data: ${error.message}`);
            }
            return;
        }

        alert("Session error. Please log in again.");
        handleSignOut();

    }, [onboardingData, navigate, exchangeCodeForTokens, setUserDataChecked, isLoggedIn, getValidAccessToken, handleSignOut]);


    // AUTHENTICATION HANDLER
    const handleSignIn = () => {
        setUserDataChecked(false); 
        performCognitoRedirect(CLIENT_ID_PUBLIC, COGNITO_DOMAIN, REDIRECT_URI);
    };

    const openSignUpModal = handleSignIn;
    
    // CORE useEffect: Handles Login/Redirect Flow 
    useEffect(() => {
        const hasTokens = !!(localStorage.getItem('access_token') && localStorage.getItem('refresh_token'));
        const urlParams = new URLSearchParams(window.location.search);
        const authCode = urlParams.get('code');
        const isExchanging = sessionStorage.getItem('exchangeAttempted') === 'true'; 

        const handleAuthFlow = async () => {
            
            // 1. User returns from Cognito with code (Flow A - IMMEDIATE EXCHANGE)
            if (authCode && !isExchanging) {
                console.log("FLOW A (CODE FOUND): Initiating immediate token exchange (token-only).");

                // Clear the code from the URL first
                if (window.history.replaceState) {
                    const cleanUrl = window.location.origin + window.location.pathname;
                    window.history.replaceState({}, '', cleanUrl);
                }
                
                // Save code for potential onboarding form submission
                sessionStorage.setItem('auth_code_pending', authCode);
                
                // exchangeCodeForTokens will send an empty payload and skip data save (FIXED)
                const result = await exchangeCodeForTokens(INITIAL_ONBOARDING_DATA, authCode); 
                
                if (!result.success) {
                    console.error("FLOW A: Immediate Token exchange failed. Cannot proceed.");
                    handleSignOut(); 
                    return;
                }
                
                // Tokens are now saved, isLoggedIn is true.
            } 
            
            // 2. Existing Tokens found on page load/refresh (Flow A-Sub)
            if (hasTokens && !isLoggedIn) {
                console.log("FLOW A-Sub: Tokens found locally, setting isLoggedIn=true.");
                setIsLoggedIn(true);
            }
            
            // 3. Logged in and user data hasn't been checked yet (Flow B - Scenarios 1 & 2)
            if (isLoggedIn && !userDataChecked) { 
                console.log("FLOW B: Logged in, checking user data and determining navigation.");
                
                setUserDataChecked(true); 
                
                const fetchResult = await fetchUserData(); 
                
                if (fetchResult.success) {
                    // Scenario 1: Data found (Existing User)
                    console.log("FLOW B: Data found. Navigating to Dashboard.");
                    navigate('/dashboard', { replace: true });
                } else {
                    // Scenario 2: No meaningful data found (New User or Incomplete)
                    console.log("FLOW B: No meaningful data found. Navigating to Onboarding.");
                    if(authCode) sessionStorage.setItem('auth_code_pending', authCode); 
                    navigate('/onboarding', { replace: true });
                }
            }
        };
        
        if (!isExchanging) {
            handleAuthFlow();
        }
        
    }, [navigate, fetchUserData, exchangeCodeForTokens, isLoggedIn, setUserDataChecked, userDataChecked, handleSignOut]); 
    
    
    // 🌟 NEW FUNCTION: Fetch the user's loan application history
    const fetchApplicationsHistory = useCallback(async () => {
        if (!isLoggedIn) return;
        
        const validToken = await getValidAccessToken();
        if (!validToken) {
            console.warn("fetchApplicationsHistory: No valid token. Skipping fetch.");
            return;
        }

        try {
            console.log("Fetching loan application history...");
            const response = await fetch(LOAN_APPLICATION_ENDPOINT, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${validToken}` // Secured by token
                },
                mode: 'cors',
            });

            if (response.ok) {
                const data = await response.json();
                setApplications(data); // Update the applications state
                console.log("Application history loaded successfully:", data.length, "items.");
            } else {
                console.error(`Failed to fetch applications: HTTP Status ${response.status}. Response: ${await response.text()}`);
                setApplications([]);
            }
        } catch (error) {
            console.error('Network Error fetching applications:', error);
            setApplications([]);
        }
    }, [isLoggedIn, getValidAccessToken]);
    
    
    // 🌟 New useEffect: Trigger application history fetch on login
    useEffect(() => {
        if (isLoggedIn) {
            fetchApplicationsHistory();
        }
    }, [isLoggedIn, fetchApplicationsHistory]);


    // 🌟 UPDATED FUNCTION: Handle loan application submission (Save in background and return link)
    const handleApply = useCallback(async (offerDetails) => {
        if (!isLoggedIn) {
            alert("Please log in before applying for a loan.");
            return { success: false, error: "Not logged in" };
        }
        
        const validToken = await getValidAccessToken();
        if (!validToken) {
            alert("Session expired. Please log in again to submit your application.");
            handleSignOut();
            return { success: false, error: "Session expired" };
        }
        
        try {
            // Prepare the payload based on the offerDetails structure
            const applicationPayload = {
                // Fields mapped to your Java Lambda request and DynamoDB model:
                
                // 🚨 CRITICAL FIX: Use 'offerDetails.title' for both the backend partner field 
                // and the UI loan name field to ensure the name is saved correctly.
                nbfc_partner: offerDetails.title, 
                loan_amount: String(offerDetails.loanAmount), 
                interest_rate: String(offerDetails.interestRate),
                tenure_months: String(offerDetails.tenureMonths),
                status: "Pending", 
                
                // Additional fields for MyApplicationsPage UI:
                loanName: offerDetails.title, // Use title here so the card and modal can both access it.
                requestedAmount: String(offerDetails.loanAmount),
                date: new Date().toISOString(), 
            };

            console.log("Submitting loan application in background:", applicationPayload);

            const response = await fetch(LOAN_APPLICATION_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${validToken}` // REQUIRED: Secured by token
                },
                body: JSON.stringify(applicationPayload),
            });

            if (response.ok) {
                console.log("Loan application saved successfully. Preparing for redirect.");
                // Refresh the application list to show the new submission
                fetchApplicationsHistory(); 
                
                // 🚨 KEY CHANGE: Return success and the public link
                return { success: true, publicLink: offerDetails.publicLink };
                
            } else {
                const errorBody = await response.text();
                throw new Error(`Submission failed: HTTP Status ${response.status}. Backend response: ${errorBody}`);
            }

        } catch (error) {
            console.error('Loan Application Error (POST):', error.message);
            // Don't alert here, let DashboardPage handle the final message after the save attempt
            return { success: false, error: error.message };
        }
        
    }, [isLoggedIn, getValidAccessToken, handleSignOut, fetchApplicationsHistory]); 
    
    return (
        <div className="app">
            <header className="header">
              <Link to="/" className="logo">Kamai Suraksha</Link>
              <nav className="nav">
                <Link to="/">Dashboard</Link>
                {isLoggedIn && <Link to="/onboarding">Onboarding</Link>}
                {isLoggedIn && <Link to="/myapplications">My Applications</Link>}
                {/* Conditional Rendering using isAdmin state */}
                {isAdmin && <Link to="/admin">Admin</Link>} 
                {isAdmin && <Link to="/partner">Partner</Link>} 
              </nav>
              <div className="auth-buttons">
                {isLoggedIn ? (
                    <button className="logout" onClick={handleSignOut}>Log Out</button>
                ) : (
                    <>
                        <button className="login" onClick={handleSignIn}>Log In</button> 
                        <button className="signup" onClick={openSignUpModal}>Sign Up</button> 
                    </>
                )}
              </div>
            </header>

            {authError && (
                <div style={{ padding: '10px', backgroundColor: '#fdd', color: 'red', textAlign: 'center' }}>
                    Authentication Error: {authError}
                </div>
            )}

            <main className="content">
                <Routes>
                    <Route path="/" element={<DashboardPage onApply={handleApply} userScore={userScore} />} />
                    <Route path="/dashboard" element={<DashboardPage onApply={handleApply} userScore={userScore} />} />
                    
                    <Route 
                        path="/onboarding" 
                        element={
                            isLoggedIn || sessionStorage.getItem('auth_code_pending') ? 
                            <OnboardingForm
                                onboardingData={onboardingData} 
                                setOnboardingData={setOnboardingData} 
                                onFormSubmit={handleOnboardingComplete} 
                            /> 
                            : <DashboardPage onApply={handleApply} userScore={userScore} />
                        } 
                    /> 
                    {/* Pass onboardingData to MyApplicationsPage */}
                    <Route 
                        path="/myapplications" 
                        element={
                            isLoggedIn ? 
                            <MyApplicationsPage 
                                applications={applications} 
                                onboardingData={onboardingData} 
                            /> 
                            : <DashboardPage onApply={handleApply} userScore={userScore} />
                        } 
                    />
                    
                    {/* Conditional Route Access */}
                    <Route path="/admin" element={isAdmin ? <AdminDashboard /> : <DashboardPage onApply={handleApply} userScore={userScore} />} />
                    <Route path="/partner" element={isAdmin ? <PartnerPage /> : <DashboardPage onApply={handleApply} userScore={userScore} />} />
                    
                    <Route path="/logout-cleanup" element={<LogoutCleanup />} />
                </Routes>
            </main>
        </div>
    );
}