import api, { ApiError, NetworkError } from '../utils/api';

class BoardService {
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
   * Obtém todos os quadros do usuário
   * @returns {Promise<Object>} Lista de quadros
   */
  async getBoards() {
    try {
      console.log('🌐 Fazendo requisição de quadros para:', '/boards');
      const response = await api.get('/boards');
      
      if (!response.data) {
        return {
          success: false,
          error: 'Dados de quadros não encontrados'
        };
      }
      
      console.log('✅ Quadros obtidos com sucesso:', response.data.length || 0, 'quadros');
      return { success: true, boards: response.data };
    } catch (error) {
      return this._handleError(error, 'obter quadros');
    }
  }

  /**
   * Obtém um quadro específico por ID
   * @param {number} boardId - ID do quadro
   * @returns {Promise<Object>} Dados do quadro
   */
  async getBoard(boardId) {
    try {
      console.log('🌐 Fazendo requisição de quadro para:', `/boards/${boardId}`);
      const response = await api.get(`/boards/${boardId}`);
      
      if (!response.data) {
        return {
          success: false,
          error: 'Dados do quadro não encontrados'
        };
      }
      
      console.log('✅ Quadro obtido com sucesso');
      return { success: true, board: response.data };
    } catch (error) {
      return this._handleError(error, 'obter quadro');
    }
  }

  /**
   * Cria um novo quadro
   * @param {Object} boardData - Dados do quadro
   * @returns {Promise<Object>} Quadro criado
   */
  async createBoard(boardData) {
    try {
      console.log('🌐 Fazendo requisição de criação de quadro para:', '/boards');
      console.log('📤 Dados enviados:', boardData);
      
      const response = await api.post('/boards', boardData);
      
      if (!response.data) {
        return {
          success: false,
          error: 'Dados do quadro criado não encontrados'
        };
      }
      
      console.log('✅ Quadro criado com sucesso');
      return { success: true, board: response.data };
    } catch (error) {
      return this._handleError(error, 'criar quadro');
    }
  }

  /**
   * Atualiza um quadro existente
   * @param {number} boardId - ID do quadro
   * @param {Object} boardData - Novos dados do quadro
   * @returns {Promise<Object>} Quadro atualizado
   */
  async updateBoard(boardId, boardData) {
    try {
      console.log('🌐 Fazendo requisição de atualização de quadro para:', `/boards/${boardId}`);
      console.log('📤 Dados enviados:', boardData);
      
      const response = await api.put(`/boards/${boardId}`, boardData);
      
      if (!response.data) {
        return {
          success: false,
          error: 'Dados do quadro atualizado não encontrados'
        };
      }
      
      console.log('✅ Quadro atualizado com sucesso');
      return { success: true, board: response.data };
    } catch (error) {
      return this._handleError(error, 'atualizar quadro');
    }
  }

  /**
   * Exclui um quadro
   * @param {number} boardId - ID do quadro
   * @returns {Promise<Object>} Resultado da exclusão
   */
  async deleteBoard(boardId) {
    try {
      await api.delete(`/boards/${boardId}`);
      return { success: true };
    } catch (error) {
      console.error('Erro ao excluir quadro:', error);
      return {
        success: false,
        error: error.message || 'Erro ao excluir quadro'
      };
    }
  }

  /**
   * Obtém as listas de um quadro
   * @param {number} boardId - ID do quadro
   * @returns {Promise<Object>} Lista de listas
   */
  async getBoardLists(boardId) {
    try {
      const response = await api.get(`/boards/${boardId}/lists`);
      return { success: true, lists: response.data };
    } catch (error) {
      console.error('Erro ao obter listas:', error);
      return {
        success: false,
        error: error.message || 'Erro ao carregar listas'
      };
    }
  }

  /**
   * Cria uma nova lista em um quadro
   * @param {number} boardId - ID do quadro
   * @param {Object} listData - Dados da lista
   * @returns {Promise<Object>} Lista criada
   */
  async createList(boardId, listData) {
    try {
      const response = await api.post(`/boards/${boardId}/lists`, listData);
      return { success: true, list: response.data };
    } catch (error) {
      console.error('Erro ao criar lista:', error);
      return {
        success: false,
        error: error.message || 'Erro ao criar lista'
      };
    }
  }

  /**
   * Atualiza uma lista
   * @param {number} listId - ID da lista
   * @param {Object} listData - Novos dados da lista
   * @returns {Promise<Object>} Lista atualizada
   */
  async updateList(listId, listData) {
    try {
      const response = await api.put(`/lists/${listId}`, listData);
      return { success: true, list: response.data };
    } catch (error) {
      console.error('Erro ao atualizar lista:', error);
      return {
        success: false,
        error: error.message || 'Erro ao atualizar lista'
      };
    }
  }

  /**
   * Exclui uma lista
   * @param {number} listId - ID da lista
   * @returns {Promise<Object>} Resultado da exclusão
   */
  async deleteList(listId) {
    try {
      await api.delete(`/lists/${listId}`);
      return { success: true };
    } catch (error) {
      console.error('Erro ao excluir lista:', error);
      return {
        success: false,
        error: error.message || 'Erro ao excluir lista'
      };
    }
  }

  /**
   * Obtém os cards de uma lista
   * @param {number} listId - ID da lista
   * @returns {Promise<Object>} Lista de cards
   */
  async getListCards(listId) {
    try {
      const response = await api.get(`/lists/${listId}/cards`);
      return { success: true, cards: response.data };
    } catch (error) {
      console.error('Erro ao obter cards:', error);
      return {
        success: false,
        error: error.message || 'Erro ao carregar cards'
      };
    }
  }

  /**
   * Cria um novo card em uma lista
   * @param {number} listId - ID da lista
   * @param {Object} cardData - Dados do card
   * @returns {Promise<Object>} Card criado
   */
  async createCard(listId, cardData) {
    try {
      const response = await api.post(`/lists/${listId}/cards`, cardData);
      return { success: true, card: response.data };
    } catch (error) {
      console.error('Erro ao criar card:', error);
      return {
        success: false,
        error: error.message || 'Erro ao criar card'
      };
    }
  }

  /**
   * Atualiza um card
   * @param {number} cardId - ID do card
   * @param {Object} cardData - Novos dados do card
   * @returns {Promise<Object>} Card atualizado
   */
  async updateCard(cardId, cardData) {
    try {
      const response = await api.put(`/cards/${cardId}`, cardData);
      return { success: true, card: response.data };
    } catch (error) {
      console.error('Erro ao atualizar card:', error);
      return {
        success: false,
        error: error.message || 'Erro ao atualizar card'
      };
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
   * Obtém os quadros de um usuário específico
   * @param {number} userId - ID do usuário
   * @returns {Promise<Object>} Lista de quadros do usuário
   */
  async getUserBoards(userId) {
    try {
      const response = await api.get(`/boards/user/${userId}`);
      return { success: true, boards: response.data };
    } catch (error) {
      console.error('Erro ao obter quadros do usuário:', error);
      return {
        success: false,
        error: error.message || 'Erro ao carregar quadros do usuário'
      };
    }
  }

  /**
   * Obtém as tarefas do usuário
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
}

export default new BoardService();
