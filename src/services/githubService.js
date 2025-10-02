import api, { ApiError, NetworkError } from '../utils/api';

class GitHubService {
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
   * Gera URL de autorização do GitHub
   * @returns {Promise<Object>} URL de autorização
   */
  async getAuthUrl() {
    try {
      console.log('🌐 Fazendo requisição de URL de autorização GitHub para:', '/github/auth-url');
      const response = await api.post('/github/auth-url');
      
      if (!response.data) {
        return {
          success: false,
          error: 'URL de autorização não encontrada'
        };
      }
      
      console.log('✅ URL de autorização GitHub obtida com sucesso');
      return { success: true, authUrl: response.data.authUrl };
    } catch (error) {
      return this._handleError(error, 'obter URL de autorização GitHub');
    }
  }

  /**
   * Processa callback do GitHub OAuth (POST)
   * @param {Object} callbackData - Dados do callback
   * @returns {Promise<Object>} Resultado do callback
   */
  async processCallback(callbackData) {
    try {
      console.log('🌐 Fazendo requisição de callback GitHub para:', '/github/callback');
      console.log('📤 Dados enviados:', callbackData);
      
      const response = await api.post('/github/callback', callbackData);
      
      if (!response.data) {
        return {
          success: false,
          error: 'Dados do callback não encontrados'
        };
      }
      
      console.log('✅ Callback GitHub processado com sucesso');
      return { success: true, data: response.data };
    } catch (error) {
      return this._handleError(error, 'processar callback GitHub');
    }
  }

  /**
   * Obtém informações do usuário GitHub
   * @returns {Promise<Object>} Dados do usuário GitHub
   */
  async getUserInfo() {
    try {
      console.log('🌐 Fazendo requisição de informações do usuário GitHub para:', '/github/user');
      const response = await api.get('/github/user');
      
      if (!response.data) {
        return {
          success: false,
          error: 'Dados do usuário GitHub não encontrados'
        };
      }
      
      console.log('✅ Informações do usuário GitHub obtidas com sucesso');
      return { success: true, user: response.data };
    } catch (error) {
      return this._handleError(error, 'obter informações do usuário GitHub');
    }
  }

  /**
   * Obtém repositórios do usuário
   * @returns {Promise<Object>} Lista de repositórios
   */
  async getRepositories() {
    try {
      console.log('🌐 Fazendo requisição de repositórios GitHub para:', '/github/repositories');
      const response = await api.get('/github/repositories');
      
      if (!response.data) {
        return {
          success: false,
          error: 'Dados de repositórios não encontrados'
        };
      }
      
      console.log('✅ Repositórios GitHub obtidos com sucesso:', response.data.length || 0, 'repositórios');
      return { success: true, repositories: response.data };
    } catch (error) {
      return this._handleError(error, 'obter repositórios GitHub');
    }
  }

  /**
   * Cria webhook para repositório
   * @param {Object} webhookData - Dados do webhook
   * @returns {Promise<Object>} Webhook criado
   */
  async createWebhook(webhookData) {
    try {
      console.log('🌐 Fazendo requisição de criação de webhook para:', '/github/webhook');
      console.log('📤 Dados enviados:', webhookData);
      
      const response = await api.post('/github/webhook', webhookData);
      
      if (!response.data) {
        return {
          success: false,
          error: 'Dados do webhook criado não encontrados'
        };
      }
      
      console.log('✅ Webhook GitHub criado com sucesso');
      return { success: true, webhook: response.data };
    } catch (error) {
      return this._handleError(error, 'criar webhook GitHub');
    }
  }

  /**
   * Obtém informações de debug do GitHub OAuth
   * @returns {Promise<Object>} Dados de debug
   */
  async getDebugInfo() {
    try {
      console.log('🌐 Fazendo requisição de debug GitHub para:', '/github/debug');
      const response = await api.get('/github/debug');
      
      if (!response.data) {
        return {
          success: false,
          error: 'Dados de debug não encontrados'
        };
      }
      
      console.log('✅ Informações de debug GitHub obtidas com sucesso');
      return { success: true, debug: response.data };
    } catch (error) {
      return this._handleError(error, 'obter informações de debug GitHub');
    }
  }

  /**
   * Verifica variáveis de ambiente do GitHub
   * @returns {Promise<Object>} Status das variáveis de ambiente
   */
  async checkEnvironmentVariables() {
    try {
      console.log('🌐 Fazendo requisição de verificação de variáveis de ambiente para:', '/github/env-check');
      const response = await api.get('/github/env-check');
      
      if (!response.data) {
        return {
          success: false,
          error: 'Dados de verificação de ambiente não encontrados'
        };
      }
      
      console.log('✅ Variáveis de ambiente verificadas com sucesso');
      return { success: true, envCheck: response.data };
    } catch (error) {
      return this._handleError(error, 'verificar variáveis de ambiente GitHub');
    }
  }

  /**
   * Verifica status da conexão GitHub
   * @returns {Promise<Object>} Status da conexão
   */
  async getConnectionStatus() {
    try {
      console.log('🌐 Fazendo requisição de status da conexão GitHub para:', '/github/status');
      const response = await api.get('/github/status');
      
      if (!response.data) {
        return {
          success: false,
          error: 'Dados de status da conexão não encontrados'
        };
      }
      
      console.log('✅ Status da conexão GitHub obtido com sucesso');
      return { success: true, status: response.data };
    } catch (error) {
      return this._handleError(error, 'obter status da conexão GitHub');
    }
  }

  /**
   * Valida token de acesso GitHub
   * @param {string} token - Token de acesso
   * @returns {Promise<Object>} Resultado da validação
   */
  async validateToken(token) {
    try {
      console.log('🌐 Fazendo requisição de validação de token GitHub para:', '/github/validate-token');
      console.log('📤 Token enviado:', token ? 'presente' : 'ausente');
      
      const response = await api.post('/github/validate-token', { token });
      
      if (!response.data) {
        return {
          success: false,
          error: 'Dados de validação não encontrados'
        };
      }
      
      console.log('✅ Token GitHub validado com sucesso');
      return { success: true, validation: response.data };
    } catch (error) {
      return this._handleError(error, 'validar token GitHub');
    }
  }

  /**
   * Desconecta integração GitHub
   * @returns {Promise<Object>} Resultado da desconexão
   */
  async disconnect() {
    try {
      console.log('🌐 Fazendo requisição de desconexão GitHub para:', '/github/disconnect');
      const response = await api.delete('/github/disconnect');
      
      console.log('✅ Integração GitHub desconectada com sucesso');
      return { success: true, data: response.data };
    } catch (error) {
      return this._handleError(error, 'desconectar integração GitHub');
    }
  }
}

export default new GitHubService();
