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
      
      // Dados mock para demonstração
      const allSprints = [
        {
          id: 1,
          nome: 'Sprint 1 - Setup Inicial',
          descricao: 'Configuração inicial do projeto e estrutura base',
          data_inicio: '2025-01-15',
          data_fim: '2025-01-29',
          status: 'encerrada',
          board_id: 1,
          total_tasks: 8,
          tasks_concluidas: 8,
          tasks_em_andamento: 0,
          tasks_pendentes: 0,
          progresso: 100.0,
          tasks: [
            { id: 1, titulo: 'Configurar ambiente de desenvolvimento', status: 'done', prioridade: 'high' },
            { id: 2, titulo: 'Criar estrutura base do projeto', status: 'done', prioridade: 'high' },
            { id: 3, titulo: 'Configurar banco de dados', status: 'done', prioridade: 'medium' },
            { id: 4, titulo: 'Implementar autenticação básica', status: 'done', prioridade: 'high' }
          ]
        },
        {
          id: 2,
          nome: 'Sprint 2 - Autenticação',
          descricao: 'Implementação do sistema de autenticação e autorização',
          data_inicio: '2025-02-01',
          data_fim: '2025-02-14',
          status: 'encerrada',
          board_id: 1,
          total_tasks: 12,
          tasks_concluidas: 12,
          tasks_em_andamento: 0,
          tasks_pendentes: 0,
          progresso: 100.0,
          tasks: [
            { id: 5, titulo: 'Implementar login com JWT', status: 'done', prioridade: 'high' },
            { id: 6, titulo: 'Criar sistema de permissões', status: 'done', prioridade: 'high' },
            { id: 7, titulo: 'Implementar recuperação de senha', status: 'done', prioridade: 'medium' },
            { id: 8, titulo: 'Criar middleware de autenticação', status: 'done', prioridade: 'high' }
          ]
        },
        {
          id: 3,
          nome: 'Sprint 3 - Dashboard',
          descricao: 'Desenvolvimento do dashboard principal e funcionalidades',
          data_inicio: '2025-03-01',
          data_fim: '2025-03-14',
          status: 'ativa',
          board_id: 1,
          total_tasks: 15,
          tasks_concluidas: 10,
          tasks_em_andamento: 4,
          tasks_pendentes: 1,
          progresso: 66.7,
          tasks: [
            { id: 9, titulo: 'Criar layout do dashboard', status: 'done', prioridade: 'high' },
            { id: 10, titulo: 'Implementar listagem de quadros', status: 'done', prioridade: 'high' },
            { id: 11, titulo: 'Criar sistema de filtros', status: 'doing', prioridade: 'medium' },
            { id: 12, titulo: 'Implementar busca de quadros', status: 'doing', prioridade: 'medium' },
            { id: 13, titulo: 'Criar modal de criação de quadros', status: 'todo', prioridade: 'low' }
          ]
        },
        {
          id: 4,
          nome: 'Sprint 4 - Gestão de Membros',
          descricao: 'Sistema de gerenciamento de membros e permissões',
          data_inicio: '2025-04-01',
          data_fim: '2025-04-14',
          status: 'ativa',
          board_id: 1,
          total_tasks: 10,
          tasks_concluidas: 6,
          tasks_em_andamento: 3,
          tasks_pendentes: 1,
          progresso: 60.0,
          tasks: [
            { id: 14, titulo: 'Criar interface de gestão de membros', status: 'done', prioridade: 'high' },
            { id: 15, titulo: 'Implementar convite de membros', status: 'done', prioridade: 'high' },
            { id: 16, titulo: 'Criar sistema de roles', status: 'doing', prioridade: 'medium' },
            { id: 17, titulo: 'Implementar remoção de membros', status: 'todo', prioridade: 'low' }
          ]
        }
      ];

      // Filtrar sprints pelo mês selecionado
      const filteredSprints = allSprints.filter(sprint => {
        const sprintStartDate = new Date(sprint.data_inicio);
        const sprintEndDate = new Date(sprint.data_fim);
        
        // Verificar se a sprint tem alguma data no mês selecionado
        return (sprintStartDate.getMonth() === month && sprintStartDate.getFullYear() === year) ||
               (sprintEndDate.getMonth() === month && sprintEndDate.getFullYear() === year) ||
               (sprintStartDate <= new Date(year, month, 1) && sprintEndDate >= new Date(year, month + 1, 0));
      });

      setSprints(filteredSprints);
      console.log(`✅ Sprints encontradas para ${months[month]} ${year}:`, filteredSprints.length);
      
    } catch (error) {
      console.error('❌ Erro ao carregar sprints:', error);
      setError('Erro ao carregar sprints do mês selecionado');
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
                        <FaCalendar /> {new Date(sprint.data_inicio).toLocaleDateString('pt-BR')}
                      </span>
                      <span className="date-item">
                        <FaCalendar /> {new Date(sprint.data_fim).toLocaleDateString('pt-BR')}
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
                        <FaTasks /> Tarefas da Sprint ({sprint.tasks.length})
                      </h4>
                      
                      <div className="tasks-list">
                        {sprint.tasks.map(task => (
                          <div key={task.id} className={`task-item ${task.status}`}>
                            <div className="task-info">
                              <div className="task-status">
                                {getTaskStatusIcon(task.status)}
                                <span className="status-label">{getTaskStatusLabel(task.status)}</span>
                              </div>
                              <h5 className="task-title">{task.titulo}</h5>
                            </div>
                            <div className="task-meta">
                              <span 
                                className="priority-badge"
                                style={{ backgroundColor: getPriorityColor(task.prioridade) }}
                              >
                                {getPriorityLabel(task.prioridade)}
                              </span>
                            </div>
                          </div>
                        ))}
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
