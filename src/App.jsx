// src/App.jsx - FINAL CLEAN AUTH VERSION (v1.30)

import React, { useState, useEffect, useCallback } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";

// 🛑 CRITICAL FIX: Remove Amplify/Auth imports.
// Now importing core auth functions from the new config file.
import { 
    getLoginUrl, 
    logout, 
    getValidAccessToken as authGetValidAccessToken, // Aliasing to avoid conflict
    exchangeCodeForTokens as authExchangeCodeForTokens, // Aliasing
    refreshAccessToken as authRefreshAccessToken // Aliasing
} from './config/auth.js';


// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// 💡 DEPLOYMENT VERIFICATION: NEW STAMP
const VERSION_STAMP = 'v1.30_RUNTIME_FINAL_CLEAN_AUTH'; 
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

// Components (No Change)
import DashboardPage from "./components/DashboardPage.jsx";
import OnboardingForm from "./components/OnboardingForm.jsx";
import AdminDashboard from "./components/AdminDashboardPage.jsx";
import PartnerPage from "./components/NBFC_PartnerDashboard.jsx";
import MyApplicationsPage from "./components/MyApplicationsPage.jsx";
import LogoutCleanup from "./components/LogoutCleanup.jsx";
import Callback from "./pages/Callback.jsx";


// --- Configuration Constants (Simplified) ---
// Remove all old Amplify config, only API endpoints remain.
const API_BASE_URL1 = 'https://jrzuzhs5t8.execute-api.eu-west-2.amazonaws.com/prod';
const USER_DATA_ENDPOINT = `${API_BASE_URL1}/userdata`; 
const LOAN_APPLICATION_ENDPOINT = `${API_BASE_URL1}/loanapplication`; 

const INITIAL_ONBOARDING_DATA = {
    full_name: '', age: '', phone_number: '', email_id: '',
    dob: '', gender: '', address: '', city: '',
    aadhaar_number: '', pan_number: '', gig_platform: [],
    work_type: '', work_tenure_months: '', monthly_income: '',
    bank_account_linked: '',
    worker_id: '',
    admin: false
};

// ===============================================
// 🔑 UTILITY FUNCTIONS (Simplified/Removed)
// ===============================================
// decodeToken, isTokenExpired, and refreshAccessToken are now in auth.js.

// --- Main Application Component ---
export default function App() {
    const navigate = useNavigate();
    
    // 1. STATE INITIALIZATION (unchanged)
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
    const [applications, setApplications] = useState([]); 
    const [onboardingData, setOnboardingData] = useState(INITIAL_ONBOARDING_DATA);
    const [userScore, setUserScore] = useState(0);
    const [isAdmin, setIsAdmin] = useState(false);


    // 🛑 AMPLIFY CONFIGURATION REMOVED 🛑
    useEffect(() => {
        // Log the final version stamp for debugging purposes
        console.log(`[DEPLOYMENT] Application loaded. Stamp: ${VERSION_STAMP}`);
    }, []); 


    // LOGOUT HANDLER 
    const handleSignOut = useCallback(() => {
        console.log("--- LOGOUT TRIGGERED (Clean Auth) ---"); 
        
        // This function in auth.js handles clearing local storage and redirecting.
        logout(); // 🛑 Use the imported logout function
        
        // Immediate UI reset (though redirect will follow)
        setIsLoggedIn(false); 
        setUserDataChecked(false); 
        setSessionTokens({ id_token: null, access_token: null, refresh_token: null });
        setExchangeAttempted(false);
        setUserScore(0);
        setIsAdmin(false); 
        setOnboardingData(INITIAL_ONBOARDING_DATA); 
        setApplications([]); 

    }, []); 

    // Helper to get the correct token (Uses imported function)
    // NOTE: We wrap the imported function to satisfy the useCallback dependency
    const getValidAccessToken = useCallback(async () => {
        // 🛑 Use the imported utility function
        return authGetValidAccessToken(); 
    }, []); 


    // CORE: fetchUserData (GET) (Logic mostly unchanged, only token access changed)
    const fetchUserData = useCallback(async (token = null) => {
        console.log("--- fetchUserData: STARTED ---"); 
        let validToken = token;
        let isUserFound = false; 

        if (!validToken) validToken = await getValidAccessToken();
        // ... (rest of the logic remains the same, just removed the dependency on 
        // setSessionTokens and isLoggedIn from the original inner fetchUserData)
        if (!validToken) {
            console.error("fetchUserData: ABORTED. No token available."); 
            if(!isLoggedIn) navigate('/', { replace: true });
            return { success: false, data: null };
        }
        
        try {
            const response = await fetch(USER_DATA_ENDPOINT, {
                method: 'GET',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${validToken}` 
                },
                mode: 'cors',
            });
            
            if (response.ok) {
                const data = await response.json();
                
                const isAdminUser = (data.admin === true || data.Admin === true || data.admin === "true" || data.Admin === "true");
                setIsAdmin(isAdminUser); 
                
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
                        admin: isAdminUser,
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
    }, [getValidAccessToken, setOnboardingData, setAuthError, handleSignOut, setUserScore, isLoggedIn, navigate]);


    // CORE FUNCTION: exchangeCodeForTokens (Uses imported function)
    // The complex token exchange logic has been moved to auth.js
    const exchangeCodeForTokens = useCallback(async (formData, authCode) => {
        if (sessionStorage.getItem('exchangeAttempted') === 'true' || !authCode) {
            console.warn("Exchange attempt blocked: already attempted or no code provided.");
            return { success: false, tokens: null, workerId: null };
        }
        
        sessionStorage.setItem('exchangeAttempted', 'true');
        setExchangeAttempted(true);
        
        try {
            // 🛑 Use the imported utility function
            const tokens = await authExchangeCodeForTokens(authCode, formData);

            // Decode the ID token for the worker ID and immediately update state
            const workerId = tokens.id_token ? JSON.parse(atob(tokens.id_token.split('.')[1])).sub : null;
            
            if (!workerId) throw new Error("Failed to extract unique user ID from the ID token.");

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

    
    // CORE FUNCTION: handleOnboardingComplete (Unchanged logic flow)
    const handleOnboardingComplete = useCallback(async () => {
        // ... (rest of this function is fine, uses exchangeCodeForTokens and local API calls)
        const authCode = sessionStorage.getItem('auth_code_pending');
        
        // CASE 1: New User/First Submission (Use /auth/callback with code)
        if (authCode) {
            console.log("SUBMISSION: CASE 1 - New user with pending code. Exchanging code and saving data via auth/callback.");
            const result = await exchangeCodeForTokens(onboardingData, authCode); 
            
            if (result.success) {
                 setUserDataChecked(false); 
                 navigate('/dashboard', { replace: true });
            } else {
                alert(`Failed to save data: ${result.error || "Please check your details and try again."}`);
            }
            return;
        }

        // CASE 2: Existing User Update (Use /userdata POST with Authorization header)
        if (isLoggedIn) {
            console.log("SUBMISSION: CASE 2 - Existing user. Updating data only via /userdata POST.");
            
            const validToken = await getValidAccessToken();
            if (!validToken) {
                 alert("Session expired. Please log in again to update your data.");
                 handleSignOut();
                 return;
            }
            
            try {
                const processedFormData = { ...onboardingData };
                if (Array.isArray(processedFormData.gig_platform)) processedFormData.gig_platform = processedFormData.gig_platform.join(", ");
                delete processedFormData.age; 
                
                processedFormData.admin = processedFormData.admin || false; 
                processedFormData.admin = String(processedFormData.admin); 
                
                const finalBody = { ...processedFormData };
                if (finalBody.worker_id) {
                     finalBody.UserID = finalBody.worker_id; 
                     delete finalBody.worker_id;
                }
                
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
        // 🛑 CRITICAL FIX: Direct redirect to the Cognito Hosted UI
        window.location.href = getLoginUrl(); 
    };

    const openSignUpModal = handleSignIn;
    
    // ... (rest of the file is unchanged)
    
    // Simple useEffect to check for existing token and set isLoggedIn status on load
    useEffect(() => {
        const hasTokens = !!(localStorage.getItem('access_token') && localStorage.getItem('refresh_token'));
        if (hasTokens && !isLoggedIn) {
            setIsLoggedIn(true);
        }
    }, [isLoggedIn]);
    
    // Simple useEffect to navigate away from /callback and /logout if needed
    useEffect(() => {
        const pathname = window.location.pathname;
        if (isLoggedIn && (pathname.endsWith('/callback') || pathname.endsWith('/logout'))) {
            navigate('/dashboard', { replace: true });
        }
        // If the user navigates directly to /callback without a code, redirect to home
        if (!isLoggedIn && pathname.endsWith('/callback') && !new URLSearchParams(window.location.search).get('code')) {
            navigate('/', { replace: true });
        }
    }, [isLoggedIn, navigate]);

    
    // Fetch the user's loan application history (unchanged)
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
                    'Authorization': `Bearer ${validToken}` 
                },
                mode: 'cors',
            });

            if (response.ok) {
                const data = await response.json();
                setApplications(data); 
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
    
    
    // Trigger application history fetch on login
    useEffect(() => {
        if (isLoggedIn) {
            fetchApplicationsHistory();
        }
    }, [isLoggedIn, fetchApplicationsHistory]);


    // Handle loan application submission (unchanged)
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
            const applicationPayload = {
                nbfc_partner: offerDetails.title, 
                loan_amount: String(offerDetails.loanAmount), 
                interest_rate: String(offerDetails.interestRate),
                tenure_months: String(offerDetails.tenureMonths),
                status: "Pending", 
                
                loanName: offerDetails.title, 
                requestedAmount: String(offerDetails.loanAmount),
                date: new Date().toISOString(), 
            };

            console.log("Submitting loan application in background:", applicationPayload);

            const response = await fetch(LOAN_APPLICATION_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${validToken}` 
                },
                body: JSON.stringify(applicationPayload),
            });

            if (response.ok) {
                console.log("Loan application saved successfully. Preparing for redirect.");
                fetchApplicationsHistory(); 
                
                return { success: true, publicLink: offerDetails.publicLink };
                
            } else {
                const errorBody = await response.text();
                throw new Error(`Submission failed: HTTP Status ${response.status}. Backend response: ${errorBody}`);
            }

        } catch (error) {
            console.error('Loan Application Error (POST):', error.message);
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
                    
                    {/* Pass core functions as props to the Callback component */}
                    <Route 
                        path="/callback" 
                        element={
                            <Callback 
                                // 🛑 Use the imported/aliased exchangeCodeForTokens
                                exchangeCodeForTokens={exchangeCodeForTokens} 
                                fetchUserData={fetchUserData}
                                handleSignOut={handleSignOut}
                                setIsLoggedIn={setIsLoggedIn}
                                setUserDataChecked={setUserDataChecked}
                                // Pass state setters if Callback needs them (like setAuthError)
                                setAuthError={setAuthError} 
                                // Pass current onboarding data for case where form is submitted
                                onboardingData={onboardingData}
                            />
                        } 
                    />
                    
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
                    
                    <Route path="/admin" element={isAdmin ? <AdminDashboard /> : <DashboardPage onApply={handleApply} userScore={userScore} />} />
                    <Route path="/partner" element={isAdmin ? <PartnerPage /> : <DashboardPage onApply={handleApply} userScore={userScore} />} />
                    
                    <Route path="/logout-cleanup" element={<LogoutCleanup />} />
                </Routes>
            </main>
        </div>
    );
}