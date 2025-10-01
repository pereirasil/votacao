import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowRight, FaUser, FaCheck } from 'react-icons/fa';
import './AvatarSelection.css';

const AvatarSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [roomId, setRoomId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Avatares disponíveis
  const avatars = [
    { id: 'avataaars', name: 'Avatar 1', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=avatar1' },
    { id: 'avataaars2', name: 'Avatar 2', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=avatar2' },
    { id: 'avataaars3', name: 'Avatar 3', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=avatar3' },
    { id: 'avataaars4', name: 'Avatar 4', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=avatar4' },
    { id: 'avataaars5', name: 'Avatar 5', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=avatar5' },
    { id: 'avataaars6', name: 'Avatar 6', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=avatar6' },
    { id: 'avataaars7', name: 'Avatar 7', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=avatar7' },
    { id: 'avataaars8', name: 'Avatar 8', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=avatar8' },
  ];

  useEffect(() => {
    // Obter dados do usuário do localStorage
    const userData = localStorage.getItem('userData');
    const searchParams = new URLSearchParams(location.search);
    const roomIdFromUrl = searchParams.get('roomId');

    console.log('🎭 AvatarSelection - Dados recebidos:', {
      userData,
      roomIdFromUrl,
      location: location.search
    });

    if (!userData) {
      console.log('❌ AvatarSelection - Sem dados do usuário, redirecionando para login');
      navigate('/login');
      return;
    }

    try {
      const parsedUserData = JSON.parse(userData);
      setUserName(parsedUserData.name);
      setUserRole(parsedUserData.role || 'collaborator');
      setRoomId(roomIdFromUrl || '');
      
      console.log('✅ AvatarSelection - Dados do usuário carregados:', {
        name: parsedUserData.name,
        role: parsedUserData.role,
        roomId: roomIdFromUrl
      });
    } catch (error) {
      console.error('❌ AvatarSelection - Erro ao parsear dados do usuário:', error);
      navigate('/login');
    }
  }, [navigate, location]);

  const handleAvatarSelect = (avatar) => {
    console.log('🎭 Avatar selecionado:', avatar);
    setSelectedAvatar(avatar.url);
  };

  const handleContinue = () => {
    if (!selectedAvatar) {
      alert('Por favor, selecione um avatar antes de continuar.');
      return;
    }

    setIsLoading(true);
    
    console.log('🚀 Continuando para votação com:', {
      userName,
      userRole,
      roomId,
      selectedAvatar
    });

    // Salvar dados do usuário para a votação
    localStorage.setItem('userName', userName);
    localStorage.setItem('userRole', userRole);
    localStorage.setItem('userAvatar', selectedAvatar);
    localStorage.setItem('currentRoom', roomId);

    // Aguardar um pouco para garantir que os dados foram salvos
    setTimeout(() => {
      if (roomId) {
        console.log('🔄 Redirecionando para votação:', roomId);
        navigate(`/votacao/${roomId}`, { replace: true });
      } else {
        console.log('🔄 Redirecionando para dashboard');
        navigate('/dashboard', { replace: true });
      }
    }, 100);
  };

  if (!userName) {
    return (
      <div className="avatar-selection-container">
        <div className="loading">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="avatar-selection-container">
      <div className="avatar-selection-box">
        <div className="header">
          <h1>Escolha seu Avatar</h1>
          <p>Olá, <strong>{userName}</strong>!</p>
          {roomId && <p className="room-info">Entrando na sala: <strong>{roomId}</strong></p>}
        </div>

        <div className="avatar-grid">
          {avatars.map((avatar) => (
            <div
              key={avatar.id}
              className={`avatar-option ${selectedAvatar === avatar.url ? 'selected' : ''}`}
              onClick={() => handleAvatarSelect(avatar)}
            >
              <img src={avatar.url} alt={avatar.name} className="avatar-image" />
              {selectedAvatar === avatar.url && (
                <div className="selected-indicator">
                  <FaCheck />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="avatar-actions">
          <button 
            className="continue-button"
            onClick={handleContinue}
            disabled={!selectedAvatar || isLoading}
          >
            {isLoading ? 'Entrando...' : 'Continuar'} 
            <FaArrowRight className="button-icon" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarSelection;
