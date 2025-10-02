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
import sprintService from '../services/sprintService';
import boardService from '../services/boardService';
import './SprintManagement.css';

const SprintManagement = () => {
  const [sprints, setSprints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSprint, setEditingSprint] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentBoard, setCurrentBoard] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedSprintId, setSelectedSprintId] = useState(null);
  const [selectedSprint, setSelectedSprint] = useState(null);
  const [sprintTasks, setSprintTasks] = useState([]);
  const [showSprintDetails, setShowSprintDetails] = useState(false);
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
      
      // Carregar sprints reais do backend
      const boardsResult = await boardService.getBoards();
      if (!boardsResult.success) {
        console.error('❌ Erro ao carregar boards:', boardsResult.error);
        setError('Erro ao carregar boards: ' + boardsResult.error);
        return;
      }

      const boards = boardsResult.boards;
      console.log('📋 Boards encontrados:', boards.length);

      // Definir o primeiro board como board atual
      if (boards.length > 0) {
        setCurrentBoard(boards[0]);
        console.log('📋 Board atual definido:', boards[0].name, 'ID:', boards[0].id);
      }

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

      const realSprints = allSprints;

      console.log('✅ Sprints carregadas:', realSprints.length);
      setSprints(realSprints);
      
    } catch (error) {
      console.error('❌ Erro ao carregar sprints:', error);
      setError('Erro ao carregar sprints');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSprintTasks = async (sprintId) => {
    try {
      const result = await sprintService.getSprintTasks(sprintId);
      if (result.success) {
        setSprintTasks(result.tasks || []);
      } else {
        console.error('Erro ao carregar tarefas da sprint:', result.error);
        setError('Erro ao carregar tarefas da sprint: ' + result.error);
      }
    } catch (error) {
      console.error('Erro ao carregar tarefas da sprint:', error);
      setError('Erro ao carregar tarefas da sprint.');
    }
  };

  const handleViewSprint = async (sprint) => {
    setSelectedSprint(sprint);
    await loadSprintTasks(sprint.id);
    setShowSprintDetails(true);
  };

  const handleCreateSprint = async (sprintData) => {
    try {
      setIsLoading(true);
      console.log('➕ Criando sprint...', sprintData);
      
      // Adicionar board_id aos dados da sprint
      const sprintDataWithBoard = {
        ...sprintData,
        board_id: currentBoard?.id || 3 // Usar board atual ou default para 3 (que existe no banco)
      };
      
      console.log('📤 Dados completos da sprint:', sprintDataWithBoard);
      
      // Criar sprint usando o serviço real
      const result = await sprintService.createSprint(sprintDataWithBoard);
      
      if (result.success) {
        console.log('✅ Sprint criada com sucesso:', result.sprint);
        
        // Recarregar sprints para obter dados atualizados
        await loadSprints();
        
        setShowCreateModal(false);
        setSuccess('Sprint criada com sucesso!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        console.error('❌ Erro ao criar sprint:', result.error);
        setError('Erro ao criar sprint: ' + result.error);
      }
      
    } catch (error) {
      console.error('❌ Erro ao criar sprint:', error);
      setError('Erro ao criar sprint: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSprint = async (sprintId, sprintData) => {
    try {
      setIsLoading(true);
      console.log('✏️ Editando sprint...', sprintId, sprintData);
      
      // Atualizar sprint usando o serviço real
      const result = await sprintService.updateSprint(sprintId, sprintData);
      
      if (result.success) {
        console.log('✅ Sprint atualizada com sucesso:', result.sprint);
        
        // Recarregar sprints para obter dados atualizados
        await loadSprints();
        
        setEditingSprint(null);
        setSuccess('Sprint atualizada com sucesso!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        console.error('❌ Erro ao atualizar sprint:', result.error);
        setError('Erro ao atualizar sprint: ' + result.error);
      }
      
    } catch (error) {
      console.error('❌ Erro ao editar sprint:', error);
      setError('Erro ao editar sprint: ' + error.message);
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
      
      // Atualizar sprint para status 'encerrada' usando o serviço real
      const result = await sprintService.updateSprint(sprintId, { status: 'encerrada' });
      
      if (result.success) {
        console.log('✅ Sprint encerrada com sucesso:', result.sprint);
        
        // Recarregar sprints para obter dados atualizados
        await loadSprints();
        
        setSuccess('Sprint encerrada com sucesso!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        console.error('❌ Erro ao encerrar sprint:', result.error);
        setError('Erro ao encerrar sprint: ' + result.error);
      }
      
    } catch (error) {
      console.error('❌ Erro ao encerrar sprint:', error);
      setError('Erro ao encerrar sprint: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTaskToSprint = (sprintId) => {
    setSelectedSprintId(sprintId);
    setShowTaskModal(true);
  };

  const handleCreateTask = async (taskData) => {
    try {
      setIsLoading(true);
      
      const taskDataWithSprint = {
        ...taskData,
        sprint_id: selectedSprintId
      };
      
      const result = await sprintService.addTaskToSprint(taskDataWithSprint);
      
      if (result.success) {
        setShowTaskModal(false);
        setSelectedSprintId(null);
        await loadSprints(); // Recarregar sprints para atualizar contadores
        setSuccess('Tarefa adicionada à sprint com sucesso!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Erro ao criar tarefa: ' + result.error);
      }
    } catch (error) {
      console.error('❌ Erro ao criar tarefa:', error);
      setError('Erro ao criar tarefa: ' + error.message);
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
      
      // Excluir sprint usando o serviço real
      const result = await sprintService.deleteSprint(sprintId);
      
      if (result.success) {
        console.log('✅ Sprint excluída com sucesso');
        
        // Recarregar sprints para obter dados atualizados
        await loadSprints();
        
        setSuccess('Sprint excluída com sucesso!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        console.error('❌ Erro ao excluir sprint:', result.error);
        setError('Erro ao excluir sprint: ' + result.error);
      }
      
    } catch (error) {
      console.error('❌ Erro ao excluir sprint:', error);
      setError('Erro ao excluir sprint: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ativa':
      case 'planejada':
        return <FaPlay className="status-icon active" />;
      case 'encerrada':
      case 'concluida':
        return <FaStop className="status-icon ended" />;
      default:
        return <FaPlay className="status-icon active" />; // Default para 'ativa'
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'ativa':
        return 'Ativa';
      case 'planejada':
        return 'Ativa'; // Mapear 'planejada' para 'Ativa'
      case 'encerrada':
        return 'Encerrada';
      case 'concluida':
        return 'Encerrada'; // Mapear 'concluida' para 'Encerrada'
      default:
        console.log('⚠️ Status desconhecido:', status);
        return 'Ativa'; // Default para 'Ativa' para mostrar botões
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
    const endDate = new Date(dataFim + 'T00:00:00');
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredSprints = sprints.filter(sprint => {
    if (filterStatus === 'all') return true;
    return sprint.status === filterStatus;
  });

  const activeSprints = sprints.filter(sprint => sprint.status === 'ativa' || sprint.status === 'planejada');
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
            <h3>{activeSprints.reduce((sum, sprint) => sum + Number(sprint.total_tasks || 0), 0)}</h3>
            <p>Total de Tarefas</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <FaCheckCircle />
          </div>
          <div className="stat-info">
            <h3>{activeSprints.reduce((sum, sprint) => sum + Number(sprint.tasks_concluidas || 0), 0)}</h3>
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
            const isOverdue = daysRemaining < 0 && (sprint.status === 'ativa' || sprint.status === 'planejada');
            
            return (
              <div key={sprint.id} className={`sprint-card ${sprint.status} ${isOverdue ? 'overdue' : ''}`}>
                <div className="sprint-header-card">
                  <div className="sprint-title" onClick={() => navigate(`/sprint/${sprint.id}/board`)} style={{ cursor: 'pointer' }}>
                    <h3>{sprint.nome}</h3>
                    <div className="sprint-status">
                      {getStatusIcon(sprint.status)}
                      <span>{getStatusLabel(sprint.status)}</span>
                    </div>
                  </div>
                  
                  {(sprint.status === 'ativa' || sprint.status === 'planejada') && (
                    <div className="sprint-actions">
                      <button 
                        className="action-btn add-task"
                        onClick={() => handleAddTaskToSprint(sprint.id)}
                        title="Adicionar Tarefa"
                      >
                        <FaPlus />
                        Nova Tarefa
                      </button>
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
                      <span>Início: {new Date(sprint.data_inicio + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="date-item">
                      <FaCalendar />
                      <span>Fim: {new Date(sprint.data_fim + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                    </div>
                    {(sprint.status === 'ativa' || sprint.status === 'planejada') && (
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
                      <span>{Number(sprint.progresso || 0).toFixed(1)}%</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ 
                          width: `${Number(sprint.progresso || 0)}%`,
                          backgroundColor: getProgressColor(Number(sprint.progresso || 0))
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="sprint-tasks">
                    <div className="task-stats">
                      <div 
                        className="task-stat clickable" 
                        onClick={() => navigate(`/sprint/${sprint.id}/tasks`)}
                        title="Ver todas as tarefas da sprint"
                      >
                        <FaTasks />
                        <span>{Number(sprint.total_tasks || 0)} total</span>
                      </div>
                      <div className="task-stat completed">
                        <FaCheckCircle />
                        <span>{Number(sprint.tasks_concluidas || 0)} concluídas</span>
                      </div>
                      <div className="task-stat in-progress">
                        <FaExclamationCircle />
                        <span>{Number(sprint.tasks_em_andamento || 0)} em andamento</span>
                      </div>
                      <div className="task-stat pending">
                        <FaClock />
                        <span>{Number(sprint.tasks_pendentes || 0)} pendentes</span>
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

      {/* Create Task Modal */}
      {showTaskModal && (
        <TaskModal
          sprintId={selectedSprintId}
          onClose={() => {
            setShowTaskModal(false);
            setSelectedSprintId(null);
          }}
          onSave={handleCreateTask}
        />
      )}

      {/* Sprint Details Modal */}
      {showSprintDetails && selectedSprint && (
        <SprintDetailsModal
          sprint={selectedSprint}
          tasks={sprintTasks}
          onClose={() => {
            setShowSprintDetails(false);
            setSelectedSprint(null);
            setSprintTasks([]);
          }}
          onAddTask={() => {
            setShowSprintDetails(false);
            setSelectedSprintId(selectedSprint.id);
            setShowTaskModal(true);
          }}
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
    
    if (sprint) {
      // Editando sprint existente
      onSave(sprint.id, formData);
    } else {
      // Criando nova sprint
      onSave(formData);
    }
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

// Modal para criar tarefa na sprint
const TaskModal = ({ sprintId, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    estimated_hours: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onSave(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Nova Tarefa</h2>
        
        <form onSubmit={handleSubmit} className="create-task-form">
          <div className="form-group">
            <label>Título da Tarefa</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ex: Implementar login"
              required
              maxLength={255}
            />
          </div>

          <div className="form-group">
            <label>Descrição</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva a tarefa em detalhes..."
              rows={3}
              maxLength={1000}
            />
          </div>

          <div className="form-group">
            <label>Prioridade</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
            >
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
              <option value="critical">Crítica</option>
            </select>
          </div>

          <div className="form-group">
            <label>Horas Estimadas</label>
            <input
              type="number"
              value={formData.estimated_hours}
              onChange={(e) => setFormData(prev => ({ ...prev, estimated_hours: e.target.value }))}
              placeholder="Ex: 8"
              min="0"
              step="0.5"
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancelar
            </button>
            <button type="submit" className="save-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Criando...' : 'Criar Tarefa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal para visualizar detalhes da sprint e suas tarefas
const SprintDetailsModal = ({ sprint, tasks, onClose, onAddTask }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pendente': return '#f59e0b';
      case 'em_andamento': return '#3b82f6';
      case 'concluida': return '#10b981';
      case 'cancelada': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'baixa': return '#10b981';
      case 'media': return '#f59e0b';
      case 'alta': return '#ef4444';
      case 'urgente': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pendente': return 'Pendente';
      case 'em_andamento': return 'Em Andamento';
      case 'concluida': return 'Concluída';
      case 'cancelada': return 'Cancelada';
      default: return status;
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'baixa': return 'Baixa';
      case 'media': return 'Média';
      case 'alta': return 'Alta';
      case 'urgente': return 'Urgente';
      default: return priority;
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content sprint-details-modal">
        <div className="modal-header">
          <div className="sprint-header-info">
            <h2>{sprint.nome}</h2>
            <div className="sprint-meta">
              <span className="sprint-status-badge" style={{ backgroundColor: getStatusColor(sprint.status) }}>
                {getStatusLabel(sprint.status)}
              </span>
              <span className="sprint-dates">
                {new Date(sprint.data_inicio + 'T00:00:00').toLocaleDateString('pt-BR')} - {new Date(sprint.data_fim + 'T00:00:00').toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
          <div className="modal-actions">
            <button className="action-btn add-task" onClick={onAddTask}>
              <FaPlus />
              Nova Tarefa
            </button>
            <button className="close-btn" onClick={onClose}>
              <FaTimes />
            </button>
          </div>
        </div>

        <div className="modal-body">
          {sprint.descricao && (
            <div className="sprint-description">
              <p>{sprint.descricao}</p>
            </div>
          )}

          <div className="sprint-stats">
            <div className="stat-item">
              <FaTasks />
              <span>{tasks.length} Tarefas</span>
            </div>
            <div className="stat-item completed">
              <FaCheckCircle />
              <span>{tasks.filter(t => t.status === 'concluida').length} Concluídas</span>
            </div>
            <div className="stat-item in-progress">
              <FaExclamationCircle />
              <span>{tasks.filter(t => t.status === 'em_andamento').length} Em Andamento</span>
            </div>
            <div className="stat-item pending">
              <FaClock />
              <span>{tasks.filter(t => t.status === 'pendente').length} Pendentes</span>
            </div>
          </div>

          <div className="tasks-section">
            <h3>Tarefas da Sprint</h3>
            {tasks.length === 0 ? (
              <div className="empty-tasks">
                <FaTasks />
                <p>Nenhuma tarefa encontrada nesta sprint.</p>
                <button className="add-first-task-btn" onClick={onAddTask}>
                  <FaPlus />
                  Adicionar Primeira Tarefa
                </button>
              </div>
            ) : (
              <div className="tasks-list">
                {tasks.map(task => (
                  <div key={task.id} className="task-item">
                    <div className="task-header">
                      <div className="task-title">
                        <h4>{task.card?.title || 'Tarefa sem título'}</h4>
                        <div className="task-meta">
                          <span 
                            className="task-status" 
                            style={{ backgroundColor: getStatusColor(task.status) }}
                          >
                            {getStatusLabel(task.status)}
                          </span>
                          <span 
                            className="task-priority" 
                            style={{ backgroundColor: getPriorityColor(task.prioridade) }}
                          >
                            {getPriorityLabel(task.prioridade)}
                          </span>
                        </div>
                      </div>
                      <div className="task-actions">
                        {task.estimativa_horas > 0 && (
                          <span className="task-hours">
                            <FaClock />
                            {task.estimativa_horas}h
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {task.card?.description && (
                      <div className="task-description">
                        <p>{task.card.description}</p>
                      </div>
                    )}

                    {task.observacoes && (
                      <div className="task-notes">
                        <strong>Observações:</strong>
                        <p>{task.observacoes}</p>
                      </div>
                    )}

                    {task.data_limite && (
                      <div className="task-deadline">
                        <FaCalendar />
                        <span>Prazo: {new Date(task.data_limite).toLocaleDateString('pt-BR')}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SprintManagement;
