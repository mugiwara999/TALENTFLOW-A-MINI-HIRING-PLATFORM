import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { initializeStorage } from './utils/storage'

const { worker } = await import('./mocks/browser')
await worker.start({
  onUnhandledRequest: 'bypass',
})

await initializeStorage()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
