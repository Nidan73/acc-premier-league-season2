/**
 * ACC Futsal League - Main Application
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import HomePage from './pages/HomePage';
import AuctionPage from './pages/AuctionPage';
import LeaguePage from './pages/LeaguePage';
import LivePage from './pages/LivePage';
import AdminPage from './pages/AdminPage';
import TeamDetailPage from './pages/TeamDetailPage';

function AppContent() {
  const { isLoading, error, isInitialized } = useApp();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-lg">Connecting to database...</p>
          <p className="text-sm opacity-60">Please wait...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
        <div className="card bg-error text-error-content max-w-lg">
          <div className="card-body">
            <h2 className="card-title">⚠️ Connection Error</h2>
            <p>{error}</p>
            <div className="card-actions justify-end mt-4">
              <button 
                className="btn btn-sm"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
            <div className="mt-4 p-3 bg-base-100/20 rounded-lg text-sm">
              <p className="font-bold">Troubleshooting:</p>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Go to Firebase Console</li>
                <li>Open Realtime Database → Rules</li>
                <li>Set: {`{ "rules": { ".read": true, ".write": true } }`}</li>
                <li>Click "Publish"</li>
                <li>Refresh this page</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-dots loading-lg text-primary"></span>
          <p className="mt-4">Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/auction" element={<AuctionPage />} />
      <Route path="/league" element={<LeaguePage />} />
      <Route path="/live" element={<LivePage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/teams/:teamId" element={<TeamDetailPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AppProvider>
  );
}
