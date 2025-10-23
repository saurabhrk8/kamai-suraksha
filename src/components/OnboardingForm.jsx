import React, { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom"; 
// Link is not used but kept in import for consistency


// ==========================================================
// 1. OPTIMIZED SUB-COMPONENTS (Memoized)
// ==========================================================

// Component to render input fields with validation state
const InputField = React.memo(({ id, label, type, placeholder, value, onChange, error }) => (
    <div className="form-row" key={id}>
      <label htmlFor={id}>{label}</label>
      <input
        type={type}
        id={id}
        name={id}
        placeholder={placeholder || `Enter your ${label.toLowerCase()}`}
        value={value}
        onChange={onChange}
        className={`input ${error ? 'input-error' : ''}`}
      />
      {error && <p className="error-message">{error}</p>}
    </div>
));

const ProgressStepper = React.memo(({ currentStep }) => {
    const steps = ["Personal Info", "Work Details", "Review"];
    return (
      <div className="stepper">
        {steps.map((label, idx) => {
          const stepNumber = idx + 1;
          const isActive = currentStep >= stepNumber;
          return (
            <div
              key={idx}
              className={`step ${isActive ? "active" : ""}`}
            >
              <div className="step-number">{stepNumber}</div>
              <div className="step-label">{label}</div>
            </div>
          );
        })}
      </div>
    );
});

const ReviewItem = React.memo(({ label, value }) => (
    <div className="form-row small">
      <strong>{label}:</strong> {Array.isArray(value) ? value.join(", ") : value || "N/A"}
    </div>
));

// Custom Success Modal (Defined here for completeness)
const SuccessModal = React.memo(({ onClose }) => (
    <div className="modal-overlay">
        <div className="modal-content profile-complete-modal">
            <div className="success-icon-container" style={{color: '#0d9488'}}>✓</div>
            <h2 className="success-title">Profile Complete!</h2>
            <p className="success-message">
                Your profile has been successfully created. You can now 
                access personalized loan and insurance offers.
            </p>
            <button className="apply-button" style={{width: '90%'}} onClick={onClose}>
                Go to Dashboard
            </button>
        </div>
    </div>
));


// --- Main Onboarding Form Component ---

// 🛑 CRITICAL CHANGE: Receive all three props
const OnboardingForm = ({ onboardingData, setOnboardingData, onFormSubmit }) => {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // --- HANDLERS ---

  // Handler for back button
  const handleBack = useCallback(() => setStep(prevStep => prevStep - 1), []);

  // Handle simple input changes
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    // 🚀 Use setOnboardingData from props
    setOnboardingData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error for the current field being typed
    if (errors[name]) {
      setErrors(prev => {
        const updatedErrors = { ...prev };
        delete updatedErrors[name];
        return updatedErrors;
      });
    }
  }, [errors, setOnboardingData]); 

  // Handle multi-select changes
  const handleMultiSelectChange = useCallback((e) => {
    const { name, options } = e.target;
    const value = Array.from(options)
      .filter((option) => option.selected)
      .map((option) => option.value);
      
    // 🚀 Use setOnboardingData from props
    setOnboardingData((prev) => ({ ...prev, [name]: value }));

    // Clear error
    if (errors[name]) {
      setErrors(prev => {
        const updatedErrors = { ...prev };
        delete updatedErrors[name];
        return updatedErrors;
      });
    }
  }, [errors, setOnboardingData]);

  
  // --- Validation Logic (Uses onboardingData from props) ---
  const validateStep = useCallback((currentStep) => {
    let newErrors = {};
    let isValid = true;
    
    // 🚀 Use onboardingData from props
    const formData = onboardingData;

    if (currentStep === 1) {
      const requiredFields = ['full_name', 'age', 'city', 'address', 'aadhaar_number', 'pan_number', 'dob', 'phone_number', 'email_id', 'gender'];
      requiredFields.forEach(field => {
        if (!formData[field] || String(formData[field]).trim().length === 0 || (Array.isArray(formData[field]) && formData[field].length === 0)) {
          newErrors[field] = 'This field is required.';
          isValid = false;
        }
      });
      const ageNum = parseInt(formData.age);
      if (formData.age && (isNaN(ageNum) || ageNum < 18 || ageNum > 100)) {
        newErrors.age = 'Age must be between 18 and 100.';
        isValid = false;
      }
      if (formData.phone_number && !/^\d{10}$/.test(formData.phone_number)) {
        newErrors.phone_number = 'Phone number must be 10 digits.';
        isValid = false;
      }
      if (formData.email_id && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email_id)) {
          newErrors.email_id = 'Must be a valid email address.';
          isValid = false;
      }
      if (formData.aadhaar_number && !/^\d{12}$/.test(formData.aadhaar_number)) {
        newErrors.aadhaar_number = 'Aadhaar must be exactly 12 digits.';
        isValid = false;
      }
      if (formData.pan_number && !/^([A-Z]){5}([0-9]){4}([A-Z]){1}$/.test(formData.pan_number.toUpperCase())) {
        newErrors.pan_number = 'PAN must be 10 characters (e.g., ABCDE1234F).';
        isValid = false;
      }
    }
    
    if (currentStep === 2) {
        const requiredFields = ['gig_platform', 'work_type', 'work_tenure_months', 'monthly_income', 'bank_account_linked'];
        requiredFields.forEach(field => {
            if (!formData[field] || String(formData[field]).trim().length === 0 || (Array.isArray(formData[field]) && formData[field].length === 0)) {
              newErrors[field] = 'This field is required.';
              isValid = false;
            }
        });

        const tenureNum = parseInt(formData.work_tenure_months);
        if (formData.work_tenure_months && (isNaN(tenureNum) || tenureNum < 1)) {
            newErrors.work_tenure_months = 'Must be a positive number.';
            isValid = false;
        }
        const incomeNum = parseInt(formData.monthly_income);
        if (formData.monthly_income && (isNaN(incomeNum) || incomeNum < 100)) {
            newErrors.monthly_income = 'Income must be a valid positive amount.';
            isValid = false;
        }
    }

    setErrors(newErrors);
    return isValid;
  }, [onboardingData]); // Dependency on 'onboardingData' is essential for validation

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    } else {
      const firstErrorField = document.querySelector('.input-error');
      if (firstErrorField) {
         firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };
  
  // 🛑 CRITICAL CHANGE: Calls the parent submission handler! 🛑
  const handleSubmit = () => {
    if (validateStep(step)) { 
      if (step === 3) {
          console.log("Form review complete. Calling parent submission handler.");
          // 🚀 CALL THE PARENT FUNCTION, which handles the API exchange
          onFormSubmit(); 
      }
    } else if (step === 3) {
        // If validation fails on Step 2 (when submitting from Step 3)
        setStep(2);
        alert("Please fix the errors in Step 2 before submitting.");
    }
  };


  // --- Field Definitions (Unchanged) ---
  const personalInfoFields = useMemo(() => [
    { key: "full_name", label: "Full Name", type: "text" },
    { key: "age", label: "Age", type: "number" },
    { key: "phone_number", label: "Phone Number", type: "text" },
    { key: "email_id", label: "Email ID", type: "email" },
    { key: "dob", label: "Date Of Birth", type: "date" },
    { key: "city", label: "City", type: "text" },
    { key: "address", label: "Address", type: "text" },
    { key: "aadhaar_number", label: "Aadhaar No", type: "text" },
    { key: "pan_number", label: "Pan Card", type: "text" },
  ], []);

  const workInfoFields = useMemo(() => [
    { key: "work_tenure_months", label: "Work Tenure (Months)", type: "number" },
    { key: "monthly_income", label: "Monthly Income (₹)", type: "number" },
  ], []);

  // --- Main Render ---

  return (
    <div className="profile-page">
      <div className="profile-inner">
        <header className="profile-hero">
          <h1 className="profile-title">Complete Your Profile</h1>
          <p className="profile-subtitle">
            Help us understand your work to provide the best loan offers
          </p>
        </header>

        {/* Stepper (Memoized) */}
        <ProgressStepper currentStep={step} />

        {/* Form Container */}
        <section className="profile-card">
          {/* STEP 1: PERSONAL INFORMATION */}
          {step === 1 && (
            <>
              <h2 className="card-title">Step 1: Personal Information</h2>
              {personalInfoFields.map((field) => (
                <InputField 
                    key={field.key} 
                    id={field.key} 
                    label={field.label} 
                    type={field.type}
                    // 🚀 Use onboardingData from props
                    value={onboardingData[field.key]}
                    onChange={handleChange} 
                    error={errors[field.key]}
                />
              ))}

              <div className="form-row">
                <label htmlFor="gender">Gender</label>
                <select
                  id="gender"
                  name="gender"
                  // 🚀 Use onboardingData from props
                  value={onboardingData.gender}
                  onChange={handleChange}
                  className={`input ${errors.gender ? 'input-error' : ''}`}
                >
                  <option value="">Choose Your Gender...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && <p className="error-message">{errors.gender}</p>}
              </div>

              <div className="card-actions">
                <button onClick={handleNext} className="btn btn-primary">
                  Next Step →
                </button>
              </div>
            </>
          )}

          {/* STEP 2: WORK PROFILE */}
          {step === 2 && (
            <>
                <h2 className="card-title">Step 2: Work Profile</h2>

                {/* --- 1. Gig Platform Dropdown (Multi-Select) --- */}
                <div className="form-row">
                    <label htmlFor="gig_platform">Gig Platform</label>
                    <select
                        id="gig_platform" 
                        name="gig_platform"
                        multiple
                        // 🚀 Use onboardingData from props
                        value={onboardingData.gig_platform}
                        onChange={handleMultiSelectChange} 
                        className={`input ${errors.gig_platform ? 'input-error' : ''}`}
                        style={{ height: "100px" }}
                    >
                        <option value="Swiggy">Swiggy</option>
                        <option value="Zomato">Zomato</option>
                        <option value="Ola">Ola</option>
                        <option value="Uber">Uber</option>
                        <option value="Rapido">Rapido</option>
                        <option value="Blinkit">Blinkit</option>
                        <option value="Zepto">Zepto</option>
                        <option value="Other">Other</option> 
                    </select>
                    {errors.gig_platform && <p className="error-message">{errors.gig_platform}</p>}
                    <p className="small">
                        Hold Ctrl/Cmd or tap to select multiple options
                    </p>
                </div>

                {/* --- 2. Work Type (Single Select) --- */}
                <div className="form-row">
                    <label htmlFor="work_type">Work Type</label>
                    <select
                        id="work_type" 
                        name="work_type" 
                        // 🚀 Use onboardingData from props
                        value={onboardingData.work_type}
                        onChange={handleChange} 
                        className={`input ${errors.work_type ? 'input-error' : ''}`}
                    >
                        <option value="">Select your type of work</option>
                        <option value="Ride-sharing">Ride-sharing</option>
                        <option value="Delivery">Delivery</option>
                        <option value="Freelance">Freelance</option>
                        <option value="Other">Other</option>
                    </select>
                    {errors.work_type && <p className="error-message">{errors.work_type}</p>}
                </div>

                {/* --- 3. Remaining Fields --- */}
                {workInfoFields.map((field) => (
                    <InputField 
                        key={field.key} 
                        id={field.key} 
                        label={field.label} 
                        type={field.type}
                        // 🚀 Use onboardingData from props
                        value={onboardingData[field.key]}
                        onChange={handleChange} 
                        error={errors[field.key]}
                    />
                ))}

                {/* --- 4. Bank Account Linked (Select Yes/No) --- */}
                <div className="form-row">
                    <label htmlFor="bank_account_linked">Bank Account Linked</label>
                    <select
                        name="bank_account_linked"
                        id="bank_account_linked" 
                        // 🚀 Use onboardingData from props
                        value={onboardingData.bank_account_linked}
                        onChange={handleChange} 
                        className={`input ${errors.bank_account_linked ? 'input-error' : ''}`}
                    >
                        <option value="">Select Option</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                    </select>
                    {errors.bank_account_linked && <p className="error-message">{errors.bank_account_linked}</p>}
                </div>


                <div className="card-actions">
                    <button onClick={handleBack} className="btn">
                        ← Back
                    </button>
                    <button onClick={handleNext} className="btn btn-primary">
                        Next Step →
                    </button>
                </div>
            </>
          )}

          {/* STEP 3: REVIEW */}
          {step === 3 && (
            <>
              <h2 className="card-title">Step 3: Review Your Information</h2>

              <h3 className="small" style={{ marginTop: "20px" }}>
                Personal Information
              </h3>
              {personalInfoFields.map((f) => (
                <ReviewItem
                  key={f.key}
                  label={f.label}
                  // 🚀 Use onboardingData from props
                  value={onboardingData[f.key]}
                />
              ))}
              <ReviewItem label="Gender" value={onboardingData.gender} />

              <h3 className="small" style={{ marginTop: "20px" }}>
                Work Information
              </h3>
              {workInfoFields
                .concat([{key: 'gig_platform', label: 'Gig Platform'}, {key: 'work_type', label: 'Work Type'}, {key: 'bank_account_linked', label: 'Bank Account Linked'}])
                .map((f) => (
                <ReviewItem
                  key={f.key}
                  label={f.label}
                  // 🚀 Use onboardingData from props
                  value={
                    f.key === "gig_platform"
                      ? onboardingData[f.key].join(", ")
                      : onboardingData[f.key]
                  }
                />
              ))}

              <div className="card-actions">
                <button onClick={handleBack} className="btn">
                  ← Back
                </button>
                <button 
                  onClick={handleSubmit}
                  className="btn btn-primary"
                >
                  Submit Profile
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default OnboardingForm;