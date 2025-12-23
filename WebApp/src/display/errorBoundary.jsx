import React from 'react'
import '../styles/errorBoundary.css'

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error }
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ errorInfo })
        // console.error("Error caught by ErrorBoundary:", error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className='error-container'>
                    <div>
                        <h2 className='error-text'>Whoops! Something went wrong. 😬</h2>
                        <p className='error-text'>{this.state.error?.toString()}</p>
                    </div>
                </div>
            )
        }
        return this.props.children
    }
}

export default ErrorBoundary
