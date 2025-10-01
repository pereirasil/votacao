import api, { ApiError, NetworkError } from '../utils/api';

class AuthService {
  /**
   * Realiza login do usuário
   * @param {string} email - Email do usuário
   * @param {string} password - Senha do usuário
   * @returns {Promise<Object>} Dados do usuário e token
   */
  async login(email, password) {
    try {
      console.log('🌐 Fazendo requisição de login para:', '/auth/login');
      console.log('📤 Dados enviados:', { email, password: '***' });
      
      const response = await api.post('/auth/login', {
        email,
        password
      });
      
      console.log('🌐 Resposta da API:', response);
      console.log('📊 Status da resposta:', response.status);
      console.log('📋 Dados recebidos:', response.data);
      
      // Verificar se a resposta tem a estrutura esperada
      if (!response.data) {
        console.error('❌ Resposta da API não contém dados');
        return {
          success: false,
          error: 'Resposta inválida da API'
        };
      }
      
      const { token, user } = response.data;
      
      console.log('🔑 Token recebido:', token ? 'presente' : 'ausente');
      console.log('👤 User recebido:', user);
      
      if (!token) {
        console.error('❌ Token não encontrado na resposta');
        return {
          success: false,
          error: 'Token não encontrado na resposta'
        };
      }
      
      if (!user) {
        console.error('❌ Dados do usuário não encontrados na resposta');
        return {
          success: false,
          error: 'Dados do usuário não encontrados'
        };
      }
      
      console.log('💾 Salvando dados no localStorage:', { token: token ? 'presente' : 'ausente', user });
      
      // Salvar token e dados do usuário no localStorage
      try {
        console.log('💾 Tentando salvar no localStorage...');
        console.log('💾 Token a ser salvo:', token.substring(0, 20) + '...');
        console.log('💾 User a ser salvo:', user);
        
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(user));
        
        console.log('💾 Dados salvos, verificando...');
        
        // Verificar se foi salvo corretamente
        const savedToken = localStorage.getItem('authToken');
        const savedUserData = localStorage.getItem('userData');
        
        console.log('✅ Verificação pós-salvamento:', {
          token: savedToken ? 'salvo' : 'não salvo',
          userData: savedUserData ? 'salvo' : 'não salvo',
          tokenLength: savedToken ? savedToken.length : 0,
          userDataLength: savedUserData ? savedUserData.length : 0
        });
        
        if (!savedToken || !savedUserData) {
          console.error('❌ Falha ao salvar dados no localStorage');
          console.error('❌ Token salvo:', savedToken);
          console.error('❌ UserData salvo:', savedUserData);
          return {
            success: false,
            error: 'Falha ao salvar dados no localStorage'
          };
        }
        
        console.log('✅ Dados salvos com sucesso no localStorage');
        
      } catch (storageError) {
        console.error('❌ Erro ao salvar no localStorage:', storageError);
        console.error('❌ Detalhes do erro:', {
          name: storageError.name,
          message: storageError.message,
          stack: storageError.stack
        });
        return {
          success: false,
          error: 'Erro ao salvar dados no localStorage'
        };
      }
      
      return { success: true, user, token };
    } catch (error) {
      console.error('❌ Erro no login:', error);
      
      // Tratamento específico de erros
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
        error: error.message || 'Erro inesperado ao fazer login',
        type: 'unknown'
      };
    }
  }

  /**
   * Registra um novo usuário
   * @param {Object} userData - Dados do usuário (name, email, password, role)
   * @returns {Promise<Object>} Resultado do cadastro
   */
  async register(userData) {
    try {
      console.log('🌐 Fazendo requisição de cadastro para:', '/auth/register');
      console.log('📤 Dados enviados:', { ...userData, password: '***' });
      
      const response = await api.post('/auth/register', userData);
      
      const { token, user } = response.data;
      
      if (!token || !user) {
        return {
          success: false,
          error: 'Dados de resposta inválidos'
        };
      }
      
      // Salvar token e dados do usuário no localStorage
      localStorage.setItem('authToken', token);
      localStorage.setItem('userData', JSON.stringify(user));
      
      console.log('✅ Usuário cadastrado com sucesso');
      return { success: true, user, token };
    } catch (error) {
      console.error('❌ Erro no cadastro:', error);
      
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
        error: error.message || 'Erro inesperado ao cadastrar usuário',
        type: 'unknown'
      };
    }
  }

  /**
   * Obtém o perfil do usuário logado
   * @returns {Promise<Object>} Dados do usuário
   */
  async getProfile() {
    try {
      console.log('🌐 Fazendo requisição de perfil para:', '/auth/profile');
      const response = await api.get('/auth/profile');
      
      if (!response.data) {
        return {
          success: false,
          error: 'Dados de perfil não encontrados'
        };
      }
      
      console.log('✅ Perfil obtido com sucesso');
      return { success: true, user: response.data };
    } catch (error) {
      console.error('❌ Erro ao obter perfil:', error);
      
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
        error: error.message || 'Erro inesperado ao obter perfil',
        type: 'unknown'
      };
    }
  }

  /**
   * Atualiza o perfil do usuário
   * @param {Object} userData - Novos dados do usuário
   * @returns {Promise<Object>} Resultado da atualização
   */
  async updateProfile(userData) {
    try {
      console.log('🌐 Fazendo requisição de atualização de perfil para:', '/auth/profile');
      console.log('📤 Dados enviados:', userData);
      
      const response = await api.put('/auth/profile', userData);
      
      if (!response.data) {
        return {
          success: false,
          error: 'Dados de resposta inválidos'
        };
      }
      
      // Atualizar dados no localStorage se a atualização foi bem-sucedida
      localStorage.setItem('userData', JSON.stringify(response.data));
      
      console.log('✅ Perfil atualizado com sucesso');
      return { success: true, user: response.data };
    } catch (error) {
      console.error('❌ Erro ao atualizar perfil:', error);
      
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
        error: error.message || 'Erro inesperado ao atualizar perfil',
        type: 'unknown'
      };
    }
  }

  /**
   * Realiza logout do usuário
   */
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('currentRoom');
  }

  /**
   * Verifica se o usuário está autenticado
   * @returns {boolean} True se autenticado
   */
  isAuthenticated() {
    console.log('🔍 Iniciando verificação de autenticação...');
    
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    console.log('🔍 Dados brutos do localStorage:', {
      token: token,
      userData: userData,
      tokenType: typeof token,
      userDataType: typeof userData
    });
    
    const isAuth = !!(token && userData);
    
    console.log('🔍 Verificando autenticação:', { 
      token: token ? 'presente' : 'ausente', 
      userData: userData ? 'presente' : 'ausente',
      isAuthenticated: isAuth
    });
    
    if (token) {
      console.log('🔑 Token encontrado:', token.substring(0, 20) + '...');
      console.log('🔑 Token completo:', token);
    } else {
      console.log('❌ Token não encontrado no localStorage');
      console.log('❌ localStorage keys:', Object.keys(localStorage));
    }
    
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        console.log('👤 Dados do usuário:', parsed);
      } catch (e) {
        console.log('❌ Erro ao parsear userData:', e);
        console.log('❌ userData raw:', userData);
      }
    } else {
      console.log('❌ userData não encontrado no localStorage');
      console.log('❌ localStorage keys:', Object.keys(localStorage));
    }
    
    console.log('🔍 Resultado final da autenticação:', isAuth);
    return isAuth;
  }

  /**
   * Obtém dados do usuário do localStorage
   * @returns {Object|null} Dados do usuário ou null
   */
  getCurrentUser() {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Obtém token de autenticação
   * @returns {string|null} Token ou null
   */
  getToken() {
    return localStorage.getItem('authToken');
  }
}

export default new AuthService();
