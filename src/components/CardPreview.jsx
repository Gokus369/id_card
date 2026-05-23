import React, { useEffect, useRef, useMemo } from 'react';

function CardPreview({ formData, isFlipped, cardFrontRef, cardBackRef }) {
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
            return `${String(date.getDate()).padStart(2, '0')} ${months[date.getMonth()]} ${date.getFullYear()}`;
        }
        return formData.validUntil;
    }, [formData.validUntil]);

    // Dynamic Joining Date string formatter
    const formattedJoining = useMemo(() => {
        if (!formData.joiningDate) return 'Date of Joining';
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const date = new Date(formData.joiningDate);
        if (!isNaN(date.getTime())) {
            return `${String(date.getDate()).padStart(2, '0')} ${months[date.getMonth()]} ${date.getFullYear()}`;
        }
        return formData.joiningDate;
    }, [formData.joiningDate]);

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

    // --- REUSABLE VECTOR SVG ICONS FOR ROWS ---
    const IdIcon = () => (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a3 3 0 100-6 3 3 0 000 6zm5 6a7 7 0 00-7-7h14a7 7 0 00-7 7z" />
        </svg>
    );

    const BuildingIcon = () => (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
    );

    const BloodIcon = () => (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
    );

    const PhoneIcon = () => (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
    );

    const CalendarIcon = () => (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    );

    const EmailIcon = () => (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
    );

    const ShieldCheckIcon = () => (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '15px', height: '15px', color: '#0e3b4a' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
    );

    const BellIcon = () => (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
    );

    return (
        <div className={`card-scene ${isFlipped ? 'flipped' : ''}`} id="cardScene" ref={sceneRef}>
            <div className="card-viewport" id="cardViewport" ref={viewportRef}>
                
                {/* ID CARD FRONT */}
                <div className="id-card id-card-front" id="cardFrontCanvasSource" ref={cardFrontRef}>
                    <div className="card-holo" id="cardHoloFront" ref={holoFrontRef}></div>
                    <div className="card-slot"></div>
                    
                    {/* Organic Curves Header Area */}
                    <div className="card-header">
                        <div className="card-header-waves">
                            <svg viewBox="0 0 320 150" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                                <path d="M0 0h320v95c0 0-40 28-160 28S0 95 0 95V0z" fill="#082b37" opacity="0.3" />
                                <path d="M0 0h320v82c0 0-30 33-160 33S0 82 0 82V0z" fill="#0c4c62" opacity="0.2" />
                                <path d="M0 0h320v110c0 0-40 22-160 22S0 110 0 110V0z" fill="#0e3b4a" />
                            </svg>
                        </div>

                        <div className="card-logo">
                            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="#ffffff">
                                <rect x="15" y="15" width="22" height="22" rx="8" />
                                <rect x="63" y="63" width="22" height="22" rx="8" />
                                <path d="M 15 57 C 15 49, 21 43, 29 43 H 49 C 57 43, 63 37, 63 29 V 23 A 8 8 0 0 1 71 15 H 77 A 8 8 0 0 1 85 23 V 43 C 85 51, 79 57, 71 57 H 51 C 43 57, 37 63, 37 71 V 77 A 8 8 0 0 1 29 85 H 23 A 8 8 0 0 1 15 77 Z" />
                            </svg>
                            <div className="card-logo-divider"></div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                <div className="card-logo-text">HOX INFOTECH</div>
                                <div className="card-logo-sub">Private Limited</div>
                            </div>
                        </div>
                    </div>

                    {/* Card Body */}
                    <div className="card-body">
                        {/* Circular Profile Avatar Container */}
                        <div className="card-avatar-container">
                            {!formData.photoBase64 ? (
                                <div id="avatarPlaceholder" className="avatar-placeholder">
                                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span>No Photo</span>
                                </div>
                            ) : (
                                <img id="cardPhotoImg" className="card-photo" src={formData.photoBase64} alt="Profile" style={{ display: 'block' }} />
                            )}
                        </div>

                        <div className="card-field-group">
                            <div className="card-name" id="cardNameVal">{formData.fullName || 'EMPLOYEE NAME'}</div>
                        </div>
                        <div className="card-field-group">
                            <div className="card-title" id="cardTitleVal">{(formData.designation || 'DESIGNATION').toUpperCase()}</div>
                        </div>

                        {/* Beautiful Dotted Separator */}
                        <div className="card-body-separator">
                            <div className="card-body-separator-line"></div>
                            <div className="card-body-separator-dot"></div>
                            <div className="card-body-separator-line"></div>
                        </div>

                        {/* Details Tabular Circular Icon Row Grid */}
                        <div className="card-info-table">
                            <div className="card-info-row">
                                <div className="card-info-left">
                                    <div className="card-info-icon"><IdIcon /></div>
                                    <span className="card-info-label">Employee ID</span>
                                </div>
                                <span className="card-info-divider">|</span>
                                <span className="card-info-val" id="cardEmpIdVal">{formData.employeeId || 'HIT-012'}</span>
                            </div>

                            <div className="card-info-row">
                                <div className="card-info-left">
                                    <div className="card-info-icon"><BuildingIcon /></div>
                                    <span className="card-info-label">Department</span>
                                </div>
                                <span className="card-info-divider">|</span>
                                <span className="card-info-val" id="cardDeptVal">{formData.department || 'Technology'}</span>
                            </div>

                            <div className="card-info-row">
                                <div className="card-info-left">
                                    <div className="card-info-icon"><BloodIcon /></div>
                                    <span className="card-info-label">Blood Group</span>
                                </div>
                                <span className="card-info-divider">|</span>
                                <span className="card-info-val" id="cardBloodVal" style={{ fontWeight: 800 }}>{formData.bloodGroup || 'B+'}</span>
                            </div>

                            <div className="card-info-row">
                                <div className="card-info-left">
                                    <div className="card-info-icon"><PhoneIcon /></div>
                                    <span className="card-info-label">Mobile</span>
                                </div>
                                <span className="card-info-divider">|</span>
                                <span className="card-info-val" id="cardMobileVal">{formData.mobileNo ? `+91 ${formData.mobileNo}` : '+91 98765 43210'}</span>
                            </div>

                            <div className="card-info-row">
                                <div className="card-info-left">
                                    <div className="card-info-icon"><CalendarIcon /></div>
                                    <span className="card-info-label">Date of Join</span>
                                </div>
                                <span className="card-info-divider">|</span>
                                <span className="card-info-val" id="cardJoinVal">{formattedJoining}</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Curved footer tab with website URL */}
                    <div className="card-footer-tab">
                        <span className="card-footer-url">www.hoxinfotech.com</span>
                    </div>
                </div>

                {/* ID CARD BACK */}
                <div className="id-card id-card-back" id="cardBackCanvasSource" ref={cardBackRef}>
                    <div className="card-holo" id="cardHoloBack" ref={holoBackRef}></div>
                    <div className="card-slot"></div>

                    {/* Back side Curved Header */}
                    <div className="card-header">
                        <div className="card-header-waves">
                            <svg viewBox="0 0 320 150" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                                <path d="M0 0h320v95c0 0-40 28-160 28S0 95 0 95V0z" fill="#082b37" opacity="0.3" />
                                <path d="M0 0h320v82c0 0-30 33-160 33S0 82 0 82V0z" fill="#0c4c62" opacity="0.2" />
                                <path d="M0 0h320v110c0 0-40 22-160 22S0 110 0 110V0z" fill="#0e3b4a" />
                            </svg>
                        </div>

                        <div className="card-logo">
                            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="#ffffff">
                                <rect x="15" y="15" width="22" height="22" rx="8" />
                                <rect x="63" y="63" width="22" height="22" rx="8" />
                                <path d="M 15 57 C 15 49, 21 43, 29 43 H 49 C 57 43, 63 37, 63 29 V 23 A 8 8 0 0 1 71 15 H 77 A 8 8 0 0 1 85 23 V 43 C 85 51, 79 57, 71 57 H 51 C 43 57, 37 63, 37 71 V 77 A 8 8 0 0 1 29 85 H 23 A 8 8 0 0 1 15 77 Z" />
                            </svg>
                            <div className="card-logo-divider"></div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                <div className="card-logo-text">EMERGENCY</div>
                                <div className="card-logo-sub" style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em' }}>CONTACT DETAILS</div>
                            </div>
                        </div>
                    </div>

                    <div className="card-back-body">
                        {/* Tabular Icon Row Grid for Emergency Contacts */}
                        <div className="card-back-info">
                            <div className="card-back-row">
                                <div className="card-info-left">
                                    <div className="card-info-icon"><PhoneIcon /></div>
                                    <span className="card-info-label">Contact No</span>
                                </div>
                                <span className="card-info-divider">|</span>
                                <span className="card-back-val" id="cardPhoneVal">{formData.mobileNo ? `+91 ${formData.mobileNo}` : '+91 98765 43210'}</span>
                            </div>

                            <div className="card-back-row">
                                <div className="card-info-left">
                                    <div className="card-info-icon"><BellIcon /></div>
                                    <span className="card-info-label">Emergency Call</span>
                                </div>
                                <span className="card-info-divider">|</span>
                                <span className="card-back-val" id="cardEmergVal">{formData.emergencyContact ? `+91 ${formData.emergencyContact}` : '+91 11223 44556'}</span>
                            </div>

                            <div className="card-back-row">
                                <div className="card-info-left">
                                    <div className="card-info-icon"><EmailIcon /></div>
                                    <span className="card-info-label">Company Email</span>
                                </div>
                                <span className="card-info-divider">|</span>
                                <span className="card-back-val" id="cardEmailVal">{formData.companyEmail || 'hoxinfotech.in@gmail.com'}</span>
                            </div>

                            <div className="card-back-row">
                                <div className="card-info-left">
                                    <div className="card-info-icon"><CalendarIcon /></div>
                                    <span className="card-info-label">Valid Until</span>
                                </div>
                                <span className="card-info-divider">|</span>
                                <span className="card-back-val" id="cardValidityVal" style={{ color: 'var(--theme-primary, #0e3b4a)', fontWeight: 800 }}>{formattedValidity}</span>
                            </div>
                        </div>

                        {/* Custom Card Terms Card Container with Shield Icon badge */}
                        <div className="card-custom-text" id="cardBackTermsVal">
                            <div className="card-custom-text-shield">
                                <ShieldCheckIcon />
                            </div>
                            {formData.backContent}
                        </div>

                        {/* Bottom Row: Signature & QR Code side-by-side */}
                        <div className="card-bottom-row">
                            <div className="card-signature-wrapper">
                                <div className="card-signature-box">
                                    {!formData.signatureBase64 ? (
                                        <span id="cardSigPlaceholder" className="card-signature-placeholder">NO SIGNATURE</span>
                                    ) : (
                                        <img id="cardSigImg" className="card-signature-img" src={formData.signatureBase64} alt="Authorized Signature" style={{ display: 'block' }} />
                                    )}
                                </div>
                                <span className="card-signature-title">Card Holder Signature</span>
                            </div>
                            
                            <div className="card-qrcode-wrapper">
                                <div className="card-qrcode-box" id="cardQrcodeContainer" title="Dynamic Card Verification Code">
                                    <img src={qrCodeUrl} alt="Verify Badge" style={{ width: '100%', height: '100%' }} />
                                </div>
                                <span className="card-qrcode-title">Scan To Verify</span>
                            </div>
                        </div>
                    </div>

                    {/* Curved footer tab with website URL */}
                    <div className="card-footer-tab">
                        <span className="card-footer-url">www.hoxinfotech.com</span>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default CardPreview;
