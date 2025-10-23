// SuccessModal.jsx

import React from 'react';

// Use consistent colors and classes from app.css
const PRIMARY_ACCENT_COLOR = '#40A8A4'; 
const MODAL_BUTTON_COLOR = '#4FA09D'; 

const SuccessModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        // Uses the same CSS classes for fullscreen overlay
        <div className="modal-overlay">
            
            <div className="modal-content profile-complete-modal">
                
                <div className="success-icon-container">
                    {/* Checkmark icon (using Unicode for simplicity, or an SVG/Image) */}
                    <span style={{ color: PRIMARY_ACCENT_COLOR }}>&#10003;</span>
                </div>

                <h2 className="success-title" style={{ color: PRIMARY_ACCENT_COLOR }}>
                    Profile Complete!
                </h2>
                
                <p className="success-message">
                    Your profile has been successfully created. You can now access personalized loan and insurance offers.
                </p>

                <div className="form-action">
                    <button
                        onClick={onClose} // Function to close the modal (and typically navigate)
                        className="add-loan-submit-btn"
                        style={{ backgroundColor: MODAL_BUTTON_COLOR }}
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SuccessModal;