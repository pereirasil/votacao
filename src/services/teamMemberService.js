import api, { ApiError, NetworkError } from '../utils/api';

class TeamMemberService {
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
   * Obtém membros de um board
   * @param {number} boardId - ID do board
   * @returns {Promise<Object>} Lista de membros
   */
  async getBoardMembers(boardId) {
    try {
      console.log('🌐 Fazendo requisição de membros do board para:', `/team-members/board/${boardId}`);
      const response = await api.get(`/team-members/board/${boardId}`);
      
      if (!response.data) {
        return {
          success: false,
          error: 'Dados de membros não encontrados'
        };
      }
      
      console.log('✅ Membros do board obtidos com sucesso:', response.data.length || 0, 'membros');
      return { success: true, members: response.data };
    } catch (error) {
      return this._handleError(error, 'obter membros do board');
    }
  }

  /**
   * Adiciona um membro ao board
   * @param {Object} memberData - Dados do membro
   * @returns {Promise<Object>} Membro adicionado
   */
  async addMember(memberData) {
    try {
      console.log('🌐 Fazendo requisição de adição de membro para:', '/team-members');
      console.log('📤 Dados enviados:', memberData);
      
      const response = await api.post('/team-members', memberData);
      
      if (!response.data) {
        return {
          success: false,
          error: 'Dados do membro adicionado não encontrados'
        };
      }
      
      console.log('✅ Membro adicionado com sucesso');
      return { success: true, member: response.data };
    } catch (error) {
      return this._handleError(error, 'adicionar membro');
    }
  }

  /**
   * Atualiza função de um membro
   * @param {number} memberId - ID do membro
   * @param {Object} memberData - Novos dados do membro
   * @returns {Promise<Object>} Membro atualizado
   */
  async updateMember(memberId, memberData) {
    try {
      console.log('🌐 Fazendo requisição de atualização de membro para:', `/team-members/${memberId}`);
      console.log('📤 Dados enviados:', memberData);
      
      const response = await api.put(`/team-members/${memberId}`, memberData);
      
      if (!response.data) {
        return {
          success: false,
          error: 'Dados do membro atualizado não encontrados'
        };
      }
      
      console.log('✅ Membro atualizado com sucesso');
      return { success: true, member: response.data };
    } catch (error) {
      return this._handleError(error, 'atualizar membro');
    }
  }

  /**
   * Remove um membro do board
   * @param {number} memberId - ID do membro
   * @returns {Promise<Object>} Resultado da remoção
   */
  async removeMember(memberId) {
    try {
      await api.delete(`/team-members/${memberId}`);
      return { success: true };
    } catch (error) {
      console.error('Erro ao remover membro:', error);
      return {
        success: false,
        error: error.message || 'Erro ao remover membro'
      };
    }
  }

  /**
   * Convida um membro para o board
   * @param {Object} inviteData - Dados do convite
   * @returns {Promise<Object>} Convite criado
   */
  async inviteMember(inviteData) {
    try {
      console.log('🌐 Fazendo requisição de convite de membro para:', '/team-members/invite');
      console.log('📤 Dados enviados:', inviteData);
      
      const response = await api.post('/team-members/invite', inviteData);
      
      if (!response.data) {
        return {
          success: false,
          error: 'Dados do convite não encontrados'
        };
      }
      
      console.log('✅ Convite enviado com sucesso');
      return { success: true, invite: response.data };
    } catch (error) {
      return this._handleError(error, 'convidar membro');
    }
  }

  /**
   * Obtém convites de um board
   * @param {number} boardId - ID do board
   * @returns {Promise<Object>} Lista de convites
   */
  async getBoardInvites(boardId) {
    try {
      console.log('🌐 Fazendo requisição de convites do board para:', `/team-members/invites/board/${boardId}`);
      const response = await api.get(`/team-members/invites/board/${boardId}`);
      
      if (!response.data) {
        return {
          success: false,
          error: 'Dados de convites não encontrados'
        };
      }
      
      console.log('✅ Convites do board obtidos com sucesso:', response.data.length || 0, 'convites');
      return { success: true, invites: response.data };
    } catch (error) {
      return this._handleError(error, 'obter convites do board');
    }
  }

  /**
   * Aceita um convite
   * @param {Object} inviteData - Dados do convite
   * @returns {Promise<Object>} Resultado da aceitação
   */
  async acceptInvite(inviteData) {
    try {
      console.log('🌐 Fazendo requisição de aceitação de convite para:', '/team-members/accept-invite');
      console.log('📤 Dados enviados:', inviteData);
      
      const response = await api.post('/team-members/accept-invite', inviteData);
      
      if (!response.data) {
        return {
          success: false,
          error: 'Dados da aceitação não encontrados'
        };
      }
      
      console.log('✅ Convite aceito com sucesso');
      return { success: true, member: response.data };
    } catch (error) {
      return this._handleError(error, 'aceitar convite');
    }
  }

  /**
   * Atualiza status de um convite
   * @param {number} inviteId - ID do convite
   * @param {Object} inviteData - Novos dados do convite
   * @returns {Promise<Object>} Convite atualizado
   */
  async updateInvite(inviteId, inviteData) {
    try {
      console.log('🌐 Fazendo requisição de atualização de convite para:', `/team-members/invites/${inviteId}`);
      console.log('📤 Dados enviados:', inviteData);
      
      const response = await api.put(`/team-members/invites/${inviteId}`, inviteData);
      
      if (!response.data) {
        return {
          success: false,
          error: 'Dados do convite atualizado não encontrados'
        };
      }
      
      console.log('✅ Convite atualizado com sucesso');
      return { success: true, invite: response.data };
    } catch (error) {
      return this._handleError(error, 'atualizar convite');
    }
  }

  /**
   * Deleta um convite
   * @param {number} inviteId - ID do convite
   * @returns {Promise<Object>} Resultado da exclusão
   */
  async deleteInvite(inviteId) {
    try {
      await api.delete(`/team-members/invites/${inviteId}`);
      return { success: true };
    } catch (error) {
      console.error('Erro ao deletar convite:', error);
      return {
        success: false,
        error: error.message || 'Erro ao deletar convite'
      };
    }
  }

  /**
   * Obtém membros da equipe
   * @returns {Promise<Object>} Lista de membros da equipe
   */
  async getTeamMembers() {
    try {
      console.log('🌐 Fazendo requisição de membros da equipe para:', '/team/members');
      const response = await api.get('/team/members');
      
      if (!response.data) {
        return {
          success: false,
          error: 'Dados de membros da equipe não encontrados'
        };
      }
      
      console.log('✅ Membros da equipe obtidos com sucesso:', response.data.length || 0, 'membros');
      return { success: true, members: response.data };
    } catch (error) {
      return this._handleError(error, 'obter membros da equipe');
    }
  }

  /**
   * Convida um membro para a equipe
   * @param {Object} inviteData - Dados do convite
   * @returns {Promise<Object>} Convite criado
   */
  async inviteTeamMember(inviteData) {
    try {
      console.log('🌐 Fazendo requisição de convite para equipe para:', '/team/invite');
      console.log('📤 Dados enviados:', inviteData);
      
      const response = await api.post('/team/invite', inviteData);
      
      if (!response.data) {
        return {
          success: false,
          error: 'Dados do convite não encontrados'
        };
      }
      
      console.log('✅ Convite para equipe enviado com sucesso');
      return { success: true, invite: response.data };
    } catch (error) {
      return this._handleError(error, 'convidar membro para equipe');
    }
  }

  /**
   * Atualiza um membro da equipe
   * @param {number} memberId - ID do membro
   * @param {Object} memberData - Novos dados do membro
   * @returns {Promise<Object>} Membro atualizado
   */
  async updateTeamMember(memberId, memberData) {
    try {
      console.log('🌐 Fazendo requisição de atualização de membro da equipe para:', `/team/members/${memberId}`);
      console.log('📤 Dados enviados:', memberData);
      
      const response = await api.put(`/team/members/${memberId}`, memberData);
      
      if (!response.data) {
        return {
          success: false,
          error: 'Dados do membro atualizado não encontrados'
        };
      }
      
      console.log('✅ Membro da equipe atualizado com sucesso');
      return { success: true, member: response.data };
    } catch (error) {
      return this._handleError(error, 'atualizar membro da equipe');
    }
  }

  /**
   * Remove um membro da equipe
   * @param {number} memberId - ID do membro
   * @returns {Promise<Object>} Resultado da remoção
   */
  async removeTeamMember(memberId) {
    try {
      await api.delete(`/team/members/${memberId}`);
      return { success: true };
    } catch (error) {
      console.error('Erro ao remover membro da equipe:', error);
      return {
        success: false,
        error: error.message || 'Erro ao remover membro da equipe'
      };
    }
  }
}

export default new TeamMemberService();
