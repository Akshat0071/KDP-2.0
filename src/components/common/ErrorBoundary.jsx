import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[KDP ErrorBoundary caught error]:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          textAlign: 'center',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}>
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E6DCE2',
            borderRadius: 12,
            padding: 32,
            maxWidth: 480,
            boxShadow: '0 4px 16px rgba(48,39,43,0.06)',
          }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: '#FDF2F4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: '#D83040',
              fontWeight: 700,
              fontSize: 20,
            }}>
              !
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#30272B', margin: '0 0 8px' }}>
              Something went wrong loading this view
            </h2>
            <p style={{ fontSize: 13, color: '#746970', lineHeight: 1.5, margin: '0 0 20px' }}>
              A newer version of the application may have been deployed or a network interruption occurred.
            </p>
            <button
              onClick={this.handleReload}
              style={{
                background: '#7B2240',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 8,
                padding: '10px 20px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

