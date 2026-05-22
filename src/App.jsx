import React, { useState, useEffect, useRef, useMemo } from 'react';
import html2canvas from 'html2canvas';

// Component Imports
import FrontDetails from './components/FrontDetails';
import BackDetails from './components/BackDetails';
import MediaUploads from './components/MediaUploads';

import CardPreview from './components/CardPreview';
import LoaderModal from './components/LoaderModal';
import ToastNotification from './components/ToastNotification';

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
        companyEmail: 'hoxinfotech.in@gmail.com',
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

    // Canvas Refs for High-Res Print Compilation (replaces document.getElementById)
    const cardFrontRef = useRef(null);
    const cardBackRef = useRef(null);

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
            const frontCard = cardFrontRef.current;
            const backCard = cardBackRef.current;
            
            if (!frontCard || !backCard) {
                throw new Error("Card references not loaded in DOM.");
            }

            // Set scale high for clean physical PVC printers
            const config = {
                scale: 3,
                useCORS: true,
                backgroundColor: null,
                logging: false
            };

            const frontCanvas = await html2canvas(frontCard, config);
            const backCanvas = await html2canvas(backCard, config);

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
                        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="var(--theme-primary, #0e3b4a)">
                            <rect x="15" y="15" width="22" height="22" rx="8" />
                            <rect x="63" y="63" width="22" height="22" rx="8" />
                            <path d="M 15 57 C 15 49, 21 43, 29 43 H 49 C 57 43, 63 37, 63 29 V 23 A 8 8 0 0 1 71 15 H 77 A 8 8 0 0 1 85 23 V 43 C 85 51, 79 57, 71 57 H 51 C 43 57, 37 63, 37 71 V 77 A 8 8 0 0 1 29 85 H 23 A 8 8 0 0 1 15 77 Z" />
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
                    </form>
                </div>

                {/* Right Column 3D Card Viewport */}
                <div className="preview-column">
                    <div className="panel preview-panel">
                        <div className="preview-header">
                            <h2 className="preview-title">Real-Time 3D Card Preview</h2>
                            <p className="preview-subtitle">Hover to tilt 3D card. Use the buttons below to flip or export.</p>
                        </div>

                        <div className="preview-stage">
                            <CardPreview 
                                formData={formData} 
                                isFlipped={isFlipped} 
                                cardFrontRef={cardFrontRef} 
                                cardBackRef={cardBackRef} 
                            />
                        </div>

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
                </div>
            </main>

            {/* Dialogs and loaders */}
            <LoaderModal loader={loader} />
            <ToastNotification toast={toast} />
        </React.Fragment>
    );
}

export default App;
