import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaCalendar,
  FaClock,
  FaTasks,
  FaCheckCircle,
  FaExclamationCircle,
  FaUser,
  FaFlag,
  FaTimes
} from 'react-icons/fa';
import authService from '../services/authService';
import sprintService from '../services/sprintService';
import './SprintTasksView.css';

const SprintTasksView = () => {
  const { sprintId } = useParams();
  const navigate = useNavigate();
  const [sprint, setSprint] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    const isAuth = authService.isAuthenticated();
    
    if (!currentUser || !isAuth) {
      navigate('/login', { replace: true });
      return;
    }

    if (sprintId) {
      loadSprintData();
    }
  }, [navigate, sprintId]);

  const loadSprintData = async () => {
    try {
      setIsLoading(true);
      setError('');
      console.log('📋 Carregando dados da sprint:', sprintId);

      // Carregar dados da sprint e suas tarefas
      const [sprintResult, tasksResult] = await Promise.all([
        sprintService.getSprint(sprintId),
        sprintService.getSprintTasks(sprintId)
      ]);

      if (sprintResult.success) {
        setSprint(sprintResult.sprint);
        console.log('✅ Sprint carregada:', sprintResult.sprint);
      } else {
        console.error('❌ Erro ao carregar sprint:', sprintResult.error);
        setError('Erro ao carregar dados da sprint: ' + sprintResult.error);
        return;
      }

      if (tasksResult.success) {
        setTasks(tasksResult.tasks || []);
        console.log('✅ Tarefas carregadas:', tasksResult.tasks?.length || 0);
      } else {
        console.error('❌ Erro ao carregar tarefas:', tasksResult.error);
        setError('Erro ao carregar tarefas: ' + tasksResult.error);
      }

    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      setError('Erro ao carregar dados da sprint');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      setIsLoading(true);
      console.log('➕ Criando tarefa...', taskData);
      
      const taskDataWithSprint = {
        ...taskData,
        sprint_id: parseInt(sprintId)
      };
      
      const result = await sprintService.addTaskToSprint(taskDataWithSprint);
      
      if (result.success) {
        console.log('✅ Tarefa criada com sucesso:', result.task);
        await loadSprintData(); // Recarregar dados
        setShowCreateTask(false);
      } else {
        console.error('❌ Erro ao criar tarefa:', result.error);
        setError('Erro ao criar tarefa: ' + result.error);
      }
      
    } catch (error) {
      console.error('❌ Erro ao criar tarefa:', error);
      setError('Erro ao criar tarefa: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTask = async (taskId, taskData) => {
    try {
      setIsLoading(true);
      console.log('✏️ Atualizando tarefa...', taskId, taskData);
      
      const result = await sprintService.updateSprintTask(taskId, taskData);
      
      if (result.success) {
        console.log('✅ Tarefa atualizada com sucesso:', result.task);
        await loadSprintData(); // Recarregar dados
        setEditingTask(null);
      } else {
        console.error('❌ Erro ao atualizar tarefa:', result.error);
        setError('Erro ao atualizar tarefa: ' + result.error);
      }
      
    } catch (error) {
      console.error('❌ Erro ao atualizar tarefa:', error);
      setError('Erro ao atualizar tarefa: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
      return;
    }

    try {
      setIsLoading(true);
      console.log('🗑️ Excluindo tarefa...', taskId);
      
      const result = await sprintService.removeTaskFromSprint(taskId);
      
      if (result.success) {
        console.log('✅ Tarefa excluída com sucesso');
        await loadSprintData(); // Recarregar dados
      } else {
        console.error('❌ Erro ao excluir tarefa:', result.error);
        setError('Erro ao excluir tarefa: ' + result.error);
      }
      
    } catch (error) {
      console.error('❌ Erro ao excluir tarefa:', error);
      setError('Erro ao excluir tarefa: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

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

  const getDaysRemaining = (dataFim) => {
    const today = new Date();
    const endDate = new Date(dataFim);
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <div className="sprint-tasks-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Carregando tarefas da sprint...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sprint-tasks-container">
        <div className="error-state">
          <h3>Erro ao carregar sprint</h3>
          <p>{error}</p>
          <button onClick={() => navigate('/sprints')} className="back-btn">
            <FaArrowLeft /> Voltar às Sprints
          </button>
        </div>
      </div>
    );
  }

  if (!sprint) {
    return (
      <div className="sprint-tasks-container">
        <div className="error-state">
          <h3>Sprint não encontrada</h3>
          <p>A sprint solicitada não foi encontrada.</p>
          <button onClick={() => navigate('/sprints')} className="back-btn">
            <FaArrowLeft /> Voltar às Sprints
          </button>
        </div>
      </div>
    );
  }

  const daysRemaining = getDaysRemaining(sprint.data_fim);
  const isOverdue = daysRemaining < 0 && (sprint.status === 'ativa' || sprint.status === 'planejada');

  return (
    <div className="sprint-tasks-container">
      {/* Header */}
      <header className="sprint-tasks-header">
        <div className="header-left">
          <button 
            className="back-btn"
            onClick={() => navigate('/sprints')}
          >
            <FaArrowLeft /> Sprints
          </button>
          <div className="title-section">
            <h1>{sprint.nome}</h1>
            <p>Tarefas da Sprint</p>
          </div>
        </div>
        
        <div className="header-right">
          <button 
            className="create-task-btn"
            onClick={() => setShowCreateTask(true)}
          >
            <FaPlus /> Nova Tarefa
          </button>
        </div>
      </header>

      {/* Sprint Info */}
      <div className="sprint-info-card">
        <div className="sprint-info-header">
          <div className="sprint-title">
            <h2>{sprint.nome}</h2>
            <div className="sprint-status">
              <span className={`status-badge ${sprint.status}`}>
                {sprint.status === 'ativa' ? 'Ativa' : sprint.status === 'encerrada' ? 'Encerrada' : 'Planejada'}
              </span>
            </div>
          </div>
        </div>

        {sprint.descricao && (
          <div className="sprint-description">
            <p>{sprint.descricao}</p>
          </div>
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
      </div>

      {/* Tasks List */}
      <div className="tasks-section">
        <div className="tasks-header">
          <h3>Tarefas da Sprint</h3>
          <div className="tasks-count">
            {tasks.length} {tasks.length === 1 ? 'tarefa' : 'tarefas'}
          </div>
        </div>

        {tasks.length === 0 ? (
          <div className="empty-tasks">
            <FaTasks />
            <p>Nenhuma tarefa encontrada nesta sprint.</p>
            <button className="add-first-task-btn" onClick={() => setShowCreateTask(true)}>
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
                    <button 
                      className="action-btn edit"
                      onClick={() => setEditingTask(task)}
                      title="Editar Tarefa"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="action-btn delete"
                      onClick={() => handleDeleteTask(task.id)}
                      title="Excluir Tarefa"
                    >
                      <FaTrash />
                    </button>
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

      {/* Create Task Modal */}
      {showCreateTask && (
        <TaskModal
          sprintId={sprintId}
          onClose={() => setShowCreateTask(false)}
          onSave={handleCreateTask}
        />
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <TaskModal
          task={editingTask}
          sprintId={sprintId}
          onClose={() => setEditingTask(null)}
          onSave={(taskData) => handleUpdateTask(editingTask.id, taskData)}
        />
      )}
    </div>
  );
};

// Modal para criar/editar tarefa
const TaskModal = ({ task, sprintId, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    estimated_hours: '',
    due_date: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.card?.title || '',
        description: task.card?.description || '',
        priority: task.prioridade || 'medium',
        estimated_hours: task.estimativa_horas || '',
        due_date: task.data_limite || '',
        notes: task.observacoes || ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        estimated_hours: '',
        due_date: '',
        notes: ''
      });
    }
  }, [task]);

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
      <div className="modal-content task-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{task ? 'Editar Tarefa' : 'Nova Tarefa'}</h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="task-form">
          <div className="form-group">
            <label>Título da Tarefa *</label>
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

          <div className="form-row">
            <div className="form-group">
              <label>Prioridade</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
              >
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
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
          </div>

          <div className="form-group">
            <label>Data de Vencimento</label>
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label>Observações</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Observações adicionais..."
              rows={2}
              maxLength={500}
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancelar
            </button>
            <button type="submit" className="save-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : (task ? 'Atualizar Tarefa' : 'Criar Tarefa')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SprintTasksView;
