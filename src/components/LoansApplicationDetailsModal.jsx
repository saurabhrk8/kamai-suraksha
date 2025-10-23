import React from 'react';

// --- Loans Application Details Modal Component ---
const LoansApplicationDetailsModal = ({ application, onClose }) => {
    // If no application data is passed, don't render the modal
    if (!application) return null;

    // Helper to format currency
    const formatCurrency = (amount) => {
        const num = Number(amount);
        return num > 0 ? `₹${num.toLocaleString('en-IN')}` : 'N/A';
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

                {/* Score and Status Header (To match UI) */}
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
                                color: application.status === 'Pending' ? '#fb923c' : (application.status === 'Approved' ? '#10b981' : '#ef4444'),
                                fontWeight: 700 
                            }}
                        >
                            {application.status}
                        </span>
                    </div>
                </div>


                {/* Modal Body/Content */}
                <div className="details-content">
                    
                    {/* Loan Details Section (Primary focus for user) */}
                    <div className="details-section">
                        <h4>Loan & Tenure Details</h4>
                        <div className="loan-details-grid">
                            <div className="detail-item">
                                <span className="detail-label">Requested Amount</span>
                                <span className="detail-value">{formatCurrency(application.requestedAmount)}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Interest Rate</span>
                                <span className="detail-value">{application.loanRate || 'N/A'}%</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Tenure</span>
                                <span className="detail-value">{application.tenure || 'N/A'} months</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Applied Date</span>
                                <span className="detail-value">{application.date ? new Date(application.date).toLocaleDateString() : 'N/A'}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Partner/Lender</span>
                                <span className="detail-value">{application.nbfc_partner || 'N/A'}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Risk Score</span>
                                <span className="detail-value">{application.riskScore || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Applicant Profile Information Section */}
                    <div className="details-section" style={{ borderBottom: 'none' }}>
                        <h4>Applicant Profile Overview</h4>
                        <div className="applicant-info-grid">
                            <div className="detail-item">
                                <span className="detail-label">Full Name</span>
                                <span className="detail-value">{application.name || 'N/A'}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Monthly Income</span>
                                <span className="detail-value">{formatCurrency(application.monthlyIncome)}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Work Type</span>
                                <span className="detail-value">{application.workType || 'N/A'}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Gig Platform</span>
                                <span className="detail-value">{application.platform || 'N/A'}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">City</span>
                                <span className="detail-value">{application.city || 'N/A'}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Age</span>
                                <span className="detail-value">{application.age || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons (Removed: Assuming this is a user-view, not admin-action) */}
                <div className="details-modal-actions">
                    <button className="btn-close-modal" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoansApplicationDetailsModal;