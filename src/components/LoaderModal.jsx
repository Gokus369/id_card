import React from 'react';

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

export default LoaderModal;
