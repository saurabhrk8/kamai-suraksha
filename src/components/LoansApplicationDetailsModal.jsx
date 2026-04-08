import React from 'react';

// --- Loans Application Details Modal Component ---
const LoansApplicationDetailsModal = ({ application, onClose, onApprove, onReject }) => {
    // If no application data is passed, don't render the modal
    if (!application) return null;

    // Helper to format currency
    const formatCurrency = (amount) => {
        // Use Number() to handle potential string 'undefined' or null values from the data mapping
        const num = Number(amount);
        // Check if num is a valid positive number
        return isNaN(num) || num <= 0 ? 'N/A' : `₹${num.toLocaleString('en-IN')}`;
    };

    // Helper to format Confidence Score with appropriate color
    const getScoreStyle = (score) => {
        const numScore = parseInt(score, 10);
        let color = '#ef4444'; // Red (Low)
        if (numScore >= 70) {
            color = '#10b981'; // Green (High)
        } else if (numScore >= 40) {
            color = '#fb923c'; // Orange (Medium)
        }
        return { color, fontWeight: 700 };
    };

    const confidenceScore = application.confidenceScore || 'N/A';
    const statusColor = {
        'Pending': '#fb923c',
        'Approved': '#10b981',
        'Rejected': '#ef4444',
    }[application.status] || '#a1a1aa'; // Default to gray

    // --- Data Grouping ---
    
    const applicantDetails = [
        { label: 'Full Name', value: application.name || 'N/A' },
        { label: 'Monthly Income', value: formatCurrency(application.monthlyIncome) },
        { label: 'Work Type', value: application.workType || 'N/A' },
        { label: 'City', value: application.city || 'N/A' },
        { label: 'Age', value: application.age || 'N/A' },
        { label: 'Marital Status', value: application.maritalStatus || 'N/A' },
        { label: 'Platform (If Gig)', value: application.platform || 'N/A' },
        { label: 'User ID (Key)', value: application.userId || 'N/A' }, // Added userId for admin reference
    ];

    const loanDetails = [
        { label: 'Requested Amount', value: formatCurrency(application.requestedAmount) },
        { label: 'Interest Rate', value: (application.loanRate ? application.loanRate + '%' : 'N/A') },
        { label: 'Tenure', value: (application.tenure ? application.tenure + ' months' : 'N/A') },
        { label: 'Partner/Lender', value: application.nbfc_partner || 'N/A' },
        { label: 'Applied Date', value: application.date ? new Date(application.date).toLocaleDateString() : 'N/A' },
        { label: 'Risk Score', value: application.riskScore || 'N/A' },
    ];


    // --- Helper Component for Grid Section ---
    const DetailSection = ({ title, items }) => (
        <div className="details-section">
            <h4>{title}</h4>
            <div className="applicant-info-grid"> {/* Reusing the grid class */}
                {items.map((item, index) => (
                    <div className="detail-item" key={index}>
                        <span className="detail-label">{item.label}</span>
                        <span className="detail-value">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="modal-overlay" onClick={onClose}>
            {/* Prevent clicks inside the content from closing the modal */}
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                
                {/* Modal Header */}
                <div className="details-modal-header">
                    <h3 className="details-modal-title">
                        {application.loanName || 'Loan Application'} Details
                    </h3>
                    <button className="modal-close-btn" onClick={onClose}>
                        &times;
                    </button>
                </div>

                {/* Score and Status Header */}
                <div className="score-status-header">
                    <div className="score-box">
                        <span className="score-label">Confidence Score</span>
                        <span 
                            className="score-value" 
                            style={getScoreStyle(confidenceScore)}
                        >
                            {confidenceScore}
                        </span>
                    </div>
                    <div className="status-box">
                        <span className="status-label">Current Status</span>
                        <span 
                            className="status-value"
                            style={{ 
                                color: statusColor,
                                fontWeight: 700 
                            }}
                        >
                            {application.status}
                        </span>
                    </div>
                </div>

                {/* Modal Body/Content */}
                <div className="details-content">
                    
                    {/* 1. APPLICANT DETAILS SECTION */}
                    <DetailSection 
                        title="Applicant Details" 
                        items={applicantDetails}
                    />

                    {/* 2. LOAN DETAILS SECTION */}
                    <DetailSection 
                        title="Loan & Product Details" 
                        items={loanDetails}
                    />
                    
                </div>

                {/* Action Buttons: Allow decision-making in the admin view */}
                <div className="details-modal-actions">
                    <button 
                        className="btn-reject" 
                        onClick={() => onReject(application.id)} 
                        disabled={application.status !== 'Pending'}
                    >
                        Reject
                    </button>
                    <button 
                        className="btn-approve" 
                        onClick={() => onApprove(application.id)}
                        disabled={application.status !== 'Pending'}
                    >
                        Approve
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoansApplicationDetailsModal;