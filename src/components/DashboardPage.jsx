import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";

// Define the API endpoint to fetch the loan offers
const API_BASE_URL1 = 'https://jrzuzhs5t8.execute-api.eu-west-2.amazonaws.com/prod'; 
const LOAN_OFFERS_ENDPOINT = `${API_BASE_URL1}/loanoffers`;


/**
 * Renders the main user dashboard page.
 * @param {object} props - Component props.
 * @param {function} props.onApply - Function passed from App.jsx to handle application submission.
 * @param {number} props.userScore - The current confidence score of the logged-in user (0-100).
 */
export default function DashboardPage({ onApply, userScore = 0 }) {
  
  // State to hold the real loan offers fetched from the API
  const [loanOffers, setLoanOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Function to fetch the loan offers from the public endpoint (Unchanged)
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

  // Fetch data when the component mounts (Unchanged)
  useEffect(() => {
    fetchLoanOffers();
  }, [fetchLoanOffers]);


  // Filter logic (Unchanged)
  const displayOffers = loanOffers.filter(offer => 
    offer.score <= userScore
  );


  // Calculate percentage width for the progress bar (Unchanged)
  const scoreWidth = `${userScore}%`; 
  
  // 🌟 KEY CHANGE: Submits the application details in background and redirects
  const handleApplyClick = async (offer) => {
    if (!onApply || !offer.publicLink) {
        alert("Cannot apply: Invalid offer or missing public link.");
        return;
    }
    
    console.log(`Apply Now clicked for ${offer.id}. Saving application and preparing redirect.`);
    
    // Call the async onApply function in App.jsx and wait for the result
    const result = await onApply(offer); 
    
    if (result && result.success && result.publicLink) {
        console.log("Application saved successfully. Redirecting to:", result.publicLink);
        
        // Inform the user about the redirect
        alert(`Your application has been successfully saved! Redirecting you to ${offer.name} for final submission...`);
        
        // Redirect the user to the partner's public link in a new tab
        window.open(result.publicLink, '_blank');
        
    } else {
        // Error handling is managed within App.jsx's handleApply
        console.error("Redirection aborted due to application save error.");
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
          {/* DYNAMIC SCORE DISPLAY */}
          <p className="score-label">Current Score: <span className="current-score-value">{userScore}</span>/100</p>
          <div className="score-bar">
            {/* DYNAMIC PROGRESS BAR */}
            <div className="score-fill" style={{ width: scoreWidth }}></div> 
          </div>
          <p className="score-description">
            Your score reflects your work history, income stability, and financial behavior.
            A higher score unlocks better loan offers.
          </p>
        </div>
      </section>
      
      {/* --- PERSONALIZED LOAN OFFERS SECTION --- */}
      <section className="offers">
        <div className="loan-offers-section">
          <div className="offer">
            <h3>Personalized Loan Offers</h3>
            <p>{isLoading ? 'Loading...' : `${displayOffers.length} offers available`}</p>
          </div>

          <div className="offer-cards-grid">
            {isLoading ? (
                <p className="loading-state">Loading available loan offers...</p>
            ) : displayOffers.length > 0 ? (
              displayOffers.map((offer) => (
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
                      <span className="offer-detail-value">{offer.tenure} months</span>
                    </div>
                    <div className="offer-detail-item">
                      <span className="offer-detail-label">Min. Score</span>
                      <span className="offer-detail-value">{offer.score}</span>
                    </div>
                  </div>
                  
                  {/* Public Link Display (Optional) */}
                  {offer.publicLink && (
                    <div className="mt-3">
                        <p className="text-xs text-gray-500">Provided by an External Partner</p>
                    </div>
                  )}

                  {/* 🚨 KEY CHANGE: Calls the async handler */}
                  <button 
                    onClick={() => handleApplyClick(offer)}
                    className="apply-button" 
                  >
                    Apply Now
                  </button>
                </div>
              ))
            ) : (
              <p className="empty-state">No personalized loan offers are currently available for your profile. Complete the onboarding or improve your profile!</p>
            )}
          </div>
        </div>

        {/* Existing Insurance and Application Sections */}
        <div className="offer">
          <h3>Insurance Offers for You</h3>
          <p>0 offers available</p>
        </div>
        <div className="offer">
          <h3>My Loan Applications</h3>
          <Link to="/myapplications">View All</Link> 
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