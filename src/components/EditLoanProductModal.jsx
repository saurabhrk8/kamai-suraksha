import React, { useState, useEffect } from 'react';

// Use consistent colors and classes from app.css
const PRIMARY_ACCENT_COLOR = '#40A8A4'; 
const MODAL_BUTTON_COLOR = '#4FA09D'; 
const HOVER_PRIMARY_COLOR = '#348885'; 

const EditLoanProductModal = ({ isOpen, onClose, product, onUpdate }) => {
    // 1. Initialize state with the product data passed via props
    const [formData, setFormData] = useState({});

    // 2. Use effect to load product data when the modal opens for a new product
    useEffect(() => {
        if (product) {
            setFormData({
                loanName: product.loanName || '',
                minAmount: product.minAmount || 0,
                maxAmount: product.maxAmount || 0,
                interestRate: product.interestRate || 0,
                tenure: product.tenure || 0,
                minEligibilityScore: product.minEligibilityScore || 0,
                description: product.description || '',
                // Add the new status field (assuming 'yes' means true/active)
                isActive: product.status === 'yes', 
            });
        }
    }, [product]);

    if (!isOpen || !product) return null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Prepare data for update
        const updatedData = {
            ...formData,
            // Convert boolean isActive back to 'yes'/'no' for consistency with existing state
            status: formData.isActive ? 'yes' : 'no'
        };

        // Pass the updated product ID and data back to the dashboard
        onUpdate(product.id, updatedData);
        
        onClose();
    };

    return (
        // Modal Overlay
        <div className="modal-overlay">
            
            {/* Modal Content container (Uses external CSS classes) */}
            <div className="modal-content">
                
                {/* Modal Header: "Edit Loan Product" */}
                <div className="modal-header">
                    <h2 className="modal-title" style={{ color: PRIMARY_ACCENT_COLOR }}>
                        Edit Loan Product
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
                        <input type="text" name="loanName" value={formData.loanName || ''} onChange={handleChange} className="form-input" placeholder="Enter loan product name" required />
                    </div>

                    {/* Minimum Loan Amount & Maximum Loan Amount (Two Columns) */}
                    <div className="form-grid-2">
                        <div className="form-group">
                            <label className="form-label">Minimum Loan Amount (₹)</label>
                            <input type="number" name="minAmount" value={formData.minAmount || ''} onChange={handleChange} className="form-input" placeholder="5000" required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Maximum Loan Amount (₹)</label>
                            <input type="number" name="maxAmount" value={formData.maxAmount || ''} onChange={handleChange} className="form-input" placeholder="50000" required />
                        </div>
                    </div>

                    {/* Interest Rate & Tenure (Two Columns) */}
                    <div className="form-grid-2">
                        <div className="form-group">
                            <label className="form-label">Interest Rate (%)</label>
                            <input type="number" name="interestRate" value={formData.interestRate || ''} onChange={handleChange} step="0.1" className="form-input" placeholder="12.5" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Tenure (Months)</label>
                            <input type="number" name="tenure" value={formData.tenure || ''} onChange={handleChange} className="form-input" placeholder="12" />
                        </div>
                    </div>
                    
                    {/* Minimum Eligibility Score (Single Column) */}
                    <div className="form-group">
                        <label className="form-label">Minimum Eligibility Score</label>
                        <input type="number" name="minEligibilityScore" value={formData.minEligibilityScore || ''} onChange={handleChange} className="form-input" placeholder="65" />
                    </div>

                    {/* Description (Textarea) */}
                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea name="description" value={formData.description || ''} onChange={handleChange} rows="4" className="form-textarea" placeholder="Describe the loan product and its benefits" />
                    </div>

                    {/* ⬅️ NEW: Active Checkbox ⬅️ */}
                    <div className="form-group checkbox-group">
                        <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive || false} onChange={handleChange} className="form-checkbox" />
                        <label htmlFor="isActive" className="form-label-inline">Active</label>
                    </div>

                    {/* Form Action (Full Width Button) */}
                    <div className="form-action">
                        <button
                            type="submit"
                            className="add-loan-submit-btn"
                            style={{ backgroundColor: MODAL_BUTTON_COLOR, hoverBackgroundColor: HOVER_PRIMARY_COLOR }}
                        >
                            Update Loan Product
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditLoanProductModal;