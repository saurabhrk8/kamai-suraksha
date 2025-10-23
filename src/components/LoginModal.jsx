// src/components/LoginModal.jsx

import React, { useState, useCallback } from 'react';
// 🛑 COMMENT OUT COGNITO IMPORTS 🛑
// import { CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
// import UserPool from '../aws-config'; 

const LoginModal = ({ isOpen, onClose, onSignUpClick, onSuccess }) => {
    if (!isOpen) return null;

    const [formData, setFormData] = useState({
        username: '', // This will be the Phone Number
        password: '',
    });
    // 🛑 Keep isSubmitting but it won't be used for actual API calls 🛑
    const [isSubmitting, setIsSubmitting] = useState(false); 
    const [error, setError] = useState('');

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    }, []);

    // 🛑 REPLACE THE COGNITO SUBMIT LOGIC WITH A STUB 🛑
    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        // ----------------------------------------------------
        // START: SIMULATE SUCCESSFUL LOGIN
        // ----------------------------------------------------
        console.log("Cognito login skipped. Simulating success...");

        // Use a small delay to simulate network latency for better UI feedback
        setTimeout(() => {
            setIsSubmitting(false);
            
            // Call the success handler immediately
            onClose(); // Close the modal
            if (onSuccess) {
                onSuccess(); // Triggers the App.jsx logic (sets isLoggedIn=true, navigates)
            }
        }, 500); // 500ms delay
        
        // ----------------------------------------------------
        // END: SIMULATE SUCCESSFUL LOGIN
        // ----------------------------------------------------


        // 🛑 COMMENT OUT ALL ORIGINAL COGNITO CODE BELOW 🛑

        
        const { username, password } = formData;
        
        // Cognito requires phone number in E.164 format for the username
        const formattedUsername = username.startsWith('+') ? username : '+91' + username; 

        const authenticationDetails = new AuthenticationDetails({
            Username: formattedUsername,
            Password: password,
        });

        const cognitoUser = new CognitoUser({
            Username: formattedUsername,
            Pool: UserPool,
        });

        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: (result) => {
                // Successful Login! Tokens are stored in CognitoUser object.
                setIsSubmitting(false);
                console.log('Access Token:', result.getAccessToken().getJwtToken());
                
                onClose(); // Close the modal
                if (onSuccess) {
                    onSuccess(); // Sets isLoggedIn(true) and navigates to dashboard
                }
            },
            onFailure: (err) => {
                setIsSubmitting(false);
                if (err.code === 'UserNotConfirmedException') {
                    setError('Account not confirmed. Please check your phone for the verification code.');
                } else {
                    setError(err.message || 'Invalid username or password.');
                }
            },
            newPasswordRequired: (userAttributes, requiredAttributes) => {
                // Handle forced password reset flow if needed
                setIsSubmitting(false);
                setError('New password required. This needs a separate UI flow.');
            }
        });
        
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose} aria-label="Close">&times;</button>
                <h2 className="modal-title">Log In to Kamai Suraksha</h2>
                
                {error && <p className="error-message" style={{textAlign: 'center', marginBottom: '15px'}}>{error}</p>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Phone Number / Email</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            placeholder="Enter your phone number or email"
                            value={formData.username}
                            onChange={handleChange}
                            className="input modal-input"
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            className="input modal-input"
                            required
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        className="btn btn-primary modal-action-btn"
                        disabled={isSubmitting} // isSubmitting is still active for visual feedback
                    >
                        {isSubmitting ? 'Logging In...' : 'Log In'}
                    </button>
                </form>
                
                <div className="modal-footer-link">
                    <p>Don't have an account? <span onClick={onSignUpClick} className="link-text">Sign up here</span></p>
                </div>
            </div>
        </div>
    );
};
export default LoginModal;