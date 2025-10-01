import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaUser, 
  FaBell, 
  FaPalette, 
  FaShieldAlt, 
  FaPlug, 
  FaCog, 
  FaSave, 
  FaEye, 
  FaEyeSlash,
  FaCamera,
  FaGlobe,
  FaMoon,
  FaSun,
  FaDesktop,
  FaCheck,
  FaTimes
} from 'react-icons/fa';
import authService from '../services/authService';
import './Settings.css';

const Settings = () => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Estados do formulário
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    bio: '',
    avatar_url: '',
    timezone: 'America/Sao_Paulo',
    language: 'pt-BR'
  });

  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    push_notifications: true,
    board_updates: true,
    card_assignments: true,
    due_date_reminders: true,
    weekly_digest: false,
    marketing_emails: false
  });

  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'light',
    sidebar_collapsed: false,
    compact_mode: false,
    show_avatars: true,
    show_animations: true
  });

  const [securitySettings, setSecuritySettings] = useState({
    two_factor_enabled: false,
    session_timeout: 30,
    login_notifications: true
  });

  const [integrations, setIntegrations] = useState({
    github: {
      connected: false,
      username: '',
      avatar_url: '',
      access_token: ''
    },
    google_drive: {
      connected: false,
      access_token: ''
    },
    slack: {
      connected: false,
      webhook_url: ''
    }
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    const isAuth = authService.isAuthenticated();
    
    if (!currentUser || !isAuth) {
      navigate('/login', { replace: true });
      return;
    }

    setUser(currentUser);
    
    // Verificar se é admin
    const userRole = currentUser.role || 'member';
    setIsAdmin(userRole === 'admin');

    // Carregar dados do usuário
    loadUserSettings(currentUser);
    
    // Carregar integrações salvas
    loadIntegrations();
    
    // Processar dados do GitHub que podem vir via URL parameters
    processGitHubDataFromURL();
    
    // Verificar status da conexão GitHub
    checkGitHubConnectionStatus();
  }, [navigate]);

  const loadIntegrations = () => {
    try {
      console.log('🔌 Carregando integrações...');
      
      // Carregar integração do GitHub
      const githubData = localStorage.getItem('github_integration');
      if (githubData) {
        const parsedData = JSON.parse(githubData);
        setIntegrations(prev => ({
          ...prev,
          github: parsedData
        }));
        console.log('✅ Integração GitHub carregada:', parsedData);
      }
      
    } catch (error) {
      console.error('❌ Erro ao carregar integrações:', error);
    }
  };

  const checkGitHubConnectionStatus = async () => {
    try {
      console.log('🔍 Verificando status da conexão GitHub...');
      
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:3003'}/github/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Status da conexão GitHub:', data);
        
        // Se não estiver conectado no backend mas estiver no localStorage, limpar
        if (!data.connected && integrations.github.connected) {
          console.log('🧹 Limpando dados GitHub obsoletos...');
          setIntegrations(prev => ({
            ...prev,
            github: {
              connected: false,
              username: '',
              avatar_url: '',
              access_token: '',
              user_info: null
            }
          }));
          localStorage.removeItem('github_integration');
        }
      }
    } catch (error) {
      console.error('❌ Erro ao verificar status da conexão GitHub:', error);
    }
  };

  const loadUserSettings = async (currentUser) => {
    try {
      setIsLoading(true);
      console.log('⚙️ Carregando configurações do usuário...');

      // Dados mock para demonstração
      const mockSettings = {
        profile: {
          name: currentUser.name || '',
          email: currentUser.email || '',
          bio: 'Desenvolvedor apaixonado por tecnologia e inovação.',
          avatar_url: currentUser.avatar_url || '',
          timezone: 'America/Sao_Paulo',
          language: 'pt-BR'
        },
        notifications: {
          email_notifications: true,
          push_notifications: true,
          board_updates: true,
          card_assignments: true,
          due_date_reminders: true,
          weekly_digest: false,
          marketing_emails: false
        },
        appearance: {
          theme: 'light',
          sidebar_collapsed: false,
          compact_mode: false,
          show_avatars: true,
          show_animations: true
        },
        security: {
          two_factor_enabled: false,
          session_timeout: 30,
          login_notifications: true
        }
      };

      setProfileData(mockSettings.profile);
      setNotificationSettings(mockSettings.notifications);
      setAppearanceSettings(mockSettings.appearance);
      setSecuritySettings(mockSettings.security);

      console.log('✅ Configurações carregadas com sucesso');
      
    } catch (error) {
      console.error('❌ Erro ao carregar configurações:', error);
      setError('Erro ao carregar configurações');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);
      console.log('💾 Salvando perfil...', profileData);
      
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Perfil atualizado com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (error) {
      console.error('❌ Erro ao salvar perfil:', error);
      setError('Erro ao salvar perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setIsLoading(true);
      console.log('🔔 Salvando configurações de notificação...', notificationSettings);
      
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Configurações de notificação salvas!');
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (error) {
      console.error('❌ Erro ao salvar notificações:', error);
      setError('Erro ao salvar configurações de notificação');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAppearance = async () => {
    try {
      setIsLoading(true);
      console.log('🎨 Salvando configurações de aparência...', appearanceSettings);
      
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Configurações de aparência salvas!');
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (error) {
      console.error('❌ Erro ao salvar aparência:', error);
      setError('Erro ao salvar configurações de aparência');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('As senhas não coincidem');
      return;
    }

    if (passwordData.new_password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      setIsLoading(true);
      console.log('🔒 Alterando senha...');
      
      // Simular alteração de senha
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      
      setSuccess('Senha alterada com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (error) {
      console.error('❌ Erro ao alterar senha:', error);
      setError('Erro ao alterar senha');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSecurity = async () => {
    try {
      setIsLoading(true);
      console.log('🛡️ Salvando configurações de segurança...', securitySettings);
      
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Configurações de segurança salvas!');
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (error) {
      console.error('❌ Erro ao salvar segurança:', error);
      setError('Erro ao salvar configurações de segurança');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubConnect = async () => {
    try {
      setIsLoading(true);
      setError('');
      console.log('🐙 Conectando com GitHub...');
      
      // Obter URL de autorização do backend
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:3003'}/github/auth-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify({
          redirectUri: `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:3003'}/github/callback`
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao obter URL de autorização');
      }

      const data = await response.json();
      console.log('✅ URL de autorização obtida:', data.authUrl);
      
      // Redirecionar diretamente para o GitHub (melhor UX)
      window.location.href = data.authUrl;
      
    } catch (error) {
      console.error('❌ Erro ao conectar com GitHub:', error);
      setError(`Erro ao conectar com GitHub: ${error.message}`);
      setIsLoading(false);
    }
  };

  // Função para processar dados do GitHub que vêm via URL parameters
  const processGitHubDataFromURL = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get("success");
    const githubData = urlParams.get("github_data");
    const error = urlParams.get("error");
    const message = urlParams.get("message");
    
    if (success === "true" && githubData) {
      try {
        const data = JSON.parse(decodeURIComponent(githubData));
        console.log("🎉 Dados do GitHub recebidos via URL:", data);
        
        // Atualizar estado com dados do GitHub
        setIntegrations(prev => ({
          ...prev,
          github: {
            connected: true,
            username: data.user.login,
            avatar_url: data.user.avatar_url,
            access_token: data.access_token,
            user_info: data.user
          }
        }));
        
        // Salvar no localStorage
        localStorage.setItem("github_integration", JSON.stringify({
          connected: true,
          username: data.user.login,
          avatar_url: data.user.avatar_url,
          access_token: data.access_token,
          user_info: data.user
        }));
        
        setSuccess(`🎉 GitHub conectado com sucesso! Bem-vindo, @${data.user.login}!`);
        setTimeout(() => setSuccess(""), 5000);
        
        // Limpar URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (error) {
        console.error("❌ Erro ao processar dados do GitHub:", error);
        setError("Erro ao processar dados do GitHub");
      }
    } else if (error) {
      console.error("❌ Erro no callback do GitHub:", message);
      setError(`Erro: ${message || "Erro desconhecido"}`);
    }
  };

  const handleGitHubCallback = async (code, state) => {
    try {
      console.log('🔄 Processando callback do GitHub...');
      
      // Enviar código para o backend
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:3003'}/github/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify({
          code,
          redirectUri: `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:3003'}/github/callback`,
          state
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao processar callback do GitHub');
      }

      const data = await response.json();
      
      // Atualizar estado com dados do GitHub
      setIntegrations(prev => ({
        ...prev,
        github: {
          connected: true,
          username: data.user.login,
          avatar_url: data.user.avatar_url,
          access_token: data.access_token,
          user_info: data.user
        }
      }));
      
      // Salvar no localStorage
      localStorage.setItem('github_integration', JSON.stringify({
        connected: true,
        username: data.user.login,
        avatar_url: data.user.avatar_url,
        access_token: data.access_token,
        user_info: data.user
      }));
      
      setSuccess('GitHub conectado com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (error) {
      console.error('❌ Erro ao processar callback do GitHub:', error);
      setError('Erro ao processar autenticação do GitHub');
    }
  };

  const handleGitHubDisconnect = async () => {
    try {
      setIsLoading(true);
      console.log('🔌 Desconectando do GitHub...');
      
      // Chamar API do backend para desconectar
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:3003'}/github/disconnect`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao desconectar do GitHub');
      }
      
      setIntegrations(prev => ({
        ...prev,
        github: {
          connected: false,
          username: '',
          avatar_url: '',
          access_token: '',
          user_info: null
        }
      }));
      
      // Remover do localStorage
      localStorage.removeItem('github_integration');
      
      setSuccess('🔌 GitHub desconectado com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (error) {
      console.error('❌ Erro ao desconectar do GitHub:', error);
      setError('Erro ao desconectar do GitHub');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: FaUser },
    { id: 'notifications', label: 'Notificações', icon: FaBell },
    { id: 'appearance', label: 'Aparência', icon: FaPalette },
    { id: 'security', label: 'Segurança', icon: FaShieldAlt },
    { id: 'integrations', label: 'Integrações', icon: FaPlug },
    ...(isAdmin ? [{ id: 'system', label: 'Sistema', icon: FaCog }] : [])
  ];

  if (isLoading && !user) {
    return (
      <div className="settings-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-container">
      {/* Header */}
      <header className="settings-header">
        <div className="header-left">
          <button 
            className="back-btn"
            onClick={() => navigate('/dashboard')}
          >
            <FaArrowLeft /> Dashboard
          </button>
          <div className="title-section">
            <h1>Configurações</h1>
            <p>Gerencie suas preferências e configurações da conta</p>
          </div>
        </div>
      </header>

      {/* Alerts */}
      {error && (
        <div className="alert alert-error">
          <FaTimes />
          <span>{error}</span>
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <FaCheck />
          <span>{success}</span>
          <button onClick={() => setSuccess('')}>×</button>
        </div>
      )}

      <div className="settings-content">
        {/* Sidebar */}
        <aside className="settings-sidebar">
          <nav className="settings-nav">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="settings-main">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="settings-section">
              <div className="section-header">
                <h2>Perfil do Usuário</h2>
                <p>Gerencie suas informações pessoais e preferências</p>
              </div>

              <div className="profile-form">
                <div className="avatar-section">
                  <div className="avatar-container">
                    {profileData.avatar_url ? (
                      <img src={profileData.avatar_url} alt="Avatar" className="avatar" />
                    ) : (
                      <div className="avatar-placeholder">
                        {profileData.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <button className="avatar-upload">
                      <FaCamera />
                    </button>
                  </div>
                  <div className="avatar-info">
                    <h3>Foto do Perfil</h3>
                    <p>Clique para alterar sua foto de perfil</p>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Nome Completo</label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Seu nome completo"
                    />
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="seu@email.com"
                    />
                  </div>

                  <div className="form-group">
                    <label>Biografia</label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Conte um pouco sobre você..."
                      rows={3}
                    />
                  </div>

                  <div className="form-group">
                    <label>Fuso Horário</label>
                    <select
                      value={profileData.timezone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, timezone: e.target.value }))}
                    >
                      <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
                      <option value="America/New_York">Nova York (GMT-5)</option>
                      <option value="Europe/London">Londres (GMT+0)</option>
                      <option value="Asia/Tokyo">Tóquio (GMT+9)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Idioma</label>
                    <select
                      value={profileData.language}
                      onChange={(e) => setProfileData(prev => ({ ...prev, language: e.target.value }))}
                    >
                      <option value="pt-BR">Português (Brasil)</option>
                      <option value="en-US">English (US)</option>
                      <option value="es-ES">Español</option>
                    </select>
                  </div>
                </div>

                <div className="form-actions">
                  <button 
                    className="save-btn"
                    onClick={handleSaveProfile}
                    disabled={isLoading}
                  >
                    <FaSave /> Salvar Perfil
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="settings-section">
              <div className="section-header">
                <h2>Notificações</h2>
                <p>Configure como e quando você deseja receber notificações</p>
              </div>

              <div className="notifications-form">
                <div className="notification-group">
                  <h3>Email</h3>
                  <div className="notification-options">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={notificationSettings.email_notifications}
                        onChange={(e) => setNotificationSettings(prev => ({ 
                          ...prev, 
                          email_notifications: e.target.checked 
                        }))}
                      />
                      <span className="checkmark"></span>
                      Receber notificações por email
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={notificationSettings.board_updates}
                        onChange={(e) => setNotificationSettings(prev => ({ 
                          ...prev, 
                          board_updates: e.target.checked 
                        }))}
                      />
                      <span className="checkmark"></span>
                      Atualizações de quadros
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={notificationSettings.card_assignments}
                        onChange={(e) => setNotificationSettings(prev => ({ 
                          ...prev, 
                          card_assignments: e.target.checked 
                        }))}
                      />
                      <span className="checkmark"></span>
                      Atribuições de cards
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={notificationSettings.due_date_reminders}
                        onChange={(e) => setNotificationSettings(prev => ({ 
                          ...prev, 
                          due_date_reminders: e.target.checked 
                        }))}
                      />
                      <span className="checkmark"></span>
                      Lembretes de prazo
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={notificationSettings.weekly_digest}
                        onChange={(e) => setNotificationSettings(prev => ({ 
                          ...prev, 
                          weekly_digest: e.target.checked 
                        }))}
                      />
                      <span className="checkmark"></span>
                      Resumo semanal
                    </label>
                  </div>
                </div>

                <div className="notification-group">
                  <h3>Push Notifications</h3>
                  <div className="notification-options">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={notificationSettings.push_notifications}
                        onChange={(e) => setNotificationSettings(prev => ({ 
                          ...prev, 
                          push_notifications: e.target.checked 
                        }))}
                      />
                      <span className="checkmark"></span>
                      Notificações push no navegador
                    </label>
                  </div>
                </div>

                <div className="notification-group">
                  <h3>Marketing</h3>
                  <div className="notification-options">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={notificationSettings.marketing_emails}
                        onChange={(e) => setNotificationSettings(prev => ({ 
                          ...prev, 
                          marketing_emails: e.target.checked 
                        }))}
                      />
                      <span className="checkmark"></span>
                      Emails de marketing e novidades
                    </label>
                  </div>
                </div>

                <div className="form-actions">
                  <button 
                    className="save-btn"
                    onClick={handleSaveNotifications}
                    disabled={isLoading}
                  >
                    <FaSave /> Salvar Notificações
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="settings-section">
              <div className="section-header">
                <h2>Aparência</h2>
                <p>Personalize a aparência da interface</p>
              </div>

              <div className="appearance-form">
                <div className="appearance-group">
                  <h3>Tema</h3>
                  <div className="theme-options">
                    <label className="theme-option">
                      <input
                        type="radio"
                        name="theme"
                        value="light"
                        checked={appearanceSettings.theme === 'light'}
                        onChange={(e) => setAppearanceSettings(prev => ({ 
                          ...prev, 
                          theme: e.target.value 
                        }))}
                      />
                      <div className="theme-preview light">
                        <FaSun />
                        <span>Claro</span>
                      </div>
                    </label>
                    <label className="theme-option">
                      <input
                        type="radio"
                        name="theme"
                        value="dark"
                        checked={appearanceSettings.theme === 'dark'}
                        onChange={(e) => setAppearanceSettings(prev => ({ 
                          ...prev, 
                          theme: e.target.value 
                        }))}
                      />
                      <div className="theme-preview dark">
                        <FaMoon />
                        <span>Escuro</span>
                      </div>
                    </label>
                    <label className="theme-option">
                      <input
                        type="radio"
                        name="theme"
                        value="auto"
                        checked={appearanceSettings.theme === 'auto'}
                        onChange={(e) => setAppearanceSettings(prev => ({ 
                          ...prev, 
                          theme: e.target.value 
                        }))}
                      />
                      <div className="theme-preview auto">
                        <FaDesktop />
                        <span>Automático</span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="appearance-group">
                  <h3>Layout</h3>
                  <div className="layout-options">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={appearanceSettings.sidebar_collapsed}
                        onChange={(e) => setAppearanceSettings(prev => ({ 
                          ...prev, 
                          sidebar_collapsed: e.target.checked 
                        }))}
                      />
                      <span className="checkmark"></span>
                      Sidebar colapsada por padrão
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={appearanceSettings.compact_mode}
                        onChange={(e) => setAppearanceSettings(prev => ({ 
                          ...prev, 
                          compact_mode: e.target.checked 
                        }))}
                      />
                      <span className="checkmark"></span>
                      Modo compacto
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={appearanceSettings.show_avatars}
                        onChange={(e) => setAppearanceSettings(prev => ({ 
                          ...prev, 
                          show_avatars: e.target.checked 
                        }))}
                      />
                      <span className="checkmark"></span>
                      Mostrar avatars
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={appearanceSettings.show_animations}
                        onChange={(e) => setAppearanceSettings(prev => ({ 
                          ...prev, 
                          show_animations: e.target.checked 
                        }))}
                      />
                      <span className="checkmark"></span>
                      Mostrar animações
                    </label>
                  </div>
                </div>

                <div className="form-actions">
                  <button 
                    className="save-btn"
                    onClick={handleSaveAppearance}
                    disabled={isLoading}
                  >
                    <FaSave /> Salvar Aparência
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="settings-section">
              <div className="section-header">
                <h2>Segurança</h2>
                <p>Gerencie a segurança da sua conta</p>
              </div>

              <div className="security-form">
                <div className="security-group">
                  <h3>Alterar Senha</h3>
                  <div className="password-form">
                    <div className="form-group">
                      <label>Senha Atual</label>
                      <div className="password-input">
                        <input
                          type={showPassword.current ? 'text' : 'password'}
                          value={passwordData.current_password}
                          onChange={(e) => setPasswordData(prev => ({ 
                            ...prev, 
                            current_password: e.target.value 
                          }))}
                          placeholder="Digite sua senha atual"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))}
                        >
                          {showPassword.current ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Nova Senha</label>
                      <div className="password-input">
                        <input
                          type={showPassword.new ? 'text' : 'password'}
                          value={passwordData.new_password}
                          onChange={(e) => setPasswordData(prev => ({ 
                            ...prev, 
                            new_password: e.target.value 
                          }))}
                          placeholder="Digite sua nova senha"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                        >
                          {showPassword.new ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Confirmar Nova Senha</label>
                      <div className="password-input">
                        <input
                          type={showPassword.confirm ? 'text' : 'password'}
                          value={passwordData.confirm_password}
                          onChange={(e) => setPasswordData(prev => ({ 
                            ...prev, 
                            confirm_password: e.target.value 
                          }))}
                          placeholder="Confirme sua nova senha"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                        >
                          {showPassword.confirm ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>

                    <button 
                      className="change-password-btn"
                      onClick={handleChangePassword}
                      disabled={isLoading || !passwordData.current_password || !passwordData.new_password}
                    >
                      <FaShieldAlt /> Alterar Senha
                    </button>
                  </div>
                </div>

                <div className="security-group">
                  <h3>Configurações de Segurança</h3>
                  <div className="security-options">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={securitySettings.two_factor_enabled}
                        onChange={(e) => setSecuritySettings(prev => ({ 
                          ...prev, 
                          two_factor_enabled: e.target.checked 
                        }))}
                      />
                      <span className="checkmark"></span>
                      Autenticação de dois fatores
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={securitySettings.login_notifications}
                        onChange={(e) => setSecuritySettings(prev => ({ 
                          ...prev, 
                          login_notifications: e.target.checked 
                        }))}
                      />
                      <span className="checkmark"></span>
                      Notificações de login
                    </label>
                  </div>

                  <div className="form-group">
                    <label>Timeout da Sessão (minutos)</label>
                    <select
                      value={securitySettings.session_timeout}
                      onChange={(e) => setSecuritySettings(prev => ({ 
                        ...prev, 
                        session_timeout: parseInt(e.target.value) 
                      }))}
                    >
                      <option value={15}>15 minutos</option>
                      <option value={30}>30 minutos</option>
                      <option value={60}>1 hora</option>
                      <option value={120}>2 horas</option>
                      <option value={480}>8 horas</option>
                    </select>
                  </div>
                </div>

                <div className="form-actions">
                  <button 
                    className="save-btn"
                    onClick={handleSaveSecurity}
                    disabled={isLoading}
                  >
                    <FaSave /> Salvar Segurança
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Integrations Tab */}
          {activeTab === 'integrations' && (
            <div className="settings-section">
              <div className="section-header">
                <h2>Integrações</h2>
                <p>Conecte com outras ferramentas e serviços</p>
              </div>

              <div className="integrations-form">
                <div className="integration-card">
                  <div className="integration-info">
                    <h3>Google Drive</h3>
                    <p>Conecte com o Google Drive para anexar arquivos</p>
                    {integrations.google_drive.connected && (
                      <div className="integration-status">
                        <span className="status-indicator connected"></span>
                        <span>Conectado</span>
                      </div>
                    )}
                  </div>
                  <button 
                    className="connect-btn"
                    disabled={isLoading}
                  >
                    {integrations.google_drive.connected ? 'Desconectar' : 'Conectar'}
                  </button>
                </div>

                <div className="integration-card">
                  <div className="integration-info">
                    <h3>Slack</h3>
                    <p>Receba notificações no Slack</p>
                    {integrations.slack.connected && (
                      <div className="integration-status">
                        <span className="status-indicator connected"></span>
                        <span>Conectado</span>
                      </div>
                    )}
                  </div>
                  <button 
                    className="connect-btn"
                    disabled={isLoading}
                  >
                    {integrations.slack.connected ? 'Desconectar' : 'Conectar'}
                  </button>
                </div>

                <div className="integration-card">
                  <div className="integration-info">
                    <h3>GitHub</h3>
                    <p>Integre com repositórios do GitHub</p>
                    {integrations.github.connected && (
                      <div className="integration-status">
                        <span className="status-indicator connected"></span>
                        <span>Conectado como @{integrations.github.username}</span>
                        {integrations.github.avatar_url && (
                          <img 
                            src={integrations.github.avatar_url} 
                            alt="GitHub Avatar" 
                            className="github-avatar"
                          />
                        )}
                      </div>
                    )}
                  </div>
                  <button 
                    className={`connect-btn ${integrations.github.connected ? 'disconnect' : ''}`}
                    onClick={integrations.github.connected ? handleGitHubDisconnect : handleGitHubConnect}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Processando...' : (integrations.github.connected ? 'Desconectar' : 'Conectar')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* System Tab (Admin only) */}
          {activeTab === 'system' && isAdmin && (
            <div className="settings-section">
              <div className="section-header">
                <h2>Configurações do Sistema</h2>
                <p>Configurações avançadas do sistema (apenas administradores)</p>
              </div>

              <div className="system-form">
                <div className="system-group">
                  <h3>Manutenção</h3>
                  <div className="system-options">
                    <button className="system-btn">Limpar Cache</button>
                    <button className="system-btn">Otimizar Banco de Dados</button>
                    <button className="system-btn">Gerar Backup</button>
                  </div>
                </div>

                <div className="system-group">
                  <h3>Logs</h3>
                  <div className="system-options">
                    <button className="system-btn">Visualizar Logs</button>
                    <button className="system-btn">Exportar Logs</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Settings;
