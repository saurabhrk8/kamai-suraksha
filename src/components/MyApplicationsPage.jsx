// src/components/MyApplicationsPage.jsx - Updated to handle Health Applications

import React, { useState } from "react";
// Assuming you have this modal component for loan details
import LoansApplicationDetailsModal from './LoansApplicationDetailsModal.jsx'; 
import { Link } from "react-router-dom"; 

/**
 * Renders the page showing all submitted loan and health applications.
 * @param {object} props - Component props.
 * @param {Array<object>} props.applications - List of submitted applications (combined loan and health).
 * @param {object} props.onboardingData - The current user's saved profile data (from App.jsx state).
 */
export default function MyApplicationsPage({ applications = [], onboardingData }) {
  
  const [selectedApplication, setSelectedApplication] = useState(null);

  // Helper to calculate age from DOB string (e.g., '1990-01-01')
  const calculateAge = (dobString) => {
    if (!dobString) return 'N/A';
    try {
        const today = new Date();
        const birthDate = new Date(dobString);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        // Adjust age if the birthday hasn't occurred yet this year
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age > 0 ? age.toString() : 'N/A';
    } catch (e) {
        return 'N/A';
    }
  };

  const handleViewDetails = (application) => {
      
      // Calculate age dynamically from the saved DOB in onboardingData
      const age = calculateAge(onboardingData.dob);

      // Aggressively find the partner name/plan title for display in the modal
      const partnerNameForDisplay = 
          application.loanName || 
          application.nbfc_partner || 
          application.planName || 
          application.partnerName || 
          'N/A';
          
      const isLoan = application.type === 'loan' || (!application.type && (application.loanName || application.nbfc_partner));

      // COMBINE PROFILE DATA AND APPLICATION DATA
      const fullApplicationData = {
          // --- Data from Application (Backend) ---
          ...application,
          id: application.id,
          status: application.status,
          type: isLoan ? 'loan' : 'health',
          
          // Loan Specific Fields
          loanType: application.loanName || 'Personal Loan', 
          requestedAmount: application.requestedAmount || application.loanAmount || '0',
          loanRate: application.interestRate || application.interest_rate || 'N/A', 
          tenure: application.tenureMonths || application.tenure_months || 'N/A', 
          
          // Health Specific Fields
          planName: application.planName || application.title || 'Health Plan',
          coverage: application.coverageAmount || 'N/A',
          premium: application.premiumAmount || 'N/A',
          planDuration: application.planDuration || 'N/A',
          
          // Partner Name (common display field)
          nbfc_partner: partnerNameForDisplay, 
          
          riskScore: application.riskScore || 'Medium', 
          
          // --- Data from User Profile (onboardingData) ---
          name: onboardingData.full_name || 'N/A',
          age: age,
          city: onboardingData.city || 'N/A',
          monthlyIncome: onboardingData.monthly_income || '0',
          workType: onboardingData.work_type || 'N/A',
          // gig_platform is an array in state, join it for display
          platform: Array.isArray(onboardingData.gig_platform) ? onboardingData.gig_platform.join(', ') : onboardingData.gig_platform || 'N/A',
          
          // Confidence Score (from the backend on fetchUserData, stored in state)
          confidenceScore: onboardingData.confidence_score || 'N/A',
      };

      setSelectedApplication(fullApplicationData);
  };
  
  const handleCloseModal = () => {
      setSelectedApplication(null);
  };

  const formatDate = (isoString) => {
      if (!isoString) return 'N/A';
      try {
          return new Date(isoString).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
          });
      } catch (e) {
          return isoString.split('T')[0];
      }
  }

  // Sort applications by status (Pending first) and then by date (newest first)
  const sortedApplications = [...applications].sort((a, b) => {
    // Ensure 'date' is prioritized, falling back to a dummy date if missing
    const dateA = new Date(a.date || a.AppliedDate || 0);
    const dateB = new Date(b.date || b.AppliedDate || 0);
    
    // 1. Sort by status
    if (a.status === 'Pending' && b.status !== 'Pending') return -1;
    if (a.status !== 'Pending' && b.status === 'Pending') return 1;
    
    // 2. Sort by date (newest first)
    return dateB - dateA;
  });

  return (
    <div className="my-applications-page">
      <header className="applications-header">
        <h2>My Applications History</h2>
        <p>
          Track the status of your submitted **loan and insurance** applications in real-time.
        </p>
      </header>

      <div className="applications-grid">
        {sortedApplications.length > 0 ? (
          sortedApplications.map((app) => {
            const isLoan = app.type === 'loan' || (!app.type && (app.loanName || app.nbfc_partner));
            const mainTitle = isLoan ? (app.loanName || app.nbfc_partner || 'Loan Application') : (app.planName || app.title || 'Health Plan');

            return (
                <div key={app.id || app.ApplicationID} className={`application-card ${isLoan ? 'loan-app-card' : 'health-app-card'}`}> 
                  <h3>{mainTitle}</h3> 
                  <p className="app-type-badge">
                    Type: <strong>{isLoan ? 'Loan' : 'Health Insurance'}</strong>
                  </p>
                  <p>
                    <span>Status:</span>
                    <span style={{ 
                        color: app.status === 'Pending' ? '#fb923c' : (app.status === 'Approved' ? '#10b981' : '#ef4444'),
                        fontWeight: 700 
                    }}>
                        {app.status}
                    </span>
                  </p>
                  
                  {isLoan ? (
                      <p>
                        <span>Requested Amount:</span>
                        <span>₹ {app.requestedAmount || app.loanAmount}</span>
                      </p>
                  ) : (
                      <p>
                        <span>Coverage:</span>
                        <span>₹ {app.coverageAmount}</span>
                      </p>
                  )}
                  
                  <p>
                    <span>Applied Date:</span>
                    <span>{formatDate(app.date || app.AppliedDate)}</span>
                  </p>
                  
                  <button 
                    className="view-details-btn" 
                    onClick={() => handleViewDetails(app)}
                  >
                    View Details
                  </button>
                </div>
            )
          })
        ) : (
          <div className="empty-state">
            <p>You have not submitted any loan or insurance applications yet.</p>
            <Link to="/dashboard">Check out available offers</Link>
          </div>
        )}
      </div>

      {/* The modal is reused, but the data passed handles both types */}
      <LoansApplicationDetailsModal 
          application={selectedApplication}
          onClose={handleCloseModal}
      />

    </div>
  );
}