import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import DetailsWindow from './detailsWindow.jsx'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <DetailsWindow />
    </StrictMode>,
)
