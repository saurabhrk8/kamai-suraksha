import React, { useState } from "react";

const GIG_OPTIONS = ["Swiggy", "Zomato", "Uber", "Ola", "Porter", "Zepto", "Blinkit", "Other"];

const InputField = ({ id, label, type = "text", value, onChange, readOnly, placeholder }) => (
  <div className="form-row" style={{ marginBottom: '15px' }}>
    <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px', color: '#334155' }}>{label}</label>
    <input
      type={type} name={id} value={value || ''} onChange={onChange}
      readOnly={readOnly} placeholder={placeholder} className="input"
      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: readOnly ? '#f1f5f9' : '#fff' }}
    />
  </div>
);

export default function OnboardingForm({ onboardingData, setOnboardingData, onFormSubmit }) {
  // Use the stage from DB if available, otherwise start at 1
  const [step, setStep] = useState(onboardingData.CurrentStage || 1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOnboardingData(prev => ({ ...prev, [name]: value }));
  };

  const handleGigToggle = (platform) => {
    // Handle both string and array formats from DB
    let current = Array.isArray(onboardingData.gig_platform) 
        ? onboardingData.gig_platform 
        : (onboardingData.gig_platform ? [onboardingData.gig_platform] : []);
        
    const updated = current.includes(platform) 
      ? current.filter(p => p !== platform) 
      : [...current, platform];
    setOnboardingData(prev => ({ ...prev, gig_platform: updated }));
  };

  return (
    <div className="profile-page" style={{ maxWidth: '700px', margin: '20px auto' }}>
      <div className="profile-inner">
        <section className="profile-card" style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px' }}>
            <span style={{ fontWeight: step === 1 ? '700' : '400', color: step === 1 ? '#2563eb' : '#94a3b8' }}>1. Personal</span>
            <span style={{ fontWeight: step === 2 ? '700' : '400', color: step === 2 ? '#2563eb' : '#94a3b8' }}>2. Work</span>
            <span style={{ fontWeight: step === 3 ? '700' : '400', color: step === 3 ? '#2563eb' : '#94a3b8' }}>3. Review</span>
          </div>

          {step === 1 && (
            <>
              <h3 style={{ marginBottom: '20px', color: '#1e293b' }}>Personal Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <InputField id="full_name" label="Full Name" value={onboardingData.full_name} onChange={handleChange} />
                <InputField id="phone_number" label="Phone Number" value={onboardingData.phone_number} onChange={handleChange} />
                <InputField id="email" label="Email" value={onboardingData.email} onChange={handleChange} readOnly />
                <InputField id="dob" label="Date of Birth" type="date" value={onboardingData.dob} onChange={handleChange} />
                <InputField id="pan_number" label="PAN" value={onboardingData.pan_number} onChange={handleChange} />
                <InputField id="aadhaar_number" label="Aadhaar" value={onboardingData.aadhaar_number} onChange={handleChange} />
              </div>
              <InputField id="address" label="Address" value={onboardingData.address} onChange={handleChange} />
              <button onClick={() => setStep(2)} className="btn btn-primary" style={{ width: '100%', marginTop: '20px', padding: '12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Next: Work Details</button>
            </>
          )}

          {step === 2 && (
            <>
              <h3 style={{ marginBottom: '20px', color: '#1e293b' }}>Work Details</h3>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '10px' }}>Gig Platforms</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {GIG_OPTIONS.map(opt => (
                    <button 
                      key={opt} type="button"
                      onClick={() => handleGigToggle(opt)}
                      style={{ 
                        padding: '8px 16px', borderRadius: '20px', border: '1px solid #2563eb',
                        background: onboardingData.gig_platform?.includes(opt) ? '#2563eb' : '#fff',
                        color: onboardingData.gig_platform?.includes(opt) ? '#fff' : '#2563eb',
                        cursor: 'pointer', fontSize: '0.9rem'
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <InputField id="work_type" label="Work Type" value={onboardingData.work_type} onChange={handleChange} />
                <InputField id="work_tenure" label="Work Tenure (Months)" type="number" value={onboardingData.work_tenure} onChange={handleChange} />
              </div>
              <InputField id="monthly_income" label="Monthly Income" type="number" value={onboardingData.monthly_income} onChange={handleChange} />
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button onClick={() => setStep(1)} style={{ flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer' }}>Back</button>
                <button onClick={() => setStep(3)} style={{ flex: 1, padding: '12px', borderRadius: '6px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>Review Profile</button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h3 style={{ marginBottom: '20px', color: '#1e293b' }}>Review & Submit</h3>
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ fontSize: '0.9rem' }}><strong>Name:</strong> {onboardingData.full_name}</div>
                <div style={{ fontSize: '0.9rem' }}><strong>Phone:</strong> {onboardingData.phone_number}</div>
                <div style={{ fontSize: '0.9rem' }}><strong>PAN:</strong> {onboardingData.pan_number}</div>
                <div style={{ fontSize: '0.9rem' }}><strong>Income:</strong> ₹{onboardingData.monthly_income}</div>
                <div style={{ fontSize: '0.9rem' }}><strong>Tenure:</strong> {onboardingData.work_tenure} Months</div>
                <div style={{ fontSize: '0.9rem', gridColumn: '1 / -1' }}><strong>Platforms:</strong> {Array.isArray(onboardingData.gig_platform) ? onboardingData.gig_platform.join(", ") : onboardingData.gig_platform || "None"}</div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button onClick={() => setStep(2)} style={{ flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer' }}>Edit</button>
                <button onClick={onFormSubmit} style={{ flex: 1, padding: '12px', borderRadius: '6px', border: 'none', background: '#10b981', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>Confirm & Save</button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}