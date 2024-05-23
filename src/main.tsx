import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx';
import './index.css';
import { GenerationProvider } from "./Reducers/generationReducer";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GenerationProvider>
      <App />
    </GenerationProvider>
  </React.StrictMode>,
)
