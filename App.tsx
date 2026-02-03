import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { ContentProvider } from './context/ContentContext';
import PublicView from './components/PublicView';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

const App: React.FC = () => {
  return (
    <ContentProvider>
        <HashRouter>
            <Routes>
                <Route path="/" element={<PublicView />} />
                <Route path="/admin" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Routes>
        </HashRouter>
    </ContentProvider>
  );
};

export default App;
