import React from 'react';

const OfferCard = ({ title, loanAmount, interestRate, tenure, minEligibilityScore, onApply }) => {
    return (
        <div className="user-offer-card">
            <div className="offer-header">
                <h3>{title}</h3>
            </div>
            
            <div className="offer-details-list">
                <div className="offer-detail-item">
                    <span className="offer-detail-label">Loan Amount Range</span>
                    <span className="offer-detail-value">{loanAmount}</span>
                </div>
                <div className="offer-detail-item">
                    <span className="offer-detail-label">Interest Rate</span>
                    <span className="offer-detail-value">{interestRate}</span>
                </div>
                <div className="offer-detail-item">
                    <span className="offer-detail-label">Tenure</span>
                    <span className="offer-detail-value">{tenure} months</span>
                </div>
                {/* You might hide this from the user, but including for now */}
                <div className="offer-detail-item">
                    <span className="offer-detail-label">Min. Score Required</span>
                    <span className="offer-detail-value">{minEligibilityScore}</span>
                </div>
            </div>

            <button onClick={() => onApply(title)} className="apply-button">
                Apply Now
            </button>
        </div>
    );
};

export default OfferCard;