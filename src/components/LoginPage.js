import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUser, FaLock, FaArrowRight, FaEye, FaEyeSlash } from 'react-icons/fa';
import authService from '../services/authService';
import './LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get roomId from URL query parameters
  const searchParams = new URLSearchParams(location.search);
  const roomId = searchParams.get('roomId');

  // Verificar se já está autenticado
  useEffect(() => {
    console.log('🔄 LoginPage useEffect executado');
    const isAuth = authService.isAuthenticated();
    console.log('🔐 Usuário já autenticado?', isAuth);
    
    if (isAuth) {
      console.log('✅ Usuário já autenticado, redirecionando...');
      // Evitar loop de redirecionamento
      const currentPath = window.location.pathname;
      if (currentPath === '/login') {
        if (roomId) {
          console.log('🔄 Redirecionando para seleção de avatar:', roomId);
          navigate(`/avatar?roomId=${roomId}`, { replace: true });
        } else {
          console.log('🔄 Redirecionando para dashboard');
          navigate('/dashboard', { replace: true });
        }
      }
    }
  }, [navigate, roomId]);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    console.log('🔐 handleLogin iniciado');
    console.log('🔐 Email:', email);
    console.log('🔐 Password:', password ? 'preenchida' : 'vazia');
    
    if (!email.trim()) {
      console.log('❌ Email vazio');
      setError('Por favor, digite seu e-mail!');
      return;
    }
    
    if (!password.trim()) {
      console.log('❌ Senha vazia');
      setError('Por favor, digite sua senha!');
      return;
    }

    console.log('✅ Validações passaram, iniciando login...');
    setIsLoading(true);
    setError('');

    try {
      console.log('🔐 Tentando fazer login com:', { email: email.trim(), roomId });
      const result = await authService.login(email.trim(), password);
      console.log('🔐 Resultado do login:', result);
      
      if (result.success) {
        console.log('✅ Login bem-sucedido, redirecionando...');
        console.log('📍 URL atual antes do redirecionamento:', window.location.href);
        
        // Aguardar um pouco para garantir que o localStorage foi atualizado
        setTimeout(() => {
          console.log('🔄 Verificando autenticação antes do redirecionamento...');
          console.log('🔍 Token no localStorage:', localStorage.getItem('authToken'));
          console.log('🔍 UserData no localStorage:', localStorage.getItem('userData'));
          const isAuth = authService.isAuthenticated();
          console.log('🔐 isAuthenticated após login:', isAuth);
          
          if (isAuth) {
            // Redirecionar baseado no contexto
            if (roomId) {
              console.log('🔄 Redirecionando para seleção de avatar:', roomId);
              navigate(`/avatar?roomId=${roomId}`, { replace: true });
            } else {
              console.log('🔄 Redirecionando para dashboard');
              navigate('/dashboard', { replace: true });
            }
          } else {
            console.log('❌ Problema: usuário não está autenticado após login');
            console.log('❌ Token:', localStorage.getItem('authToken'));
            console.log('❌ UserData:', localStorage.getItem('userData'));
          }
        }, 100);
      } else {
        console.log('❌ Erro no login:', result.error);
        setError(result.error);
      }
    } catch (error) {
      console.error('❌ Erro inesperado no login:', error);
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    const role = formData.get('role') || 'collaborator';

    if (!name.trim()) {
      setError('Por favor, digite seu nome completo!');
      return;
    }
    
    if (!email.trim()) {
      setError('Por favor, digite seu e-mail!');
      return;
    }
    
    if (!password.trim()) {
      setError('Por favor, digite sua senha!');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem!');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres!');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await authService.register({
        name: name.trim(),
        email: email.trim(),
        password,
        role
      });
      
      if (result.success) {
        // Redirecionar baseado no contexto
    if (roomId) {
      navigate(`/votacao/${roomId}`);
    } else {
          navigate('/dashboard');
        }
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (showRegister) {
    return (
      <div className="login-container">
        <div className="login-box">
          <h1>Criar Conta</h1>
          {roomId && <p className="room-info">Entrando na sala: {roomId}</p>}
          
          <form onSubmit={handleRegister} className="auth-form">
            <div className="input-group">
              <FaUser className="input-icon" />
              <input
                type="text"
                name="name"
                placeholder="Nome completo"
                className="login-input"
                maxLength={100}
                required
              />
            </div>

            <div className="input-group">
              <FaUser className="input-icon" />
              <input
                type="email"
                name="email"
                placeholder="E-mail"
                className="login-input"
                maxLength={255}
                required
              />
            </div>

            <div className="input-group">
              <FaLock className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Senha (mínimo 6 caracteres)"
                className="login-input"
                minLength={6}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <div className="input-group">
              <FaLock className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Confirmar senha"
                className="login-input"
                minLength={6}
                required
              />
            </div>

            <div className="input-group">
              <select name="role" className="login-input">
                <option value="collaborator">Colaborador</option>
                <option value="manager">Gestor</option>
              </select>
            </div>

            {error && <p className="error-message">{error}</p>}
            
            <button 
              type="submit" 
              className="login-button"
              disabled={isLoading}
            >
              {isLoading ? 'Criando conta...' : 'Criar Conta'} 
              <FaArrowRight className="button-icon" />
            </button>
          </form>

          <div className="auth-switch">
            <p>Já tem conta? 
              <button 
                type="button" 
                className="switch-button"
                onClick={() => setShowRegister(false)}
              >
                Entrar
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Entrar</h1>
        {roomId && <p className="room-info">Entrando na sala: {roomId}</p>}
        
        <form onSubmit={handleLogin} className="auth-form">
        <div className="input-group">
          <FaUser className="input-icon" />
          <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              placeholder="E-mail"
              className="login-input"
              maxLength={255}
              required
            />
          </div>

          <div className="input-group">
            <FaLock className="input-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
            onChange={(e) => {
                setPassword(e.target.value);
              setError('');
            }}
              placeholder="Senha"
            className="login-input"
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {error && <p className="error-message">{error}</p>}
          
          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Entrando...' : 'Entrar'} 
            <FaArrowRight className="button-icon" />
          </button>
        </form>

        <div className="auth-actions">
          <button 
            type="button" 
            className="forgot-password"
            onClick={() => setError('Funcionalidade em desenvolvimento')}
          >
            Esqueceu a senha?
          </button>
        </div>

        <div className="auth-switch">
          <p>Não tem conta? 
            <button 
              type="button" 
              className="switch-button"
              onClick={() => setShowRegister(true)}
            >
              Cadastrar-se
            </button>
          </p>
        </div>

        {/* Botão de teste para debug */}
        <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
          <p style={{ fontSize: '12px', color: '#666', margin: '0 0 10px 0' }}>Debug:</p>
          <button 
            type="button"
            onClick={() => {
              console.log('🔍 Estado atual do localStorage:');
              console.log('Token:', localStorage.getItem('authToken'));
              console.log('UserData:', localStorage.getItem('userData'));
              console.log('isAuthenticated:', authService.isAuthenticated());
            }}
            style={{ 
              padding: '5px 10px', 
              fontSize: '12px', 
              background: '#f0f0f0', 
              border: '1px solid #ccc', 
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            Verificar localStorage
        </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 