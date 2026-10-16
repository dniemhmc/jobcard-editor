import '@fontsource-variable/inter';
import './theme.css';
import './app.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { browserStore } from './storage';

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root element');

createRoot(root).render(
  <StrictMode>
    <App store={browserStore(window.localStorage)} />
  </StrictMode>,
);
