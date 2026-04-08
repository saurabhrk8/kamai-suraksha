import React, { useState, useEffect } from 'react';

const EditHealthOfferModal = ({ offer, onClose, onUpdate }) => {
    if (!offer) return null;

    // Initialize state with current offer data
    const [formData, setFormData] = useState({
        offerName: offer.title || '',
        premiumAmount: offer.premiumAmount || '',
        coverageAmount: offer.coverageAmount || '',
        planDuration: offer.planDuration || '',
        minAge: offer.minAge || '',
        maxAge: offer.maxAge || '',
        description: offer.description || '',
        publicLink: offer.publicLink || '', 
        active: offer.status === 'Active' || offer.status === 'New', 
    });

    // Sync form data when the passed 'offer' prop changes (e.g., when editing a different offer)
    useEffect(() => {
        if (offer) {
            setFormData({
                offerName: offer.title || '',
                premiumAmount: offer.premiumAmount || '',
                coverageAmount: offer.coverageAmount || '',
                planDuration: offer.planDuration || '',
                minAge: offer.minAge || '',
                maxAge: offer.maxAge || '',
                description: offer.description || '',
                publicLink: offer.publicLink || '',
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
        
        const updatedOffer = {
            ...offer,
            title: formData.offerName,
            premiumAmount: formData.premiumAmount,
            coverageAmount: formData.coverageAmount,
            planDuration: formData.planDuration,
            minAge: formData.minAge,
            maxAge: formData.maxAge,
            description: formData.description,
            publicLink: formData.publicLink || '',
            status: formData.active ? 'Active' : 'Inactive',
        };
        onUpdate(updatedOffer);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3 className="modal-title">Edit Health Insurance Offer</h3>
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
                            Update Health Offer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default EditHealthOfferModal;