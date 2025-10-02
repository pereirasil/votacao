import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaCalendar, 
  FaTasks, 
  FaCheckCircle, 
  FaClock, 
  FaExclamationCircle,
  FaPlay,
  FaStop,
  FaFlag,
  FaUser,
  FaCalendarAlt,
  FaSearch,
  FaFilter
} from 'react-icons/fa';
import authService from '../services/authService';
import sprintService from '../services/sprintService';
import boardService from '../services/boardService';
import './MyTasks.css';

const MyTasks = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [sprints, setSprints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    const isAuth = authService.isAuthenticated();
    
    if (!currentUser || !isAuth) {
      navigate('/login', { replace: true });
      return;
    }

    loadSprintsForMonth(selectedYear, selectedMonth);
  }, [navigate, selectedYear, selectedMonth]);

  const loadSprintsForMonth = async (year, month) => {
    try {
      setIsLoading(true);
      setError('');
      console.log(`📅 Carregando sprints para ${months[month]} ${year}...`);
      
      // Carregar sprints reais do backend
      const boardsResult = await boardService.getBoards();
      if (!boardsResult.success) {
        console.error('❌ Erro ao carregar boards:', boardsResult.error);
        setError('Erro ao carregar boards: ' + boardsResult.error);
        return;
      }

      const boards = boardsResult.boards;
      console.log('📋 Boards encontrados:', boards.length);

      // Carregar sprints de todos os boards
      const allSprints = [];
      for (const board of boards) {
        const sprintsResult = await sprintService.getBoardSprints(board.id);
        if (sprintsResult.success) {
          // Adicionar informações do board às sprints
          const sprintsWithBoard = sprintsResult.sprints.map(sprint => {
            console.log('📋 Sprint do backend:', sprint);
            return {
              ...sprint,
              board_name: board.name,
              board_id: board.id,
              // Garantir que o status seja mapeado corretamente
              status: sprint.status === 'planejada' ? 'ativa' : sprint.status
            };
          });
          allSprints.push(...sprintsWithBoard);
        } else {
          console.warn(`⚠️ Erro ao carregar sprints do board ${board.id}:`, sprintsResult.error);
        }
      }

      console.log('✅ Sprints carregadas:', allSprints.length);
      setSprints(allSprints);
      
    } catch (error) {
      console.error('❌ Erro ao carregar sprints:', error);
      setError('Erro ao carregar sprints');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMonthChange = (monthIndex) => {
    setSelectedMonth(monthIndex);
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
  };

  const loadSprintTasks = async (sprintId) => {
    try {
      const result = await sprintService.getSprintTasks(sprintId);
      if (result.success) {
        return result.tasks || [];
      } else {
        console.error('Erro ao carregar tarefas da sprint:', result.error);
        return [];
      }
    } catch (error) {
      console.error('Erro ao carregar tarefas da sprint:', error);
      return [];
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ativa':
        return <FaPlay className="status-icon active" />;
      case 'encerrada':
        return <FaStop className="status-icon ended" />;
      default:
        return <FaClock className="status-icon" />;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'ativa':
        return 'Ativa';
      case 'encerrada':
        return 'Encerrada';
      default:
        return 'Desconhecido';
    }
  };

  const getTaskStatusIcon = (status) => {
    switch (status) {
      case 'done':
        return <FaCheckCircle className="task-status-icon done" />;
      case 'doing':
        return <FaClock className="task-status-icon doing" />;
      case 'todo':
        return <FaExclamationCircle className="task-status-icon todo" />;
      default:
        return <FaTasks className="task-status-icon" />;
    }
  };

  const getTaskStatusLabel = (status) => {
    switch (status) {
      case 'done':
        return 'Concluída';
      case 'doing':
        return 'Em Andamento';
      case 'todo':
        return 'Pendente';
      default:
        return 'Desconhecido';
    }
  };

  const getPriorityColor = (prioridade) => {
    switch (prioridade) {
      case 'high':
        return '#dc3545';
      case 'medium':
        return '#ffc107';
      case 'low':
        return '#28a745';
      default:
        return '#6c757d';
    }
  };

  const getPriorityLabel = (prioridade) => {
    switch (prioridade) {
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Média';
      case 'low':
        return 'Baixa';
      default:
        return 'Normal';
    }
  };

  const currentUser = authService.getCurrentUser();
  const currentMonthName = months[selectedMonth];
  const currentYear = selectedYear;

  if (isLoading) {
    return (
      <div className="my-tasks-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Carregando suas tarefas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-tasks-container">
      {/* Header */}
      <header className="my-tasks-header">
        <div className="header-left">
          <button 
            className="back-btn"
            onClick={() => navigate('/dashboard')}
          >
            <FaArrowLeft /> Dashboard
          </button>
          <div className="title-section">
            <h1>Minhas Tarefas</h1>
            <p>Visualize suas tarefas organizadas por sprint e mês</p>
          </div>
        </div>
        
        <div className="header-right">
          <div className="user-info">
            <FaUser className="user-icon" />
            <span>{currentUser?.name}</span>
          </div>
        </div>
      </header>

      {/* Month/Year Selector */}
      <div className="month-selector-section">
        <div className="selector-container">
          <div className="year-selector">
            <label>Ano:</label>
            <select 
              value={selectedYear} 
              onChange={(e) => handleYearChange(parseInt(e.target.value))}
              className="year-select"
            >
              {Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <div className="month-selector">
            <label>Mês:</label>
            <div className="month-grid">
              {months.map((month, index) => (
                <button
                  key={index}
                  className={`month-btn ${selectedMonth === index ? 'active' : ''}`}
                  onClick={() => handleMonthChange(index)}
                >
                  {month}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <FaTasks />
            </div>
            <div className="stat-info">
              <h3>{sprints.reduce((sum, sprint) => sum + Number(sprint.total_tasks || 0), 0)}</h3>
              <p>Total de Tarefas</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <FaCheckCircle />
            </div>
            <div className="stat-info">
              <h3>{sprints.reduce((sum, sprint) => sum + Number(sprint.tasks_concluidas || 0), 0)}</h3>
              <p>Concluídas</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <FaClock />
            </div>
            <div className="stat-info">
              <h3>{sprints.reduce((sum, sprint) => sum + Number(sprint.tasks_em_andamento || 0), 0)}</h3>
              <p>Em Andamento</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <FaExclamationCircle />
            </div>
            <div className="stat-info">
              <h3>{sprints.reduce((sum, sprint) => sum + Number(sprint.tasks_pendentes || 0), 0)}</h3>
              <p>Pendentes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="my-tasks-content">
        {error && (
          <div className="error-state">
            <h3>Erro ao carregar tarefas</h3>
            <p>{error}</p>
            <button onClick={() => loadSprintsForMonth(selectedYear, selectedMonth)} className="retry-btn">
              Tentar Novamente
            </button>
          </div>
        )}

        {!error && sprints.length === 0 && (
          <div className="no-sprints-state">
            <div className="no-sprints-icon">
              <FaCalendarAlt />
            </div>
            <h3>Nenhuma sprint encontrada</h3>
            <p>Não foram encontradas sprints para <strong>{currentMonthName} de {currentYear}</strong></p>
            <div className="suggestions">
              <p>Você pode:</p>
              <ul>
                <li>Selecionar outro mês</li>
                <li>Verificar se existem sprints em outros períodos</li>
                <li>Criar uma nova sprint para este mês</li>
              </ul>
            </div>
          </div>
        )}

        {!error && sprints.length > 0 && (
          <div className="sprints-section">
            <div className="section-header">
              <h2>
                <FaFlag /> Sprints de {currentMonthName} de {currentYear}
                <span className="sprint-count">({sprints.length} sprint{sprints.length !== 1 ? 's' : ''})</span>
              </h2>
            </div>

            <div className="sprints-list">
              {sprints.map(sprint => (
                <div key={sprint.id} className={`sprint-card ${sprint.status}`}>
                  <div className="sprint-header">
                    <div className="sprint-title">
                      <h3>{sprint.nome}</h3>
                      <div className="sprint-status">
                        {getStatusIcon(sprint.status)}
                        <span>{getStatusLabel(sprint.status)}</span>
                      </div>
                    </div>
                    <div className="sprint-dates">
                      <span className="date-item">
                        <FaCalendar /> {new Date(sprint.data_inicio + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </span>
                      <span className="date-item">
                        <FaCalendar /> {new Date(sprint.data_fim + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>

                  <div className="sprint-content">
                    {sprint.descricao && (
                      <p className="sprint-description">{sprint.descricao}</p>
                    )}

                    <div className="sprint-progress">
                      <div className="progress-header">
                        <span>Progresso da Sprint</span>
                        <span>{sprint.progresso.toFixed(1)}%</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${sprint.progresso}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="tasks-section">
                      <h4>
                        <FaTasks /> Tarefas da Sprint ({sprint.total_tasks || 0})
                      </h4>
                      
                      <div className="tasks-summary">
                        <div className="task-stats">
                          <div className="task-stat">
                            <FaTasks />
                            <span>{Number(sprint.total_tasks || 0)} total</span>
                              </div>
                          <div className="task-stat completed">
                            <FaCheckCircle />
                            <span>{Number(sprint.tasks_concluidas || 0)} concluídas</span>
                            </div>
                          <div className="task-stat in-progress">
                            <FaClock />
                            <span>{Number(sprint.tasks_em_andamento || 0)} em andamento</span>
                            </div>
                          <div className="task-stat pending">
                            <FaExclamationCircle />
                            <span>{Number(sprint.tasks_pendentes || 0)} pendentes</span>
                          </div>
                        </div>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${sprint.progresso || 0}%` }}
                          ></div>
                        </div>
                        <div className="progress-text">
                          {sprint.progresso || 0}% concluído
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTasks;
