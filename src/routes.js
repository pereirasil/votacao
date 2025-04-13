import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import Votacao from './Votacao/apps';

const PrivateRoute = ({ children }) => {
  const userName = localStorage.getItem('userName');
  const userRole = localStorage.getItem('userRole');
  const currentRoom = localStorage.getItem('currentRoom');

  if (!userName || !userRole) {
    // Se não há dados do usuário, redireciona para o login
    return <Navigate to={currentRoom ? `/login?roomId=${currentRoom}` : '/'} />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/votacao/:roomId" element={
          <PrivateRoute>
            <Votacao />
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
