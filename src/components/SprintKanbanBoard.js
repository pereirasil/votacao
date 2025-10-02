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
  FaTimes,
  FaGripVertical,
  FaEllipsisH,
  FaTag,
  FaList
} from 'react-icons/fa';
import authService from '../services/authService';
import sprintService from '../services/sprintService';
import './SprintKanbanBoard.css';

const SprintKanbanBoard = () => {
  const { sprintId } = useParams();
  const navigate = useNavigate();
  const [sprint, setSprint] = useState(null);
  const [columns, setColumns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateColumn, setShowCreateColumn] = useState(false);
  const [showCreateCard, setShowCreateCard] = useState(null);
  const [editingColumn, setEditingColumn] = useState(null);
  const [editingCard, setEditingCard] = useState(null);
  const [draggedCard, setDraggedCard] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

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

      // Carregar dados da sprint
      const sprintResult = await sprintService.getSprint(sprintId);
      if (sprintResult.success) {
        setSprint(sprintResult.sprint);
        console.log('✅ Sprint carregada:', sprintResult.sprint);
      } else {
        console.error('❌ Erro ao carregar sprint:', sprintResult.error);
        setError('Erro ao carregar dados da sprint: ' + sprintResult.error);
        return;
      }

      // Carregar colunas e cartões da sprint
      await loadSprintBoard();

    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      setError('Erro ao carregar dados da sprint');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSprintBoard = async () => {
    try {
      // Carregar colunas reais da sprint
      const columnsResult = await sprintService.getSprintColumns(sprintId);
      let sprintColumns = [];
      
      if (columnsResult.success) {
        sprintColumns = columnsResult.columns || [];
        console.log('✅ Colunas da sprint carregadas:', sprintColumns.length);
      } else {
        console.warn('⚠️ Erro ao carregar colunas da sprint:', columnsResult.error);
        // Fallback para colunas padrão se não conseguir carregar
        sprintColumns = [
          { id: 1, nome: 'A Fazer', ordem: 0, sprint_id: parseInt(sprintId) },
          { id: 2, nome: 'Em Andamento', ordem: 1, sprint_id: parseInt(sprintId) },
          { id: 3, nome: 'Concluído', ordem: 2, sprint_id: parseInt(sprintId) }
        ];
      }

      // Carregar tarefas reais da sprint
      const tasksResult = await sprintService.getSprintTasks(sprintId);
      let sprintTasks = [];
      
      if (tasksResult.success) {
        sprintTasks = tasksResult.tasks || [];
        console.log('✅ Tarefas da sprint carregadas:', sprintTasks.length);
      } else {
        console.warn('⚠️ Erro ao carregar tarefas da sprint:', tasksResult.error);
      }

      // Mapear colunas para o formato esperado pelo frontend
      const mappedColumns = sprintColumns.map(column => {
        const columnCards = sprintTasks
          .filter(task => {
            // Usar column_id da tarefa para mapear para a coluna correta
            return task.column_id === column.id;
          })
          .map(task => ({
            id: task.id,
            title: task.titulo || 'Tarefa sem título',
            description: task.descricao || '',
            position: 1,
            column_id: task.column_id,
            labels: [],
            due_date: task.data_limite,
            priority: task.prioridade || 'media',
            estimativa_horas: task.estimativa_horas || 0,
            checklists: [],
            taskData: task // Manter dados originais da tarefa
          }));

        return {
          id: column.id,
          title: column.nome,
          position: column.ordem + 1,
          sprint_id: column.sprint_id,
          cards: columnCards
        };
      });

      setColumns(mappedColumns);
      console.log('✅ Board carregado com tarefas reais:', mappedColumns);

    } catch (error) {
      console.error('❌ Erro ao carregar board:', error);
      setError('Erro ao carregar board da sprint');
    }
  };

  const handleCreateColumn = async (columnData) => {
    try {
      // Criar coluna no backend
      const result = await sprintService.createSprintColumn(sprintId, {
        nome: columnData.title
      });

      if (result.success) {
        // Recarregar o board para mostrar a nova coluna
        await loadSprintBoard();
        setShowCreateColumn(false);
        console.log('✅ Coluna criada:', result.column);
      } else {
        console.error('❌ Erro ao criar coluna:', result.error);
        setError('Erro ao criar coluna: ' + result.error);
      }

    } catch (error) {
      console.error('❌ Erro ao criar coluna:', error);
      setError('Erro ao criar coluna');
    }
  };

  const handleUpdateColumn = async (columnId, columnData) => {
    try {
      // Atualizar coluna no backend
      const result = await sprintService.updateSprintColumn(sprintId, columnId, {
        nome: columnData.title
      });

      if (result.success) {
        // Recarregar o board para mostrar as mudanças
        await loadSprintBoard();
        setEditingColumn(null);
        console.log('✅ Coluna atualizada:', columnId);
      } else {
        console.error('❌ Erro ao atualizar coluna:', result.error);
        setError('Erro ao atualizar coluna: ' + result.error);
      }

    } catch (error) {
      console.error('❌ Erro ao atualizar coluna:', error);
      setError('Erro ao atualizar coluna');
    }
  };

  const handleDeleteColumn = async (columnId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta coluna? Todas as tarefas serão movidas para a primeira coluna.')) {
      return;
    }

    try {
      // Excluir coluna no backend
      const result = await sprintService.deleteSprintColumn(sprintId, columnId);

      if (result.success) {
        // Recarregar o board para mostrar as mudanças
        await loadSprintBoard();
        console.log('✅ Coluna excluída:', columnId);
      } else {
        console.error('❌ Erro ao excluir coluna:', result.error);
        setError('Erro ao excluir coluna: ' + result.error);
      }

    } catch (error) {
      console.error('❌ Erro ao excluir coluna:', error);
      setError('Erro ao excluir coluna');
    }
  };

  const handleCreateCard = async (columnId, cardData) => {
    try {
      // Determinar status baseado na coluna
      const targetColumn = columns.find(col => col.id === columnId);
      let status = 'pendente';
      
      if (targetColumn) {
        switch (targetColumn.title) {
          case 'Para Desenvolver':
            status = 'pendente';
            break;
          case 'Em Desenvolvimento':
            status = 'em_andamento';
            break;
          case 'Impedimento':
            status = 'impedimento';
            break;
          default:
            status = 'pendente';
        }
      }

      // Criar tarefa no backend
      const taskData = {
        titulo: cardData.title,
        descricao: cardData.description || '',
        prioridade: cardData.priority || 'media',
        data_limite: cardData.due_date || null,
        estimativa_horas: cardData.estimativa_horas || 0,
        sprint_id: parseInt(sprintId)
      };

      const result = await sprintService.addTaskToSprint(taskData);
      
      if (result.success) {
        // Recarregar o board para mostrar a nova tarefa
        await loadSprintBoard();
        setShowCreateCard(null);
        console.log('✅ Tarefa criada:', result.task);
      } else {
        console.error('❌ Erro ao criar tarefa:', result.error);
        setError('Erro ao criar tarefa: ' + result.error);
      }

    } catch (error) {
      console.error('❌ Erro ao criar cartão:', error);
      setError('Erro ao criar cartão');
    }
  };

  const handleUpdateCard = async (cardId, cardData) => {
    try {
      // Determinar status baseado na coluna
      const targetColumn = columns.find(col => col.id === cardData.column_id);
      let status = 'pendente';
      
      if (targetColumn) {
        switch (targetColumn.title) {
          case 'Para Desenvolver':
            status = 'pendente';
            break;
          case 'Em Desenvolvimento':
            status = 'em_andamento';
            break;
          case 'Impedimento':
            status = 'impedimento';
            break;
          default:
            status = 'pendente';
        }
      }

      // Atualizar tarefa no backend
      const updateData = {
        titulo: cardData.title,
        descricao: cardData.description || '',
        prioridade: cardData.priority || 'media',
        data_limite: cardData.due_date || null,
        estimativa_horas: cardData.estimativa_horas || 0,
        column_id: cardData.column_id
      };

      const result = await sprintService.updateSprintTask(cardId, updateData);
      
      if (result.success) {
        // Recarregar o board para mostrar as mudanças
        await loadSprintBoard();
        setEditingCard(null);
        console.log('✅ Tarefa atualizada:', cardId);
      } else {
        console.error('❌ Erro ao atualizar tarefa:', result.error);
        setError('Erro ao atualizar tarefa: ' + result.error);
      }

    } catch (error) {
      console.error('❌ Erro ao atualizar cartão:', error);
      setError('Erro ao atualizar cartão');
    }
  };

  const handleDeleteCard = async (cardId) => {
    if (!window.confirm('Tem certeza que deseja excluir este cartão?')) {
      return;
    }

    try {
      // Excluir tarefa no backend
      const result = await sprintService.removeTaskFromSprint(cardId);
      
      if (result.success) {
        // Recarregar o board para remover a tarefa
        await loadSprintBoard();
        console.log('✅ Tarefa excluída:', cardId);
      } else {
        console.error('❌ Erro ao excluir tarefa:', result.error);
        setError('Erro ao excluir tarefa: ' + result.error);
      }

    } catch (error) {
      console.error('❌ Erro ao excluir cartão:', error);
      setError('Erro ao excluir cartão');
    }
  };

  const handleDragStart = (e, card) => {
    setDraggedCard(card);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnId);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOverColumn(null);
  };

  const handleDrop = async (e, targetColumnId) => {
    e.preventDefault();
    
    if (!draggedCard) return;

    const sourceColumnId = draggedCard.column_id;
    
    if (sourceColumnId === targetColumnId) {
      setDraggedCard(null);
      return;
    }

    try {
      // Determinar novo status baseado na coluna destino
      const targetColumn = columns.find(col => col.id === targetColumnId);
      let newStatus = 'pendente';
      
      if (targetColumn) {
        switch (targetColumn.title) {
          case 'Para Desenvolver':
            newStatus = 'pendente';
            break;
          case 'Em Desenvolvimento':
            newStatus = 'em_andamento';
            break;
          case 'Impedimento':
            newStatus = 'impedimento';
            break;
          default:
            newStatus = 'pendente';
        }
      }

      // Atualizar tarefa no backend se tiver dados originais
      if (draggedCard.taskData) {
        const updateResult = await sprintService.updateSprintTask(draggedCard.id, {
          column_id: targetColumnId
        });
        
        if (!updateResult.success) {
          console.error('❌ Erro ao atualizar coluna da tarefa:', updateResult.error);
          setError('Erro ao atualizar coluna da tarefa');
          return;
        }
      }

      // Atualizar estado local
      setColumns(prev => {
        const newColumns = [...prev];
        
        // Remover cartão da coluna origem
        const sourceColumn = newColumns.find(col => col.id === sourceColumnId);
        if (sourceColumn) {
          sourceColumn.cards = sourceColumn.cards.filter(card => card.id !== draggedCard.id);
        }
        
        // Adicionar cartão na coluna destino
        const targetColumn = newColumns.find(col => col.id === targetColumnId);
        if (targetColumn) {
          targetColumn.cards = [...targetColumn.cards, { 
            ...draggedCard, 
            column_id: targetColumnId,
            position: targetColumn.cards.length + 1
          }];
        }
        
        return newColumns;
      });

      console.log('✅ Cartão movido de', sourceColumnId, 'para', targetColumnId, 'com status:', newStatus);
    } catch (error) {
      console.error('❌ Erro ao mover cartão:', error);
      setError('Erro ao mover cartão');
    } finally {
      setDraggedCard(null);
      setDragOverColumn(null);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgente': return '#ef4444';
      case 'alta': return '#f97316';
      case 'media': return '#f59e0b';
      case 'baixa': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return priority;
    }
  };

  if (isLoading) {
    return (
      <div className="kanban-board-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Carregando board da sprint...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="kanban-board-container">
        <div className="error-state">
          <h3>Erro ao carregar board</h3>
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
      <div className="kanban-board-container">
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

  return (
    <div className="kanban-board-container">
      {/* Header */}
      <header className="kanban-header">
        <div className="header-left">
          <button 
            className="back-btn"
            onClick={() => navigate('/sprints')}
          >
            <FaArrowLeft /> Sprints
          </button>
          <div className="title-section">
            <h1>{sprint.nome}</h1>
            <p>Board Kanban</p>
          </div>
        </div>
        
        <div className="header-right">
          <button 
            className="add-column-btn"
            onClick={() => setShowCreateColumn(true)}
          >
            <FaPlus /> Nova Coluna
          </button>
        </div>
      </header>

      {/* Sprint Info */}
      <div className="sprint-info-bar">
        <div className="sprint-dates">
          <FaCalendar />
          <span>
            {new Date(sprint.data_inicio + 'T00:00:00').toLocaleDateString('pt-BR')} - {new Date(sprint.data_fim + 'T00:00:00').toLocaleDateString('pt-BR')}
          </span>
        </div>
        <div className="sprint-stats">
          <div className="stat">
            <FaTasks />
            <span>{columns.reduce((sum, col) => sum + col.cards.length, 0)} Tarefas</span>
          </div>
          <div className="stat completed">
            <FaCheckCircle />
            <span>{columns.find(col => col.title.toLowerCase().includes('concluíd'))?.cards.length || 0} Concluídas</span>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="kanban-board">
        <div className="columns-container">
          {columns.map(column => (
            <Column
              key={column.id}
              column={column}
              onAddCard={() => setShowCreateCard(column.id)}
              onUpdateColumn={handleUpdateColumn}
              onDeleteColumn={handleDeleteColumn}
              onUpdateCard={handleUpdateCard}
              onDeleteCard={handleDeleteCard}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              dragOverColumn={dragOverColumn}
              setEditingColumn={setEditingColumn}
              setEditingCard={setEditingCard}
            />
          ))}
        </div>
      </div>

      {/* Create Column Modal */}
      {showCreateColumn && (
        <ColumnModal
          onClose={() => setShowCreateColumn(false)}
          onSave={handleCreateColumn}
        />
      )}

      {/* Edit Column Modal */}
      {editingColumn && (
        <ColumnModal
          column={editingColumn}
          onClose={() => setEditingColumn(null)}
          onSave={(columnData) => handleUpdateColumn(editingColumn.id, columnData)}
        />
      )}

      {/* Create Card Modal */}
      {showCreateCard && (
        <CardModal
          columnId={showCreateCard}
          columns={columns}
          onClose={() => setShowCreateCard(null)}
          onSave={(cardData) => handleCreateCard(cardData.column_id, cardData)}
        />
      )}

      {/* Edit Card Modal */}
      {editingCard && (
        <CardModal
          card={editingCard}
          columnId={editingCard.column_id}
          columns={columns}
          onClose={() => setEditingCard(null)}
          onSave={(cardData) => handleUpdateCard(editingCard.id, cardData)}
        />
      )}
    </div>
  );
};

// Componente para coluna
const Column = ({ 
  column, 
  onAddCard, 
  onUpdateColumn, 
  onDeleteColumn, 
  onUpdateCard, 
  onDeleteCard, 
  onDragStart, 
  onDragOver, 
  onDragLeave,
  onDrop,
  dragOverColumn,
  setEditingColumn,
  setEditingCard
}) => {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <div 
      className={`column ${dragOverColumn === column.id ? 'drag-over' : ''}`}
      onDragOver={(e) => onDragOver(e, column.id)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, column.id)}
    >
      <div className="column-header">
        <h3 className="column-title">{column.title}</h3>
        <div className="column-actions">
          <span className="card-count">{column.cards.length}</span>
          <button 
            className="options-btn"
            onClick={() => setShowOptions(!showOptions)}
          >
            <FaEllipsisH />
          </button>
          {showOptions && (
            <div className="column-options">
              <button onClick={() => {
                setEditingColumn(column);
                setShowOptions(false);
              }}>
                <FaEdit /> Editar
              </button>
              <button onClick={() => {
                onDeleteColumn(column.id);
                setShowOptions(false);
              }}>
                <FaTrash /> Excluir
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="cards-container">
        {column.cards.map(card => (
          <Card
            key={card.id}
            card={card}
            onUpdate={onUpdateCard}
            onDelete={onDeleteCard}
            onDragStart={onDragStart}
            setEditingCard={setEditingCard}
          />
        ))}
        
        <button className="add-card-btn" onClick={onAddCard}>
          <FaPlus /> Adicionar Cartão
        </button>
      </div>
    </div>
  );
};

// Componente para cartão
const Card = ({ card, onUpdate, onDelete, onDragStart, setEditingCard }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgente': return '#ef4444';
      case 'alta': return '#f97316';
      case 'media': return '#f59e0b';
      case 'baixa': return '#10b981';
      default: return '#6b7280';
    }
  };

  const completedChecklists = card.checklists.reduce((sum, checklist) => 
    sum + checklist.items.filter(item => item.completed).length, 0
  );
  const totalChecklists = card.checklists.reduce((sum, checklist) => 
    sum + checklist.items.length, 0
  );

  return (
    <div 
      className="card"
      draggable
      onDragStart={(e) => onDragStart(e, card)}
      onDragEnd={() => {
        // Limpar estado de drag quando terminar
        document.querySelectorAll('.column').forEach(col => {
          col.classList.remove('drag-over');
        });
      }}
    >
      <div className="card-header">
        <div className="card-labels">
          {card.labels.map(label => (
            <span 
              key={label.id} 
              className="label" 
              style={{ backgroundColor: label.color }}
            >
              {label.name}
            </span>
          ))}
        </div>
        <div className="card-actions">
          <button 
            className="edit-btn"
            onClick={() => setEditingCard(card)}
            title="Editar cartão"
          >
            <FaEdit />
          </button>
          <button 
            className="delete-btn"
            onClick={() => onDelete(card.id)}
            title="Excluir cartão"
          >
            <FaTrash />
          </button>
        </div>
      </div>

      <div className="card-content">
        <h4 className="card-title">{card.title}</h4>
        {card.description && (
          <p className="card-description">{card.description}</p>
        )}
      </div>

      <div className="card-footer">
        {card.due_date && (
          <div className="due-date">
            <FaCalendar />
            <span>{new Date(card.due_date + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
          </div>
        )}
        
        {totalChecklists > 0 && (
          <div className="checklist-progress">
            <FaList />
            <span>{completedChecklists}/{totalChecklists}</span>
          </div>
        )}

        <div 
          className="priority-badge"
          style={{ backgroundColor: getPriorityColor(card.priority) }}
        >
          {card.priority}
        </div>
      </div>
    </div>
  );
};

// Modal para criar/editar coluna
const ColumnModal = ({ column, onClose, onSave }) => {
  const [title, setTitle] = useState(column?.title || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) {
      onSave({ title: title.trim() });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{column ? 'Editar Coluna' : 'Nova Coluna'}</h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="column-form">
          <div className="form-group">
            <label>Nome da Coluna *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: A Fazer, Em Andamento, Concluídas"
              required
              autoFocus
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancelar
            </button>
            <button type="submit" className="save-btn">
              {column ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal para criar/editar cartão
const CardModal = ({ card, columnId, onClose, onSave, columns = [] }) => {
  const [formData, setFormData] = useState({
    title: card?.title || '',
    description: card?.description || '',
    priority: card?.priority || 'media',
    due_date: card?.due_date || '',
    labels: card?.labels || [],
    column_id: card?.column_id || columnId || 1
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title.trim()) {
      onSave(formData);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content card-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{card ? 'Editar Cartão' : 'Novo Cartão'}</h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="card-form">
          <div className="form-group">
            <label>Título *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Título do cartão"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Descrição</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrição do cartão"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Coluna</label>
            <select
              value={formData.column_id}
              onChange={(e) => setFormData(prev => ({ ...prev, column_id: parseInt(e.target.value) }))}
            >
              {columns.map(column => (
                <option key={column.id} value={column.id}>
                  {column.title}
                </option>
              ))}
            </select>
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
              <label>Data de Vencimento</label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancelar
            </button>
            <button type="submit" className="save-btn">
              {card ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SprintKanbanBoard;
