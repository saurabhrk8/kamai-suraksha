// File: src/components/Header.jsx
import React from 'react';

// Accept props for login status, so you can show 'Logout' or 'Login' buttons
const Header = ({ isLoggedIn }) => {
    return (
        <header style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
            <h1>My Application</h1>
            {/* You can add navigation links or a Logout button here */}
            {isLoggedIn && <span>Status: Logged In</span>}
        </header>
    );
};

export default Header;