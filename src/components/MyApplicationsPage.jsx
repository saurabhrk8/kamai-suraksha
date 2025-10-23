import React, { useState } from "react";
import LoansApplicationDetailsModal from './LoansApplicationDetailsModal.jsx'; 

/**
 * Renders the page showing all submitted loan applications.
 * @param {object} props - Component props.
 * @param {Array<object>} props.applications - List of submitted applications.
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

      // Aggressively find the partner name/loan title for display in the modal
      const partnerNameForDisplay = 
          application.loanName || 
          application.nbfc_partner || 
          application.loanType || 
          'N/A';

      // COMBINE PROFILE DATA AND LOAN DATA
      const fullApplicationData = {
          // --- Data from Loan Application (Backend) ---
          ...application,
          id: application.id,
          status: application.status,
          
          loanType: application.loanName || 'Personal Loan', 
          
          requestedAmount: application.requestedAmount || '0',
          loanRate: application.interest_rate || 'N/A', 
          tenure: application.tenure_months || 'N/A', 
          
          // Use the aggressively found partner name for the modal display
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
    // 1. Sort by status
    if (a.status === 'Pending' && b.status !== 'Pending') return -1;
    if (a.status !== 'Pending' && b.status === 'Pending') return 1;
    // 2. Sort by date (if statuses are the same)
    return new Date(b.date) - new Date(a.date);
  });

  return (
    <div className="my-applications-page">
      <header className="applications-header">
        <h1>My Loan Applications</h1>
        <p>
          Track the status of your submitted loan and insurance applications in real-time.
        </p>
      </header>

      <div className="applications-grid">
        {sortedApplications.length > 0 ? (
          sortedApplications.map((app) => (
            <div key={app.id} className="application-card"> 
              <h3>{app.loanName}</h3> 
              <p>
                <span>Status:</span>
                <span style={{ 
                    color: app.status === 'Pending' ? '#fb923c' : (app.status === 'Approved' ? '#10b981' : '#ef4444'),
                    fontWeight: 700 
                }}>
                    {app.status}
                </span>
              </p>
              <p>
                <span>Requested Amount:</span>
                <span>₹ {app.requestedAmount}</span>
              </p>
              <p>
                <span>Applied Date:</span>
                <span>{formatDate(app.date)}</span>
              </p>
              
              <button 
                className="view-details-btn" 
                onClick={() => handleViewDetails(app)}
              >
                View Details
              </button>
            </div>
          ))
        ) : (
          <div className="empty-state">
            You have not submitted any loan applications yet.
          </div>
        )}
      </div>

      <LoansApplicationDetailsModal
          application={selectedApplication}
          onClose={handleCloseModal}
      />

    </div>
  );
}