import React, { useState, useEffect } from 'react';

// Use consistent colors
const PRIMARY_ACCENT_COLOR = '#40A8A4'; 
const MODAL_BUTTON_COLOR = '#4FA09D'; // Darker teal for the submit button

const EditEligibilityModal = ({ isOpen, onClose, product, onUpdate }) => {
    // Local state initialized with the current product's eligibility score
    const [minEligibilityScore, setMinEligibilityScore] = useState(product ? product.minEligibilityScore : 0);

    // Effect to update local state when a new product prop is passed
    useEffect(() => {
        if (product) {
            setMinEligibilityScore(product.minEligibilityScore);
        }
    }, [product]);

    if (!isOpen || !product) return null;

    const handleSubmit = (e) => {
        e.preventDefault();

        // Pass the updated data back to the dashboard component
        onUpdate(product.id, { 
            minEligibilityScore: parseFloat(minEligibilityScore) 
        });
        
        onClose();
    };

    return (
        // Modal Overlay (Uses external CSS class)
        <div className="modal-overlay">
            
            {/* Modal Content container */}
            <div className="modal-content">
                
                {/* Modal Header matching the screenshot: "Modify Eligibility Criteria" */}
                <div className="modal-header">
                    <h2 className="modal-title" style={{ color: PRIMARY_ACCENT_COLOR }}>
                        Modify Eligibility Criteria
                    </h2>
                    {/* Close Button (X icon) */}
                    <button onClick={onClose} className="modal-close-btn">
                        &times;
                    </button>
                </div>

                {/* Modal Body / Form */}
                <form onSubmit={handleSubmit} className="modal-form">
                    
                    {/* Minimum Eligibility Score */}
                    <div className="form-group">
                        <label className="form-label">Minimum Eligibility Score</label>
                        <input
                            type="number"
                            name="minEligibilityScore"
                            value={minEligibilityScore}
                            onChange={(e) => setMinEligibilityScore(e.target.value)}
                            className="form-input"
                            placeholder="65"
                            required
                        />
                    </div>

                    {/* Form Action (Full Width Button) */}
                    <div className="form-action">
                        <button
                            type="submit"
                            className="add-loan-submit-btn"
                            style={{ backgroundColor: MODAL_BUTTON_COLOR }}
                        >
                            Update Eligibility Criteria
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditEligibilityModal;