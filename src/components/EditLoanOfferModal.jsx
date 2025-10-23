import React, { useState, useEffect } from 'react';

const EditLoanOfferModal = ({ offer, onClose, onUpdate }) => {
    // Check if the modal should be visible
    if (!offer) return null;

    // Initialize state with current offer data (including the new publicLink)
    const [formData, setFormData] = useState({
        loanName: offer.title || '',
        minAmount: offer.minAmount || '',
        maxAmount: offer.maxAmount || '',
        // Ensure interestRate removes the '%' for editing
        interestRate: String(offer.interestRate).replace('%', '') || '', 
        tenure: offer.tenure || '',
        minEligibilityScore: offer.minEligibilityScore || '',
        description: offer.description || '',
        // NEW: Initialize publicLink
        publicLink: offer.publicLink || '', 
        status: offer.isNew !== undefined ? (offer.isNew ? 'New' : 'Active') : 'Active',
        active: offer.status === 'Active' || offer.status === 'New', 
    });

    // Update form data when the passed 'offer' prop changes
    useEffect(() => {
        if (offer) {
            setFormData({
                loanName: offer.title || '',
                minAmount: offer.minAmount || '',
                maxAmount: offer.maxAmount || '',
                interestRate: String(offer.interestRate).replace('%', '') || '',
                tenure: offer.tenure || '',
                minEligibilityScore: offer.minEligibilityScore || '',
                description: offer.description || '',
                // NEW: Update publicLink on prop change
                publicLink: offer.publicLink || '', 
                status: offer.isNew !== undefined ? (offer.isNew ? 'New' : 'Active') : 'Active',
                active: offer.status === 'Active' || offer.status === 'New',
            });
        }
    }, [offer]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Prepare the updated offer object
        const updatedOffer = {
            ...offer,
            title: formData.loanName,
            loanAmount: `₹${formData.minAmount} - ₹${formData.maxAmount}`,
            minAmount: formData.minAmount,
            maxAmount: formData.maxAmount,
            interestRate: formData.interestRate, // Passed as number/string, backend expects string
            tenure: formData.tenure,
            minEligibilityScore: formData.minEligibilityScore,
            description: formData.description,
            // NEW: Include publicLink in the update payload
            publicLink: formData.publicLink || '',
            // Re-map the 'active' state to 'isNew' or 'status' for the main list
            isNew: formData.active && offer.isNew, 
            status: formData.active ? 'Active' : 'Inactive',
        };
        onUpdate(updatedOffer);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3 className="modal-title">Edit Loan Offer</h3>
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
                                placeholder="Describe the loan product and its benefits"
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Active Checkbox */}
                        <div className="form-group">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="active"
                                    checked={formData.active}
                                    onChange={handleChange}
                                    style={{ width: 'auto' }}
                                />
                                Active
                            </label>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="submit" className="btn-primary">
                            Update Loan Offer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default EditLoanOfferModal;