import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUser, FaArrowRight } from 'react-icons/fa';
import './LoginPage.css';

const avatars = [
  { id: 1, src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1' },
  { id: 2, src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2' },
  { id: 3, src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3' },
  { id: 4, src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4' },
  { id: 5, src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=5' },
  { id: 6, src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=6' },
  { id: 7, src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=7' },
  { id: 8, src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=8' },
  { id: 9, src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=9' },
  { id: 10, src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=10' },
  { id: 11, src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=11' },
  { id: 12, src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=12' },
];

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get roomId from URL query parameters
  const searchParams = new URLSearchParams(location.search);
  const roomId = searchParams.get('roomId');

  const handleLogin = () => {
    if (username.trim() === '') {
      setError('Por favor, digite seu nome!');
      return;
    }
    if (!selectedAvatar) {
      setError('Por favor, selecione um avatar!');
      return;
    }
    
    // Save user data
    localStorage.setItem('userName', username.trim());
    localStorage.setItem('userRole', roomId ? 'participant' : 'moderator');
    
    // Save room ID if available
    if (roomId) {
      localStorage.setItem('currentRoom', roomId);
      navigate(`/votacao/${roomId}`);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Bem-vindo ao Sistema de Votação</h1>
        {roomId && <p className="room-info">Entrando na sala: {roomId}</p>}
        <div className="avatar-selection">
          <h3>Escolha seu Avatar</h3>
          <div className="avatar-grid">
            {avatars.map((avatar) => (
              <div
                key={avatar.id}
                className={`avatar-item ${selectedAvatar === avatar.id ? 'selected' : ''}`}
                onClick={() => setSelectedAvatar(avatar.id)}
              >
                <img src={avatar.src} alt={`Avatar ${avatar.id}`} />
              </div>
            ))}
          </div>
        </div>
        <div className="input-group">
          <FaUser className="input-icon" />
          <input
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError('');
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="Digite seu nome"
            className="login-input"
            maxLength={20}
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button onClick={handleLogin} className="login-button">
          Entrar <FaArrowRight className="button-icon" />
        </button>
      </div>
    </div>
  );
};

export default LoginPage; 