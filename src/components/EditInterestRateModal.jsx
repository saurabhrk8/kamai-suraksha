import React, { useState, useEffect } from 'react';

// Use consistent colors
const PRIMARY_ACCENT_COLOR = '#40A8A4'; 
const MODAL_BUTTON_COLOR = '#4FA09D'; // Darker teal for the submit button

const EditInterestRateModal = ({ isOpen, onClose, product, onUpdate }) => {
    // Local state initialized with the current product's interest rate
    const [interestRate, setInterestRate] = useState(product ? product.interestRate : 0);

    // Effect to update local state when a new product prop is passed
    useEffect(() => {
        if (product) {
            setInterestRate(product.interestRate);
        }
    }, [product]);

    if (!isOpen || !product) return null;

    const handleSubmit = (e) => {
        e.preventDefault();

        // Pass the updated data back to the dashboard component
        onUpdate(product.id, { 
            interestRate: parseFloat(interestRate) 
        });
        
        onClose();
    };

    return (
        // Modal Overlay (Uses external CSS class)
        <div className="modal-overlay">
            
            {/* Modal Content container */}
            <div className="modal-content">
                
                {/* Modal Header matching the screenshot: "Update Interest Rate" */}
                <div className="modal-header">
                    <h2 className="modal-title" style={{ color: PRIMARY_ACCENT_COLOR }}>
                        Update Interest Rate
                    </h2>
                    {/* Close Button (X icon) */}
                    <button onClick={onClose} className="modal-close-btn">
                        &times;
                    </button>
                </div>

                {/* Modal Body / Form */}
                <form onSubmit={handleSubmit} className="modal-form">
                    
                    {/* New Interest Rate (%) */}
                    <div className="form-group">
                        <label className="form-label">New Interest Rate (%)</label>
                        <input
                            type="number"
                            name="interestRate"
                            value={interestRate}
                            onChange={(e) => setInterestRate(e.target.value)}
                            step="0.1"
                            className="form-input"
                            placeholder="12.5"
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
                            Update Interest Rate
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default EditInterestRateModal;