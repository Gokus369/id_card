import React from 'react';

function FrontDetails({ formData, setFormData, onNext }) {
    return (
        <div id="form-section" className="tab-content active">
            <div className="form-grid">
                <div className="form-group full-width">
                    <label htmlFor="fullName">Full Name</label>
                    <div className="input-wrapper">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <input 
                            type="text" 
                            id="fullName" 
                            placeholder="e.g. Abhay Sharma" 
                            required 
                            value={formData.fullName}
                            onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="designation">Designation</label>
                    <div className="input-wrapper">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <input 
                            type="text" 
                            id="designation" 
                            placeholder="e.g. Full Stack Developer" 
                            required 
                            value={formData.designation}
                            onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="department">Department</label>
                    <div className="input-wrapper">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <select 
                            id="department" 
                            required
                            value={formData.department}
                            onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                        >
                            <option value="" disabled>Select Department</option>
                            <option value="Technology">Technology</option>
                            <option value="Human Resources">Human Resources</option>
                            <option value="Digital Marketing">Digital Marketing</option>
                            <option value="UI/UX Design">UI/UX Design</option>
                            <option value="Quality Assurance">Quality Assurance</option>
                            <option value="Business Development">Business Development</option>
                            <option value="Operations">Operations</option>
                            <option value="Administration">Administration</option>
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="bloodGroup">Blood Group</label>
                    <div className="input-wrapper">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <select 
                            id="bloodGroup" 
                            required
                            value={formData.bloodGroup}
                            onChange={(e) => setFormData(prev => ({ ...prev, bloodGroup: e.target.value }))}
                        >
                            <option value="" disabled>Select Blood Group</option>
                            <option value="A+">A+ (A Positive)</option>
                            <option value="A-">A- (A Negative)</option>
                            <option value="B+">B+ (B Positive)</option>
                            <option value="B-">B- (B Negative)</option>
                            <option value="AB+">AB+ (AB Positive)</option>
                            <option value="AB-">AB- (AB Negative)</option>
                            <option value="O+">O+ (O Positive)</option>
                            <option value="O-">O- (O Negative)</option>
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="validUntil">Valid Until</label>
                    <div className="input-wrapper">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <input 
                            type="date" 
                            id="validUntil" 
                            required
                            value={formData.validUntil}
                            onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
                        />
                    </div>
                </div>
            </div>

            <div className="form-actions">
                <button type="button" className="btn next-tab-btn" onClick={onNext}>
                    Proceed to Back Side
                    <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

export default FrontDetails;
