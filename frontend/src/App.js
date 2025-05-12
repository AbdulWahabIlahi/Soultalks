import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GlobalStyle from './theme/GlobalStyles';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Journal from './pages/Journal';
import JournalList from './pages/JournalList';
import JournalDetail from './pages/JournalDetail';
import Insights from './pages/Insights';
import Chat from './pages/Chat';
import VoiceChat from './pages/VoiceChat';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <GlobalStyle />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="journal" element={<Journal />} />
            <Route path="journals" element={<JournalList />} />
            <Route path="journal/:id" element={<JournalDetail />} />
            <Route path="insights" element={<Insights />} />
            <Route path="chat" element={<Chat />} />
            <Route path="voice-chat" element={<VoiceChat />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
