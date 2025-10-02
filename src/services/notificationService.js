import api, { ApiError, NetworkError } from '../utils/api';

class NotificationService {
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
   * Cria uma nova notificação
   * @param {Object} notificationData - Dados da notificação
   * @returns {Promise<Object>} Notificação criada
   */
  async createNotification(notificationData) {
    try {
      console.log('🌐 Fazendo requisição de criação de notificação para:', '/notifications');
      console.log('📤 Dados enviados:', notificationData);
      
      const response = await api.post('/notifications', notificationData);
      
      if (!response.data) {
        return {
          success: false,
          error: 'Dados da notificação criada não encontrados'
        };
      }
      
      console.log('✅ Notificação criada com sucesso');
      return { success: true, notification: response.data };
    } catch (error) {
      return this._handleError(error, 'criar notificação');
    }
  }

  /**
   * Obtém notificações do usuário
   * @returns {Promise<Object>} Lista de notificações
   */
  async getNotifications() {
    try {
      console.log('🌐 Fazendo requisição de notificações para:', '/notifications');
      const response = await api.get('/notifications');
      
      if (!response.data) {
        return {
          success: false,
          error: 'Dados de notificações não encontrados'
        };
      }
      
      console.log('✅ Notificações obtidas com sucesso:', response.data.length || 0, 'notificações');
      return { success: true, notifications: response.data };
    } catch (error) {
      return this._handleError(error, 'obter notificações');
    }
  }

  /**
   * Obtém notificações não lidas
   * @returns {Promise<Object>} Lista de notificações não lidas
   */
  async getUnreadNotifications() {
    try {
      console.log('🌐 Fazendo requisição de notificações não lidas para:', '/notifications/unread');
      const response = await api.get('/notifications/unread');
      
      if (!response.data) {
        return {
          success: false,
          error: 'Dados de notificações não lidas não encontrados'
        };
      }
      
      console.log('✅ Notificações não lidas obtidas com sucesso:', response.data.length || 0, 'notificações');
      return { success: true, notifications: response.data };
    } catch (error) {
      return this._handleError(error, 'obter notificações não lidas');
    }
  }

  /**
   * Obtém estatísticas de notificações
   * @returns {Promise<Object>} Estatísticas de notificações
   */
  async getNotificationStats() {
    try {
      console.log('🌐 Fazendo requisição de estatísticas de notificações para:', '/notifications/stats');
      const response = await api.get('/notifications/stats');
      
      if (!response.data) {
        return {
          success: false,
          error: 'Dados de estatísticas não encontrados'
        };
      }
      
      console.log('✅ Estatísticas de notificações obtidas com sucesso');
      return { success: true, stats: response.data };
    } catch (error) {
      return this._handleError(error, 'obter estatísticas de notificações');
    }
  }

  /**
   * Obtém uma notificação específica por ID
   * @param {number} notificationId - ID da notificação
   * @returns {Promise<Object>} Dados da notificação
   */
  async getNotification(notificationId) {
    try {
      console.log('🌐 Fazendo requisição de notificação para:', `/notifications/${notificationId}`);
      const response = await api.get(`/notifications/${notificationId}`);
      
      if (!response.data) {
        return {
          success: false,
          error: 'Dados da notificação não encontrados'
        };
      }
      
      console.log('✅ Notificação obtida com sucesso');
      return { success: true, notification: response.data };
    } catch (error) {
      return this._handleError(error, 'obter notificação');
    }
  }

  /**
   * Marca notificações como lidas
   * @param {Object} markData - Dados para marcar como lidas
   * @returns {Promise<Object>} Resultado da marcação
   */
  async markAsRead(markData) {
    try {
      console.log('🌐 Fazendo requisição de marcação como lidas para:', '/notifications/mark-read');
      console.log('📤 Dados enviados:', markData);
      
      const response = await api.put('/notifications/mark-read', markData);
      
      if (!response.data) {
        return {
          success: false,
          error: 'Dados da marcação não encontrados'
        };
      }
      
      console.log('✅ Notificações marcadas como lidas com sucesso');
      return { success: true, data: response.data };
    } catch (error) {
      return this._handleError(error, 'marcar notificações como lidas');
    }
  }

  /**
   * Atualiza uma notificação
   * @param {number} notificationId - ID da notificação
   * @param {Object} notificationData - Novos dados da notificação
   * @returns {Promise<Object>} Notificação atualizada
   */
  async updateNotification(notificationId, notificationData) {
    try {
      console.log('🌐 Fazendo requisição de atualização de notificação para:', `/notifications/${notificationId}`);
      console.log('📤 Dados enviados:', notificationData);
      
      const response = await api.put(`/notifications/${notificationId}`, notificationData);
      
      if (!response.data) {
        return {
          success: false,
          error: 'Dados da notificação atualizada não encontrados'
        };
      }
      
      console.log('✅ Notificação atualizada com sucesso');
      return { success: true, notification: response.data };
    } catch (error) {
      return this._handleError(error, 'atualizar notificação');
    }
  }

  /**
   * Deleta uma notificação
   * @param {number} notificationId - ID da notificação
   * @returns {Promise<Object>} Resultado da exclusão
   */
  async deleteNotification(notificationId) {
    try {
      await api.delete(`/notifications/${notificationId}`);
      return { success: true };
    } catch (error) {
      console.error('Erro ao deletar notificação:', error);
      return {
        success: false,
        error: error.message || 'Erro ao deletar notificação'
      };
    }
  }
}

export default new NotificationService();
