import React, { useState, useEffect, useCallback, useRef } from "react";
import { Routes, Route, Link, useNavigate, Navigate } from "react-router-dom";
import {
getLoginUrl, logout,
getValidAccessToken as authGetValidAccessToken,
exchangeCodeForTokens as authExchangeCodeForTokens
} from './config/auth.js';

import DashboardPage from "./components/DashboardPage.jsx";
import OnboardingForm from "./components/OnboardingForm.jsx";
import AdminDashboard from "./components/AdminDashboardPage.jsx";
import PartnerPage from "./components/NBFC_PartnerDashboard.jsx";
import MyApplicationsPage from "./components/MyApplicationsPage.jsx";
import Callback from "./pages/Callback.jsx";

const API_BASE_URL = 'https://jrzuzhs5t8.execute-api.eu-west-2.amazonaws.com/prod';
const USER_DATA_ENDPOINT = `${API_BASE_URL}/userdata`;

export default function App() {
const navigate = useNavigate();
const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('access_token'));
const [isAdmin, setIsAdmin] = useState(false);
const [userScore, setUserScore] = useState(0);
const [userApplications, setUserApplications] = useState([]);
const [onboardingData, setOnboardingData] = useState({});
const exchangeInProgress = useRef(false);

const fetchUserData = useCallback(async () => {
const token = await authGetValidAccessToken();
if (!token) return;
try {
const response = await fetch(USER_DATA_ENDPOINT, {
headers: { 'Authorization': `Bearer ${token}` },
});
if (response.ok) {
const rawData = await response.json();

// 🎯 DATA MAPPER: Links DynamoDB PascalCase to Form snake_case
const mappedData = {
...rawData,
full_name: rawData.FullName || '',
email: rawData.EmailId || '',
phone_number: rawData.PhoneNumber || '',
dob: rawData.DOB || '',
pan_number: rawData.PANNumber || '',
aadhaar_number: rawData.AadhaarNumber || '',
address: rawData.Address || '',
city: rawData.City || '',
work_type: rawData.WorkType || '',
monthly_income: rawData.MonthlyIncome || '',
work_tenure: rawData.WorkTenureMonths || '',
gig_platform: rawData.GigPlatform || '',
CurrentStage: rawData.CurrentStage ? parseInt(rawData.CurrentStage) : 1
};

// 🎯 PARTNER TAB FIX: Check all possible admin key variants
const isUserAdmin = rawData.admin === true || rawData.Admin === true ||
String(rawData.admin).toLowerCase() === "true" ||
String(rawData.Admin).toLowerCase() === "true";
setIsAdmin(isUserAdmin);
setUserScore(rawData.ConfidenceScore || 0);
setOnboardingData(mappedData);
}
} catch (e) { console.error("Load Error:", e); }
}, []);

const fetchApplications = useCallback(async () => {
const token = await authGetValidAccessToken();
if (!token) return;
try {
const [lRes, hRes] = await Promise.all([
fetch(`${API_BASE_URL}/loanapplication`, { headers: { 'Authorization': `Bearer ${token}` } }),
fetch(`${API_BASE_URL}/healthapplication`, { headers: { 'Authorization': `Bearer ${token}` } })
]);
let combined = [];
if (lRes.ok) combined = [...combined, ...(await lRes.json()).map(i => ({...i, type: 'loan'}))];
if (hRes.ok) combined = [...combined, ...(await hRes.json()).map(i => ({...i, type: 'health'}))];
setUserApplications(combined);
} catch (e) { console.error("Apps Error:", e); }
}, []);

const handleLoginExchange = useCallback(async (code) => {
if (!code || exchangeInProgress.current) return { success: false };
exchangeInProgress.current = true;
try {
const tokens = await authExchangeCodeForTokens(code);
if (tokens?.access_token) {
localStorage.setItem('access_token', tokens.access_token);
setIsLoggedIn(true);
await fetchUserData();
return { success: true };
}
} catch (e) { console.error(e); }
finally { exchangeInProgress.current = false; }
return { success: false };
}, [fetchUserData]);

useEffect(() => {
if (isLoggedIn) {
fetchUserData();
fetchApplications();
}
}, [isLoggedIn, fetchUserData, fetchApplications]);

return (
<div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
<header style={{ display: 'flex', justifyContent: 'space-between', padding: '0 40px', height: '70px', background: '#fff', borderBottom: '1px solid #e2e8f0', alignItems: 'center' }}>
<Link to="/" style={{ fontWeight: '800', fontSize: '1.2rem', textDecoration: 'none', color: '#2563eb' }}>KAMAI SURAKSHA</Link>
<nav style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
<Link to="/" style={{ textDecoration: 'none', color: '#475569', fontWeight: '500' }}>Dashboard</Link>
{isLoggedIn && (
<>
<Link to="/my-applications" style={{ textDecoration: 'none', color: '#475569', fontWeight: '500' }}>My Apps</Link>
<Link to="/profile" style={{ textDecoration: 'none', color: '#475569', fontWeight: '500' }}>Profile</Link>
</>
)}
{isAdmin && (
<div style={{ display: 'flex', gap: '15px', borderLeft: '2px solid #e2e8f0', paddingLeft: '15px' }}>
<Link to="/admin" style={{ color: '#ef4444', fontWeight: 'bold', textDecoration: 'none' }}>Admin</Link>
<Link to="/partner" style={{ color: '#ef4444', fontWeight: 'bold', textDecoration: 'none' }}>Partner</Link>
</div>
)}
</nav>
<div>
{isLoggedIn ? (
<button onClick={() => { logout(); localStorage.clear(); setIsLoggedIn(false); navigate('/'); }} style={{ cursor: 'pointer', padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>Log Out</button>
) : (
<button onClick={() => window.location.href = getLoginUrl()} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold' }}>Log In</button>
)}
</div>
</header>

<main style={{ flex: 1, padding: '20px' }}>
<Routes>
<Route path="/" element={<DashboardPage userScore={userScore} isLoggedIn={isLoggedIn} />} />
<Route path="/callback" element={<Callback exchangeCodeForTokens={handleLoginExchange} />} />
<Route path="/my-applications" element={<MyApplicationsPage applications={userApplications} onboardingData={onboardingData} />} />
<Route path="/profile" element={<OnboardingForm onboardingData={onboardingData} setOnboardingData={setOnboardingData} onFormSubmit={fetchUserData} />} />
<Route path="/admin" element={<AdminDashboard />} />
<Route path="/partner" element={<PartnerPage />} />
</Routes>
</main>
</div>
);
}