import React, { useState, useEffect } from 'react';
import { 
  FaTimes, 
  FaUser, 
  FaEnvelope, 
  FaCalendar, 
  FaCamera, 
  FaSave, 
  FaEdit, 
  FaEye, 
  FaEyeSlash,
  FaShieldAlt,
  FaCog
} from 'react-icons/fa';
import authService from '../services/authService';
import './ProfileModal.css';

const ProfileModal = ({ isOpen, onClose, onProfileUpdate }) => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Estados do formulário
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    bio: '',
    avatar_url: '',
    phone: '',
    company: '',
    position: '',
    location: '',
    website: '',
    timezone: 'America/Sao_Paulo',
    language: 'pt-BR'
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadUserProfile();
    }
  }, [isOpen]);

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      const currentUser = authService.getCurrentUser();
      
      if (!currentUser) {
        setError('Usuário não encontrado');
        return;
      }

      // Dados mock para demonstração (em produção, viria da API)
      const mockProfile = {
        name: currentUser.name || '',
        email: currentUser.email || '',
        bio: 'Desenvolvedor apaixonado por tecnologia e inovação.',
        avatar_url: currentUser.avatar_url || '',
        phone: '+55 11 99999-9999',
        company: 'TimeBoard Solutions',
        position: 'Desenvolvedor Full Stack',
        location: 'São Paulo, SP',
        website: 'https://meusite.com',
        timezone: 'America/Sao_Paulo',
        language: 'pt-BR',
        created_at: currentUser.created_at || new Date().toISOString(),
        last_login: new Date().toISOString(),
        role: currentUser.role || 'member'
      };

      setUser(currentUser);
      setProfileData(mockProfile);
      console.log('👤 Perfil carregado:', mockProfile);
      
    } catch (error) {
      console.error('❌ Erro ao carregar perfil:', error);
      setError('Erro ao carregar dados do perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Validações básicas
      if (!profileData.name.trim()) {
        setError('Nome é obrigatório');
        return;
      }

      if (!profileData.email.trim()) {
        setError('Email é obrigatório');
        return;
      }

      // Validação de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(profileData.email)) {
        setError('Email inválido');
        return;
      }

      console.log('💾 Salvando perfil...', profileData);
      
      // Simular salvamento (em produção, chamaria a API)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Atualizar dados do usuário no localStorage
      const updatedUser = {
        ...user,
        name: profileData.name,
        email: profileData.email,
        avatar_url: profileData.avatar_url
      };
      
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      
      // Notificar componente pai sobre a atualização
      if (onProfileUpdate) {
        onProfileUpdate(updatedUser);
      }
      
      setSuccess('Perfil atualizado com sucesso!');
      setIsEditing(false);
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (error) {
      console.error('❌ Erro ao salvar perfil:', error);
      setError('Erro ao salvar perfil');
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
      setError('');
      
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

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
    setSuccess('');
    // Recarregar dados originais
    loadUserProfile();
  };

  const handleAvatarUpload = () => {
    // Simular upload de avatar
    const newAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name)}&background=0079bf&color=fff&size=200`;
    setProfileData(prev => ({ ...prev, avatar_url: newAvatarUrl }));
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'member':
        return 'Membro';
      case 'guest':
        return 'Convidado';
      default:
        return 'Usuário';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return '#f39c12';
      case 'member':
        return '#3498db';
      case 'guest':
        return '#95a5a6';
      default:
        return '#666';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content profile-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="header-left">
            <h2>Meu Perfil</h2>
            <span className="profile-role" style={{ color: getRoleColor(profileData.role) }}>
              {getRoleLabel(profileData.role)}
            </span>
          </div>
          <div className="header-right">
            {!isEditing ? (
              <button 
                className="edit-btn"
                onClick={() => setIsEditing(true)}
              >
                <FaEdit /> Editar
              </button>
            ) : (
              <div className="edit-actions">
                <button 
                  className="cancel-btn"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  Cancelar
                </button>
                <button 
                  className="save-btn"
                  onClick={handleSaveProfile}
                  disabled={isLoading}
                >
                  <FaSave /> {isLoading ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            )}
            <button 
              className="close-btn"
              onClick={onClose}
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
            <button onClick={() => setError('')}>×</button>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <span>{success}</span>
            <button onClick={() => setSuccess('')}>×</button>
          </div>
        )}

        {/* Content */}
        <div className="modal-body">
          {isLoading && !isEditing ? (
            <div className="loading">
              <div className="loading-spinner"></div>
              <p>Carregando perfil...</p>
            </div>
          ) : (
            <div className="profile-content">
              {/* Avatar Section */}
              <div className="avatar-section">
                <div className="avatar-container">
                  {profileData.avatar_url ? (
                    <img 
                      src={profileData.avatar_url} 
                      alt="Avatar" 
                      className="avatar" 
                    />
                  ) : (
                    <div className="avatar-placeholder">
                      {profileData.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {isEditing && (
                    <button 
                      className="avatar-upload"
                      onClick={handleAvatarUpload}
                    >
                      <FaCamera />
                    </button>
                  )}
                </div>
                <div className="avatar-info">
                  <h3>{profileData.name}</h3>
                  <p>{profileData.email}</p>
                  {isEditing && (
                    <button 
                      className="change-avatar-btn"
                      onClick={handleAvatarUpload}
                    >
                      Alterar Foto
                    </button>
                  )}
                </div>
              </div>

              {/* Profile Information */}
              <div className="profile-info">
                <div className="info-section">
                  <h3>Informações Pessoais</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>
                        <FaUser /> Nome Completo
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.name}
                          onChange={(e) => setProfileData(prev => ({ 
                            ...prev, 
                            name: e.target.value 
                          }))}
                          placeholder="Seu nome completo"
                        />
                      ) : (
                        <span>{profileData.name}</span>
                      )}
                    </div>

                    <div className="info-item">
                      <label>
                        <FaEnvelope /> Email
                      </label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData(prev => ({ 
                            ...prev, 
                            email: e.target.value 
                          }))}
                          placeholder="seu@email.com"
                        />
                      ) : (
                        <span>{profileData.email}</span>
                      )}
                    </div>

                    <div className="info-item">
                      <label>
                        <FaCalendar /> Telefone
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => setProfileData(prev => ({ 
                            ...prev, 
                            phone: e.target.value 
                          }))}
                          placeholder="+55 11 99999-9999"
                        />
                      ) : (
                        <span>{profileData.phone}</span>
                      )}
                    </div>

                    <div className="info-item">
                      <label>Empresa</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.company}
                          onChange={(e) => setProfileData(prev => ({ 
                            ...prev, 
                            company: e.target.value 
                          }))}
                          placeholder="Nome da empresa"
                        />
                      ) : (
                        <span>{profileData.company}</span>
                      )}
                    </div>

                    <div className="info-item">
                      <label>Cargo</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.position}
                          onChange={(e) => setProfileData(prev => ({ 
                            ...prev, 
                            position: e.target.value 
                          }))}
                          placeholder="Seu cargo"
                        />
                      ) : (
                        <span>{profileData.position}</span>
                      )}
                    </div>

                    <div className="info-item">
                      <label>Localização</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.location}
                          onChange={(e) => setProfileData(prev => ({ 
                            ...prev, 
                            location: e.target.value 
                          }))}
                          placeholder="Cidade, Estado"
                        />
                      ) : (
                        <span>{profileData.location}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="info-section">
                  <h3>Biografia</h3>
                  {isEditing ? (
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData(prev => ({ 
                        ...prev, 
                        bio: e.target.value 
                      }))}
                      placeholder="Conte um pouco sobre você..."
                      rows={3}
                    />
                  ) : (
                    <p className="bio-text">{profileData.bio}</p>
                  )}
                </div>

                {/* Change Password Section */}
                {isEditing && (
                  <div className="info-section">
                    <h3>
                      <FaShieldAlt /> Alterar Senha
                    </h3>
                    <div className="password-form">
                      <div className="password-input">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={passwordData.current_password}
                          onChange={(e) => setPasswordData(prev => ({ 
                            ...prev, 
                            current_password: e.target.value 
                          }))}
                          placeholder="Senha atual"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>

                      <div className="password-input">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={passwordData.new_password}
                          onChange={(e) => setPasswordData(prev => ({ 
                            ...prev, 
                            new_password: e.target.value 
                          }))}
                          placeholder="Nova senha"
                        />
                      </div>

                      <div className="password-input">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={passwordData.confirm_password}
                          onChange={(e) => setPasswordData(prev => ({ 
                            ...prev, 
                            confirm_password: e.target.value 
                          }))}
                          placeholder="Confirmar nova senha"
                        />
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
                )}

                {/* Account Info */}
                <div className="info-section">
                  <h3>Informações da Conta</h3>
                  <div className="account-info">
                    <div className="account-item">
                      <label>Membro desde</label>
                      <span>{new Date(profileData.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="account-item">
                      <label>Último login</label>
                      <span>{new Date(profileData.last_login).toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="account-item">
                      <label>Fuso horário</label>
                      <span>{profileData.timezone}</span>
                    </div>
                    <div className="account-item">
                      <label>Idioma</label>
                      <span>{profileData.language === 'pt-BR' ? 'Português (Brasil)' : 'English'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
