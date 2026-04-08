import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import ApplicationDetailsModal from './ApplicationDetailsModal'; 
import EditLoanOfferModal from './EditLoanOfferModal'; 
import AddLoanOfferModal from './AddLoanOfferModal';
import EditHealthOfferModal from './EditHealthOfferModal'; 
import AddHealthOfferModal from './AddHealthOfferModal'; 

const API_BASE_URL = 'https://jrzuzhs5t8.execute-api.eu-west-2.amazonaws.com/prod'; 

export default function AdminDashboardPage() {
    const [applications, setApplications] = useState([]);
    const [loanOffers, setLoanOffers] = useState([]);
    const [healthOffers, setHealthOffers] = useState([]);
    const [filterStatus, setFilterStatus] = useState('All Statuses');
    
    // Modal States
    const [selectedApp, setSelectedApp] = useState(null);
    const [editingLoan, setEditingLoan] = useState(null);
    const [editingHealth, setEditingHealth] = useState(null);
    const [isAddLoanOpen, setIsAddLoanOpen] = useState(false);
    const [isAddHealthOpen, setIsAddHealthOpen] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const [appRes, loanRes, healthRes] = await Promise.all([
                fetch(`${API_BASE_URL}/admin/applications`),
                fetch(`${API_BASE_URL}/loanoffers`),
                fetch(`${API_BASE_URL}/healthoffers`)
            ]);
            if (appRes.ok) setApplications(await appRes.json());
            if (loanRes.ok) setLoanOffers(await loanRes.json());
            if (healthRes.ok) setHealthOffers(await healthRes.json());
        } catch (e) { console.error(e); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleUpdateStatus = async (newStatus) => {
        if (!selectedApp) return;
        try {
            const res = await fetch(`${API_BASE_URL}/admin/application-status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: selectedApp.ApplicationID,
                    userId: selectedApp.UserID,
                    status: newStatus
                })
            });
            if (res.ok) { fetchData(); setSelectedApp(null); }
        } catch (e) { alert("Error updating status"); }
    };

    const filtered = applications.filter(a => filterStatus === 'All Statuses' || (a.status || a.Status) === filterStatus);

    // --- Inline Styles from DashboardPage ---
    const sectionStyle = { marginBottom: '40px' };
    const headerRowStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' };
    const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' };
    const cardStyle = { background: '#fff', border: '1px solid #e0e0e0', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' };
    const cardHeaderStyle = { marginBottom: '15px', borderBottom: '1px solid #f0f0f0', paddingBottom: '10px' };
    const detailItemStyle = { display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' };
    const labelStyle = { color: '#666' };
    const valueStyle = { fontWeight: '600', color: '#333' };
    const buttonStyle = { marginTop: '15px', padding: '10px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };
    const editButtonStyle = { ...buttonStyle, background: '#f8f9fa', color: '#007bff', border: '1px solid #007bff' };

    return (
        <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'inherit' }}>
            
            <section style={sectionStyle}>
                <div style={headerRowStyle}>
                    <h2 style={{ margin: 0 }}>Incoming Loan Applications</h2>
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: '8px', borderRadius: '4px' }}>
                        <option>All Statuses</option>
                        <option>Pending</option>
                        <option>Approved</option>
                        <option>Rejected</option>
                    </select>
                </div>
                <div style={gridStyle}>
                    {filtered.map(app => (
                        <div key={app.ApplicationID} style={cardStyle}>
                            <div style={cardHeaderStyle}>
                                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{app.FullName || 'Unknown User'}</h3>
                                <span style={{ fontSize: '0.8rem', color: '#28a745', fontWeight: 'bold' }}>{app.status || app.Status}</span>
                            </div>
                            <div style={detailItemStyle}><span style={labelStyle}>Loan:</span><span style={valueStyle}>{app.LoanName}</span></div>
                            <div style={detailItemStyle}><span style={labelStyle}>Amount:</span><span style={valueStyle}>₹{app.RequestedAmount || app.Loan_amount}</span></div>
                            <div style={detailItemStyle}><span style={labelStyle}>Income:</span><span style={valueStyle}>₹{app.MonthlyIncome}</span></div>
                            <button style={buttonStyle} onClick={() => setSelectedApp(app)}>Review Application</button>
                        </div>
                    ))}
                </div>
            </section>

            {/* LOAN OFFERS MANAGEMENT */}
            <section style={sectionStyle}>
                <div style={headerRowStyle}>
                    <h2 style={{ margin: 0 }}>Manage Loan Offers</h2>
                    <button style={{ ...buttonStyle, marginTop: 0 }} onClick={() => setIsAddLoanOpen(true)}>+ Add New Loan</button>
                </div>
                <div style={gridStyle}>
                    {loanOffers.map(offer => (
                        <div key={offer.OfferID} style={cardStyle}>
                            <div style={cardHeaderStyle}><h3 style={{ margin: 0, fontSize: '1rem' }}>{offer.Title}</h3></div>
                            <div style={detailItemStyle}><span style={labelStyle}>Rate:</span><span style={valueStyle}>{offer.InterestRate}%</span></div>
                            <div style={detailItemStyle}><span style={labelStyle}>Tenure:</span><span style={valueStyle}>{offer.TenureMonths} Mo</span></div>
                            <div style={detailItemStyle}><span style={labelStyle}>Min Score:</span><span style={valueStyle}>{offer.MinEligibilityScore}</span></div>
                            <button style={editButtonStyle} onClick={() => setEditingLoan(offer)}>Edit Offer</button>
                        </div>
                    ))}
                </div>
            </section>

            {/* HEALTH OFFERS MANAGEMENT */}
            <section style={sectionStyle}>
                <div style={headerRowStyle}>
                    <h2 style={{ margin: 0 }}>Manage Insurance Offers</h2>
                    <button style={{ ...buttonStyle, marginTop: 0, background: '#28a745' }} onClick={() => setIsAddHealthOpen(true)}>+ Add Insurance</button>
                </div>
                <div style={gridStyle}>
                    {healthOffers.map(offer => (
                        <div key={offer.id || offer.offerID} style={cardStyle}>
                            <div style={cardHeaderStyle}><h3 style={{ margin: 0, fontSize: '1rem' }}>{offer.title || offer.Title}</h3></div>
                            <div style={detailItemStyle}><span style={labelStyle}>Premium:</span><span style={valueStyle}>₹{offer.premiumAmount}</span></div>
                            <div style={detailItemStyle}><span style={labelStyle}>Coverage:</span><span style={valueStyle}>₹{offer.coverageAmount}</span></div>
                            <div style={detailItemStyle}><span style={labelStyle}>Partner:</span><span style={valueStyle}>{offer.partnerName}</span></div>
                            <button style={editButtonStyle} onClick={() => setEditingHealth(offer)}>Edit Offer</button>
                        </div>
                    ))}
                </div>
            </section>

            {/* MODALS */}
            {selectedApp && <ApplicationDetailsModal application={selectedApp} onClose={() => setSelectedApp(null)} onApprove={() => handleUpdateStatus('Approved')} onReject={() => handleUpdateStatus('Rejected')} />}
            {editingLoan && <EditLoanOfferModal offer={editingLoan} onClose={() => setEditingLoan(null)} onUpdate={fetchData} />}
            {editingHealth && <EditHealthOfferModal offer={editingHealth} onClose={() => setEditingHealth(null)} onUpdate={fetchData} />}
            <AddLoanOfferModal isOpen={isAddLoanOpen} onClose={() => setIsAddLoanOpen(false)} onSave={fetchData} />
            <AddHealthOfferModal isOpen={isAddHealthOpen} onClose={() => setIsAddHealthOpen(false)} onSave={fetchData} />
        </div>
    );
}