// Teste para verificar o token atual
function checkCurrentToken() {
  const token = localStorage.getItem('authToken');
  const userData = localStorage.getItem('userData');
  
  console.log('🔑 Token atual:', token);
  console.log('👤 Dados do usuário:', userData);
  
  if (token) {
    console.log('📏 Tamanho do token:', token.length);
    console.log('🔍 Primeiros 20 caracteres:', token.substring(0, 20) + '...');
  } else {
    console.log('❌ Nenhum token encontrado');
  }
  
  return { token, userData };
}

// Teste de validação do token
async function validateCurrentToken() {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    console.log('❌ Nenhum token encontrado');
    return false;
  }
  
  try {
    console.log('🔐 Validando token atual...');
    
    const response = await fetch('http://localhost:3003/auth/profile', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('📡 Status da resposta:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Token válido! Dados do usuário:', data);
      return true;
    } else {
      const errorData = await response.json();
      console.log('❌ Token inválido:', errorData);
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao validar token:', error);
    return false;
  }
}

// Função para fazer login e obter um token válido
async function loginAndGetToken() {
  try {
    console.log('🔐 Fazendo login para obter token válido...');
    
    const loginData = {
      email: 'admin@example.com', // Substitua pelos dados corretos
      password: 'password123'      // Substitua pelos dados corretos
    };
    
    const response = await fetch('http://localhost:3003/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
    });
    
    console.log('📡 Status da resposta de login:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Login realizado com sucesso:', data);
      
      // Salvar token e dados do usuário
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userData', JSON.stringify(data.user));
      
      console.log('💾 Token e dados salvos no localStorage');
      return true;
    } else {
      const errorData = await response.json();
      console.log('❌ Erro no login:', errorData);
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao fazer login:', error);
    return false;
  }
}

// Função para testar criação de sprint com token válido
async function testSprintCreationWithValidToken() {
  try {
    console.log('🏃 Testando criação de sprint com token válido...');
    
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.log('❌ Nenhum token encontrado. Faça login primeiro.');
      return false;
    }
    
    const sprintData = {
      nome: 'Sprint Teste Console',
      descricao: 'Sprint criada via console para teste',
      data_inicio: '2025-10-02',
      data_fim: '2025-10-03',
      board_id: 1
    };
    
    console.log('📤 Dados da sprint:', sprintData);
    
    const response = await fetch('http://localhost:3003/sprints', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(sprintData)
    });
    
    console.log('📡 Status da resposta:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Sprint criada com sucesso:', data);
      return true;
    } else {
      const errorData = await response.text();
      console.error('❌ Erro ao criar sprint:', response.status, response.statusText);
      console.error('❌ Detalhes do erro:', errorData);
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao criar sprint:', error);
    return false;
  }
}

// Executar diagnóstico completo
async function runTokenDiagnostic() {
  console.log('🔍 Iniciando diagnóstico do token...');
  
  // 1. Verificar token atual
  const { token, userData } = checkCurrentToken();
  
  // 2. Validar token atual
  const isValid = await validateCurrentToken();
  
  if (!isValid) {
    console.log('⚠️ Token inválido. Tentando fazer login...');
    const loginSuccess = await loginAndGetToken();
    
    if (loginSuccess) {
      console.log('✅ Login realizado. Testando criação de sprint...');
      await testSprintCreationWithValidToken();
    } else {
      console.log('❌ Falha no login. Verifique as credenciais.');
    }
  } else {
    console.log('✅ Token válido. Testando criação de sprint...');
    await testSprintCreationWithValidToken();
  }
}

// Exportar funções
window.checkCurrentToken = checkCurrentToken;
window.validateCurrentToken = validateCurrentToken;
window.loginAndGetToken = loginAndGetToken;
window.testSprintCreationWithValidToken = testSprintCreationWithValidToken;
window.runTokenDiagnostic = runTokenDiagnostic;

console.log('🔧 Funções de diagnóstico do token carregadas!');
console.log('Execute runTokenDiagnostic() para diagnosticar o problema do token.');
