import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { TooltipProvider } from '~/components/ui/tooltip'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux'
import { store } from '~/redux/store'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <TooltipProvider>
          <ToastContainer position="top-right" />
          <App />
        </TooltipProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>
)
