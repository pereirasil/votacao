import api, { ApiError, NetworkError } from '../utils/api';

class CardService {
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
   * Obtém todos os cards de uma lista
   * @param {number} listId - ID da lista
   * @returns {Promise<Object>} Lista de cards
   */
  async getCards(listId) {
    try {
      console.log('🌐 Fazendo requisição de cards para:', `/lists/${listId}/cards`);
      const response = await api.get(`/lists/${listId}/cards`);
      
      if (!response.data) {
        return {
          success: false,
          error: 'Dados de cards não encontrados'
        };
      }
      
      console.log('✅ Cards obtidos com sucesso:', response.data.length || 0, 'cards');
      return { success: true, cards: response.data };
    } catch (error) {
      return this._handleError(error, 'obter cards');
    }
  }

  /**
   * Obtém um card específico por ID
   * @param {number} cardId - ID do card
   * @returns {Promise<Object>} Dados do card
   */
  async getCard(cardId) {
    try {
      console.log('🌐 Fazendo requisição de card para:', `/cards/${cardId}`);
      const response = await api.get(`/cards/${cardId}`);
      
      if (!response.data) {
        return {
          success: false,
          error: 'Dados do card não encontrados'
        };
      }
      
      console.log('✅ Card obtido com sucesso');
      return { success: true, card: response.data };
    } catch (error) {
      return this._handleError(error, 'obter card');
    }
  }

  /**
   * Cria um novo card
   * @param {number} listId - ID da lista
   * @param {Object} cardData - Dados do card
   * @returns {Promise<Object>} Card criado
   */
  async createCard(listId, cardData) {
    try {
      console.log('🌐 Fazendo requisição de criação de card para:', `/lists/${listId}/cards`);
      console.log('📤 Dados enviados:', cardData);
      
      const response = await api.post(`/lists/${listId}/cards`, cardData);
      
      if (!response.data) {
        return {
          success: false,
          error: 'Dados do card criado não encontrados'
        };
      }
      
      console.log('✅ Card criado com sucesso');
      return { success: true, card: response.data };
    } catch (error) {
      return this._handleError(error, 'criar card');
    }
  }

  /**
   * Atualiza um card existente
   * @param {number} cardId - ID do card
   * @param {Object} cardData - Novos dados do card
   * @returns {Promise<Object>} Card atualizado
   */
  async updateCard(cardId, cardData) {
    try {
      console.log('🌐 Fazendo requisição de atualização de card para:', `/cards/${cardId}`);
      console.log('📤 Dados enviados:', cardData);
      
      const response = await api.put(`/cards/${cardId}`, cardData);
      
      if (!response.data) {
        return {
          success: false,
          error: 'Dados do card atualizado não encontrados'
        };
      }
      
      console.log('✅ Card atualizado com sucesso');
      return { success: true, card: response.data };
    } catch (error) {
      return this._handleError(error, 'atualizar card');
    }
  }

  /**
   * Exclui um card
   * @param {number} cardId - ID do card
   * @returns {Promise<Object>} Resultado da exclusão
   */
  async deleteCard(cardId) {
    try {
      await api.delete(`/cards/${cardId}`);
      return { success: true };
    } catch (error) {
      console.error('Erro ao excluir card:', error);
      return {
        success: false,
        error: error.message || 'Erro ao excluir card'
      };
    }
  }

  /**
   * Move um card entre listas
   * @param {number} cardId - ID do card
   * @param {number} newListId - ID da nova lista
   * @param {number} newPosition - Nova posição na lista
   * @returns {Promise<Object>} Resultado da movimentação
   */
  async moveCard(cardId, newListId, newPosition) {
    try {
      const response = await api.put(`/cards/${cardId}/move`, {
        list_id: newListId,
        position: newPosition
      });
      return { success: true, card: response.data };
    } catch (error) {
      console.error('Erro ao mover card:', error);
      return {
        success: false,
        error: error.message || 'Erro ao mover card'
      };
    }
  }

  /**
   * Atribui um card a um usuário
   * @param {number} cardId - ID do card
   * @param {number} userId - ID do usuário
   * @returns {Promise<Object>} Resultado da atribuição
   */
  async assignCard(cardId, userId) {
    try {
      const response = await api.put(`/cards/${cardId}/assign`, {
        assigned_user_id: userId
      });
      return { success: true, card: response.data };
    } catch (error) {
      console.error('Erro ao atribuir card:', error);
      return {
        success: false,
        error: error.message || 'Erro ao atribuir card'
      };
    }
  }

  /**
   * Remove atribuição de um card
   * @param {number} cardId - ID do card
   * @returns {Promise<Object>} Resultado da remoção
   */
  async unassignCard(cardId) {
    try {
      const response = await api.put(`/cards/${cardId}/assign`, {
        assigned_user_id: null
      });
      return { success: true, card: response.data };
    } catch (error) {
      console.error('Erro ao remover atribuição:', error);
      return {
        success: false,
        error: error.message || 'Erro ao remover atribuição'
      };
    }
  }

  /**
   * Obtém as tarefas do usuário logado
   * @returns {Promise<Object>} Lista de tarefas
   */
  async getMyTasks() {
    try {
      const response = await api.get('/cards/my-tasks');
      return { success: true, tasks: response.data };
    } catch (error) {
      console.error('Erro ao obter tarefas:', error);
      return {
        success: false,
        error: error.message || 'Erro ao carregar tarefas'
      };
    }
  }

  /**
   * Obtém estatísticas do dashboard do usuário
   * @returns {Promise<Object>} Estatísticas do dashboard
   */
  async getDashboardStats() {
    try {
      console.log('📊 Fazendo requisição de estatísticas do dashboard...');
      const response = await api.get('/dashboard/stats');
      
      if (!response.data) {
        return {
          success: false,
          error: 'Dados de estatísticas não encontrados'
        };
      }
      
      console.log('✅ Estatísticas do dashboard obtidas com sucesso');
      return { success: true, stats: response.data };
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas do dashboard:', error);
      return {
        success: false,
        error: error.message || 'Erro ao carregar estatísticas'
      };
    }
  }

  /**
   * Obtém tarefas filtradas por status
   * @param {string} status - Status das tarefas (completed, in_progress, pending, my_tasks)
   * @returns {Promise<Object>} Lista de tarefas filtradas
   */
  async getTasksByStatus(status) {
    try {
      console.log(`🔍 Buscando tarefas com status: ${status}`);
      const response = await api.get(`/cards/filter`, {
        params: { status }
      });
      
      if (!response.data) {
        return {
          success: false,
          error: 'Dados de tarefas não encontrados'
        };
      }
      
      console.log(`✅ Tarefas ${status} obtidas com sucesso:`, response.data.length);
      return { success: true, tasks: response.data };
    } catch (error) {
      console.error(`❌ Erro ao obter tarefas ${status}:`, error);
      return {
        success: false,
        error: error.message || `Erro ao carregar tarefas ${status}`
      };
    }
  }

  /**
   * Obtém cards por filtros
   * @param {Object} filters - Filtros de busca
   * @returns {Promise<Object>} Lista de cards filtrados
   */
  async searchCards(filters) {
    try {
      const response = await api.get('/cards/search', { params: filters });
      return { success: true, cards: response.data };
    } catch (error) {
      console.error('Erro ao buscar cards:', error);
      return {
        success: false,
        error: error.message || 'Erro ao buscar cards'
      };
    }
  }

  /**
   * Adiciona um comentário a um card
   * @param {number} cardId - ID do card
   * @param {string} content - Conteúdo do comentário
   * @returns {Promise<Object>} Comentário criado
   */
  async addComment(cardId, content) {
    try {
      const response = await api.post(`/cards/${cardId}/comments`, {
        content
      });
      return { success: true, comment: response.data };
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      return {
        success: false,
        error: error.message || 'Erro ao adicionar comentário'
      };
    }
  }

  /**
   * Obtém comentários de um card
   * @param {number} cardId - ID do card
   * @returns {Promise<Object>} Lista de comentários
   */
  async getComments(cardId) {
    try {
      const response = await api.get(`/cards/${cardId}/comments`);
      return { success: true, comments: response.data };
    } catch (error) {
      console.error('Erro ao obter comentários:', error);
      return {
        success: false,
        error: error.message || 'Erro ao carregar comentários'
      };
    }
  }

  /**
   * Adiciona uma etiqueta a um card
   * @param {number} cardId - ID do card
   * @param {number} labelId - ID da etiqueta
   * @returns {Promise<Object>} Resultado da operação
   */
  async addLabel(cardId, labelId) {
    try {
      const response = await api.post(`/cards/${cardId}/labels`, {
        label_id: labelId
      });
      return { success: true, card: response.data };
    } catch (error) {
      console.error('Erro ao adicionar etiqueta:', error);
      return {
        success: false,
        error: error.message || 'Erro ao adicionar etiqueta'
      };
    }
  }

  /**
   * Remove uma etiqueta de um card
   * @param {number} cardId - ID do card
   * @param {number} labelId - ID da etiqueta
   * @returns {Promise<Object>} Resultado da operação
   */
  async removeLabel(cardId, labelId) {
    try {
      await api.delete(`/cards/${cardId}/labels/${labelId}`);
      return { success: true };
    } catch (error) {
      console.error('Erro ao remover etiqueta:', error);
      return {
        success: false,
        error: error.message || 'Erro ao remover etiqueta'
      };
    }
  }

  /**
   * Cria uma checklist em um card
   * @param {number} cardId - ID do card
   * @param {string} title - Título da checklist
   * @returns {Promise<Object>} Checklist criada
   */
  async createChecklist(cardId, title) {
    try {
      const response = await api.post(`/cards/${cardId}/checklists`, {
        title
      });
      return { success: true, checklist: response.data };
    } catch (error) {
      console.error('Erro ao criar checklist:', error);
      return {
        success: false,
        error: error.message || 'Erro ao criar checklist'
      };
    }
  }

  /**
   * Obtém checklists de um card
   * @param {number} cardId - ID do card
   * @returns {Promise<Object>} Lista de checklists
   */
  async getChecklists(cardId) {
    try {
      const response = await api.get(`/cards/${cardId}/checklists`);
      return { success: true, checklists: response.data };
    } catch (error) {
      console.error('Erro ao obter checklists:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar checklists'
      };
    }
  }
}

export default new CardService();
