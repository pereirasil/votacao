import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import BoardView from './components/BoardView';
import AvatarSelection from './components/AvatarSelection';
import MemberManagement from './components/MemberManagement';
import Settings from './components/Settings';
import SprintManagement from './components/SprintManagement';
import SprintTasksView from './components/SprintTasksView';
import SprintKanbanBoard from './components/SprintKanbanBoard';
import MyTasks from './components/MyTasks';
import AdminDashboard from './components/AdminDashboard';
import Votacao from './Votacao/apps';
import authService from './services/authService';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  console.log('🔐 PrivateRoute - isAuthenticated:', isAuthenticated);
  console.log('🔐 PrivateRoute - URL atual:', window.location.href);
  
  if (!isAuthenticated) {
    console.log('❌ Usuário não autenticado, redirecionando para login');
    console.log('❌ Redirecionando de:', window.location.href, 'para /login');
    return <Navigate to="/login" />;
  }

  console.log('✅ Usuário autenticado, renderizando componente');
  return children;
};

const VotingRoute = ({ children }) => {
  const userName = localStorage.getItem('userName');
  const userRole = localStorage.getItem('userRole');
  const userData = localStorage.getItem('userData');
  const currentRoom = localStorage.getItem('currentRoom');
  
  // Verificar se há dados do usuário no sistema de autenticação
  let hasUserData = false;
  if (userData) {
    try {
      const parsedUserData = JSON.parse(userData);
      hasUserData = !!(parsedUserData.name && parsedUserData.email);
    } catch (e) {
      console.error('Erro ao parsear userData:', e);
    }
  }
  
  // Usar dados do authService se disponíveis, senão usar dados do localStorage
  const hasLegacyData = !!(userName && userRole);
  const hasValidData = hasUserData || hasLegacyData;
  
  console.log('🔍 VotingRoute - Verificação de dados:', {
    userName,
    userRole,
    hasUserData,
    hasLegacyData,
    hasValidData,
    currentRoom
  });

  if (!hasValidData) {
    // Se não há dados do usuário, redireciona para o login
    console.log('❌ VotingRoute - Dados insuficientes, redirecionando para login');
    return <Navigate to={currentRoom ? `/login?roomId=${currentRoom}` : '/'} />;
  }

  console.log('✅ VotingRoute - Dados válidos, renderizando componente');
  return children;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        <Route path="/board/:boardId" element={
          <PrivateRoute>
            <BoardView />
          </PrivateRoute>
        } />
        <Route path="/trello" element={
          <PrivateRoute>
            <BoardView />
          </PrivateRoute>
        } />
        <Route path="/avatar" element={
          <PrivateRoute>
            <AvatarSelection />
          </PrivateRoute>
        } />
        <Route path="/admin/members" element={
          <PrivateRoute>
            <MemberManagement />
          </PrivateRoute>
        } />
        <Route path="/settings" element={
          <PrivateRoute>
            <Settings />
          </PrivateRoute>
        } />
        <Route path="/sprints" element={
          <PrivateRoute>
            <SprintManagement />
          </PrivateRoute>
        } />
        <Route path="/sprint/:sprintId/tasks" element={
          <PrivateRoute>
            <SprintTasksView />
          </PrivateRoute>
        } />
        <Route path="/sprint/:sprintId/board" element={
          <PrivateRoute>
            <SprintKanbanBoard />
          </PrivateRoute>
        } />
        <Route path="/my-tasks" element={
          <PrivateRoute>
            <MyTasks />
          </PrivateRoute>
        } />
        <Route path="/admin-dashboard" element={
          <PrivateRoute>
            <AdminDashboard />
          </PrivateRoute>
        } />
        <Route path="/votacao/:roomId" element={
          <VotingRoute>
            <Votacao />
          </VotingRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
