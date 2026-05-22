import React from 'react';

function BackDetails({ formData, setFormData, onBack, onNext }) {
    return (
        <div id="back-section" className="tab-content active">
            <div className="form-grid">
                <div className="form-group">
                    <label htmlFor="mobileNo">Mobile Number</label>
                    <div className="input-wrapper">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <input 
                            type="tel" 
                            id="mobileNo" 
                            placeholder="e.g. +91 98765 43210" 
                            required
                            value={formData.mobileNo}
                            onChange={(e) => setFormData(prev => ({ ...prev, mobileNo: e.target.value }))}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="emergencyContact">Emergency Contact Number</label>
                    <div className="input-wrapper">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <input 
                            type="tel" 
                            id="emergencyContact" 
                            placeholder="e.g. +91 98765 55555" 
                            required
                            value={formData.emergencyContact}
                            onChange={(e) => setFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                        />
                    </div>
                </div>

                <div className="form-group full-width">
                    <label htmlFor="companyEmail">Company Email</label>
                    <div className="input-wrapper">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                        <input 
                            type="email" 
                            id="companyEmail" 
                            required
                            value={formData.companyEmail}
                            onChange={(e) => setFormData(prev => ({ ...prev, companyEmail: e.target.value }))}
                        />
                    </div>
                </div>

                <div className="form-group full-width">
                    <label htmlFor="backContent">Best ID Card Back Content <span className="optional">(Terms & Conditions)</span></label>
                    <textarea 
                        id="backContent" 
                        rows="3" 
                        placeholder="Write any instructions for card finders..."
                        value={formData.backContent}
                        onChange={(e) => setFormData(prev => ({ ...prev, backContent: e.target.value }))}
                    ></textarea>
                </div>
            </div>

            <div className="form-actions">
                <button type="button" className="btn btn-secondary prev-tab-btn" onClick={onBack}>
                    Back
                </button>
                <button type="button" className="btn next-tab-btn" onClick={onNext}>
                    Proceed to Uploads
                    <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

export default BackDetails;
