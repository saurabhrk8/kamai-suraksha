import React, { useState, useCallback } from 'react';

/**
 * Sign-Up Modal component matching the design in the provided image.
 * @param {object} props - Component props
 * @param {boolean} props.isOpen - Controls the visibility of the modal.
 * @param {function} props.onClose - Function to close the modal.
 * @param {function} props.onSignInClick - Function to switch to the login modal/view.
 */
const SignUpModal = ({ isOpen, onClose, onSignInClick }) => {
    // Exit early if the modal is not open
    if (!isOpen) return null;

    // Local state for form fields
    const [formData, setFormData] = useState({
        phoneNumber: '',
        email: '',
        password: '',
    });
    
    // Simple state to handle form submission (e.g., showing a spinner)
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Handler to update form data
    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    // Handler for the Sign Up button click
    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        console.log("Submitting Sign Up form:", formData);
        
        // --- SIMULATED REAL IMPLEMENTATION ---
        // You would send formData to the Cognito sign-up API endpoint here.
        
        // Simulate network delay
        setTimeout(() => {
            setIsSubmitting(false);
            
            // ********** CHANGE IS HERE **********
            // In a real app, successful sign-up means account created, but NOT logged in.
            // We close the modal and fire the success handler, which should redirect the user.
            onClose(); 
            
            // Assume successful sign-up (user must verify their account next)
            alert("Account created! Please check your email/phone for a verification code.");
            
            // ** NEW: Call a function to switch to the login view **
            if (onSuccess) {
                onSuccess();
            }
            // **********************************

        }, 1500);
    };


    return (
        // Modal Overlay (The dimmed background)
        <div className="modal-overlay" onClick={onClose}>
            {/* Modal Content (Stops clicks from closing the modal) */}
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                
                <button className="modal-close-btn" onClick={onClose} aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
                
                <h2 className="modal-title">Sign Up for Kamai Suraksha</h2>
                
                <form onSubmit={handleSubmit}>
                    
                    {/* Phone Number Field (Required field based on image design) */}
                    <div className="form-group">
                        <label htmlFor="phoneNumber">Phone Number</label>
                        <input
                            type="tel"
                            id="phoneNumber"
                            name="phoneNumber"
                            placeholder="Enter your phone number"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            className="input modal-input"
                            required
                        />
                    </div>
                    
                    {/* Email Field (Optional field based on image design) */}
                    <div className="form-group">
                        <label htmlFor="email">Email (Optional)</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            className="input modal-input"
                        />
                    </div>
                    
                    {/* Password Field */}
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Create a password"
                            value={formData.password}
                            onChange={handleChange}
                            className="input modal-input"
                            required
                            minLength="8"
                        />
                    </div>
                    
                    {/* Sign Up Button */}
                    <button 
                        type="submit" 
                        className="btn btn-primary modal-action-btn"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Signing Up...' : 'Sign Up'}
                    </button>
                </form>
                
                {/* Login Link */}
                <div className="modal-footer-link">
                    <p>Already have an account? <span onClick={onSignInClick} className="link-text">Log in here</span></p>
                </div>

            </div>
        </div>
    );
};

export default SignUpModal;