import React, { useState, useEffect, useCallback } from 'react';
import ApplicationDetailsModal from './ApplicationDetailsModal'; 
import EditLoanOfferModal from './EditLoanOfferModal'; 
import AddLoanOfferModal from './AddLoanOfferModal';

// API Configuration (Unchanged)
const API_BASE_URL1 = 'https://jrzuzhs5t8.execute-api.eu-west-2.amazonaws.com/prod'; 
const LOAN_OFFERS_ENDPOINT = `${API_BASE_URL1}/loanoffers`;

// --- MOCK DATA (Unchanged) ---
const ALL_APPLICATIONS = [
    // ... (Your mock application data remains unchanged)
    {
        id: 1, name: "Sammy Dynawave", loanType: "Quick Cash Advance", requestedAmount: "2,000",
        confidenceScore: 75, monthlyIncome: "3,000", platform: "Swiggy", status: "Pending",
        age: 28, city: "New Delhi", workType: "Ride-sharing", maritalStatus: "Single",
        riskScore: 650, loanRate: 5.5, tenure: 6,
    },
    {
        id: 2, name: "Mona Whirlwind", loanType: "SecureHome Loan", requestedAmount: "2,500",
        confidenceScore: 65, monthlyIncome: "2,500", platform: "Ola", status: "Approved",
        age: 32, city: "Mumbai", workType: "Delivery", maritalStatus: "Married",
        riskScore: 720, loanRate: 7.5, tenure: 24,
    },
    {
        id: 3, name: "Levi Thunderstruck", loanType: "MoneyGrow Loan", requestedAmount: "5,000",
        confidenceScore: 92, monthlyIncome: "4,500", platform: "Uber", status: "Approved",
        age: 45, city: "Bangalore", workType: "Freelance", maritalStatus: "Single",
        riskScore: 800, loanRate: 4, tenure: 12,
    },
    {
        id: 4, name: "Tony Stark", loanType: "Rapid Saver Loan", requestedAmount: "1,000",
        confidenceScore: 22, monthlyIncome: "1,000", platform: "Freelance", status: "Rejected",
        age: 25, city: "Hyderabad", workType: "Other", maritalStatus: "Married",
        riskScore: 400, loanRate: 6, tenure: 18,
    },
    {
        id: 5, name: "Steve Rogers", loanType: "Quick Cash Advance", requestedAmount: "3,000",
        confidenceScore: 85, monthlyIncome: "3,500", platform: "Zomato", status: "Pending",
        age: 38, city: "Chennai", workType: "Delivery", maritalStatus: "Single",
        riskScore: 780, loanRate: 5.5, tenure: 6,
    },
    {
        id: 6, name: "Natasha Romanoff", loanType: "Smart Choice Fund", requestedAmount: "4,000",
        confidenceScore: 50, monthlyIncome: "3,000", platform: "Uber", status: "Rejected",
        age: 40, city: "Pune", workType: "Ride-sharing", maritalStatus: "Married",
        riskScore: 550, loanRate: 5, tenure: 15,
    },
];

// --- Reusable Applicant Card Component (Unchanged) ---
const ApplicantCard = ({ name, loanType, requestedAmount, confidenceScore, monthlyIncome, platform, status, onViewDetails }) => {
    // ... (implementation remains unchanged)
    const statusClass = {
        'Pending': 'client-status-pending',
        'Approved': 'client-status-approved',
        'Rejected': 'client-status-rejected',
    }[status] || 'client-status-pending';

    return (
        <div className="client-application-card">
            <div className="client-card-header">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{name}</h3>
                    <p className="text-sm text-gray-600">{loanType}</p>
                </div>
                <span className={statusClass}>
                    {status}
                </span>
            </div>
            <div className="client-details-grid">
                <div className="client-detail-item">
                    <p className="client-detail-label">Requested Amount</p>
                    <p className="client-detail-value">₹ {requestedAmount}</p>
                </div>
                <div className="client-detail-item">
                    <p className="client-detail-label">Confidence Score</p>
                    <p className="client-detail-value">{confidenceScore}</p>
                </div>
                <div className="client-detail-item">
                    <p className="client-detail-label">Monthly Income</p>
                    <p className="client-detail-value">₹{monthlyIncome}</p>
                </div>
                <div className="client-detail-item">
                    <p className="client-detail-label">Platform</p>
                    <p className="client-detail-value">{platform}</p>
                </div>
            </div>
            <a href="#" onClick={(e) => { e.preventDefault(); onViewDetails(); }} className="client-view-link">View Details</a>
        </div>
    );
};

// --- Reusable Loan Offer Card Component (UPDATED to show Public Link) ---
const LoanOfferCard = ({ title, isNew, loanAmount, interestRate, tenure, minEligibilityScore, publicLink, onEditOffer }) => (
    <div className="loan-offer-card relative">
        <h3 className="product-title">
            {title}
            {isNew && (
                <span className="offer-status-badge">
                    New
                </span>
            )}
        </h3>
        
        <div className="flex flex-col gap-y-1 mb-3">
            <div className="offer-detail-row">
                <span className="offer-label">Loan Amount</span>
                <span className="offer-value">{loanAmount}</span>
            </div>
            <div className="offer-detail-row">
                <span className="offer-label">Interest Rate</span>
                <span className="offer-value">{interestRate}</span>
            </div>
            <div className="offer-detail-row">
                <span className="offer-label">Tenure</span>
                <span className="offer-value">{tenure} months</span>
            </div>
            <div className="offer-detail-row">
                <span className="offer-label">Min Eligibility Score</span>
                <span className="offer-value">{minEligibilityScore}</span>
            </div>
        </div>
        
        {publicLink && (
            <div className="mt-2 mb-3">
                <p className="offer-label font-semibold text-xs mb-1">Public Offer Link:</p>
                <a 
                    href={publicLink} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-xs text-blue-600 hover:text-blue-800 break-all"
                >
                    {publicLink.length > 50 ? publicLink.substring(0, 50) + '...' : publicLink}
                </a>
            </div>
        )}
        
        <button onClick={onEditOffer} className="edit-offer-btn">
            Edit Offer
        </button>
    </div>
);


// --- AdminDashboardPage Component ---
const AdminDashboardPage = ({ getValidAccessToken }) => { 
    // Application Management State (Unchanged)
    const [applications, setApplications] = useState(ALL_APPLICATIONS);
    const [filterStatus, setFilterStatus] = useState('All Statuses');
    const [selectedApplication, setSelectedApplication] = useState(null); 

    // Loan Offer Management State (Unchanged)
    const [loanOffers, setLoanOffers] = useState([]); 
    const [selectedOffer, setSelectedOffer] = useState(null); 
    const [isAddOfferModalOpen, setIsAddOfferModalOpen] = useState(false);
    const [isLoadingOffers, setIsLoadingOffers] = useState(true);

    // --- API & DATA FETCHING LOGIC (Minimally Changed for clarity) ---

    const fetchLoanOffers = useCallback(async () => {
        setIsLoadingOffers(true);
        // NOTE: No token logic needed here as per API Gateway setup.
        
        try {
            const response = await fetch(LOAN_OFFERS_ENDPOINT, {
                method: 'GET',
                headers: {}, 
            });

            if (!response.ok) throw new Error(`Failed to fetch loan offers: ${response.status}`);

            const data = await response.json();
            
            const mappedOffers = data.map(offer => ({
                id: offer.id,
                title: offer.title,
                isNew: false, 
                loanAmount: `₹${offer.minAmount} - ₹${offer.maxAmount}`,
                interestRate: offer.interestRate,
                tenure: offer.tenureMonths,
                minEligibilityScore: offer.minEligibilityScore,
                minAmount: offer.minAmount,
                maxAmount: offer.maxAmount,
                description: offer.description,
                status: offer.status,
                // NEW ATTRIBUTE MAPPING
                publicLink: offer.publicLink || '', 
            }));
            
            setLoanOffers(mappedOffers);
        } catch (error) {
            console.error("Error fetching loan offers:", error);
        } finally {
            setIsLoadingOffers(false);
        }
    }, []); 

    useEffect(() => {
        fetchLoanOffers();
    }, [fetchLoanOffers]);


    // --- API SAVE/UPDATE LOGIC (Updated to include publicLink) ---

    const apiCall = useCallback(async (method, offerData) => {
        // NOTE: No token logic needed here as per API Gateway setup.

        // Prepare data for the API (convert frontend structure to flat object)
        const apiData = {
            id: offerData.id,
            title: offerData.title,
            minAmount: offerData.minAmount,
            maxAmount: offerData.maxAmount,
            interestRate: offerData.interestRate,
            tenureMonths: offerData.tenure,
            minEligibilityScore: offerData.minEligibilityScore,
            description: offerData.description,
            status: offerData.status,
            // NEW: Include publicLink in the payload
            publicLink: offerData.publicLink || '',
        };
        
        try {
            const response = await fetch(LOAN_OFFERS_ENDPOINT, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(apiData),
            });

            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`API failed with status ${response.status}. Error: ${errorBody}`);
            }
            return response.json();
        } catch (error) {
            console.error(`Error during ${method} loan offer:`, error.message);
            alert(`Failed to save loan offer: ${error.message}`);
            return null;
        }
    }, []); 


    // --- LOAN OFFER MODAL HANDLERS (Unchanged functionality) ---

    const handleEditOfferClick = (offer) => {
        setSelectedOffer(offer);
    };

    const handleCloseEditOfferModal = () => {
        setSelectedOffer(null);
    };

    const handleUpdateOffer = async (updatedOffer) => {
        const result = await apiCall('PUT', updatedOffer);
        if (result) {
            fetchLoanOffers(); 
            handleCloseEditOfferModal();
        }
    };

    const handleOpenAddOfferModal = () => {
        setIsAddOfferModalOpen(true);
    };

    const handleCloseAddOfferModal = () => {
        setIsAddOfferModalOpen(false);
    };

    const handleSaveNewOffer = async (newOffer) => {
        const offerToSave = { ...newOffer, status: newOffer.status || 'Active' };
        
        const result = await apiCall('POST', offerToSave);
        if (result && result.OfferID) {
            console.log(`New Loan Offer ${newOffer.title} created with ID: ${result.OfferID}`);
            fetchLoanOffers();
            handleCloseAddOfferModal();
        }
    };


    // --- APPLICATION MODAL HANDLERS (Unchanged) ---
    const handleViewDetails = (application) => setSelectedApplication(application);
    const handleCloseApplicationModal = () => setSelectedApplication(null);
    const handleDecision = (id, newStatus) => {
        setApplications(prevApps => prevApps.map(app => app.id === id ? { ...app, status: newStatus } : app));
        handleCloseApplicationModal();
    };
    const handleApprove = (id) => handleDecision(id, 'Approved');
    const handleReject = (id) => handleDecision(id, 'Rejected');


    // FILTERING LOGIC (Unchanged)
    const filteredApplications = applications.filter(app => {
        if (filterStatus === 'All Statuses') return true;
        return app.status === filterStatus; 
    });
    const handleFilterChange = (e) => setFilterStatus(e.target.value);


    return (
        <div className="admin-dashboard-page">
            
            {/* Modals */}
            <ApplicationDetailsModal
                application={selectedApplication}
                onClose={handleCloseApplicationModal}
                onApprove={handleApprove}
                onReject={handleReject}
            />
            <EditLoanOfferModal
                offer={selectedOffer}
                onClose={handleCloseEditOfferModal}
                onUpdate={handleUpdateOffer}
            />
            <AddLoanOfferModal
                isOpen={isAddOfferModalOpen}
                onClose={handleCloseAddOfferModal}
                onSave={handleSaveNewOffer}
            />

            {/* Page-Specific Banner */}
            <div className="admin-header">
                <div className="admin-header-content">
                    <h1>Admin Dashboard</h1>
                    <p>Manage loan applications and product offerings</p>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="admin-main-content">
                
                {/* Loan Applications Section (Unchanged) */}
                <div className="mb-12">
                    <div className="admin-section-header">
                        <h2>Loan Applications</h2>
                        <button onClick={handleOpenAddOfferModal} className="add-loan-button">
                            Add New Loan Offer
                        </button>
                    </div>

                    <div className="application-filter-bar">
                        <label htmlFor="application-status">Application Status</label>
                        <select
                            id="application-status"
                            className="input" 
                            value={filterStatus}
                            onChange={handleFilterChange}
                        >
                            <option value="All Statuses">All Statuses</option>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>

                    <div className="application-list-grid">
                        {filteredApplications.length > 0 ? (
                            filteredApplications.map(app => (
                                <ApplicantCard
                                    key={app.id}
                                    {...app}
                                    onViewDetails={() => handleViewDetails(app)} 
                                />
                            ))
                        ) : (
                            <p className="col-span-full text-center text-gray-500">
                                No applications found with status: "{filterStatus}"
                            </p>
                        )}
                    </div>
                </div>

                {/* Loan Offers Management Section (Unchanged structure) */}
                <div>
                    <div className="admin-section-header">
                        <h2>Loan Offers Management</h2>
                    </div>
                    
                    {isLoadingOffers ? (
                        <p className="text-center text-gray-500">Loading loan offers...</p>
                    ) : (
                        <div className="loan-offers-grid">
                            {loanOffers.map(offer => (
                                <LoanOfferCard
                                    key={offer.id}
                                    {...offer}
                                    onEditOffer={() => handleEditOfferClick(offer)}
                                />
                            ))}
                            {loanOffers.length === 0 && (
                                <p className="col-span-full text-center text-gray-500">
                                    No loan offers found. Add a new one above.
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;