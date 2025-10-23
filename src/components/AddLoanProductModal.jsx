import React, { useState } from 'react';

// Use a slightly darker teal color for the modal button/accent,
// as seen in the screenshot's 'Add Loan Product' button.
const PRIMARY_ACCENT_COLOR = '#40A8A4'; 
const MODAL_BUTTON_COLOR = '#4FA09D'; // Slightly darker/desaturated for the modal button
const HOVER_PRIMARY_COLOR = '#348885'; 

const AddLoanProductModal = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        loanName: '',
        minAmount: 5000,
        maxAmount: 50000,
        interestRate: 12.5,
        tenure: 12, // months
        minEligibilityScore: 65,
        description: '',
    });

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Pass the new product data back to the parent component
        onSave(formData);
        
        // Reset form and close modal
        setFormData({
            loanName: '',
            minAmount: 5000,
            maxAmount: 50000,
            interestRate: 12.5,
            tenure: 12,
            minEligibilityScore: 65,
            description: '',
        });
        onClose();
    };

    return (
        // Modal Overlay (Full screen background)
        <div className="modal-overlay">
            
            {/* Modal Content container (Width, shadows, rounded corners) */}
            <div className="modal-content">
                
                {/* Modal Header */}
                <div className="modal-header">
                    <h2 className="modal-title" style={{ color: PRIMARY_ACCENT_COLOR }}>
                        Add New Loan Product
                    </h2>
                    {/* Close Button (X icon) */}
                    <button onClick={onClose} className="modal-close-btn">
                        &times;
                    </button>
                </div>
    
                {/* Modal Body / Form */}
                <form onSubmit={handleSubmit} className="modal-form">
                    
                    {/* Loan Name */}
                    <div className="form-group">
                        <label className="form-label">Loan Name</label>
                        <input
                            type="text"
                            name="loanName"
                            value={formData.loanName}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Enter loan product name"
                            required
                        />
                    </div>
    
                    {/* Amount & Rate (Two Columns) */}
                    <div className="form-grid-2">
                        <div className="form-group">
                            <label className="form-label">Minimum Loan Amount (₹)</label>
                            <input
                                type="number"
                                name="minAmount"
                                value={formData.minAmount}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="5000"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Maximum Loan Amount (₹)</label>
                            <input
                                type="number"
                                name="maxAmount"
                                value={formData.maxAmount}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="50000"
                                required
                            />
                        </div>
                    </div>
    
                    {/* Interest Rate & Tenure (Two Columns) */}
                    <div className="form-grid-2">
                        <div className="form-group">
                            <label className="form-label">Interest Rate (%)</label>
                            <input
                                type="number"
                                name="interestRate"
                                value={formData.interestRate}
                                onChange={handleChange}
                                step="0.1"
                                className="form-input"
                                placeholder="12.5"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Tenure (Months)</label>
                            <input
                                type="number"
                                name="tenure"
                                value={formData.tenure}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="12"
                            />
                        </div>
                    </div>
                    
                    {/* Minimum Eligibility Score (Single Column) */}
                    <div className="form-group">
                        <label className="form-label">Minimum Eligibility Score</label>
                        <input
                            type="number"
                            name="minEligibilityScore"
                            value={formData.minEligibilityScore}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="65"
                        />
                    </div>
    
                    {/* Description (Textarea) */}
                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            className="form-textarea"
                            placeholder="Describe the loan product and its benefits"
                        />
                    </div>
    
                    {/* Form Action (Full Width Button) */}
                    <div className="form-action">
                        <button
                            type="submit"
                            className="add-loan-submit-btn"
                            style={{ backgroundColor: MODAL_BUTTON_COLOR, hoverBackgroundColor: HOVER_PRIMARY_COLOR }}
                        >
                            Add Loan Product
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddLoanProductModal;