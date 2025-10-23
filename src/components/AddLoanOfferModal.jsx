import React, { useState } from 'react';

const AddLoanOfferModal = ({ isOpen, onClose, onSave }) => {
    // If modal is not open, don't render
    if (!isOpen) return null;

    // State to manage form fields for a new loan offer
    const [formData, setFormData] = useState({
        loanName: '',
        minAmount: '',
        maxAmount: '',
        interestRate: '',
        tenure: '',
        minEligibilityScore: '',
        description: '',
        // NEW: Add publicLink to state
        publicLink: '', 
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Prepare the new offer object
        const newOffer = {
            // NOTE: The ID fields below are for frontend display only; the backend (Lambda) generates the real ID.
            id: Date.now(), 
            title: formData.loanName,
            isNew: true, 
            loanAmount: `₹${formData.minAmount} - ₹${formData.maxAmount}`, 
            minAmount: formData.minAmount,
            maxAmount: formData.maxAmount,
            interestRate: formData.interestRate, // Passed as number/string, backend expects string
            tenure: formData.tenure,
            minEligibilityScore: formData.minEligibilityScore,
            description: formData.description,
            status: 'Active', 
            // NEW: Include publicLink in the save payload
            publicLink: formData.publicLink || '',
        };
        
        onSave(newOffer);
        
        // Reset form after saving
        setFormData({
            loanName: '',
            minAmount: '',
            maxAmount: '',
            interestRate: '',
            tenure: '',
            minEligibilityScore: '',
            description: '',
            publicLink: '',
        });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3 className="modal-title">Add New Loan Offer</h3>
                    <button className="modal-close-btn" onClick={onClose}>&times;</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-form-content">
                        {/* Loan Name */}
                        <div className="form-group">
                            <label htmlFor="loanName">Loan Name</label>
                            <input
                                id="loanName"
                                name="loanName"
                                type="text"
                                className="input"
                                placeholder="Enter loan product name"
                                value={formData.loanName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Min/Max Amount Row */}
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="minAmount">Minimum Amount (₹)</label>
                                <input
                                    id="minAmount"
                                    name="minAmount"
                                    type="number"
                                    className="input"
                                    placeholder="10000"
                                    value={formData.minAmount}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="maxAmount">Maximum Amount (₹)</label>
                                <input
                                    id="maxAmount"
                                    name="maxAmount"
                                    type="number"
                                    className="input"
                                    placeholder="50000"
                                    value={formData.maxAmount}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {/* Interest Rate/Tenure Row */}
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="interestRate">Interest Rate (%)</label>
                                <input
                                    id="interestRate"
                                    name="interestRate"
                                    type="number"
                                    step="0.1"
                                    className="input"
                                    placeholder="12"
                                    value={formData.interestRate}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="tenure">Tenure (Months)</label>
                                <input
                                    id="tenure"
                                    name="tenure"
                                    type="number"
                                    className="input"
                                    placeholder="12"
                                    value={formData.tenure}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {/* Eligibility Score */}
                        <div className="form-group">
                            <label htmlFor="minEligibilityScore">Minimum Eligibility Score</label>
                            <input
                                id="minEligibilityScore"
                                name="minEligibilityScore"
                                type="number"
                                className="input"
                                placeholder="60"
                                value={formData.minEligibilityScore}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        
                        {/* NEW: Public Link */}
                        <div className="form-group">
                            <label htmlFor="publicLink">Public Offer Link</label>
                            <input
                                id="publicLink"
                                name="publicLink"
                                type="url"
                                className="input"
                                placeholder="https://www.bankname.com/loan-offer"
                                value={formData.publicLink}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Description */}
                        <div className="form-group">
                            <label htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                className="textarea"
                                rows="3"
                                placeholder="Enter loan product description"
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="submit" className="btn-primary">
                            Save Loan Offer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddLoanOfferModal;