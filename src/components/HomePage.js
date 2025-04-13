import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { FaMoon, FaPlus, FaUsers, FaCopy } from 'react-icons/fa';
import './HomePage.css';
import logoImage from '../assets/logo.svg';
import microsoftLogo from '../assets/microsoft.svg';
import googleLogo from '../assets/google.svg';
import hpLogo from '../assets/hp.svg';
import deloitteLogo from '../assets/deloitte.svg';
import figmaLogo from '../assets/figma.svg';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://192.168.0.127:3001';

const socket = io(BACKEND_URL, {
  transports: ['websocket'],
  reconnectionAttempts: 5,
  reconnection: true,
  reconnectionDelay: 1000,
});

const HomePage = () => {
  const navigate = useNavigate();
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [newRoomId, setNewRoomId] = useState('');
  const [activeRooms, setActiveRooms] = useState([]);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    localStorage.removeItem('currentRoom');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    
    socket.on('connect', () => {
      console.log('✅ Socket conectado. ID:', socket.id);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Erro na conexão Socket:', error);
      setError('Erro ao conectar ao servidor. Por favor, tente novamente.');
    });

    socket.on('error', (error) => {
      console.error('❌ Erro recebido:', error);
      setError(error.message);
    });

    socket.on('roomCreated', (data) => {
      console.log('✅ Sala criada:', data);
      setNewRoomId(data.roomId);
      setShowCreateRoomModal(true);
    });

    socket.on('activeRooms', (rooms) => {
      console.log('📋 Salas ativas recebidas:', rooms);
      setActiveRooms(rooms);
    });

    return () => {
      socket.off('connect');
      socket.off('connect_error');
      socket.off('error');
      socket.off('roomCreated');
      socket.off('activeRooms');
    };
  }, []);

  const handleCreateRoom = () => {
    console.log('🎲 Criando nova sala');
    socket.emit('createRoom', {
      roomName: 'Nova Sala',
      roomType: 'planning-poker'
    }, (response) => {
      if (response?.error) {
        setError(response.error);
        return;
      }
      console.log('✅ Sala criada:', response);
      setNewRoomId(response.roomId);
      setShowCreateRoomModal(true);
    });
  };

  const handleCopyRoomLink = () => {
    const roomLink = `${window.location.origin}/login?roomId=${newRoomId}`;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(roomLink)
        .then(() => {
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        })
        .catch(() => {
          fallbackCopyToClipboard(roomLink);
        });
    } else {
      fallbackCopyToClipboard(roomLink);
    }
  };

  const fallbackCopyToClipboard = (text) => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      alert('Erro ao copiar o link. Por favor, copie manualmente.');
    }
  };

  const handleStartRoom = () => {
    if (newRoomId) {
      navigate(`/login?roomId=${newRoomId}`);
    }
  };

  const handleJoinRoom = () => {
    if (!roomId.trim()) {
      setError('Por favor, insira o ID da sala');
      return;
    }

    navigate(`/login?roomId=${roomId.trim()}`);
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="logo-container">
          <img src={logoImage} alt="Planning Poker Online" className="logo" />
          <div className="logo-text">
            <span className="logo-title">we agile you</span>
            <span className="logo-subtitle">PlanningPokerOnline</span>
          </div>
        </div>
        <nav className="nav-menu">
          <button className="theme-toggle" aria-label="Alternar tema">
            <FaMoon />
          </button>
          <button className="start-game-btn" onClick={() => setShowRoomModal(true)}>
            Iniciar jogo
          </button>
        </nav>
      </header>

      <main className="home-main">
        <div className="main-content">
          <h1>Scrum Poker para<br />times ágeis</h1>
          <p>Estimativas fáceis e divertidas.</p>
          <div className="room-buttons">
            <button className="start-game-btn large" onClick={handleCreateRoom}>
              <FaPlus /> Criar Nova Sala
            </button>
            <button className="join-room-btn large" onClick={() => setShowRoomModal(true)}>
              <FaUsers /> Entrar em uma Sala
            </button>
          </div>
        </div>
        <div className="main-image">
          <div className="poker-table-preview">
            <div className="preview-cards">
              <div className="preview-card">Sara</div>
              <div className="preview-card">Miguel</div>
              <div className="preview-card">Julia</div>
            </div>
            <button className="reveal-btn">Revelar cartas</button>
            <div className="voting-cards">
              <span>0</span>
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>5</span>
              <span>8</span>
              <span>13</span>
              <span>?</span>
              <span>☕</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="home-footer">
        <p>USADO POR TIMES DE</p>
        <div className="company-logos">
          <img src={microsoftLogo} alt="Microsoft" />
          <img src={googleLogo} alt="Google" />
          <img src={hpLogo} alt="HP" />
          <img src={deloitteLogo} alt="Deloitte" />
          <img src={figmaLogo} alt="Figma" />
        </div>
      </footer>

      {showRoomModal && (
        <div className="modal-overlay" onClick={() => setShowRoomModal(false)}>
          <div className="room-modal" onClick={e => e.stopPropagation()}>
            <h2>Entrar em uma Sala</h2>
            <input
              type="text"
              placeholder="Digite o ID da sala"
              value={roomId}
              onChange={(e) => {
                setRoomId(e.target.value);
                setError('');
              }}
              maxLength={6}
            />
            {error && <p className="error-message">{error}</p>}
            <div className="active-rooms">
              <h3>Salas Ativas</h3>
              <div className="rooms-list">
                {activeRooms.map(room => (
                  <div 
                    key={room.id} 
                    className="room-item"
                    onClick={() => {
                      setRoomId(room.id);
                      setError('');
                    }}
                  >
                    <span>Sala {room.id}</span>
                    <span>{room.participants} participantes</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-buttons">
              <button className="cancel-btn" onClick={() => setShowRoomModal(false)}>
                Cancelar
              </button>
              <button className="join-btn" onClick={handleJoinRoom}>
                Entrar na Sala
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateRoomModal && (
        <div className="modal-overlay" onClick={() => setShowCreateRoomModal(false)}>
          <div className="room-modal create-room-modal" onClick={e => e.stopPropagation()}>
            <h2>Nova Sala Criada</h2>
            <div className="room-info">
              <p>ID da Sala: <strong>{newRoomId}</strong></p>
              <button 
                className="copy-link-btn"
                onClick={handleCopyRoomLink}
              >
                <FaCopy /> {copySuccess ? 'Link Copiado!' : 'Copiar Link'}
              </button>
            </div>
            <p className="room-instructions">
              Compartilhe este link com sua equipe para que eles possam se juntar à sala.
            </p>
            <div className="modal-buttons">
              <button className="cancel-btn" onClick={() => setShowCreateRoomModal(false)}>
                Cancelar
              </button>
              <button className="join-btn" onClick={handleStartRoom}>
                Iniciar Sala
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage; 