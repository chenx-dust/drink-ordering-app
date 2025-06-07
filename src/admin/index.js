import React from 'react';
import ReactDOM from 'react-dom/client';
import AdminPanel from '../components/admin/AdminPanel';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('admin-root'));
root.render(
  <React.StrictMode>
    <AdminPanel />
  </React.StrictMode>
); 