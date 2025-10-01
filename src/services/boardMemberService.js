import api, { ApiError, NetworkError } from '../utils/api';

class BoardMemberService {
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
   * Obtém todos os membros de um board
   * @param {number} boardId - ID do board
   * @returns {Promise<Object>} Lista de membros
   */
  async getBoardMembers(boardId) {
    try {
      console.log('👥 Fazendo requisição de membros do board para:', `/boards/${boardId}/members`);
      const response = await api.get(`/boards/${boardId}/members`);
      
      if (!response.data) {
        return {
          success: false,
          error: 'Dados de membros não encontrados'
        };
      }
      
      console.log('✅ Membros obtidos com sucesso:', response.data.length || 0, 'membros');
      return { success: true, members: response.data };
    } catch (error) {
      return this._handleError(error, 'obter membros do board');
    }
  }

  /**
   * Adiciona um membro ao board
   * @param {number} boardId - ID do board
   * @param {string} email - Email do usuário
   * @param {string} role - Role do membro (admin, member, guest)
   * @returns {Promise<Object>} Resultado da operação
   */
  async addBoardMember(boardId, email, role = 'member') {
    try {
      console.log('➕ Fazendo requisição de adição de membro para:', `/boards/${boardId}/members`);
      console.log('📤 Dados enviados:', { email, role });
      
      const response = await api.post(`/boards/${boardId}/members`, {
        email,
        role
      });
      
      if (!response.data) {
        return {
          success: false,
          error: 'Dados de resposta inválidos'
        };
      }
      
      console.log('✅ Membro adicionado com sucesso');
      return { success: true, member: response.data };
    } catch (error) {
      return this._handleError(error, 'adicionar membro ao board');
    }
  }

  /**
   * Atualiza o role de um membro do board
   * @param {number} boardId - ID do board
   * @param {number} memberId - ID do membro
   * @param {string} role - Novo role (admin, member, guest)
   * @returns {Promise<Object>} Resultado da operação
   */
  async updateMemberRole(boardId, memberId, role) {
    try {
      console.log('🔄 Fazendo requisição de atualização de role para:', `/boards/${boardId}/members/${memberId}`);
      console.log('📤 Dados enviados:', { role });
      
      const response = await api.put(`/boards/${boardId}/members/${memberId}`, {
        role
      });
      
      if (!response.data) {
        return {
          success: false,
          error: 'Dados de resposta inválidos'
        };
      }
      
      console.log('✅ Role atualizado com sucesso');
      return { success: true, member: response.data };
    } catch (error) {
      return this._handleError(error, 'atualizar role do membro');
    }
  }

  /**
   * Remove um membro do board
   * @param {number} boardId - ID do board
   * @param {number} memberId - ID do membro
   * @returns {Promise<Object>} Resultado da operação
   */
  async removeBoardMember(boardId, memberId) {
    try {
      console.log('🗑️ Fazendo requisição de remoção de membro para:', `/boards/${boardId}/members/${memberId}`);
      
      await api.delete(`/boards/${boardId}/members/${memberId}`);
      
      console.log('✅ Membro removido com sucesso');
      return { success: true };
    } catch (error) {
      return this._handleError(error, 'remover membro do board');
    }
  }

  /**
   * Convidar um usuário para o board
   * @param {number} boardId - ID do board
   * @param {string} email - Email do usuário
   * @param {string} role - Role do convite (admin, member, guest)
   * @returns {Promise<Object>} Resultado da operação
   */
  async inviteUser(boardId, email, role = 'member') {
    try {
      console.log('📧 Fazendo requisição de convite para:', `/boards/${boardId}/invite`);
      console.log('📤 Dados enviados:', { email, role });
      
      const response = await api.post(`/boards/${boardId}/invite`, {
        email,
        role
      });
      
      if (!response.data) {
        return {
          success: false,
          error: 'Dados de resposta inválidos'
        };
      }
      
      console.log('✅ Convite enviado com sucesso');
      return { success: true, invite: response.data };
    } catch (error) {
      return this._handleError(error, 'enviar convite');
    }
  }

  /**
   * Aceitar convite para o board
   * @param {string} inviteToken - Token do convite
   * @returns {Promise<Object>} Resultado da operação
   */
  async acceptInvite(inviteToken) {
    try {
      console.log('✅ Fazendo requisição de aceite de convite para:', `/invites/${inviteToken}/accept`);
      
      const response = await api.post(`/invites/${inviteToken}/accept`);
      
      if (!response.data) {
        return {
          success: false,
          error: 'Dados de resposta inválidos'
        };
      }
      
      console.log('✅ Convite aceito com sucesso');
      return { success: true, board: response.data };
    } catch (error) {
      return this._handleError(error, 'aceitar convite');
    }
  }

  /**
   * Verificar se o usuário atual é admin do board
   * @param {number} boardId - ID do board
   * @returns {Promise<Object>} Resultado da verificação
   */
  async checkAdminPermission(boardId) {
    try {
      console.log('🔐 Verificando permissão de admin para board:', boardId);
      
      const response = await api.get(`/boards/${boardId}/permissions`);
      
      if (!response.data) {
        return {
          success: false,
          error: 'Dados de permissão não encontrados'
        };
      }
      
      console.log('✅ Permissões verificadas:', response.data);
      return { success: true, permissions: response.data };
    } catch (error) {
      return this._handleError(error, 'verificar permissões');
    }
  }

  /**
   * Obter estatísticas de membros do board
   * @param {number} boardId - ID do board
   * @returns {Promise<Object>} Estatísticas dos membros
   */
  async getMemberStats(boardId) {
    try {
      console.log('📊 Fazendo requisição de estatísticas de membros para:', `/boards/${boardId}/member-stats`);
      
      const response = await api.get(`/boards/${boardId}/member-stats`);
      
      if (!response.data) {
        return {
          success: false,
          error: 'Dados de estatísticas não encontrados'
        };
      }
      
      console.log('✅ Estatísticas obtidas com sucesso');
      return { success: true, stats: response.data };
    } catch (error) {
      return this._handleError(error, 'obter estatísticas de membros');
    }
  }
}

export default new BoardMemberService();
