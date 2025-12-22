import React, { useState } from 'react';
import Dashboard from './components/Dashboard.jsx';
import LandingPage from './components/LandingPage.jsx';

function App() {
  const [showDashboard, setShowDashboard] = useState(false);

  const handleLogout = () => setShowDashboard(false);

  return (
    <div className="min-h-screen">
      {showDashboard ? (
        <Dashboard onLogout={handleLogout} />
      ) : (
        <LandingPage onEnter={() => setShowDashboard(true)} />
      )}
    </div>
  );
}

export default App;