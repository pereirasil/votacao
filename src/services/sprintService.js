import api, { ApiError, NetworkError } from '../utils/api';

class SprintService {
  /**
   * Função auxiliar para tratamento de erros
   * @param {Error} error - Erro capturado
   * @param {string} operation - Nome da operação que falhou
   * @returns {Object} Objeto de erro padronizado
   */
  _handleError(error, operation) {
    console.error(`❌ Erro em ${operation}:`, error);
    
    if (error instanceof NetworkError) {
      return {
        success: false,
        error: 'Erro de conexão. Verifique sua internet e tente novamente.',
        type: 'network'
      };
    }
    
    if (error instanceof ApiError) {
      return {
        success: false,
        error: error.message,
        type: 'api',
        status: error.status
      };
    }
    
    return {
      success: false,
      error: error.message || `Erro inesperado em ${operation}`,
      type: 'unknown'
    };
  }

  /**
   * Cria uma nova sprint
   * @param {Object} sprintData - Dados da sprint
   * @returns {Promise<Object>} Sprint criada
   */
  async createSprint(sprintData) {
    try {
      console.log('🌐 Fazendo requisição de criação de sprint para:', '/sprints');
      console.log('📤 Dados enviados:', sprintData);
      
      const response = await api.post('/sprints', sprintData);
      
      if (!response.data) {
        return {
          success: false,
          error: 'Dados da sprint criada não encontrados'
        };
      }
      
      console.log('✅ Sprint criada com sucesso');
      return { success: true, sprint: response.data };
    } catch (error) {
      return this._handleError(error, 'criar sprint');
    }
  }

  /**
   * Obtém sprints de um board
   * @param {number} boardId - ID do board
   * @returns {Promise<Object>} Lista de sprints
   */
  async getBoardSprints(boardId) {
    try {
      console.log('🌐 Fazendo requisição de sprints para:', `/sprints/board/${boardId}`);
      const response = await api.get(`/sprints/board/${boardId}`);
      
      if (!response.data) {
        return {
          success: false,
          error: 'Dados de sprints não encontrados'
        };
      }
      
      console.log('✅ Sprints obtidas com sucesso:', response.data.length || 0, 'sprints');
      return { success: true, sprints: response.data };
    } catch (error) {
      return this._handleError(error, 'obter sprints');
    }
  }

  /**
   * Obtém uma sprint específica por ID
   * @param {number} sprintId - ID da sprint
   * @returns {Promise<Object>} Dados da sprint
   */
  async getSprint(sprintId) {
    try {
      console.log('🌐 Fazendo requisição de sprint para:', `/sprints/${sprintId}`);
      const response = await api.get(`/sprints/${sprintId}`);
      
      if (!response.data) {
        return {
          success: false,
          error: 'Dados da sprint não encontrados'
        };
      }
      
      console.log('✅ Sprint obtida com sucesso');
      return { success: true, sprint: response.data };
    } catch (error) {
      return this._handleError(error, 'obter sprint');
    }
  }

  /**
   * Atualiza uma sprint existente
   * @param {number} sprintId - ID da sprint
   * @param {Object} sprintData - Novos dados da sprint
   * @returns {Promise<Object>} Sprint atualizada
   */
  async updateSprint(sprintId, sprintData) {
    try {
      console.log('🌐 Fazendo requisição de atualização de sprint para:', `/sprints/${sprintId}`);
      console.log('📤 Dados enviados:', sprintData);
      
      const response = await api.put(`/sprints/${sprintId}`, sprintData);
      
      if (!response.data) {
        return {
          success: false,
          error: 'Dados da sprint atualizada não encontrados'
        };
      }
      
      console.log('✅ Sprint atualizada com sucesso');
      return { success: true, sprint: response.data };
    } catch (error) {
      return this._handleError(error, 'atualizar sprint');
    }
  }

  /**
   * Exclui uma sprint
   * @param {number} sprintId - ID da sprint
   * @returns {Promise<Object>} Resultado da exclusão
   */
  async deleteSprint(sprintId) {
    try {
      await api.delete(`/sprints/${sprintId}`);
      return { success: true };
    } catch (error) {
      console.error('Erro ao excluir sprint:', error);
      return {
        success: false,
        error: error.message || 'Erro ao excluir sprint'
      };
    }
  }

  /**
   * Obtém tarefas de uma sprint
   * @param {number} sprintId - ID da sprint
   * @returns {Promise<Object>} Lista de tarefas
   */
  async getSprintTasks(sprintId) {
    try {
      console.log('🌐 Fazendo requisição de tarefas da sprint para:', `/sprints/${sprintId}/tasks`);
      const response = await api.get(`/sprints/${sprintId}/tasks`);
      
      if (!response.data) {
        return {
          success: false,
          error: 'Dados de tarefas não encontrados'
        };
      }
      
      console.log('✅ Tarefas da sprint obtidas com sucesso:', response.data.length || 0, 'tarefas');
      return { success: true, tasks: response.data };
    } catch (error) {
      return this._handleError(error, 'obter tarefas da sprint');
    }
  }

  /**
   * Obtém colunas de uma sprint
   * @param {number} sprintId - ID da sprint
   * @returns {Promise<Object>} Lista de colunas
   */
  async getSprintColumns(sprintId) {
    try {
      console.log('🌐 Fazendo requisição de colunas da sprint para:', `/sprints/${sprintId}/columns`);
      const response = await api.get(`/sprints/${sprintId}/columns`);
      
      if (!response.data) {
        return {
          success: false,
          error: 'Dados de colunas não encontrados'
        };
      }
      
      console.log('✅ Colunas da sprint obtidas com sucesso:', response.data.length || 0, 'colunas');
      return { success: true, columns: response.data };
    } catch (error) {
      return this._handleError(error, 'obter colunas da sprint');
    }
  }

  /**
   * Cria uma nova coluna na sprint
   * @param {number} sprintId - ID da sprint
   * @param {Object} columnData - Dados da coluna
   * @returns {Promise<Object>} Coluna criada
   */
  async createSprintColumn(sprintId, columnData) {
    try {
      console.log('🌐 Fazendo requisição de criação de coluna para:', `/sprints/${sprintId}/columns`);
      console.log('📤 Dados enviados:', columnData);
      
      const response = await api.post(`/sprints/${sprintId}/columns`, columnData);
      
      if (!response.data) {
        return {
          success: false,
          error: 'Dados da coluna criada não encontrados'
        };
      }
      
      console.log('✅ Coluna criada com sucesso');
      return { success: true, column: response.data };
    } catch (error) {
      return this._handleError(error, 'criar coluna');
    }
  }

  /**
   * Atualiza uma coluna da sprint
   * @param {number} sprintId - ID da sprint
   * @param {number} columnId - ID da coluna
   * @param {Object} columnData - Dados da coluna
   * @returns {Promise<Object>} Coluna atualizada
   */
  async updateSprintColumn(sprintId, columnId, columnData) {
    try {
      console.log('🌐 Fazendo requisição de atualização de coluna para:', `/sprints/${sprintId}/columns/${columnId}`);
      console.log('📤 Dados enviados:', columnData);
      
      const response = await api.put(`/sprints/${sprintId}/columns/${columnId}`, columnData);
      
      if (!response.data) {
        return {
          success: false,
          error: 'Dados da coluna atualizada não encontrados'
        };
      }
      
      console.log('✅ Coluna atualizada com sucesso');
      return { success: true, column: response.data };
    } catch (error) {
      return this._handleError(error, 'atualizar coluna');
    }
  }

  /**
   * Exclui uma coluna da sprint
   * @param {number} sprintId - ID da sprint
   * @param {number} columnId - ID da coluna
   * @returns {Promise<Object>} Resultado da exclusão
   */
  async deleteSprintColumn(sprintId, columnId) {
    try {
      console.log('🌐 Fazendo requisição de exclusão de coluna para:', `/sprints/${sprintId}/columns/${columnId}`);
      
      await api.delete(`/sprints/${sprintId}/columns/${columnId}`);
      
      console.log('✅ Coluna excluída com sucesso');
      return { success: true };
    } catch (error) {
      return this._handleError(error, 'excluir coluna');
    }
  }

  /**
   * Adiciona uma tarefa à sprint
   * @param {Object} taskData - Dados da tarefa
   * @returns {Promise<Object>} Tarefa adicionada
   */
  async addTaskToSprint(taskData) {
    try {
      console.log('🌐 Fazendo requisição de adição de tarefa para:', '/sprints/tasks');
      console.log('📤 Dados enviados:', taskData);
      
      const response = await api.post('/sprints/tasks', taskData);
      
      if (!response.data) {
        return {
          success: false,
          error: 'Dados da tarefa adicionada não encontrados'
        };
      }
      
      console.log('✅ Tarefa adicionada à sprint com sucesso');
      return { success: true, task: response.data };
    } catch (error) {
      return this._handleError(error, 'adicionar tarefa à sprint');
    }
  }

  /**
   * Atualiza uma tarefa da sprint
   * @param {number} taskId - ID da tarefa
   * @param {Object} taskData - Novos dados da tarefa
   * @returns {Promise<Object>} Tarefa atualizada
   */
  async updateSprintTask(taskId, taskData) {
    try {
      console.log('🌐 Fazendo requisição de atualização de tarefa para:', `/sprints/tasks/${taskId}`);
      console.log('📤 Dados enviados:', taskData);
      
      const response = await api.put(`/sprints/tasks/${taskId}`, taskData);
      
      if (!response.data) {
        return {
          success: false,
          error: 'Dados da tarefa atualizada não encontrados'
        };
      }
      
      console.log('✅ Tarefa da sprint atualizada com sucesso');
      return { success: true, task: response.data };
    } catch (error) {
      return this._handleError(error, 'atualizar tarefa da sprint');
    }
  }

  /**
   * Remove uma tarefa da sprint
   * @param {number} taskId - ID da tarefa
   * @returns {Promise<Object>} Resultado da remoção
   */
  async removeTaskFromSprint(taskId) {
    try {
      await api.delete(`/sprints/tasks/${taskId}`);
      return { success: true };
    } catch (error) {
      console.error('Erro ao remover tarefa da sprint:', error);
      return {
        success: false,
        error: error.message || 'Erro ao remover tarefa da sprint'
      };
    }
  }

  /**
   * Obtém as tarefas de uma sprint específica
   * @param {number} sprintId - ID da sprint
   * @returns {Promise<Object>} Lista de tarefas da sprint
   */
  async getSprintTasks(sprintId) {
    try {
      console.log('🌐 Fazendo requisição de tarefas da sprint para:', `/sprints/${sprintId}/tasks`);
      const response = await api.get(`/sprints/${sprintId}/tasks`);
      
      if (!response.data) {
        return {
          success: false,
          error: 'Dados de tarefas não encontrados'
        };
      }
      
      console.log('✅ Tarefas da sprint obtidas com sucesso:', response.data.length || 0, 'tarefas');
      return { success: true, tasks: response.data };
    } catch (error) {
      return this._handleError(error, 'obter tarefas da sprint');
    }
  }

  /**
   * Obtém minhas tarefas
   * @returns {Promise<Object>} Lista de minhas tarefas
   */
  async getMyTasks() {
    try {
      console.log('🌐 Fazendo requisição de minhas tarefas para:', '/sprints/my/tasks');
      const response = await api.get('/sprints/my/tasks');
      
      if (!response.data) {
        return {
          success: false,
          error: 'Dados de tarefas não encontrados'
        };
      }
      
      console.log('✅ Minhas tarefas obtidas com sucesso:', response.data.length || 0, 'tarefas');
      return { success: true, tasks: response.data };
    } catch (error) {
      return this._handleError(error, 'obter minhas tarefas');
    }
  }
}

export default new SprintService();
