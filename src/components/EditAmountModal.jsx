import React, { useState, useEffect } from 'react';

// Use consistent colors
const PRIMARY_ACCENT_COLOR = '#40A8A4'; 
const MODAL_BUTTON_COLOR = '#4FA09D'; // Darker teal for the submit button

const EditAmountModal = ({ isOpen, onClose, product, onUpdate }) => {
    // Local state initialized with the current product's amounts
    const [minAmount, setMinAmount] = useState(product ? product.minAmount : 0);
    const [maxAmount, setMaxAmount] = useState(product ? product.maxAmount : 0);

    // Effect to update local state when a new product prop is passed (i.e., when the modal opens for a different product)
    useEffect(() => {
        if (product) {
            setMinAmount(product.minAmount);
            setMaxAmount(product.maxAmount);
        }
    }, [product]);


    if (!isOpen || !product) return null;

    const handleSubmit = (e) => {
        e.preventDefault();

        // Simple validation
        if (parseFloat(minAmount) >= parseFloat(maxAmount)) {
            alert("Minimum amount must be less than the maximum amount.");
            return;
        }

        // Pass the updated data back to the dashboard component
        onUpdate(product.id, { 
            minAmount: parseFloat(minAmount), 
            maxAmount: parseFloat(maxAmount) 
        });
        
        onClose();
    };

    return (
        // Modal Overlay
        <div className="modal-overlay">
            
            {/* Modal Content container (Width, shadows, rounded corners) */}
            <div className="modal-content">
                
                {/* Modal Header matching the screenshot: "Adjust Loan Amount Range" */}
                <div className="modal-header">
                    <h2 className="modal-title" style={{ color: PRIMARY_ACCENT_COLOR }}>
                        Adjust Loan Amount Range
                    </h2>
                    {/* Close Button (X icon) */}
                    <button onClick={onClose} className="modal-close-btn">
                        &times;
                    </button>
                </div>

                {/* Modal Body / Form */}
                <form onSubmit={handleSubmit} className="modal-form">
                    
                    {/* Minimum Loan Amount */}
                    <div className="form-group">
                        <label className="form-label">Minimum Loan Amount (₹)</label>
                        <input
                            type="number"
                            name="minAmount"
                            value={minAmount}
                            onChange={(e) => setMinAmount(e.target.value)}
                            className="form-input"
                            placeholder="5000"
                            required
                        />
                    </div>

                    {/* Maximum Loan Amount */}
                    <div className="form-group">
                        <label className="form-label">Maximum Loan Amount (₹)</label>
                        <input
                            type="number"
                            name="maxAmount"
                            value={maxAmount}
                            onChange={(e) => setMaxAmount(e.target.value)}
                            className="form-input"
                            placeholder="50000"
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
                            Update Loan Amount
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditAmountModal;