import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        console.error('App crashed:', error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: '100vh', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    background: '#0a0f1a', color: '#fff', fontFamily: 'monospace',
                    padding: '2rem', textAlign: 'center', gap: '1rem'
                }}>
                    <h2 style={{ color: '#f87171' }}>⚠️ Something went wrong</h2>
                    <pre style={{
                        background: '#1a1f2e', padding: '1rem', borderRadius: '8px',
                        fontSize: '0.75rem', maxWidth: '600px', overflowX: 'auto',
                        textAlign: 'left', color: '#fca5a5', whiteSpace: 'pre-wrap'
                    }}>
                        {this.state.error?.toString()}
                    </pre>
                    <button
                        onClick={() => this.setState({ hasError: false, error: null })}
                        style={{
                            background: '#3b82f6', border: 'none', color: '#fff',
                            padding: '0.5rem 1.5rem', borderRadius: '6px',
                            cursor: 'pointer', fontSize: '0.9rem'
                        }}
                    >
                        Try Again
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
