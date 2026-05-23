/**
 * Hox Infotech - ID Card Builder (React 18 Edition)
 * Re-engineered codebase utilizing React state management, components, hooks,
 * and high-fidelity modular flows. Operates zero-installation via Babel standalone.
 */

const { useState, useEffect, useRef, useMemo } = React;

const defaultSheetsUrl = 'https://script.google.com/macros/s/AKfycbwQnpvCxDXNTM84H3t09nTUpCI4mrSEM__6ihfKJ2dcHzQRvr6WUNRkQnxDYEQKaE6Xwg/exec';
const defaultWhatsAppPhone = '9995550353';

function App() {
    // --- STATE MANAGEMENT ---
    const [formData, setFormData] = useState({
        fullName: '',
        designation: '',
        department: '',
        bloodGroup: '',
        validUntil: `${new Date().getFullYear()}-12-31`,
        mobileNo: '',
        emergencyContact: '',
        companyEmail: 'hoxinfotech.com@gmail.com',
        backContent: 'This card is the property of Hox Infotech Private Limited. If found, please return to the office address listed above.',
        photoBase64: '',
        signatureBase64: '',
        activeTheme: 'hox',
        googleSheetsUrl: '', // loaded in useEffect
        whatsAppPhone: '',   // loaded in useEffect
        autoWhatsApp: false  // loaded in useEffect
    });

    const [activeTab, setActiveTab] = useState('form-section');
    const [isFlipped, setIsFlipped] = useState(false);

    // Notification & Loader state
    const [toast, setToast] = useState({ show: false, title: '', body: '', type: 'success' });
    const [loader, setLoader] = useState({ show: false, title: '', message: '' });

    // Toast Timer Ref
    const toastTimerRef = useRef(null);

    // --- BOOT & LOCAL STORAGE ---
    useEffect(() => {
        // Run migration block for old/hijacked URLs
        const cachedUrl = localStorage.getItem('hox_sheets_url');
        let activeUrl = cachedUrl;
        if (!cachedUrl || cachedUrl.includes('AKfycbwImI') || cachedUrl.includes('AKfycbwlml') || cachedUrl.includes('AKfycbx') || cachedUrl.includes('AKfycby')) {
            activeUrl = defaultSheetsUrl;
            localStorage.setItem('hox_sheets_url', defaultSheetsUrl);
        }

        const cachedPhone = localStorage.getItem('hox_wa_phone') || defaultWhatsAppPhone;
        const cachedAutoWA = localStorage.getItem('hox_wa_auto') === 'true';

        setFormData(prev => ({
            ...prev,
            googleSheetsUrl: activeUrl,
            whatsAppPhone: cachedPhone,
            autoWhatsApp: cachedAutoWA
        }));
    }, []);

    // Helper to persist preferences dynamically
    const updatePref = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
        if (key === 'googleSheetsUrl') localStorage.setItem('hox_sheets_url', value.trim());
        if (key === 'whatsAppPhone') localStorage.setItem('hox_wa_phone', value.trim());
        if (key === 'autoWhatsApp') localStorage.setItem('hox_wa_auto', value);
    };

    // --- VISUAL TOAST AND LOADER ACTIONS ---
    const triggerToast = (title, body, type = 'success', duration = 4000) => {
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        setToast({ show: true, title, body, type });
        toastTimerRef.current = setTimeout(() => {
            setToast(prev => ({ ...prev, show: false }));
        }, duration);
    };

    const showLoader = (title, message) => {
        setLoader({ show: true, title, message });
    };

    const hideLoader = () => {
        setLoader(prev => ({ ...prev, show: false }));
    };



    // --- WHATSAPP DISPATCH UTILITY ---
    const dispatchWhatsApp = (customData = null) => {
        const source = customData || formData;
        const phone = formData.whatsAppPhone.trim();
        let cleanPhone = phone.replace(/[^0-9]/g, '');
        if (cleanPhone.length === 10) {
            cleanPhone = '91' + cleanPhone;
        }

        let friendlyDate = source.validUntil;
        const date = new Date(source.validUntil);
        if (!isNaN(date.getTime())) {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            friendlyDate = `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
        }

        const message = `*HOX INFOTECH PRIVATE LIMITED*
*ID Card Record Submitted*

*Employee details:*
• *Full Name:* ${source.fullName}
• *Designation:* ${source.designation}
• *Department:* ${source.department}
• *Blood Group:* ${source.bloodGroup}
• *Validity:* ${friendlyDate}

*Contact details:*
• *Mobile Number:* ${source.mobileNo}
• *Emergency Call:* ${source.emergencyContact}
• *Company Email:* ${source.companyEmail}

*Custom Card Terms:*
_"${source.backContent}"_

*Submitted via Hox ID Builder Portal*`;

        const waUrl = `https://api.whatsapp.com/send?phone=${encodeURIComponent(cleanPhone)}&text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');
    };

    // --- FORM SUBMIT PIPELINE ---
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.photoBase64) {
            alert('Please upload an Employee Photo under the "Photo & Signature" tab before saving.');
            setActiveTab('media-section');
            return;
        }

        const payload = {
            fullName: formData.fullName,
            designation: formData.designation,
            department: formData.department,
            bloodGroup: formData.bloodGroup,
            validUntil: formData.validUntil,
            mobileNo: formData.mobileNo,
            emergencyContact: formData.emergencyContact,
            companyEmail: formData.companyEmail,
            backContent: formData.backContent,
            photoBase64: formData.photoBase64,
            signatureBase64: formData.signatureBase64,
            theme: formData.activeTheme,
            timestamp: new Date().toISOString()
        };

        // Sync to Central Database
        if (formData.googleSheetsUrl) {
            showLoader('Saving Details...', 'Sending details, photo, and signature directly to database...');
            try {
                const rawUrl = formData.googleSheetsUrl.trim();
                const finalUrl = rawUrl.startsWith('http') ? rawUrl : `https://script.google.com/macros/s/${rawUrl}/exec`;
                await fetch(finalUrl, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });
                hideLoader();
                triggerToast('Save Successful!', 'Record successfully saved to database!', 'success');
            } catch (error) {
                hideLoader();
                console.error('Database Sync Error:', error);
                triggerToast('Network Error', 'Failed to reach central database.', 'error', 6000);
            }
        } else {
            triggerToast('Card Ready!', 'Details updated. Use "Export High-Res Prints" below to download the badge.', 'success', 5000);
        }

        if (formData.autoWhatsApp) {
            dispatchWhatsApp(payload);
        }

        // Reset employee-specific fields for the next entry
        setFormData(prev => ({
            ...prev,
            fullName: '',
            designation: '',
            department: '',
            bloodGroup: '',
            mobileNo: '',
            emergencyContact: '',
            photoBase64: '',
            signatureBase64: ''
        }));
        setActiveTab('form-section');
        setIsFlipped(false);
    };

    // --- CARD PRINT CAPTURE ---
    const exportHighResPrints = async () => {
        if (!formData.photoBase64) {
            alert('Please upload an Employee Photo under "Photo & Signature" before printing.');
            return;
        }

        showLoader('Preparing Printable Snapshots...', 'Generating ultra-sharp, high-definition front & back card prints. Please hold...');

        try {
            const frontCard = document.getElementById('cardFrontCanvasSource');
            const backCard = document.getElementById('cardBackCanvasSource');

            // Set scale high for clean physical PVC printers
            const config = {
                scale: 3,
                useCORS: true,
                backgroundColor: null,
                logging: false
            };

            const frontCanvas = await window.html2canvas(frontCard, config);
            const backCanvas = await window.html2canvas(backCard, config);

            const safeName = formData.fullName.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'employee';

            // Front Card download
            const frontLink = document.createElement('a');
            frontLink.download = `${safeName}_front.png`;
            frontLink.href = frontCanvas.toDataURL('image/png');
            frontLink.click();

            // Small delay to ensure browser handles secondary downloads gracefully
            setTimeout(() => {
                const backLink = document.createElement('a');
                backLink.download = `${safeName}_back.png`;
                backLink.href = backCanvas.toDataURL('image/png');
                backLink.click();

                hideLoader();
                triggerToast('Badge Prints Generated!', 'Check your downloads folder for print-ready front and back PNG cards.', 'success', 5000);
            }, 800);

        } catch (error) {
            hideLoader();
            console.error('Image Export Failure:', error);
            alert('An error occurred during print compilation. Please check connection and try again.');
        }
    };

    // --- HELPER COMPONENT PROPS ---
    const connectionStatus = useMemo(() => {
        const url = formData.googleSheetsUrl.trim();
        return url && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('AKfycb'));
    }, [formData.googleSheetsUrl]);

    return (
        <React.Fragment>
            {/* Header */}
            <header>
                <div className="header-container">
                    <div className="logo-section">
                        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="var(--theme-primary)" />
                                    <stop offset="100%" stop-color="var(--theme-secondary, #7c3aed)" />
                                </linearGradient>
                            </defs>
                            <path d="M20 20 L35 20 L35 45 L65 45 L65 20 L80 20 L80 80 L65 80 L65 55 L35 55 L35 80 L20 80 Z" fill="url(#logo-grad)" />
                            <polygon points="50,10 60,25 40,25" fill="#ffffff" opacity="0.8" />
                            <polygon points="50,90 60,75 40,75" fill="#ffffff" opacity="0.8" />
                        </svg>
                        <div>
                            <h1>Hox <span>Infotech</span></h1>
                            <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--text-muted)', fontWeight: '600' }}>Private Limited</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Wrapper */}
            <main className="main-wrapper">

                {/* Left Column Form Drawer */}
                <div className="panel">

                    {/* Navigation tabs */}
                    <nav className="tab-navigation">
                        <button type="button" className={`tab-btn ${activeTab === 'form-section' ? 'active' : ''}`} onClick={() => { setActiveTab('form-section'); setIsFlipped(false); }}>
                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Front Details
                        </button>
                        <button type="button" className={`tab-btn ${activeTab === 'back-section' ? 'active' : ''}`} onClick={() => { setActiveTab('back-section'); setIsFlipped(true); }}>
                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Back Details
                        </button>
                        <button type="button" className={`tab-btn ${activeTab === 'media-section' ? 'active' : ''}`} onClick={() => { setActiveTab('media-section'); setIsFlipped(false); }}>
                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Photo & Signature
                        </button>
                        <button type="button" className={`tab-btn ${activeTab === 'vault-section' ? 'active' : ''}`} onClick={() => { setActiveTab('vault-section'); setIsFlipped(false); }}>
                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20" />
                            </svg>
                            Vault
                        </button>
                    </nav>

                    {/* Forms */}
                    <form onSubmit={handleSubmit}>
                        {activeTab === 'form-section' && (
                            <FrontDetails formData={formData} setFormData={setFormData} onNext={() => { setActiveTab('back-section'); setIsFlipped(true); }} />
                        )}

                        {activeTab === 'back-section' && (
                            <BackDetails formData={formData} setFormData={setFormData} onBack={() => { setActiveTab('form-section'); setIsFlipped(false); }} onNext={() => { setActiveTab('media-section'); setIsFlipped(false); }} />
                        )}

                        {activeTab === 'media-section' && (
                            <MediaUploads
                                formData={formData}
                                setFormData={setFormData}
                                onBack={() => { setActiveTab('back-section'); setIsFlipped(true); }}
                                onWhatsAppShare={() => { dispatchWhatsApp(); triggerToast('Opening WhatsApp...', 'Opening WhatsApp chat thread with details.', 'info', 3000); }}
                                updatePref={updatePref}
                            />
                        )}

                        {activeTab === 'vault-section' && (
                            <VaultDrawer
                                vault={vault}
                                onLoad={loadFromVault}
                                onShare={dispatchWhatsApp}
                                onDelete={deleteFromVault}
                                onClear={clearVault}
                            />
                        )}
                    </form>
                </div>

                {/* Right Column 3D Card Viewport */}
                <div className="preview-column">
                    <div style={{ textAlign: 'center' }}>
                        <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: '700', fontSize: '1.5rem', letterSpacing: '-0.015em' }}>Real-Time 3D Card Preview</h2>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Hover to tilt 3D card. Use the buttons below to flip or export.</p>
                    </div>

                    <CardPreview formData={formData} isFlipped={isFlipped} />

                    <div className="preview-controls">
                        <button type="button" className="btn btn-secondary" onClick={() => setIsFlipped(!isFlipped)}>
                            <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3 3 3m-3-3v12" />
                            </svg>
                            Flip 3D Card
                        </button>
                        <button type="button" className="btn" onClick={exportHighResPrints}>
                            <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Export High-Res Prints
                        </button>
                    </div>
                </div>
            </main>

            {/* Dialogs and loaders */}
            <LoaderModal loader={loader} />
            <ToastNotification toast={toast} />
        </React.Fragment>
    );
}

// --- SUB-COMPONENT: FRONT DETAILS ---
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

// --- SUB-COMPONENT: BACK DETAILS ---
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

                <div className="form-group">
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

// --- SUB-COMPONENT: PHOTO & SIGNATURE & SETUP ---
function MediaUploads({ formData, setFormData, onBack, onWhatsAppShare, updatePref }) {
    const fileInputRef = useRef(null);
    const canvasRef = useRef(null);
    const canvasContextRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

    // Drag-Drop style feedback state
    const [dragActive, setDragActive] = useState(false);

    // --- PHOTO HANDLING ---
    const handlePhotoFile = (file) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            alert('Please upload a valid image file (PNG/JPG).');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const maxDim = 500;
                let width = img.width;
                let height = img.height;

                if (width > maxDim || height > maxDim) {
                    if (width > height) {
                        height = Math.round((height * maxDim) / width);
                        width = maxDim;
                    } else {
                        width = Math.round((width * maxDim) / height);
                        height = maxDim;
                    }
                }

                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = width;
                tempCanvas.height = height;
                const ctx = tempCanvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const optimizedBase64 = tempCanvas.toDataURL('image/jpeg', 0.85);
                setFormData(prev => ({ ...prev, photoBase64: optimizedBase64 }));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handlePhotoFile(e.dataTransfer.files[0]);
        }
    };

    // --- SIGNATURE CANVAS CORE ---
    const getCoordinates = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return [0, 0];
        const rect = canvas.getBoundingClientRect();

        if (e.touches && e.touches.length > 0) {
            return [
                e.touches[0].clientX - rect.left,
                e.touches[0].clientY - rect.top
            ];
        } else {
            return [
                e.clientX - rect.left,
                e.clientY - rect.top
            ];
        }
    };

    const initializeCanvasSettings = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.parentNode.getBoundingClientRect();
        // Set actual dimensions to match display sizes
        canvas.width = rect.width;
        canvas.height = rect.height;

        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = '#0e3b4a'; // Corporate Navy
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        canvasContextRef.current = ctx;

        // Re-draw signature if state contains it
        if (formData.signatureBase64) {
            const img = new Image();
            img.onload = () => ctx.drawImage(img, 0, 0);
            img.src = formData.signatureBase64;
        }
    };

    useEffect(() => {
        // Run canvas resize initialization
        initializeCanvasSettings();

        // Listeners for window scaling
        window.addEventListener('resize', initializeCanvasSettings);

        // Double kick-off to resolve hidden panel tab calculations
        const timer = setTimeout(initializeCanvasSettings, 100);

        return () => {
            window.removeEventListener('resize', initializeCanvasSettings);
            clearTimeout(timer);
        };
    }, []);

    useEffect(() => {
        if (!formData.signatureBase64) {
            const canvas = canvasRef.current;
            if (canvas && canvasContextRef.current) {
                canvasContextRef.current.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    }, [formData.signatureBase64]);

    const startDrawing = (e) => {
        const [x, y] = getCoordinates(e);
        setIsDrawing(true);
        setLastPos({ x, y });
    };

    const draw = (e) => {
        if (!isDrawing || !canvasContextRef.current) return;
        const [x, y] = getCoordinates(e);
        const ctx = canvasContextRef.current;

        ctx.beginPath();
        ctx.moveTo(lastPos.x, lastPos.y);
        ctx.lineTo(x, y);
        ctx.stroke();

        setLastPos({ x, y });
    };

    const stopDrawing = () => {
        if (isDrawing) {
            setIsDrawing(false);
            syncSignatureToState();
        }
    };

    const syncSignatureToState = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const base64 = canvas.toDataURL('image/png');
        setFormData(prev => ({ ...prev, signatureBase64: base64 }));
    };

    const clearSignature = () => {
        const canvas = canvasRef.current;
        if (!canvas || !canvasContextRef.current) return;
        const ctx = canvasContextRef.current;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setFormData(prev => ({ ...prev, signatureBase64: '' }));
    };

    return (
        <div id="media-section" className="tab-content active">
            <div className="upload-container">
                {/* Photo Upload Zone */}
                <div className="form-group">
                    <label>Employee Photo</label>
                    <div
                        className={`upload-card ${formData.photoBase64 ? 'has-file' : ''}`}
                        id="photoDropzone"
                        style={dragActive ? { borderColor: 'var(--theme-primary)', background: 'rgba(var(--theme-primary-rgb), 0.05)' } : {}}
                        onClick={() => fileInputRef.current.click()}
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            accept="image/*"
                            onChange={(e) => handlePhotoFile(e.target.files[0])}
                        />
                        <div className="upload-icon">
                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="upload-text">
                            <h4>Drag & Drop Photo</h4>
                            <p>or click to browse from device</p>
                        </div>
                        {formData.photoBase64 && (
                            <img id="photoPreviewImg" className="preview-thumb" src={formData.photoBase64} alt="Profile Preview" />
                        )}
                    </div>
                    {formData.photoBase64 && (
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                            <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                style={{ width: '100%' }}
                                onClick={(e) => { e.stopPropagation(); fileInputRef.current.click(); }}
                            >
                                Replace Photo
                            </button>
                        </div>
                    )}
                </div>

                {/* Canvas Signature Board */}
                <div className="signature-box">
                    <label>Authorized Signature <span className="optional">(Draw in the grid below)</span></label>
                    <div className="canvas-container">
                        <canvas
                            ref={canvasRef}
                            id="signatureCanvas"
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseOut={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={stopDrawing}
                        ></canvas>
                    </div>
                    <div className="canvas-controls">
                        <span className="canvas-info">Smooth strokes enabled. Use mouse or touch screen.</span>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={clearSignature}>
                            Clear Pad
                        </button>
                    </div>
                </div>
            </div>

            {/* WhatsApp Dispatch Preferences */}
            <div className="setup-grid" style={{ marginTop: '1.5rem', marginBottom: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                <div className="form-group">
                    <label htmlFor="whatsAppPhone">Admin WhatsApp Number <span className="optional">(For direct text dispatch)</span></label>
                    <div className="input-wrapper">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <input
                            type="tel"
                            id="whatsAppPhone"
                            placeholder="e.g. +919876543210"
                            value={formData.whatsAppPhone}
                            onChange={(e) => updatePref('whatsAppPhone', e.target.value)}
                        />
                    </div>
                    <span className="canvas-info">The number (with country code) to receive details.</span>
                </div>

                <div className="form-group checkbox-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', userSelect: 'none' }}>
                        <input
                            type="checkbox"
                            id="autoWhatsApp"
                            style={{ width: 'auto', marginRight: '0.5rem', cursor: 'pointer' }}
                            checked={formData.autoWhatsApp}
                            onChange={(e) => updatePref('autoWhatsApp', e.target.checked)}
                        />
                        Auto-open WhatsApp on Submit
                    </label>
                    <span className="canvas-info" style={{ marginTop: '0.25rem' }}>Launches WhatsApp thread automatically upon form submission.</span>
                </div>
            </div>

            {/* Stepper buttons */}
            <div className="form-actions">
                <button type="button" className="btn btn-secondary prev-tab-btn" onClick={onBack}>
                    Back
                </button>
                <button type="button" id="whatsAppShareBtn" className="btn btn-secondary" style={{ borderColor: '#25d366', color: '#25d366', background: 'rgba(37, 211, 102, 0.05)' }} onClick={onWhatsAppShare}>
                    <svg style={{ width: '18px', height: '18px', fill: 'currentColor' }} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" />
                    </svg>
                    Share to WhatsApp
                </button>
                <button type="submit" className="btn">
                    <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Submit & Save Details
                </button>
            </div>
        </div>
    );
}

// --- SUB-COMPONENT: HISTORY DRAWER (VAULT) ---
function VaultDrawer({ vault, onLoad, onShare, onDelete, onClear }) {
    return (
        <div id="vault-section" className="tab-content active">
            <div className="vault-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem' }}>Saved ID Cards Drawer</h4>
                {vault.length > 0 && (
                    <button type="button" className="btn btn-danger btn-sm" onClick={onClear}>Clear Vault</button>
                )}
            </div>

            {vault.length === 0 ? (
                <div id="vaultEmptyState" className="vault-empty" style={{ display: 'flex' }}>
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <div>
                        <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>No Collected Submissions</h4>
                        <p style={{ fontSize: '0.8rem' }}>Cards you generate and submit will be stored locally here for print downloads and rapid admin export.</p>
                    </div>
                </div>
            ) : (
                <div id="vaultList" className="vault-grid" style={{ display: 'grid' }}>
                    {vault.map((item, index) => (
                        <div className="vault-item" key={index}>
                            <div className="vault-info">
                                <img className="vault-avatar" src={item.photoBase64} alt="" />
                                <div className="vault-details">
                                    <h5>{item.fullName}</h5>
                                    <p>{item.designation}</p>
                                </div>
                            </div>
                            <div className="vault-actions">
                                <button type="button" className="btn btn-secondary btn-sm" onClick={() => onLoad(item)} title="Load card parameters back into preview container">
                                    Load
                                </button>
                                <button type="button" className="btn btn-secondary btn-sm" style={{ borderColor: '#25d366', color: '#25d366', background: 'rgba(37, 211, 102, 0.05)' }} onClick={() => onShare(item)} title="Share details of this employee on WhatsApp">
                                    WhatsApp
                                </button>
                                <button type="button" className="btn btn-danger btn-sm" onClick={() => onDelete(index, item.fullName)} title="Delete record from local machine">
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// --- SUB-COMPONENT: REAL-TIME 3D CARD CANVAS VIEWPORT ---
function CardPreview({ formData, isFlipped }) {
    const sceneRef = useRef(null);
    const viewportRef = useRef(null);
    const holoFrontRef = useRef(null);
    const holoBackRef = useRef(null);

    // Dynamic Validity string formatter
    const formattedValidity = useMemo(() => {
        if (!formData.validUntil) return 'Valid Until';
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const date = new Date(formData.validUntil);
        if (!isNaN(date.getTime())) {
            return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
        }
        return formData.validUntil;
    }, [formData.validUntil]);

    // 3D Perspective Mouse Tracker effect
    useEffect(() => {
        const scene = sceneRef.current;
        const viewport = viewportRef.current;
        const holoFront = holoFrontRef.current;
        const holoBack = holoBackRef.current;
        if (!scene || !viewport) return;

        const handleMouseMove = (e) => {
            const rect = scene.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Map dimensions to a maximum 14 deg tilt rotation
            const rotateY = ((x / rect.width) - 0.5) * 28;
            const rotateX = (((y / rect.height) - 0.5) * -28);

            const percentageX = (x / rect.width) * 100;
            const percentageY = (y / rect.height) * 100;

            // Re-calculate based on active flip
            const finalRotateY = isFlipped ? (rotateY + 180) : rotateY;

            viewport.style.transform = `rotateX(${rotateX}deg) rotateY(${finalRotateY}deg)`;
            viewport.style.transition = 'transform 0.05s ease';

            const holoPos = `${percentageX}% ${percentageY}%`;
            if (holoFront) holoFront.style.backgroundPosition = holoPos;
            if (holoBack) holoBack.style.backgroundPosition = holoPos;
        };

        const handleMouseLeave = () => {
            viewport.style.transition = 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)';
            viewport.style.transform = isFlipped ? 'rotateX(0deg) rotateY(180deg)' : 'rotateX(0deg) rotateY(0deg)';
            if (holoFront) holoFront.style.backgroundPosition = '50% 50%';
            if (holoBack) holoBack.style.backgroundPosition = '50% 50%';
        };

        scene.addEventListener('mousemove', handleMouseMove);
        scene.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            scene.removeEventListener('mousemove', handleMouseMove);
            scene.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [isFlipped]);

    // Manage standard structural transformations when flip state adjusts
    useEffect(() => {
        const viewport = viewportRef.current;
        if (!viewport) return;
        viewport.style.transition = 'transform var(--transition-slow)';
        viewport.style.transform = isFlipped ? 'rotateX(0deg) rotateY(180deg)' : 'rotateX(0deg) rotateY(0deg)';
    }, [isFlipped]);

    const qrCodeUrl = useMemo(() => {
        const qrContent = `Hox Infotech: ${formData.fullName || 'EMPLOYEE'}`;
        return `https://api.qrserver.com/v1/create-qr-code/?size=120x120&color=090d16&data=${encodeURIComponent(qrContent)}`;
    }, [formData.fullName]);

    return (
        <div className={`card-scene ${isFlipped ? 'flipped' : ''}`} id="cardScene" ref={sceneRef}>
            <div className="card-viewport" id="cardViewport" ref={viewportRef}>

                {/* ID CARD FRONT */}
                <div className="id-card id-card-front" id="cardFrontCanvasSource">
                    <div className="card-holo" id="cardHoloFront" ref={holoFrontRef}></div>
                    <div className="card-slot"></div>

                    {/* Header */}
                    <div className="card-header">
                        <div className="card-logo">
                            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20 20 L35 20 L35 45 L65 45 L65 20 L80 20 L80 80 L65 80 L65 55 L35 55 L35 80 L20 80 Z" fill="#ffffff" />
                            </svg>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                <div className="card-logo-text">HOX INFOTECH</div>
                                <div className="card-logo-sub">Private Limited</div>
                            </div>
                        </div>
                    </div>

                    {/* Card Body */}
                    <div className="card-body">
                        <div className="card-avatar-container">
                            {!formData.photoBase64 ? (
                                <div id="avatarPlaceholder" className="avatar-placeholder">
                                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span>No Photo</span>
                                </div>
                            ) : (
                                <img id="cardPhotoImg" className="card-photo" src={formData.photoBase64} alt="Profile Image" style={{ display: 'block' }} />
                            )}
                        </div>

                        <div className="card-field-group">
                            <div className="card-name" id="cardNameVal">{formData.fullName || 'EMPLOYEE NAME'}</div>
                        </div>
                        <div className="card-field-group">
                            <div className="card-title" id="cardTitleVal">{(formData.designation || 'DESIGNATION').toUpperCase()}</div>
                        </div>

                        <div className="card-info-table">
                            <div className="card-info-row">
                                <span className="card-info-label">Department</span>
                                <span className="card-info-val" id="cardDeptVal">{formData.department || 'Department'}</span>
                            </div>
                            <div className="card-info-row">
                                <span className="card-info-label">Blood Group</span>
                                <span className="card-badge" id="cardBloodVal">{formData.bloodGroup || '-'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="card-footer"></div>
                </div>

                {/* ID CARD BACK */}
                <div className="id-card id-card-back" id="cardBackCanvasSource">
                    <div className="card-holo" id="cardHoloBack" ref={holoBackRef}></div>
                    <div className="card-slot"></div>

                    <div className="card-back-body">
                        <div className="card-back-title">Emergency Contact Details</div>

                        <div className="card-back-info">
                            <div className="card-back-row">
                                <span className="card-back-label">Contact Number</span>
                                <span className="card-back-val" id="cardPhoneVal">{formData.mobileNo || '-'}</span>
                            </div>
                            <div className="card-back-row">
                                <span className="card-back-label">Emergency Call</span>
                                <span className="card-back-val" id="cardEmergVal">{formData.emergencyContact || '-'}</span>
                            </div>
                            <div className="card-back-row">
                                <span className="card-back-label">Company Email</span>
                                <span className="card-back-val" id="cardEmailVal">{formData.companyEmail || 'hoxinfotech.com@gmail.com'}</span>
                            </div>

                            <div className="card-back-row" style={{ marginTop: '2px' }}>
                                <span className="card-back-label">Valid Until</span>
                                <span className="card-back-val" id="cardValidityVal" style={{ color: 'var(--card-text-primary, #ffffff)', fontWeight: 600 }}>{formattedValidity}</span>
                            </div>
                        </div>

                        <div className="card-custom-text" id="cardBackTermsVal">
                            {formData.backContent}
                        </div>

                        <div className="card-bottom-row">
                            <div className="card-signature-wrapper">
                                <div className="card-signature-box">
                                    {!formData.signatureBase64 ? (
                                        <span id="cardSigPlaceholder" className="card-signature-placeholder">NO SIGNATURE</span>
                                    ) : (
                                        <img id="cardSigImg" className="card-signature-img" src={formData.signatureBase64} alt="Authorized Signature" style={{ display: 'block' }} />
                                    )}
                                </div>
                                <span className="card-signature-title">Card Holder</span>
                            </div>

                            <div className="card-qrcode-box" id="cardQrcodeContainer" title="Dynamic Card Verification Code">
                                <img src={qrCodeUrl} alt="Verify Badge" style={{ width: '100%', height: '100%' }} />
                            </div>
                        </div>
                    </div>

                    <div className="card-footer"></div>
                </div>

            </div>
        </div>
    );
}

// --- DIALOG MODAL: LOADER ---
function LoaderModal({ loader }) {
    if (!loader.show) return null;
    return (
        <div id="loaderModal" className="modal-overlay show">
            <div className="loader-card">
                <div className="spinner"></div>
                <h3 id="loaderTitle">{loader.title}</h3>
                <p id="loaderMessage">{loader.message}</p>
            </div>
        </div>
    );
}

// --- DIALOG MODAL: TOAST ALERT ---
function ToastNotification({ toast }) {
    if (!toast.show) return null;

    let borderColor = '#10b981'; // Success green
    let iconColor = '#10b981';
    let iconSVG = (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );

    if (toast.type === 'error') {
        borderColor = '#ef4444';
        iconColor = '#ef4444';
        iconSVG = (
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        );
    } else if (toast.type === 'warning' || toast.type === 'info') {
        borderColor = '#f59e0b';
        iconColor = '#f59e0b';
        iconSVG = (
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        );
    }

    return (
        <div id="toastNotification" className="toast show" style={{ borderColor }}>
            <div className="toast-icon" style={{ color: iconColor }}>
                {iconSVG}
            </div>
            <div className="toast-msg">
                <h5 id="toastTitle">{toast.title}</h5>
                <p id="toastBody">{toast.body}</p>
            </div>
        </div>
    );
}

// --- APP MOUNT TRIGGER ---
const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);
root.render(<App />);
