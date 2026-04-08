import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// 🎯 FIXED: Points to the correct folder level
import { exchangeCodeForTokens as authExchangeCodeForTokens } from '../config/auth.js';

const Callback = ({ exchangeCodeForTokens }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const processed = useRef(false);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const code = params.get('code');

        if (code && !processed.current) {
            processed.current = true;
            // Calls the function passed from App.jsx
            exchangeCodeForTokens(code).then(result => {
                if (result.success) {
                    navigate('/');
                } else {
                    console.error("Auth failed");
                    navigate('/');
                }
            });
        }
    }, [exchangeCodeForTokens, location, navigate]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
            <p>Completing secure login...</p>
        </div>
    );
};

export default Callback;