import React from 'react';

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

export default ToastNotification;
