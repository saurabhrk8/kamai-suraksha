import React, { useState ,useEffect } from 'react';
import AddLoanProductModal from './AddLoanProductModal';
import '../app.css'; 
import EditAmountModal from './EditAmountModal'; 
import EditEligibilityModal from './EditEligibilityModal';
import EditLoanProductModal from './EditLoanProductModal';
import EditInterestRateModal from './EditInterestRateModal';



/**
 * NBFC Partner Dashboard Component
 * CORRECTED FINAL VERSION: Ensures StatCards are rendered correctly as three separate 
 * horizontal white boxes, matching the reference image (partner.png).
 * @returns {JSX.Element} The rendered dashboard content
 */

// Key used to store data in the browser's localStorage
const LOCAL_STORAGE_KEY = 'nbfcLoanProducts'; 

// Function to load initial data from localStorage or use defaults
const getInitialProducts = () => {
    const storedProducts = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedProducts) {
        return JSON.parse(storedProducts);
    }
    // Default/mock data if nothing is stored
    return [
        { id: 1, name: "Starter Loan", minAmount: 1000, maxAmount: 10000, interestRate: 9.5, tenure: 6 },
    ];
};


// --- New Loan Product Card Component ---
// Renders a single product in the detailed format matching partner3.png.
// Uses assumed custom CSS classes for styling.
const LoanProductCard = ({ product,onEditAmountClick,onEditEligibilityClick,onFullEditClick,onEditRateClick }) => {
    return (
      <div className="product-card">
        {/* Header */}
        <div className="product-header">
          <h3 className="product-title">{product.loanName}</h3>
          <div className="product-icons">
            <span className="icon"
             onClick={() => onFullEditClick(product)} >&#9998;</span>
            <span className="icon" 
            onClick={() => onEditRateClick(product)} >%</span>
          </div>
        </div>
  
        {/* Body */}
        <div className="product-body">
          <p>Status: {product.status || 'N/A'}</p>
          <p>Loan Amount Range ₹{product.minAmount || '-'} – ₹{product.maxAmount || '-'}</p>
          <p>Interest Rate {product.interestRate ? `${product.interestRate}% p.a.` : 'N/A'}</p>
          <p>Tenure {product.tenure ? `${product.tenure} months` : 'N/A'}</p>
          <p>Min. Eligibility Score {product.minEligibilityScore || 'N/A'}</p>
          <strong>Description</strong>
          <p>{product.description || 'No description provided.'}</p>
        </div>
  
        {/* Footer */}
        <div className="product-footer">
          <button className="product-btn"
          onClick={() => onEditAmountClick(product)} >Edit Amount</button>
          <button className="product-btn"
          onClick={() => onEditEligibilityClick(product)} >Edit Eligibility</button>
        </div>
      </div>
    );
  };  


const NBFC_PartnerDashboard = () => {
    // Dummy data to match the screenshot
    const data = {
        totalLoanProducts: 8,
        activeApplications: 24,
        approvedThisMonth: 156
    };

    const [loanProducts, setLoanProducts] = useState([
        // Initial mock data
        { id: 1, name: "Starter Loan", minAmount: 1000, maxAmount: 10000, interestRate: 9.5, tenure: 6 },
    ]);

    // 1. STATE TO CONTROL MODAL VISIBILITY
    const [isModalOpen, setIsModalOpen] = useState(false); 

    const [isEditAmountModalOpen, setIsEditAmountModalOpen] = useState(false);
    const [currentProductToEdit, setCurrentProductToEdit] = useState(null);

    const [isEditEligibilityModalOpen, setIsEditEligibilityModalOpen] = useState(false);
    const [isFullEditModalOpen, setIsFullEditModalOpen] = useState(false);

    const [isEditRateModalOpen, setIsEditRateModalOpen] = useState(false);




    // 2. DATA PERSISTENCE HOOK (Part C)
    // Runs every time loanProducts changes to save data to localStorage
    useEffect(() => {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(loanProducts));
        console.log("Data successfully saved to localStorage (local file simulation).");
    }, [loanProducts]); // Dependency array: runs every time loanProducts changes


    // Function to handle data submission from the modal
    // 3. SAVE HANDLER (Part B)
    const handleSaveNewProduct = (newProductData) => {
        const newProduct = {
            ...newProductData,
            id: Date.now(), 
        };
        // Update the state, which triggers the useEffect hook above
        setLoanProducts(prevProducts => [...prevProducts, newProduct]);
        console.log("New Product Added to State:", newProduct.loanName);
    };

    const handleUpdateLoanProduct = (id, updatedFields) => {
        setLoanProducts(prevProducts => 
            prevProducts.map(product => 
                product.id === id ? { ...product, ...updatedFields } : product
            )
        );
        console.log(`Product ID ${id} updated with new amounts.`);
    };

    

    // 2. UPDATED ON CLICK FUNCTION
    const handleAddNewLoanProduct = () => {
        // This line opens the modal
        setIsModalOpen(true); 
    };

    // ⬅️ ADD OR VERIFY THIS FUNCTION DEFINITION ⬅️
    const openEditAmountModal = (product) => {
    setCurrentProductToEdit(product);
    setIsEditAmountModalOpen(true);
    };

    const openEditEligibilityModal = (product) => {
        setCurrentProductToEdit(product);
        setIsEditEligibilityModalOpen(true);
    };

    const openFullEditModal = (product) => {
        setCurrentProductToEdit(product);
        setIsFullEditModalOpen(true);
    };

    const openEditRateModal = (product) => {
        setCurrentProductToEdit(product);
        setIsEditRateModalOpen(true);
    };
    

    // Colors matching the screenshot
    const PRIMARY_ACCENT_COLOR = '#40A8A4'; 
    const HOVER_PRIMARY_COLOR = '#348885'; 
    const TEXT_ACCENT_COLOR = '#40A8A4'; 
    const DARK_TEXT_COLOR = '#374151'; 

    // Component for the dashboard statistics cards
    // Dashboard Stat Card component
    const StatCard = ({ title, value }) => (
        <div className="stat-card">
        <p className="stat-title">{title}</p>
        <p className="stat-value">{value}</p>
        </div>
    );
  
    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <main className="max-w-7xl mx-auto">
                {/* --- Teal Banner Section --- */}
                <div className="herosub">
                    <h1>
                        NBFC Partner Dashboard
                    </h1>
                    <p>
                        Manage your loan products and track performance
                    </p>
                </div>

                {/* --- Statistics Cards Section --- */}
                <div className="stat-container">
                {/* 1. Total Loan Products Card */}
                <StatCard 
                    title="Total Loan Products" 
                    value={data.totalLoanProducts} 
                />

                {/* 2. Active Applications Card */}
                <StatCard 
                    title="Active Applications" 
                    value={data.activeApplications} 
                />

                {/* 3. Approved This Month Card */}
                <StatCard 
                    title="Approved This Month" 
                    value={data.approvedThisMonth} 
                />
                </div>


                {/* --- Loan Products Section --- */}
                <div>
                    <div>
                        <h2>Your Loan Products</h2>
                        <button
                            onClick={handleAddNewLoanProduct}
                            className="add-loan-button"
                            style={{ backgroundColor: PRIMARY_ACCENT_COLOR, '&:hover': { backgroundColor: HOVER_PRIMARY_COLOR } }}
                        >
                            Add New Loan Product
                        </button>
                    </div>
                    
                    {/* Placeholder for the actual list of loan products */}
                    {/* The Product Card List */}
                    <div className="product-list">
                        {loanProducts.length > 0 ? (
                            loanProducts.map((product) => (
                            <LoanProductCard key={product.id} product={product} 
                            onEditAmountClick={ openEditAmountModal } 
                            onEditEligibilityClick={openEditEligibilityModal} 
                            onFullEditClick={openFullEditModal} 
                            onEditRateClick={openEditRateModal} />
                            ))
                        ) : (
                            <div className="product-list">
                            No loan products have been added yet. Click 'Add New Loan Product' to begin.
                            </div>
                        )}
                    </div>
                </div>

            </main>
            {/* 3. MODAL RENDERED AT THE END */}
            <AddLoanProductModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                // IMPORTANT: Replace the comment with your actual save handler
                onSave={handleSaveNewProduct} 
            />

            <EditAmountModal
            isOpen={isEditAmountModalOpen}
            onClose={() => setIsEditAmountModalOpen(false)}
            product={currentProductToEdit}
            onUpdate={handleUpdateLoanProduct}
            />

            <EditEligibilityModal
            isOpen={isEditEligibilityModalOpen}
            onClose={() => setIsEditEligibilityModalOpen(false)}
            product={currentProductToEdit}
            onUpdate={handleUpdateLoanProduct} // Uses the same general update handler
            />

            <EditLoanProductModal
                isOpen={isFullEditModalOpen}
                onClose={() => setIsFullEditModalOpen(false)}
                product={currentProductToEdit}
                onUpdate={handleUpdateLoanProduct} 
            />

            <EditInterestRateModal
                isOpen={isEditRateModalOpen}
                onClose={() => setIsEditRateModalOpen(false)}
                product={currentProductToEdit}
                onUpdate={handleUpdateLoanProduct}
            />

        </div>
        
    );
};

export default NBFC_PartnerDashboard;