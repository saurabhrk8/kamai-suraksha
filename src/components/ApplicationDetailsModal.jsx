import React from 'react';

// --- Application Details Modal Component ---
const ApplicationDetailsModal = ({ application, onClose, onApprove, onReject }) => {
    // If no application data is passed, don't render the modal
    if (!application) return null;

    // Helper to format currency
    const formatCurrency = (amount) => `₹${Number(amount).toLocaleString('en-IN')}`;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                
                {/* Modal Header */}
                <div className="details-modal-header">
                    <h3 className="details-modal-title">Application Details</h3>
                    {/* Close button - reuse existing styles if available */}
                    <button className="modal-close-btn" onClick={onClose}>
                        &times;
                    </button>
                </div>

                {/* Modal Body/Content */}
                <div className="details-content">
                    
                    {/* Applicant Information Section */}
                    <div className="details-section">
                        <h4>Applicant Information</h4>
                        <div className="applicant-info-grid">
                            <div className="detail-item">
                                <span className="detail-label">Name</span>
                                <span className="detail-value">{application.name}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Age</span>
                                <span className="detail-value">{application.age}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">City</span>
                                <span className="detail-value">{application.city}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Monthly Income</span>
                                <span className="detail-value">{formatCurrency(application.monthlyIncome)}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Work Type</span>
                                <span className="detail-value">{application.workType}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Gig Platform</span>
                                <span className="detail-value">{application.platform}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Marital Status</span>
                                <span className="detail-value">{application.maritalStatus}</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Loan Details Section */}
                    <div className="details-section" style={{ borderBottom: 'none' }}>
                        <h4>Loan Details</h4>
                        <div className="loan-details-grid">
                            <div className="detail-item">
                                <span className="detail-label">Loan Applied</span>
                                <span className="detail-value">{application.loanType}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Requested Amount</span>
                                <span className="detail-value">{formatCurrency(application.requestedAmount)}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Interest Rate</span>
                                <span className="detail-value">{application.loanRate}%</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Tenure</span>
                                <span className="detail-value">{application.tenure} months</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Confidence Score</span>
                                <span className="detail-value">{application.confidenceScore}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Risk Score</span>
                                <span className="detail-value">{application.riskScore}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Current Status</span>
                                <span className="detail-value">{application.status}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="details-modal-actions">
                    <button className="btn-reject" onClick={() => onReject(application.id)}>
                        Reject Application
                    </button>
                    <button className="btn-approve" onClick={() => onApprove(application.id)}>
                        Approve Application
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ApplicationDetailsModal;