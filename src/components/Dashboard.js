import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaPlus, 
  FaTrello, 
  FaTasks, 
  FaCog, 
  FaSignOutAlt, 
  FaUser, 
  FaBell,
  FaSearch,
  FaFilter,
  FaColumns,
  FaList,
  FaUsers,
  FaFlag,
  FaChartBar,
  FaCheckCircle,
  FaClock,
  FaExclamationCircle,
  FaChartLine
} from 'react-icons/fa';
import authService from '../services/authService';
import BoardService from '../services/boardService';
import CardService from '../services/cardService';
import ProfileModal from './ProfileModal';
import './Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [boards, setBoards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban', 'boards', or 'list'
  const [isAdmin, setIsAdmin] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [showTaskFilter, setShowTaskFilter] = useState(false);
  const [taskFilterType, setTaskFilterType] = useState('');
  const [filteredTasks, setFilteredTasks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🏠 Dashboard carregando...');
    console.log('🏠 URL atual no Dashboard:', window.location.href);

    const currentUser = authService.getCurrentUser();
    console.log('👤 Usuário atual:', currentUser);

    const isAuth = authService.isAuthenticated();
    console.log('🔐 isAuthenticated no Dashboard:', isAuth);

    if (!currentUser || !isAuth) {
      console.log('❌ Usuário não encontrado ou não autenticado, redirecionando para login');
      console.log('❌ currentUser:', currentUser);
      console.log('❌ isAuth:', isAuth);
      console.log('❌ Redirecionando de Dashboard para /login');
      navigate('/login', { replace: true });
      return;
    }

    console.log('✅ Usuário encontrado e autenticado, carregando dashboard');
    setUser(currentUser);

    // Verificar se o usuário é admin
    const userRole = currentUser.role || 'member';
    const isUserAdmin = userRole === 'admin';
    setIsAdmin(isUserAdmin);
    console.log('👑 Usuário é admin:', isUserAdmin, 'Role:', userRole);

    // Se for admin, redirecionar para o dashboard administrativo
    if (isUserAdmin) {
      console.log('👑 Usuário é admin, redirecionando para AdminDashboard');
      navigate('/admin-dashboard', { replace: true });
      return;
    }

    loadBoards(currentUser);
    loadDashboardStats(currentUser);
  }, [navigate]);

  const loadBoards = async (currentUser) => {
    try {
      setIsLoading(true);
      console.log('📋 Carregando boards (MOCK)...');
      console.log('👤 Usuário atual na função loadBoards:', currentUser);
      
      // Dados mock para visualização
      const mockBoards = [
        {
          id: 1,
          title: 'Projeto Principal',
          description: 'Quadro principal do projeto de desenvolvimento',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_public: false,
          user_id: currentUser?.id,
          lists: [
            { id: 1, title: 'To Do', position: 1, cards: [
              { id: 1, title: 'Implementar autenticação', description: 'Criar sistema de login seguro', priority: 'high', due_date: '2024-01-15' },
              { id: 2, title: 'Configurar banco de dados', description: 'Setup inicial do PostgreSQL', priority: 'medium', due_date: '2024-01-20' }
            ]},
            { id: 2, title: 'In Progress', position: 2, cards: [
              { id: 3, title: 'Criar dashboard', description: 'Interface principal do sistema', priority: 'high', due_date: '2024-01-18' }
            ]},
            { id: 3, title: 'Done', position: 3, cards: [
              { id: 4, title: 'Setup do projeto', description: 'Configuração inicial do ambiente', priority: 'low', due_date: '2024-01-10' }
            ]}
          ],
          members: [
            { id: 1, user: { name: currentUser?.name, email: currentUser?.email }, role: 'owner' },
            { id: 2, user: { name: 'João Silva', email: 'joao@email.com' }, role: 'admin' },
            { id: 3, user: { name: 'Maria Santos', email: 'maria@email.com' }, role: 'member' }
          ]
        },
        {
          id: 2,
          title: 'Backlog de Funcionalidades',
          description: 'Lista de funcionalidades pendentes para implementação',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date(Date.now() - 3600000).toISOString(),
          is_public: true,
          user_id: currentUser?.id,
          lists: [
            { id: 4, title: 'Ideias', position: 1, cards: [
              { id: 5, title: 'Sistema de notificações', description: 'Push notifications para mobile', priority: 'medium', due_date: '2024-02-01' },
              { id: 6, title: 'Relatórios avançados', description: 'Dashboard com métricas detalhadas', priority: 'low', due_date: '2024-02-15' }
            ]},
            { id: 5, title: 'Prioritário', position: 2, cards: [
              { id: 7, title: 'Integração com API externa', description: 'Conectar com serviços de terceiros', priority: 'high', due_date: '2024-01-25' }
            ]}
          ],
          members: [
            { id: 4, user: { name: currentUser?.name, email: currentUser?.email }, role: 'owner' },
            { id: 5, user: { name: 'Pedro Costa', email: 'pedro@email.com' }, role: 'member' }
          ]
        },
        {
          id: 3,
          title: 'Sprint Atual',
          description: 'Tarefas do sprint atual em desenvolvimento',
          created_at: new Date(Date.now() - 172800000).toISOString(),
          updated_at: new Date(Date.now() - 7200000).toISOString(),
          is_public: false,
          user_id: currentUser?.id,
          lists: [
            { id: 6, title: 'Sprint Backlog', position: 1, cards: [
              { id: 8, title: 'Refatorar código legado', description: 'Melhorar qualidade do código existente', priority: 'high', due_date: '2024-01-30' },
              { id: 9, title: 'Implementar testes unitários', description: 'Aumentar cobertura de testes', priority: 'medium', due_date: '2024-02-05' }
            ]},
            { id: 7, title: 'Em Desenvolvimento', position: 2, cards: [
              { id: 10, title: 'Nova funcionalidade de busca', description: 'Sistema de busca avançada', priority: 'high', due_date: '2024-01-28' }
            ]},
            { id: 8, title: 'Review', position: 3, cards: [
              { id: 11, title: 'Otimização de performance', description: 'Melhorar velocidade da aplicação', priority: 'medium', due_date: '2024-01-22' }
            ]},
            { id: 9, title: 'Concluído', position: 4, cards: [
              { id: 12, title: 'Correção de bugs críticos', description: 'Resolver problemas de segurança', priority: 'high', due_date: '2024-01-15' }
            ]}
          ],
          members: [
            { id: 6, user: { name: currentUser?.name, email: currentUser?.email }, role: 'owner' },
            { id: 7, user: { name: 'Ana Lima', email: 'ana@email.com' }, role: 'admin' },
            { id: 8, user: { name: 'Carlos Oliveira', email: 'carlos@email.com' }, role: 'member' },
            { id: 9, user: { name: 'Fernanda Rocha', email: 'fernanda@email.com' }, role: 'member' },
            { id: 10, user: { name: 'Roberto Alves', email: 'roberto@email.com' }, role: 'member' }
          ]
        },
        {
          id: 4,
          title: 'Bugs e Melhorias',
          description: 'Quadro para reportar e corrigir bugs',
          created_at: new Date(Date.now() - 259200000).toISOString(),
          updated_at: new Date(Date.now() - 10800000).toISOString(),
          is_public: true,
          user_id: currentUser?.id,
          lists: [
            { id: 10, title: 'Bugs Críticos', position: 1, cards: [
              { id: 13, title: 'Erro de login em produção', description: 'Usuários não conseguem fazer login', priority: 'high', due_date: '2024-01-20' },
              { id: 14, title: 'Vazamento de dados', description: 'Informações sensíveis sendo expostas', priority: 'high', due_date: '2024-01-18' }
            ]},
            { id: 11, title: 'Bugs Menores', position: 2, cards: [
              { id: 15, title: 'Layout quebrado no mobile', description: 'Interface não responsiva em alguns dispositivos', priority: 'medium', due_date: '2024-01-25' }
            ]},
            { id: 12, title: 'Melhorias', position: 3, cards: [
              { id: 16, title: 'Adicionar tema escuro', description: 'Implementar modo escuro na interface', priority: 'low', due_date: '2024-02-10' },
              { id: 17, title: 'Melhorar UX do formulário', description: 'Simplificar processo de cadastro', priority: 'medium', due_date: '2024-02-01' }
            ]}
          ],
          members: [
            { id: 11, user: { name: currentUser?.name, email: currentUser?.email }, role: 'owner' },
            { id: 12, user: { name: 'Lucas Ferreira', email: 'lucas@email.com' }, role: 'admin' },
            { id: 13, user: { name: 'Juliana Martins', email: 'juliana@email.com' }, role: 'member' },
            { id: 14, user: { name: 'Diego Souza', email: 'diego@email.com' }, role: 'member' }
          ]
        }
      ];
      
      setBoards(mockBoards);
      console.log('✅ Boards carregados com sucesso (MOCK):', mockBoards);
      
    } catch (error) {
      setError('Erro ao carregar quadros');
      console.error('❌ Erro ao carregar boards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDashboardStats = async (currentUser) => {
    try {
      console.log('📊 Carregando estatísticas do dashboard...');
      
      const result = await CardService.getDashboardStats();
      
      if (result.success) {
        setDashboardStats(result.stats);
        console.log('✅ Estatísticas carregadas:', result.stats);
      } else {
        console.warn('⚠️ Não foi possível carregar estatísticas:', result.error);
        // Define estatísticas vazias se não conseguir carregar
        setDashboardStats({
          userTasks: {
            total: 0,
            completed: 0,
            inProgress: 0,
            pending: 0,
            overdue: 0
          },
          recentActivity: [],
          weeklyProgress: [],
          sprintProgress: null
        });
      }
      
    } catch (error) {
      console.error('❌ Erro ao carregar estatísticas:', error);
      // Define estatísticas vazias em caso de erro
      setDashboardStats({
        userTasks: {
          total: 0,
          completed: 0,
          inProgress: 0,
          pending: 0,
          overdue: 0
        },
        recentActivity: [],
        weeklyProgress: [],
        sprintProgress: null
      });
    }
  };

  const handleCreateBoard = async (boardData) => {
    try {
      const result = await BoardService.createBoard(boardData);
      
      if (result.success) {
        setBoards(prev => [...prev, result.board]);
        setShowCreateBoard(false);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Erro ao criar quadro');
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
    console.log('👤 Perfil atualizado:', updatedUser);
  };

  // Função para filtrar tarefas baseada no tipo selecionado
  const handleTaskFilter = async (filterType) => {
    setTaskFilterType(filterType);
    setShowTaskFilter(true);
    
    try {
      console.log(`🔍 Filtrando tarefas por: ${filterType}`);
      
      let result;
      
      if (filterType === 'my_tasks') {
        result = await CardService.getMyTasks();
      } else {
        result = await CardService.getTasksByStatus(filterType);
      }
      
      if (result.success) {
        setFilteredTasks(result.tasks || []);
        console.log(`✅ Tarefas ${filterType} carregadas:`, result.tasks?.length || 0);
      } else {
        console.warn(`⚠️ Erro ao carregar tarefas ${filterType}:`, result.error);
        setFilteredTasks([]);
      }
      
    } catch (error) {
      console.error(`❌ Erro ao filtrar tarefas ${filterType}:`, error);
      setFilteredTasks([]);
    }
  };

  const filteredBoards = boards.filter(board => {
    const matchesSearch = board.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         board.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'public') return matchesSearch && board.is_public;
    if (filterStatus === 'private') return matchesSearch && !board.is_public;
    
    return matchesSearch;
  });

  const getStatusStats = () => {
    const total = boards.length;
    const publicBoards = boards.filter(b => b.is_public).length;
    const privateBoards = total - publicBoards;
    
    return { total, publicBoards, privateBoards };
  };

  // Função para gerar título dinâmico baseado nos filtros e modo de visualização
  const getDynamicTitle = () => {
    // Se estiver no modo de controle de tarefas, mostrar título específico
    if (viewMode === 'kanban') {
      return "Controlador de Tarefas";
    }
    
    // Se estiver no modo de lista, mostrar título específico
    if (viewMode === 'list') {
      return "Lista de Quadros";
    }
    
    let title = "Meus Quadros";
    
    // Filtro de visibilidade
    if (filterStatus === 'public') {
      title = "Quadros Públicos";
    } else if (filterStatus === 'private') {
      title = "Quadros Privados";
    }
    
    // Adicionar contador
    const count = filteredBoards.length;
    title += ` (${count})`;
    
    return title;
  };

  const stats = getStatusStats();

  if (isLoading) {
    return (
      <div className="dashboard-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          
          <nav className="main-nav">
            <button 
              className={`nav-item ${viewMode === 'kanban' ? 'active' : ''}`}
              onClick={() => setViewMode('kanban')}
            >
              <FaColumns /> Controle de Tarefas
            </button>
            <button 
              className={`nav-item ${viewMode === 'boards' ? 'active' : ''}`}
              onClick={() => setViewMode('boards')}
            >
              <FaTrello /> Quadros
            </button>
            <button 
              className={`nav-item ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <FaList /> Lista
            </button>
          </nav>
        </div>

        <div className="header-center">
          <div className="search-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar quadros..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="header-right">
          <button className="header-btn">
            <FaBell />
          </button>
          <div className="user-menu">
            <div className="user-info">
              <FaUser className="user-avatar" />
              <span className="user-name">{user?.name}</span>
            </div>
            <div className="user-dropdown">
              <button 
                className="dropdown-item"
                onClick={() => setShowProfileModal(true)}
              >
                <FaUser /> Perfil
              </button>
              <button 
                className="dropdown-item"
                onClick={() => navigate('/settings')}
              >
                <FaCog /> Configurações
              </button>
              <button className="dropdown-item" onClick={handleLogout}>
                <FaSignOutAlt /> Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          {/* Filtros - Mostrar apenas nos modos Quadros e Lista */}
          {(viewMode === 'boards' || viewMode === 'list') && (
            <div className="sidebar-section">
              <h3>Filtros</h3>
              <div className="filter-options">
                <button 
                  className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('all')}
                >
                  Todos ({stats.total})
                </button>
                <button 
                  className={`filter-btn ${filterStatus === 'public' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('public')}
                >
                  Públicos ({stats.publicBoards})
                </button>
                <button 
                  className={`filter-btn ${filterStatus === 'private' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('private')}
                >
                  Privados ({stats.privateBoards})
                </button>
              </div>
            </div>
          )}

        <div className="sidebar-section">
          <h3>Sprint</h3>
          <div className="shortcuts">
            <button 
              className="shortcut-btn sprint-btn"
              onClick={() => navigate('/sprints')}
              title="Gerenciar Sprints"
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
              <FaBell /> Notificações
            </button>
            {isAdmin && (
              <button 
                className="shortcut-btn admin-only"
                onClick={() => navigate('/admin/members')}
                title="Gerenciar membros do sistema"
              >
                <FaUsers /> Gerenciamento de Membros
              </button>
            )}
          </div>
        </div>
        </aside>

        {/* Content Area */}
        <div className="dashboard-content">
          <div className="content-header">
            <h1>{getDynamicTitle()}</h1>
            {viewMode !== 'kanban' && (
              <button 
                className="create-board-btn"
                onClick={() => setShowCreateBoard(true)}
              >
                <FaPlus /> Novo Quadro
              </button>
            )}
          </div>

          {error && (
            <div className="error-banner">
              <p>{error}</p>
              <button onClick={() => setError('')}>×</button>
            </div>
          )}

          {/* Dashboard Stats and Charts */}
          {dashboardStats && viewMode === 'kanban' && (
            <div className="dashboard-stats-section">
              {/* Stats Cards */}
              <div className="stats-grid">
                <div className="stat-card clickable" onClick={() => handleTaskFilter('my_tasks')}>
                  <div className="stat-icon tasks">
                    <FaTasks />
                  </div>
                  <div className="stat-info">
                    <h3>{dashboardStats.userTasks.total}</h3>
                    <p>Minhas Tarefas</p>
                  </div>
                </div>
                
                <div className="stat-card clickable" onClick={() => handleTaskFilter('completed')}>
                  <div className="stat-icon completed">
                    <FaCheckCircle />
                  </div>
                  <div className="stat-info">
                    <h3>{dashboardStats.userTasks.completed}</h3>
                    <p>Concluídas</p>
                  </div>
                </div>
                
                <div className="stat-card clickable" onClick={() => handleTaskFilter('in_progress')}>
                  <div className="stat-icon in-progress">
                    <FaClock />
                  </div>
                  <div className="stat-info">
                    <h3>{dashboardStats.userTasks.inProgress}</h3>
                    <p>Em Andamento</p>
                  </div>
                </div>
                
                <div className="stat-card clickable" onClick={() => handleTaskFilter('pending')}>
                  <div className="stat-icon pending">
                    <FaExclamationCircle />
                  </div>
                  <div className="stat-info">
                    <h3>{dashboardStats.userTasks.pending}</h3>
                    <p>Pendentes</p>
                  </div>
                </div>
              </div>

              {/* Charts Row */}
              <div className="charts-row">
                {/* Sprint Progress - Só mostra se houver dados */}
                {dashboardStats.sprintProgress && (
                  <div className="chart-card">
                    <div className="chart-header">
                      <h3>
                        <FaFlag /> Sprint Atual
                      </h3>
                      <span className="sprint-name">{dashboardStats.sprintProgress.currentSprint}</span>
                    </div>
                    <div className="chart-content">
                      <div className="sprint-progress">
                        <div className="progress-info">
                          <span>{dashboardStats.sprintProgress.progress}% concluído</span>
                          <span>{dashboardStats.sprintProgress.daysRemaining} dias restantes</span>
                        </div>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill"
                            style={{ width: `${dashboardStats.sprintProgress.progress}%` }}
                          ></div>
                        </div>
                        <div className="sprint-tasks">
                          <span>{dashboardStats.sprintProgress.tasksCompleted} de {dashboardStats.sprintProgress.totalTasks} tarefas</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Weekly Progress Chart - Só mostra se houver dados */}
                {dashboardStats.weeklyProgress && dashboardStats.weeklyProgress.length > 0 && (
                  <div className="chart-card">
                    <div className="chart-header">
                      <h3>
                        <FaChartLine /> Progresso Semanal
                      </h3>
                      <span className="chart-subtitle">Última semana</span>
                    </div>
                    <div className="chart-content">
                      <div className="weekly-chart">
                        {dashboardStats.weeklyProgress.map((day, index) => (
                          <div key={index} className="day-bar">
                            <div className="day-name">{day.day}</div>
                            <div className="day-stats">
                              <div className="bar-container">
                                <div 
                                  className="bar completed"
                                  style={{ height: `${(day.completed / Math.max(...dashboardStats.weeklyProgress.map(d => d.tasks))) * 100}%` }}
                                ></div>
                                <div 
                                  className="bar total"
                                  style={{ height: `${(day.tasks / Math.max(...dashboardStats.weeklyProgress.map(d => d.tasks))) * 100}%` }}
                                ></div>
                              </div>
                              <div className="day-numbers">
                                <span className="completed">{day.completed}</span>
                                <span className="total">/{day.tasks}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Recent Activity - Só mostra se houver dados */}
                {dashboardStats.recentActivity && dashboardStats.recentActivity.length > 0 && (
                  <div className="chart-card">
                    <div className="chart-header">
                      <h3>
                        <FaChartBar /> Atividade Recente
                      </h3>
                      <span className="chart-subtitle">Últimas ações</span>
                    </div>
                    <div className="chart-content">
                      <div className="activity-list">
                        {dashboardStats.recentActivity.map((activity, index) => (
                          <div key={index} className="activity-item">
                            <div className="activity-icon">
                              <FaCheckCircle />
                            </div>
                            <div className="activity-content">
                              <span className="activity-action">{activity.action}</span>
                              <span className="activity-task">{activity.task}</span>
                              <span className="activity-time">{activity.time}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Mensagem quando não há dados */}
              {(!dashboardStats.sprintProgress && 
                (!dashboardStats.weeklyProgress || dashboardStats.weeklyProgress.length === 0) && 
                (!dashboardStats.recentActivity || dashboardStats.recentActivity.length === 0)) && (
                <div className="empty-state">
                  <FaChartBar className="empty-icon" />
                  <h3>Nenhum dado disponível</h3>
                  <p>As estatísticas e gráficos aparecerão conforme você usar o sistema.</p>
                </div>
              )}
            </div>
          )}

          {/* Boards Grid/List - Show only in Boards and List modes */}
          {(viewMode === 'boards' || viewMode === 'list') && (
            <div className={`boards-container ${viewMode}`}>
              {filteredBoards.length === 0 ? (
                <div className="empty-state">
                  <FaTrello className="empty-icon" />
                  <h3>Nenhum quadro encontrado</h3>
                  <p>
                    {searchTerm || filterStatus !== 'all' 
                      ? 'Tente ajustar os filtros de busca'
                      : 'Crie seu primeiro quadro para começar'
                    }
                  </p>
                  {!searchTerm && filterStatus === 'all' && (
                    <button 
                      className="create-first-btn"
                      onClick={() => setShowCreateBoard(true)}
                    >
                      <FaPlus /> Criar Primeiro Quadro
                    </button>
                  )}
                </div>
              ) : (
                filteredBoards.map(board => (
                  <div 
                    key={board.id} 
                    className="board-card"
                    onClick={() => navigate(`/board/${board.id}`)}
                  >
                    <div className="board-header">
                      <h3 className="board-title">{board.title}</h3>
                      <div className="board-actions">
                        <button 
                          className="action-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Implementar menu de opções
                          }}
                        >
                          ⋮
                        </button>
                      </div>
                    </div>
                    
                    {board.description && (
                      <p className="board-description">{board.description}</p>
                    )}
                    
                    <div className="board-footer">
                      <div className="board-meta">
                        <span className={`board-visibility ${board.is_public ? 'public' : 'private'}`}>
                          {board.is_public ? 'Público' : 'Privado'}
                        </span>
                        <span className="board-date">
                          {new Date(board.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <div className="board-stats">
                        <span className="stat">
                          <FaColumns /> {board.lists?.length || 0} listas
                        </span>
                      </div>
                    </div>
                    
                    <div className="board-color" style={{ backgroundColor: board.color }}></div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>

      {/* Create Board Modal */}
      {showCreateBoard && (
        <CreateBoardModal
          onClose={() => setShowCreateBoard(false)}
          onCreate={handleCreateBoard}
        />
      )}

      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onProfileUpdate={handleProfileUpdate}
      />

      {/* Task Filter Modal */}
      {showTaskFilter && (
        <div className="modal-overlay" onClick={() => setShowTaskFilter(false)}>
          <div className="modal-content task-filter-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {taskFilterType === 'my_tasks' && 'Minhas Tarefas'}
                {taskFilterType === 'completed' && 'Tarefas Concluídas'}
                {taskFilterType === 'in_progress' && 'Tarefas em Andamento'}
                {taskFilterType === 'pending' && 'Tarefas Pendentes'}
              </h2>
              <button 
                className="close-btn"
                onClick={() => setShowTaskFilter(false)}
              >
                ×
              </button>
            </div>
            
            <div className="task-list">
              {filteredTasks.length === 0 ? (
                <div className="empty-tasks">
                  <FaTasks className="empty-icon" />
                  <p>Nenhuma tarefa encontrada</p>
                </div>
              ) : (
                filteredTasks.map(task => (
                  <div key={task.id} className="task-item">
                    <div className="task-header">
                      <h3 className="task-title">{task.title}</h3>
                      <span className={`task-priority ${task.priority}`}>
                        {task.priority === 'high' && 'Alta'}
                        {task.priority === 'medium' && 'Média'}
                        {task.priority === 'low' && 'Baixa'}
                      </span>
                    </div>
                    <p className="task-description">{task.description}</p>
                    <div className="task-meta">
                      <span className="task-sprint">{task.sprint}</span>
                      <span className="task-due-date">
                        Vence em: {new Date(task.due_date).toLocaleDateString('pt-BR')}
                      </span>
                      <span className="task-assignee">Responsável: {task.assignee}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente para modal de criação de quadro
const CreateBoardModal = ({ onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    is_public: false,
    color: '#0079bf'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const colors = [
    '#0079bf', '#d29034', '#519839', '#b04632',
    '#89609e', '#cd5a91', '#4bbf6b', '#00aecc'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onCreate(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Criar Novo Quadro</h2>
        
        <form onSubmit={handleSubmit} className="create-board-form">
          <div className="form-group">
            <label>Título do Quadro</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ex: Projeto Alpha"
              required
              maxLength={255}
            />
          </div>

          <div className="form-group">
            <label>Descrição (opcional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva o propósito deste quadro..."
              rows={3}
              maxLength={500}
            />
          </div>

          <div className="form-group">
            <label>Cor do Quadro</label>
            <div className="color-picker">
              {colors.map(color => (
                <button
                  key={color}
                  type="button"
                  className={`color-option ${formData.color === color ? 'selected' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                />
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.is_public}
                onChange={(e) => setFormData(prev => ({ ...prev, is_public: e.target.checked }))}
              />
              <span className="checkmark"></span>
              Quadro público (visível para outros usuários)
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancelar
            </button>
            <button 
              type="submit" 
              className="create-btn"
              disabled={isSubmitting || !formData.title.trim()}
            >
              {isSubmitting ? 'Criando...' : 'Criar Quadro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Dashboard;
