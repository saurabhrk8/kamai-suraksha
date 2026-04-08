import React, { useState } from 'react';

const AddHealthOfferModal = ({ isOpen, onClose, onSave }) => {
    if (!isOpen) return null;

    const [formData, setFormData] = useState({
        offerName: '',
        premiumAmount: '',
        coverageAmount: '',
        planDuration: '',
        minAge: '',
        maxAge: '',
        description: '',
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
        e.preventDefault(); // <-- IMPORTANT: Prevents default form submission/page reload
        
        // Prepare the data structure required by the healthApiCall function in the dashboard
        const newOffer = {
            // Note: We use 'title' for the backend API, not 'offerName'
            title: formData.offerName,
            // Ensure numbers are sent as numeric types (API requirement)
            premiumAmount: parseFloat(formData.premiumAmount) || 0, 
            coverageAmount: parseFloat(formData.coverageAmount) || 0, 
            planDuration: parseInt(formData.planDuration, 10) || 0, 
            minAge: parseInt(formData.minAge, 10) || 0, 
            maxAge: parseInt(formData.maxAge, 10) || 0, 
            description: formData.description,
            publicLink: formData.publicLink || '',
            // The status is added by the AdminDashboardPage's handleSaveNewHealthOffer
        };
        
        // 🚀 CRITICAL STEP: Call the external API function passed via props
        // This is what triggers the 'healthApiCall' in the parent component.
        onSave(newOffer); 
        
        // We only reset the form after the API call finishes (handled by the parent's logic 
        // which calls onClose, which resets the form in this component)
        
        // Since the parent's onSave (handleSaveNewHealthOffer) is ASYNCHRONOUS, 
        // we rely on the parent to close the modal (and thus reset the form) upon successful API call.
        // If you close the modal here, it will close BEFORE the API call completes.
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3 className="modal-title">Add New Health Insurance Offer</h3>
                    <button className="modal-close-btn" onClick={onClose}>&times;</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-form-content">
                        {/* Offer Name */}
                        <div className="form-group">
                            <label htmlFor="offerName">Plan Name</label>
                            <input
                                id="offerName"
                                name="offerName"
                                type="text"
                                className="input"
                                placeholder="Enter health plan name"
                                value={formData.offerName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Premium/Coverage Row */}
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="premiumAmount">Annual Premium (₹)</label>
                                <input
                                    id="premiumAmount"
                                    name="premiumAmount"
                                    type="number"
                                    className="input"
                                    placeholder="5000"
                                    value={formData.premiumAmount}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="coverageAmount">Coverage Amount (₹)</label>
                                <input
                                    id="coverageAmount"
                                    name="coverageAmount"
                                    type="number"
                                    className="input"
                                    placeholder="500000"
                                    value={formData.coverageAmount}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {/* Duration/Age Range Row */}
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="planDuration">Plan Duration (Years)</label>
                                <input
                                    id="planDuration"
                                    name="planDuration"
                                    type="number"
                                    className="input"
                                    placeholder="1"
                                    value={formData.planDuration}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="minAge">Min Age</label>
                                <input
                                    id="minAge"
                                    name="minAge"
                                    type="number"
                                    className="input"
                                    placeholder="18"
                                    value={formData.minAge}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="maxAge">Max Age</label>
                                <input
                                    id="maxAge"
                                    name="maxAge"
                                    type="number"
                                    className="input"
                                    placeholder="65"
                                    value={formData.maxAge}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {/* Public Link */}
                        <div className="form-group">
                            <label htmlFor="publicLink">Public Offer Link</label>
                            <input
                                id="publicLink"
                                name="publicLink"
                                type="url"
                                className="input"
                                placeholder="https://www.insurancename.com/health-plan"
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
                                placeholder="Describe the plan features and exclusions"
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="submit" className="btn-primary">
                            Save Health Offer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddHealthOfferModal;