import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaPlus, 
  FaPlay, 
  FaStop, 
  FaEdit, 
  FaTrash, 
  FaCalendar, 
  FaClock, 
  FaTasks, 
  FaCheckCircle, 
  FaExclamationCircle,
  FaChartBar,
  FaUsers,
  FaFlag,
  FaTimes
} from 'react-icons/fa';
import authService from '../services/authService';
import './SprintManagement.css';

const SprintManagement = () => {
  const [sprints, setSprints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSprint, setEditingSprint] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    const isAuth = authService.isAuthenticated();
    
    if (!currentUser || !isAuth) {
      navigate('/login', { replace: true });
      return;
    }

    loadSprints();
  }, [navigate]);

  const loadSprints = async () => {
    try {
      setIsLoading(true);
      console.log('🏃 Carregando sprints...');
      
      // Dados mock para demonstração
      const mockSprints = [
        {
          id: 1,
          nome: 'Sprint 1 - Setup Inicial',
          descricao: 'Configuração inicial do projeto e estrutura base',
          data_inicio: '2025-01-20',
          data_fim: '2025-02-03',
          status: 'ativa',
          board_id: 1,
          total_tasks: 8,
          tasks_concluidas: 5,
          tasks_em_andamento: 2,
          tasks_pendentes: 1,
          progresso: 62.5,
          created_at: '2025-01-20T10:00:00.000Z'
        },
        {
          id: 2,
          nome: 'Sprint 2 - Autenticação',
          descricao: 'Implementação do sistema de autenticação e autorização',
          data_inicio: '2025-02-04',
          data_fim: '2025-02-17',
          status: 'ativa',
          board_id: 1,
          total_tasks: 12,
          tasks_concluidas: 8,
          tasks_em_andamento: 3,
          tasks_pendentes: 1,
          progresso: 66.7,
          created_at: '2025-02-04T10:00:00.000Z'
        },
        {
          id: 3,
          nome: 'Sprint 3 - Dashboard',
          descricao: 'Desenvolvimento do dashboard principal e funcionalidades',
          data_inicio: '2025-02-18',
          data_fim: '2025-03-03',
          status: 'ativa',
          board_id: 1,
          total_tasks: 15,
          tasks_concluidas: 10,
          tasks_em_andamento: 4,
          tasks_pendentes: 1,
          progresso: 66.7,
          created_at: '2025-02-18T10:00:00.000Z'
        },
        {
          id: 4,
          nome: 'Sprint 4 - Gestão de Membros',
          descricao: 'Sistema de gerenciamento de membros e permissões',
          data_inicio: '2025-03-04',
          data_fim: '2025-03-17',
          status: 'ativa',
          board_id: 1,
          total_tasks: 10,
          tasks_concluidas: 6,
          tasks_em_andamento: 3,
          tasks_pendentes: 1,
          progresso: 60.0,
          created_at: '2025-03-04T10:00:00.000Z'
        },
        {
          id: 5,
          nome: 'Sprint 5 - Sprints',
          descricao: 'Implementação do sistema de sprints e planejamento',
          data_inicio: '2025-03-18',
          data_fim: '2025-03-31',
          status: 'ativa',
          board_id: 1,
          total_tasks: 8,
          tasks_concluidas: 3,
          tasks_em_andamento: 4,
          tasks_pendentes: 1,
          progresso: 37.5,
          created_at: '2025-03-18T10:00:00.000Z'
        },
        {
          id: 6,
          nome: 'Sprint 0 - Planejamento',
          descricao: 'Sprint inicial para planejamento e definição de requisitos',
          data_inicio: '2025-01-06',
          data_fim: '2025-01-19',
          status: 'encerrada',
          board_id: 1,
          total_tasks: 6,
          tasks_concluidas: 6,
          tasks_em_andamento: 0,
          tasks_pendentes: 0,
          progresso: 100.0,
          created_at: '2025-01-06T10:00:00.000Z'
        }
      ];

      setSprints(mockSprints);
      console.log('✅ Sprints carregadas:', mockSprints.length);
      
    } catch (error) {
      console.error('❌ Erro ao carregar sprints:', error);
      setError('Erro ao carregar sprints');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSprint = async (sprintData) => {
    try {
      setIsLoading(true);
      console.log('➕ Criando sprint...', sprintData);
      
      // Simular criação
      const newSprint = {
        id: Date.now(),
        ...sprintData,
        status: 'ativa',
        total_tasks: 0,
        tasks_concluidas: 0,
        tasks_em_andamento: 0,
        tasks_pendentes: 0,
        progresso: 0,
        created_at: new Date().toISOString()
      };
      
      setSprints(prev => [newSprint, ...prev]);
      setShowCreateModal(false);
      setSuccess('Sprint criada com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (error) {
      console.error('❌ Erro ao criar sprint:', error);
      setError('Erro ao criar sprint');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSprint = async (sprintId, sprintData) => {
    try {
      setIsLoading(true);
      console.log('✏️ Editando sprint...', sprintId, sprintData);
      
      // Simular edição
      setSprints(prev => 
        prev.map(sprint => 
          sprint.id === sprintId 
            ? { ...sprint, ...sprintData, updated_at: new Date().toISOString() }
            : sprint
        )
      );
      
      setEditingSprint(null);
      setSuccess('Sprint atualizada com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (error) {
      console.error('❌ Erro ao editar sprint:', error);
      setError('Erro ao editar sprint');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndSprint = async (sprintId) => {
    if (!window.confirm('Tem certeza que deseja encerrar esta sprint? As tarefas não concluídas serão movidas para o backlog.')) {
      return;
    }

    try {
      setIsLoading(true);
      console.log('🏁 Encerrando sprint...', sprintId);
      
      // Simular encerramento
      setSprints(prev => 
        prev.map(sprint => 
          sprint.id === sprintId 
            ? { ...sprint, status: 'encerrada', updated_at: new Date().toISOString() }
            : sprint
        )
      );
      
      setSuccess('Sprint encerrada com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (error) {
      console.error('❌ Erro ao encerrar sprint:', error);
      setError('Erro ao encerrar sprint');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSprint = async (sprintId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta sprint? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      setIsLoading(true);
      console.log('🗑️ Excluindo sprint...', sprintId);
      
      // Simular exclusão
      setSprints(prev => prev.filter(sprint => sprint.id !== sprintId));
      
      setSuccess('Sprint excluída com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (error) {
      console.error('❌ Erro ao excluir sprint:', error);
      setError('Erro ao excluir sprint');
    } finally {
      setIsLoading(false);
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

  const getProgressColor = (progresso) => {
    if (progresso >= 80) return '#28a745';
    if (progresso >= 60) return '#ffc107';
    if (progresso >= 40) return '#fd7e14';
    return '#dc3545';
  };

  const getDaysRemaining = (dataFim) => {
    const today = new Date();
    const endDate = new Date(dataFim);
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredSprints = sprints.filter(sprint => {
    if (filterStatus === 'all') return true;
    return sprint.status === filterStatus;
  });

  const activeSprints = sprints.filter(sprint => sprint.status === 'ativa');
  const endedSprints = sprints.filter(sprint => sprint.status === 'encerrada');

  if (isLoading && sprints.length === 0) {
    return (
      <div className="sprint-management-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Carregando sprints...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sprint-management-container">
      {/* Header */}
      <header className="sprint-header">
        <div className="header-left">
          <button 
            className="back-btn"
            onClick={() => navigate('/dashboard')}
          >
            <FaArrowLeft /> Dashboard
          </button>
          <div className="title-section">
            <h1>Gerenciamento de Sprints</h1>
            <p>Planeje e acompanhe o progresso das suas sprints</p>
          </div>
        </div>
        
        <div className="header-right">
          <button 
            className="create-sprint-btn"
            onClick={() => setShowCreateModal(true)}
          >
            <FaPlus /> Nova Sprint
          </button>
        </div>
      </header>

      {/* Alerts */}
      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <span>{success}</span>
          <button onClick={() => setSuccess('')}>×</button>
        </div>
      )}

      {/* Stats */}
      <div className="sprint-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <FaPlay />
          </div>
          <div className="stat-info">
            <h3>{activeSprints.length}</h3>
            <p>Sprints Ativas</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <FaStop />
          </div>
          <div className="stat-info">
            <h3>{endedSprints.length}</h3>
            <p>Sprints Encerradas</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <FaTasks />
          </div>
          <div className="stat-info">
            <h3>{activeSprints.reduce((sum, sprint) => sum + sprint.total_tasks, 0)}</h3>
            <p>Total de Tarefas</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <FaCheckCircle />
          </div>
          <div className="stat-info">
            <h3>{activeSprints.reduce((sum, sprint) => sum + sprint.tasks_concluidas, 0)}</h3>
            <p>Tarefas Concluídas</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="sprint-filters">
        <div className="filter-group">
          <button 
            className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            Todas ({sprints.length})
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'ativa' ? 'active' : ''}`}
            onClick={() => setFilterStatus('ativa')}
          >
            Ativas ({activeSprints.length})
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'encerrada' ? 'active' : ''}`}
            onClick={() => setFilterStatus('encerrada')}
          >
            Encerradas ({endedSprints.length})
          </button>
        </div>
      </div>

      {/* Sprints List */}
      <div className="sprints-section">
        <div className="sprints-grid">
          {filteredSprints.map(sprint => {
            const daysRemaining = getDaysRemaining(sprint.data_fim);
            const isOverdue = daysRemaining < 0 && sprint.status === 'ativa';
            
            return (
              <div key={sprint.id} className={`sprint-card ${sprint.status} ${isOverdue ? 'overdue' : ''}`}>
                <div className="sprint-header-card">
                  <div className="sprint-title">
                    <h3>{sprint.nome}</h3>
                    <div className="sprint-status">
                      {getStatusIcon(sprint.status)}
                      <span>{getStatusLabel(sprint.status)}</span>
                    </div>
                  </div>
                  
                  {sprint.status === 'ativa' && (
                    <div className="sprint-actions">
                      <button 
                        className="action-btn edit"
                        onClick={() => setEditingSprint(sprint)}
                        title="Editar Sprint"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        className="action-btn end"
                        onClick={() => handleEndSprint(sprint.id)}
                        title="Encerrar Sprint"
                      >
                        <FaStop />
                      </button>
                      <button 
                        className="action-btn delete"
                        onClick={() => handleDeleteSprint(sprint.id)}
                        title="Excluir Sprint"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  )}
                </div>

                <div className="sprint-content">
                  {sprint.descricao && (
                    <p className="sprint-description">{sprint.descricao}</p>
                  )}
                  
                  <div className="sprint-dates">
                    <div className="date-item">
                      <FaCalendar />
                      <span>Início: {new Date(sprint.data_inicio).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="date-item">
                      <FaCalendar />
                      <span>Fim: {new Date(sprint.data_fim).toLocaleDateString('pt-BR')}</span>
                    </div>
                    {sprint.status === 'ativa' && (
                      <div className={`date-item ${isOverdue ? 'overdue' : ''}`}>
                        <FaClock />
                        <span>
                          {isOverdue 
                            ? `${Math.abs(daysRemaining)} dias em atraso`
                            : `${daysRemaining} dias restantes`
                          }
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="sprint-progress">
                    <div className="progress-header">
                      <span>Progresso</span>
                      <span>{sprint.progresso.toFixed(1)}%</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ 
                          width: `${sprint.progresso}%`,
                          backgroundColor: getProgressColor(sprint.progresso)
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="sprint-tasks">
                    <div className="task-stats">
                      <div className="task-stat">
                        <FaTasks />
                        <span>{sprint.total_tasks} total</span>
                      </div>
                      <div className="task-stat completed">
                        <FaCheckCircle />
                        <span>{sprint.tasks_concluidas} concluídas</span>
                      </div>
                      <div className="task-stat in-progress">
                        <FaExclamationCircle />
                        <span>{sprint.tasks_em_andamento} em andamento</span>
                      </div>
                      <div className="task-stat pending">
                        <FaClock />
                        <span>{sprint.tasks_pendentes} pendentes</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create/Edit Sprint Modal */}
      {(showCreateModal || editingSprint) && (
        <SprintModal
          sprint={editingSprint}
          onClose={() => {
            setShowCreateModal(false);
            setEditingSprint(null);
          }}
          onSave={editingSprint ? handleEditSprint : handleCreateSprint}
        />
      )}
    </div>
  );
};

// Modal para criar/editar sprint
const SprintModal = ({ sprint, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    data_inicio: '',
    data_fim: ''
  });

  useEffect(() => {
    if (sprint) {
      setFormData({
        nome: sprint.nome,
        descricao: sprint.descricao || '',
        data_inicio: sprint.data_inicio,
        data_fim: sprint.data_fim
      });
    } else {
      // Valores padrão para nova sprint
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      const twoWeeksLater = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
      
      setFormData({
        nome: '',
        descricao: '',
        data_inicio: nextWeek.toISOString().split('T')[0],
        data_fim: twoWeeksLater.toISOString().split('T')[0]
      });
    }
  }, [sprint]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      alert('Nome da sprint é obrigatório');
      return;
    }
    
    if (!formData.data_inicio || !formData.data_fim) {
      alert('Data de início e fim são obrigatórias');
      return;
    }
    
    if (new Date(formData.data_inicio) >= new Date(formData.data_fim)) {
      alert('Data de fim deve ser posterior à data de início');
      return;
    }
    
    onSave(sprint?.id, formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content sprint-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{sprint ? 'Editar Sprint' : 'Nova Sprint'}</h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="sprint-form">
          <div className="form-group">
            <label>Nome da Sprint *</label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
              placeholder="Ex: Sprint 1 - Setup Inicial"
              required
            />
          </div>

          <div className="form-group">
            <label>Descrição</label>
            <textarea
              value={formData.descricao}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              placeholder="Descreva os objetivos e metas desta sprint..."
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Data de Início *</label>
              <input
                type="date"
                value={formData.data_inicio}
                onChange={(e) => setFormData(prev => ({ ...prev, data_inicio: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label>Data de Fim *</label>
              <input
                type="date"
                value={formData.data_fim}
                onChange={(e) => setFormData(prev => ({ ...prev, data_fim: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancelar
            </button>
            <button type="submit" className="save-btn">
              {sprint ? 'Atualizar Sprint' : 'Criar Sprint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SprintManagement;
