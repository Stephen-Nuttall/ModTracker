import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './display/App.jsx'
import ErrorBoundary from './display/errorBoundary.jsx'
import './styles/index.css'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    </StrictMode>,
)
