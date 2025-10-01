import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaChartBar,
  FaUsers,
  FaTasks,
  FaBug,
  FaCheckCircle,
  FaClock,
  FaExclamationCircle,
  FaChartLine,
  FaCalendarAlt,
  FaFlag,
  FaArrowUp,
  FaArrowDown,
  FaSearch
} from 'react-icons/fa';
import authService from '../services/authService';
import './AdminDashboard.css';

// Dashboard administrativo sem gráficos por enquanto

const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    const isAuth = authService.isAuthenticated();

    if (!currentUser || !isAuth) {
      navigate('/login', { replace: true });
      return;
    }

    const userRole = currentUser.role || 'member';
    if (userRole !== 'admin') {
      navigate('/dashboard', { replace: true });
      return;
    }

    setUser(currentUser);
    setIsAdmin(true);
    loadDashboardData();
  }, [navigate]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      console.log('📊 Carregando dados do dashboard administrativo...');

      // Dados mock para demonstração
      const mockData = {
        currentSprint: {
          id: 3,
          nome: 'Sprint 3 - Dashboard',
          progresso: 66.7,
          dataInicio: '2025-03-01',
          dataFim: '2025-03-14',
          totalTasks: 15,
          tasksConcluidas: 10,
          tasksEmAndamento: 4,
          tasksPendentes: 1
        },
        userTasks: [
          { nome: 'Ander Silva', concluidas: 12, emAndamento: 3, pendentes: 2 },
          { nome: 'João Santos', concluidas: 8, emAndamento: 5, pendentes: 1 },
          { nome: 'Maria Costa', concluidas: 15, emAndamento: 2, pendentes: 0 },
          { nome: 'Carlos Lima', concluidas: 6, emAndamento: 4, pendentes: 3 },
          { nome: 'Ana Souza', concluidas: 9, emAndamento: 3, pendentes: 1 }
        ],
        monthlyPerformance: [
          { mes: 'Jan', sprints: 2, tasks: 24, concluidas: 20 },
          { mes: 'Fev', sprints: 2, tasks: 28, concluidas: 25 },
          { mes: 'Mar', sprints: 3, tasks: 35, concluidas: 28 },
          { mes: 'Abr', sprints: 2, tasks: 22, concluidas: 18 },
          { mes: 'Mai', sprints: 3, tasks: 30, concluidas: 26 },
          { mes: 'Jun', sprints: 2, tasks: 25, concluidas: 22 }
        ],
        bugsAndImprovements: {
          bugsAbertos: 8,
          bugsFechados: 24,
          melhoriasPendentes: 12,
          melhoriasImplementadas: 18
        },
        systemStats: {
          totalUsers: 15,
          activeUsers: 12,
          totalBoards: 8,
          totalSprints: 12,
          totalTasks: 164,
          completedTasks: 119
        }
      };

      setDashboardData(mockData);
      console.log('✅ Dados do dashboard carregados:', mockData);

    } catch (error) {
      console.error('❌ Erro ao carregar dados do dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Funções de dados simplificadas para exibição

  if (isLoading) {
    return (
      <div className="admin-dashboard-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Carregando dashboard administrativo...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="admin-dashboard-container">
        <div className="access-denied">
          <h2>Acesso Negado</h2>
          <p>Você não tem permissão para acessar o dashboard administrativo.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      {/* Header */}
      <header className="admin-dashboard-header">
        <div className="header-left">
          <div className="logo">
            <h1>TimeBoard</h1>
          </div>
          <nav className="main-nav">
            <button className="nav-item active">
              <FaChartBar /> Dashboard
            </button>
            <button className="nav-item">
              <FaTasks /> Lista
            </button>
          </nav>
        </div>
        
        <div className="header-center">
          <div className="search-container">
            <FaSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Buscar dados..." 
              className="search-input"
            />
          </div>
        </div>
        
        <div className="header-right">
          <button className="header-btn">
            <FaClock />
          </button>
          <div className="user-menu">
            <div className="user-info">
              <div className="user-avatar admin">
                <FaUsers />
              </div>
              <span className="user-name">{user?.name}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="admin-dashboard-main">
        {/* Sidebar */}
        <aside className="admin-dashboard-sidebar">
          <div className="sidebar-section">
            <h3>Filtros</h3>
            <div className="filter-options">
              <button className="filter-btn active">Todos (4)</button>
              <button className="filter-btn">Públicos (2)</button>
              <button className="filter-btn">Privados (2)</button>
            </div>
          </div>

          <div className="sidebar-section">
            <h3>Sprint</h3>
            <div className="shortcuts">
              <button 
                className="shortcut-btn sprint-btn"
                onClick={() => navigate('/sprints')}
              >
                <FaFlag /> Gerenciar Sprints
              </button>
            </div>
          </div>

          <div className="sidebar-section">
            <h3>Atalhos</h3>
            <div className="shortcuts">
              <button 
                className="shortcut-btn"
                onClick={() => navigate('/my-tasks')}
              >
                <FaTasks /> Minhas Tarefas
              </button>
              <button className="shortcut-btn">
                <FaClock /> Notificações
              </button>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <div className="admin-dashboard-content">
          <div className="content-header">
            <h1>Dashboard Administrativo</h1>
            <p>Visão geral do sistema e métricas de performance</p>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon users">
                <FaUsers />
              </div>
              <div className="stat-info">
                <h3>{dashboardData?.systemStats.totalUsers}</h3>
                <p>Total de Usuários</p>
                <span className="stat-change positive">
                  <FaArrowUp /> +2 este mês
                </span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon tasks">
                <FaTasks />
              </div>
              <div className="stat-info">
                <h3>{dashboardData?.systemStats.totalTasks}</h3>
                <p>Total de Tarefas</p>
                <span className="stat-change positive">
                  <FaArrowUp /> +15 esta semana
                </span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon completed">
                <FaCheckCircle />
              </div>
              <div className="stat-info">
                <h3>{dashboardData?.systemStats.completedTasks}</h3>
                <p>Tarefas Concluídas</p>
                <span className="stat-change positive">
                  <FaArrowUp /> +8 hoje
                </span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon bugs">
                <FaBug />
              </div>
              <div className="stat-info">
                <h3>{dashboardData?.bugsAndImprovements.bugsAbertos}</h3>
                <p>Bugs Abertos</p>
                <span className="stat-change negative">
                  <FaArrowDown /> -3 esta semana
                </span>
              </div>
            </div>
          </div>

          {/* Info Cards Grid */}
          <div className="info-cards-grid">
            {/* Sprint Progress */}
            <div className="info-card">
              <div className="card-header">
                <h3>
                  <FaFlag /> Sprint Atual
                </h3>
                <span className="sprint-name">{dashboardData?.currentSprint.nome}</span>
              </div>
              <div className="card-content">
                <div className="sprint-info">
                  <div className="sprint-dates">
                    <span>{new Date(dashboardData?.currentSprint.dataInicio).toLocaleDateString('pt-BR')}</span>
                    <span>até</span>
                    <span>{new Date(dashboardData?.currentSprint.dataFim).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="sprint-progress">
                    <span>{dashboardData?.currentSprint.progresso}% concluído</span>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${dashboardData?.currentSprint.progresso}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="sprint-tasks">
                    <div className="task-stat">
                      <FaCheckCircle className="icon done" />
                      <span>{dashboardData?.currentSprint.tasksConcluidas} concluídas</span>
                    </div>
                    <div className="task-stat">
                      <FaClock className="icon doing" />
                      <span>{dashboardData?.currentSprint.tasksEmAndamento} em andamento</span>
                    </div>
                    <div className="task-stat">
                      <FaExclamationCircle className="icon pending" />
                      <span>{dashboardData?.currentSprint.tasksPendentes} pendentes</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* User Performance */}
            <div className="info-card">
              <div className="card-header">
                <h3>
                  <FaUsers /> Performance dos Usuários
                </h3>
                <span className="card-subtitle">Últimas 4 semanas</span>
              </div>
              <div className="card-content">
                <div className="user-list">
                  {dashboardData?.userTasks.map((user, index) => (
                    <div key={index} className="user-item">
                      <div className="user-name">{user.nome.split(' ')[0]}</div>
                      <div className="user-stats">
                        <span className="stat done">{user.concluidas}✓</span>
                        <span className="stat doing">{user.emAndamento}⏳</span>
                        <span className="stat pending">{user.pendentes}⏸</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Monthly Performance */}
            <div className="info-card full-width">
              <div className="card-header">
                <h3>
                  <FaChartLine /> Desempenho Mensal
                </h3>
                <span className="card-subtitle">Evolução das tarefas</span>
              </div>
              <div className="card-content">
                <div className="monthly-stats">
                  {dashboardData?.monthlyPerformance.map((month, index) => (
                    <div key={index} className="month-item">
                      <div className="month-name">{month.mes}</div>
                      <div className="month-data">
                        <div className="data-item">
                          <span className="label">Sprints:</span>
                          <span className="value">{month.sprints}</span>
                        </div>
                        <div className="data-item">
                          <span className="label">Tarefas:</span>
                          <span className="value">{month.tasks}</span>
                        </div>
                        <div className="data-item">
                          <span className="label">Concluídas:</span>
                          <span className="value success">{month.concluidas}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bugs and Improvements */}
            <div className="info-card">
              <div className="card-header">
                <h3>
                  <FaBug /> Bugs e Melhorias
                </h3>
                <span className="card-subtitle">Status atual</span>
              </div>
              <div className="card-content">
                <div className="bugs-stats">
                  <div className="bug-item">
                    <FaBug className="icon bug-open" />
                    <span className="label">Bugs Abertos:</span>
                    <span className="value">{dashboardData?.bugsAndImprovements.bugsAbertos}</span>
                  </div>
                  <div className="bug-item">
                    <FaCheckCircle className="icon bug-closed" />
                    <span className="label">Bugs Fechados:</span>
                    <span className="value">{dashboardData?.bugsAndImprovements.bugsFechados}</span>
                  </div>
                  <div className="bug-item">
                    <FaExclamationCircle className="icon improvement-pending" />
                    <span className="label">Melhorias Pendentes:</span>
                    <span className="value">{dashboardData?.bugsAndImprovements.melhoriasPendentes}</span>
                  </div>
                  <div className="bug-item">
                    <FaCheckCircle className="icon improvement-done" />
                    <span className="label">Melhorias Implementadas:</span>
                    <span className="value">{dashboardData?.bugsAndImprovements.melhoriasImplementadas}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="info-card">
              <div className="card-header">
                <h3>
                  <FaCalendarAlt /> Ações Rápidas
                </h3>
                <span className="card-subtitle">Acesso direto</span>
              </div>
              <div className="card-content">
                <div className="quick-actions">
                  <button 
                    className="action-btn primary"
                    onClick={() => navigate('/sprints')}
                  >
                    <FaFlag /> Nova Sprint
                  </button>
                  <button 
                    className="action-btn secondary"
                    onClick={() => navigate('/admin/members')}
                  >
                    <FaUsers /> Gerenciar Usuários
                  </button>
                  <button 
                    className="action-btn secondary"
                    onClick={() => navigate('/my-tasks')}
                  >
                    <FaTasks /> Ver Todas as Tarefas
                  </button>
                  <button className="action-btn secondary">
                    <FaBug /> Reportar Bug
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
