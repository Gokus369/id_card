import React, { useState, useEffect, useRef } from 'react';

function MediaUploads({ formData, setFormData, onBack, onWhatsAppShare, updatePref }) {
    const fileInputRef = useRef(null);
    const canvasRef = useRef(null);
    const canvasContextRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
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
        
        const parent = canvas.parentNode;
        if (!parent) return;
        const rect = parent.getBoundingClientRect();
        
        // Prevent setting 0-size canvas when mounted in a hidden tab
        if (rect.width === 0) {
            if (canvas.width === 0) {
                canvas.width = 340;
                canvas.height = 180;
            }
        } else {
            // Only update buffer dimension if display size changes to avoid clearing canvas
            if (canvas.width !== rect.width || canvas.height !== rect.height) {
                canvas.width = rect.width;
                canvas.height = rect.height;
            }
        }

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
        if (e.cancelable) e.preventDefault();
        // Ensure canvas is sized exactly to the parent container when starting interaction
        initializeCanvasSettings();
        const [x, y] = getCoordinates(e);
        setIsDrawing(true);
        setLastPos({ x, y });
    };

    const draw = (e) => {
        if (e.cancelable) e.preventDefault();
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
                            style={{ touchAction: 'none' }}
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
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413"/>
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

export default MediaUploads;
