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
            return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
        }
        return formData.validUntil;
    }, [formData.validUntil]);

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
                
                <div className="id-card id-card-front" id="cardFrontCanvasSource" ref={cardFrontRef}>
                    <div className="card-holo" id="cardHoloFront" ref={holoFrontRef}></div>
                    <div className="card-slot"></div>
                    
                    {/* Security Accents */}
                    
                    {/* Header */}
                    <div className="card-header">
                        <div className="card-logo">
                            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="#ffffff">
                                <rect x="15" y="15" width="22" height="22" rx="8" />
                                <rect x="63" y="63" width="22" height="22" rx="8" />
                                <path d="M 15 57 C 15 49, 21 43, 29 43 H 49 C 57 43, 63 37, 63 29 V 23 A 8 8 0 0 1 71 15 H 77 A 8 8 0 0 1 85 23 V 43 C 85 51, 79 57, 71 57 H 51 C 43 57, 37 63, 37 71 V 77 A 8 8 0 0 1 29 85 H 23 A 8 8 0 0 1 15 77 Z" />
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
                                <img id="cardPhotoImg" className="card-photo" src={formData.photoBase64} alt="Profile" style={{ display: 'block' }} />
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
                <div className="id-card id-card-back" id="cardBackCanvasSource" ref={cardBackRef}>
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
                                <span className="card-back-val" id="cardEmailVal">{formData.companyEmail || 'hoxinfotech.in@gmail.com'}</span>
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

export default CardPreview;
