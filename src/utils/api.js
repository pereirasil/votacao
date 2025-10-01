// Configurações do ambiente
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || (IS_PRODUCTION ? 'https://api.timeboard.site' : 'http://localhost:3003');

/**
 * Classe para tratamento de erros da API
 */
class ApiError extends Error {
  constructor(message, status, statusText, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }
}

/**
 * Classe para tratamento de erros de rede
 */
class NetworkError extends Error {
  constructor(message, originalError) {
    super(message);
    this.name = 'NetworkError';
    this.originalError = originalError;
  }
}

/**
 * Função para fazer requisições HTTP usando fetch com tratamento robusto de erros
 * @param {string} url - URL da requisição
 * @param {Object} options - Opções da requisição
 * @returns {Promise<Object>} Resposta da API
 */
const makeRequest = async (url, options = {}) => {
  const token = localStorage.getItem('authToken');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    console.log('🌐 Fazendo requisição para:', `${BACKEND_URL}${url}`, {
      method: config.method || 'GET',
      headers: config.headers,
      body: config.body ? 'Dados enviados' : 'Sem dados'
    });
    
    const response = await fetch(`${BACKEND_URL}${url}`, config);
    
    console.log('🌐 Resposta recebida:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    // Tratamento de token expirado ou inválido
    if (response.status === 401) {
      console.warn('🔐 Token expirado ou inválido, limpando dados de autenticação');
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('userName');
      localStorage.removeItem('userRole');
      localStorage.removeItem('currentRoom');
      
      // Redirecionar para login apenas se não estiver já na página de login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      
      throw new ApiError('Token expirado ou inválido', 401, 'Unauthorized');
    }

    // Tratamento de erros de servidor
    if (!response.ok) {
      let errorData = {};
      let errorMessage = `Erro ${response.status}: ${response.statusText}`;
      
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } else {
          const textData = await response.text();
          errorMessage = textData || errorMessage;
        }
      } catch (parseError) {
        console.warn('⚠️ Erro ao parsear resposta de erro:', parseError);
      }
      
      console.error('❌ Erro na resposta:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
        errorMessage
      });
      
      throw new ApiError(errorMessage, response.status, response.statusText, errorData);
    }

    // Parse da resposta de sucesso
    let data = {};
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const textData = await response.text();
        data = { message: textData };
      }
    } catch (parseError) {
      console.warn('⚠️ Erro ao parsear resposta de sucesso:', parseError);
      data = { message: 'Resposta recebida com sucesso' };
    }
    
    console.log('✅ Dados recebidos com sucesso:', {
      hasData: !!data,
      dataKeys: Object.keys(data),
      status: response.status
    });
    
    return {
      data,
      status: response.status,
      statusText: response.statusText,
    };
    
  } catch (error) {
    // Tratamento de erros de rede
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('🌐 Erro de rede:', error);
      throw new NetworkError('Erro de conexão com o servidor. Verifique sua internet.', error);
    }
    
    // Re-throw erros da API
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Tratamento de outros erros
    console.error('❌ Erro inesperado na requisição:', error);
    throw new ApiError(
      error.message || 'Erro inesperado na requisição',
      0,
      'Unknown Error',
      { originalError: error.message }
    );
  }
};

// API object com métodos similares ao axios
const api = {
  get: (url, config = {}) => makeRequest(url, { method: 'GET', ...config }),
  post: (url, data, config = {}) => makeRequest(url, { 
    method: 'POST', 
    body: JSON.stringify(data), 
    ...config 
  }),
  put: (url, data, config = {}) => makeRequest(url, { 
    method: 'PUT', 
    body: JSON.stringify(data), 
    ...config 
  }),
  delete: (url, config = {}) => makeRequest(url, { method: 'DELETE', ...config }),
};

// Exportar classes de erro para uso nos serviços
export { ApiError, NetworkError };

export default api;
