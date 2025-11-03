import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorDebugger extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 ErrorDebugger caught an error:', error);
    console.error('🚨 Error Info:', errorInfo);
    console.error('🚨 Component Stack:', errorInfo.componentStack);
    
    this.setState({
      error,
      errorInfo
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '20px',
          border: '2px solid red',
          borderRadius: '8px',
          margin: '20px',
          backgroundColor: '#ffe6e6',
          color: '#cc0000'
        }}>
          <h2>🚨 Error Debugger Caught an Error</h2>
          <details style={{ marginTop: '10px' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
              Error Details
            </summary>
            <div style={{ marginTop: '10px', fontFamily: 'monospace' }}>
              <h3>Error:</h3>
              <pre style={{ backgroundColor: '#f0f0f0', padding: '10px', overflow: 'auto' }}>
                {this.state.error?.toString()}
              </pre>
              
              <h3>Stack:</h3>
              <pre style={{ backgroundColor: '#f0f0f0', padding: '10px', overflow: 'auto' }}>
                {this.state.error?.stack}
              </pre>
              
              {this.state.errorInfo && (
                <>
                  <h3>Component Stack:</h3>
                  <pre style={{ backgroundColor: '#f0f0f0', padding: '10px', overflow: 'auto' }}>
                    {this.state.errorInfo.componentStack}
                  </pre>
                </>
              )}
            </div>
          </details>
          
          <button 
            onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              backgroundColor: '#cc0000',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
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

export default ErrorDebugger;
