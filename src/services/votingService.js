import api, { ApiError, NetworkError } from '../utils/api';

class VotingService {
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
   * Cria uma nova sala de votação
   * @param {Object} roomData - Dados da sala
   * @returns {Promise<Object>} Sala criada
   */
  async createRoom(roomData) {
    try {
      console.log('🌐 Fazendo requisição de criação de sala de votação para:', '/voting/rooms');
      console.log('📤 Dados enviados:', roomData);
      
      const response = await api.post('/voting/rooms', roomData);
      
      if (!response.data) {
        return {
          success: false,
          error: 'Dados da sala criada não encontrados'
        };
      }
      
      console.log('✅ Sala de votação criada com sucesso');
      return { success: true, room: response.data };
    } catch (error) {
      return this._handleError(error, 'criar sala de votação');
    }
  }

  /**
   * Obtém salas ativas
   * @returns {Promise<Object>} Lista de salas ativas
   */
  async getActiveRooms() {
    try {
      console.log('🌐 Fazendo requisição de salas ativas para:', '/voting/rooms');
      const response = await api.get('/voting/rooms');
      
      if (!response.data) {
        return {
          success: false,
          error: 'Dados de salas ativas não encontrados'
        };
      }
      
      console.log('✅ Salas ativas obtidas com sucesso:', response.data.length || 0, 'salas');
      return { success: true, rooms: response.data };
    } catch (error) {
      return this._handleError(error, 'obter salas ativas');
    }
  }

  /**
   * Obtém uma sala específica por ID
   * @param {number} roomId - ID da sala
   * @returns {Promise<Object>} Dados da sala
   */
  async getRoom(roomId) {
    try {
      console.log('🌐 Fazendo requisição de sala para:', `/voting/rooms/${roomId}`);
      const response = await api.get(`/voting/rooms/${roomId}`);
      
      if (!response.data) {
        return {
          success: false,
          error: 'Dados da sala não encontrados'
        };
      }
      
      console.log('✅ Sala obtida com sucesso');
      return { success: true, room: response.data };
    } catch (error) {
      return this._handleError(error, 'obter sala');
    }
  }

  /**
   * Desativa uma sala de votação
   * @param {number} roomId - ID da sala
   * @returns {Promise<Object>} Resultado da desativação
   */
  async deactivateRoom(roomId) {
    try {
      await api.delete(`/voting/rooms/${roomId}`);
      return { success: true };
    } catch (error) {
      console.error('Erro ao desativar sala:', error);
      return {
        success: false,
        error: error.message || 'Erro ao desativar sala'
      };
    }
  }

  /**
   * Obtém histórico do chat de uma sala
   * @param {number} roomId - ID da sala
   * @returns {Promise<Object>} Histórico do chat
   */
  async getChatHistory(roomId) {
    try {
      console.log('🌐 Fazendo requisição de histórico do chat para:', `/voting/rooms/${roomId}/history`);
      const response = await api.get(`/voting/rooms/${roomId}/history`);
      
      if (!response.data) {
        return {
          success: false,
          error: 'Dados do histórico do chat não encontrados'
        };
      }
      
      console.log('✅ Histórico do chat obtido com sucesso:', response.data.length || 0, 'mensagens');
      return { success: true, history: response.data };
    } catch (error) {
      return this._handleError(error, 'obter histórico do chat');
    }
  }
}

export default new VotingService();
