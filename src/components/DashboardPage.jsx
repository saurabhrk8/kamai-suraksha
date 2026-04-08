// DashboardPage.jsx - FINAL FIX (Health Offers Rendering & Apply Handler Update)

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";

// Define the API endpoint to fetch the loan offers
const API_BASE_URL1 = 'https://jrzuzhs5t8.execute-api.eu-west-2.amazonaws.com/prod';
const LOAN_OFFERS_ENDPOINT = `${API_BASE_URL1}/loanoffers`;


/**
* Renders the main user dashboard page.
* @param {object} props - Component props.
* @param {function} props.onApply - Function passed from App.jsx to handle application submission.
* @param {number} props.userScore - The current confidence score of the logged-in user (0-100).
* @param {boolean} props.isLoggedIn - Explicit state of user login status.
* @param {Array<object>} props.userApplications - List of applications previously submitted by the user.
* @param {Array<object>} props.healthOffers - List of active insurance offers passed from App.jsx. 👈 NEW PROP
*/
export default function DashboardPage({
onApply,
userScore = 0,
isLoggedIn,
userApplications = [],
healthOffers = [] // 👈 ACCEPT THE NEW PROP
}) {
// State to hold the real loan offers fetched from the API
const [loanOffers, setLoanOffers] = useState([]);
const [isLoading, setIsLoading] = useState(true);

// Function to fetch the loan offers from the public endpoint
const fetchLoanOffers = useCallback(async () => {
setIsLoading(true);
try {
const response = await fetch(LOAN_OFFERS_ENDPOINT, {
method: 'GET',
headers: {},
});

if (!response.ok) {
throw new Error(`HTTP error! status: ${response.status}`);
}

const data = await response.json();
const mappedOffers = data.map(offer => ({
// Data needed for display
id: offer.id,
name: offer.title,
minAmount: offer.minAmount,
maxAmount: offer.maxAmount,
interestRate: offer.interestRate,
tenure: offer.tenureMonths,
score: offer.minEligibilityScore,
publicLink: offer.publicLink || '',
type: 'loan', // 👈 Add type for click handler safety
// Data needed for application submission (pass the entire object)
...offer,
}));
setLoanOffers(mappedOffers);
} catch (error) {
console.error("Error fetching loan offers:", error);
setLoanOffers([]);
} finally {
setIsLoading(false);
}
}, []);

// Fetch data when the component mounts
useEffect(() => {
fetchLoanOffers();
}, [fetchLoanOffers]);


// 🛑 NEW: Create a Set of applied loan names for efficient lookup
const appliedLoanNames = useMemo(() => {
// Only process if logged in and applications are available
if (!isLoggedIn || !userApplications) return new Set();
// Assuming the application object has a 'loanName' or 'nbfc_partner' property
return new Set(userApplications.map(app => app.loanName || app.nbfc_partner).filter(Boolean));
}, [isLoggedIn, userApplications]);


// Filter logic now explicitly depends on isLoggedIn prop
const displayLoanOffers = loanOffers.filter(offer => {
// If the user is logged in, apply the score filter
if (isLoggedIn) {
// Only show offers if the user's score meets the minimum eligibility score
return offer.score <= userScore;
}
// If the user is NOT logged in, show ALL offers (they are public offers)
return true;
});
// Filter Health offers (apply score filter if score exists)
const displayHealthOffers = healthOffers.filter(offer => {
if (isLoggedIn) {
const minScore = parseInt(offer.minEligibilityScore || 0);
return minScore <= userScore;
}
return true;
});


// Calculate percentage width for the progress bar
const scoreWidth = `${userScore}%`;
// Handles the application click
const handleApplyClick = async (offer) => {
// 🛑 CHECK FOR ALREADY APPLIED (Loan specific)
if (offer.type === 'loan' && isLoggedIn && appliedLoanNames.has(offer.name)) {
alert(`You have already applied for the ${offer.name} loan.`);
return;
}
if (!onApply) {
alert("Cannot apply: Submission handler is missing.");
return;
}
// SAFE CHECK: Only require publicLink for loan offers
if (offer.type === 'loan' && !offer.publicLink) {
alert("Cannot apply for this loan: Missing public link for partner redirection.");
return;
}
console.log(`Apply Now clicked for ${offer.id}. Calling application handler.`);
const result = await onApply(offer);
if (result && result.success) {
if (offer.type === 'loan' && result.publicLink) {
// Logged-in user: Loan Application successfully submitted, proceed to redirect
console.log("Loan application saved successfully. Redirecting to:", result.publicLink);
alert(`Your application has been successfully saved! Redirecting you to ${offer.name} for final submission...`);
window.open(result.publicLink, '_blank');
} else {
// Success for Health offers (handled internally by App.jsx)
alert(`Your ${offer.type || 'offer'} application has been successfully submitted!`);
}
} else if (result && result.error === "Authentication required") {
// Logged-out user: App.jsx handled the redirect/alert, so stop local action.
console.log("Redirecting to login flow. Aborting local action.");
return;
} else {
// Other errors (e.g., submission failed)
console.error("Submission failed or aborted due to error.");
alert(`Application submission failed: ${result.error || 'Unknown error'}`);
}
};


return (
<div className="home">
<section className="hero">
<h1>Welcome to Kamai Suraksha</h1>
<p>
Empowering India's gig workers with dignified access to credit and insurance.
Get personalized loan offers tailored to your work and financial profile.
</p>
</section>

<section className="score-card">
<h2>🏆 Your Confidence Score</h2>
<div className="score-info">
{/* RENDER SCORE INFO ONLY IF LOGGED IN */}
{isLoggedIn ? (
<>
<p className="score-label">Current Score: <span className="current-score-value">{userScore}</span>/100</p>
<div className="score-bar">
<div className="score-fill" style={{ width: scoreWidth }}></div>
</div>
<p className="score-description">
Your score reflects your work history, income stability, and financial behavior.
A higher score unlocks better loan offers.
</p>
</>
) : (
// 🛑 LOGOUT CALL TO ACTION: Renders when not logged in
<p className="score-cta">
<span style={{fontWeight: 'bold'}}>Log In/Register</span> to see your personalized score and unlock the best offers.
</p>
)}

</div>
</section>
{/* --- PERSONALIZED/PUBLIC OFFERS SECTION --- */}
<section className="offers">
{/* --- LOAN OFFERS SUB-SECTION --- */}
<div className="loan-offers-section">
<div className="offer">
<h3>
{/* 🛑 DYNAMIC HEADING */}
{isLoggedIn ? 'Personalized Loan Offers' : 'Public Loan Offers (Log In to Apply)'}
</h3>
<p>{isLoading ? 'Loading...' : `${displayLoanOffers.length} offers available`}</p>
</div>

<div className="offer-cards-grid">
{isLoading ? (
<p className="loading-state">Loading available loan offers...</p>
) : displayLoanOffers.length > 0 ? (
displayLoanOffers.map((offer) => {
// 🛑 CHECK IF APPLIED
const hasApplied = isLoggedIn && appliedLoanNames.has(offer.name);
return (
<div key={offer.id} className="user-offer-card">
<div className="offer-header">
<h3>{offer.name}</h3>
</div>
<div className="offer-details-list">
<div className="offer-detail-item">
<span className="offer-detail-label">Amount Range</span>
<span className="offer-detail-value">₹{offer.minAmount} - ₹{offer.maxAmount}</span>
</div>
<div className="offer-detail-item">
<span className="offer-detail-label">Interest Rate</span>
<span className="offer-detail-value">{offer.interestRate}% p.a.</span>
</div>
<div className="offer-detail-item">
<span className="offer-detail-label">Tenure</span>
<span className="offer-detail-value">{offer.tenureMonths} months</span>
</div>
<div className="offer-detail-item">
<span className="offer-detail-label">Min. Score</span>
<span className="offer-detail-value">{offer.score}</span>
</div>
</div>
{offer.publicLink && (
<div className="mt-3">
<p className="text-xs text-gray-500">Provided by an External Partner</p>
</div>
)}

{/* 🛑 CONDITIONAL BUTTON RENDERING/DISABLING */}
<button
onClick={() => handleApplyClick(offer)}
className={`apply-button ${hasApplied ? 'applied-button' : ''}`}
disabled={hasApplied}
style={hasApplied ? { backgroundColor: '#ccc', cursor: 'not-allowed' } : {}}
>
{hasApplied ? 'Applied' : 'Apply Now'}
</button>
</div>
);
})
) : (
<p className="empty-state">
{isLoggedIn
? `No personalized loan offers are currently available for your score of ${userScore}. Complete the onboarding or improve your profile!`
: 'No public loan offers are currently available. Please check back later.'
}
</p>
)}
</div>
</div>

{/* --- 🎯 NEW: HEALTH INSURANCE OFFERS SUB-SECTION --- */}
<div className="loan-offers-section">
<div className="offer">
<h3>Insurance Offers for You</h3>
<p>{`${displayHealthOffers.length} offers available`}</p>
</div>
<div className="offer-cards-grid">
{displayHealthOffers.length > 0 ? (
displayHealthOffers.map((offer) => {
// Assuming health offers do not have an 'applied' state tracked yet
return (
<div key={offer.id || offer.offerID} className="user-offer-card insurance-card">
<div className="offer-header">
<h3>{offer.title || 'Health Plan'}</h3>
</div>
<div className="offer-details-list">
<div className="offer-detail-item">
<span className="offer-detail-label">Coverage</span>
<span className="offer-detail-value">₹{offer.coverageAmount}</span>
</div>
<div className="offer-detail-item">
<span className="offer-detail-label">Premium</span>
<span className="offer-detail-value">₹{offer.premiumAmount} / {offer.planDuration} mo</span>
</div>
<div className="offer-detail-item">
<span className="offer-detail-label">Partner</span>
<span className="offer-detail-value">{offer.partnerName}</span>
</div>
{isLoggedIn && offer.minEligibilityScore && (
<div className="offer-detail-item">
<span className="offer-detail-label">Min. Score</span>
<span className="offer-detail-value">{offer.minEligibilityScore}</span>
</div>
)}
</div>
<div className="mt-3">
<p className="text-xs text-gray-500">{offer.offerDescription}</p>
</div>

<button
// Pass the offer object (which includes type: 'health' from App.jsx mapping)
onClick={() => handleApplyClick(offer)}
className="apply-button"
disabled={!isLoggedIn}
>
{isLoggedIn ? 'Apply Now' : 'Log In to Apply'}
</button>
</div>
);
})
) : (
<p className="empty-state">
No health insurance offers are currently available.
</p>
)}
</div>
</div>


{/* Existing Application Section */}
<div className="offer">
<h3>My Loan Applications</h3>
{/* Only show link if logged in */}
{isLoggedIn ? <Link to="/myapplications">View All</Link> : <p>Log In to View</p>}
</div>
</section>

<footer className="footer">
<p>
Your financial journey is our priority. We are committed to securing the best offers for you.
Reach out to our support team for immediate assistance.
Thank you for choosing Kamai Suraksha.
</p>
</footer>
</div>
);
}