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

// Configurações do ambiente
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Parse as origens permitidas do .env
const DEV_ORIGINS = process.env.REACT_APP_DEV_ORIGINS ? JSON.parse(process.env.REACT_APP_DEV_ORIGINS) : ["http://localhost:3000", "http://localhost:3002"];
const PROD_ORIGINS = process.env.REACT_APP_PROD_ORIGINS ? JSON.parse(process.env.REACT_APP_PROD_ORIGINS) : ["https://app.timeboard.site"];

// Seleciona as origens baseado no ambiente
const ALLOWED_ORIGINS = IS_PRODUCTION ? PROD_ORIGINS : DEV_ORIGINS;

// Define as URLs base baseado no ambiente
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || (IS_PRODUCTION ? 'https://api.timeboard.site' : 'http://192.168.0.127:3003');
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || (IS_PRODUCTION ? 'https://api.timeboard.site' : 'http://192.168.0.127:3003');

// Log detalhado das configurações
console.log('🔧 Configurações do ambiente:', {
  NODE_ENV: process.env.NODE_ENV,
  BACKEND_URL,
  SOCKET_URL,
  IS_PRODUCTION,
  ALLOWED_ORIGINS,
  SOCKET_PATH: process.env.REACT_APP_SOCKET_PATH
});

// Configurações do Socket.IO
const socketConfig = {
  path: process.env.REACT_APP_SOCKET_PATH || '/socket.io/',
  transports: ['polling', 'websocket'],
  secure: IS_PRODUCTION,
  rejectUnauthorized: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 3000,
  reconnectionDelayMax: 5000,
  timeout: 10000,
  autoConnect: false,
  withCredentials: false,
  forceNew: true,
  upgrade: true,
  rememberUpgrade: true,
  extraHeaders: {
    'Access-Control-Allow-Origin': '*'
  },
  transportOptions: {
    polling: {
      extraHeaders: {
        'Access-Control-Allow-Origin': '*'
      }
    }
  }
};

// Log das configurações do Socket.IO e ambiente
console.log('🌍 Ambiente:', process.env.NODE_ENV);
console.log('🔌 Socket.IO Config:', {
  ...socketConfig,
  url: SOCKET_URL,
  env: process.env.NODE_ENV,
  origins: ALLOWED_ORIGINS
});

// Inicializa o socket com debug
const socket = io(SOCKET_URL, socketConfig);

// Adiciona listeners de debug
socket.io.on("packet", ({ type, data }) => {
  console.log('📦 Socket.IO Packet:', { type, data });
});

socket.io.on("error", (error) => {
  console.error('❌ Socket.IO Error:', error);
});

// Função para garantir conexão do socket com retry e mais logs
const ensureSocketConnection = () => {
  return new Promise((resolve, reject) => {
    if (socket.connected) {
      console.log('✅ Socket já está conectado:', {
        id: socket.id,
        transport: socket.io?.engine?.transport?.name,
        url: socket.io?.uri
      });
      resolve(socket);
      return;
    }

    console.log('🔄 Tentando conectar ao servidor:', {
      url: SOCKET_URL,
      config: socketConfig
    });

    const timeout = setTimeout(() => {
      console.error('❌ Timeout ao tentar conectar:', {
        url: SOCKET_URL,
        state: socket.connected ? 'connected' : 'disconnected',
        readyState: socket.io?.engine?.readyState
      });
      socket.close();
      reject(new Error('Timeout ao conectar ao servidor'));
    }, socketConfig.timeout);

    socket.on('connect', () => {
      clearTimeout(timeout);
      console.log('✅ Socket conectado:', {
        id: socket.id,
        transport: socket.io?.engine?.transport?.name,
        url: socket.io?.uri,
        readyState: socket.io?.engine?.readyState
      });
      resolve(socket);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Erro de conexão:', {
        error,
        url: SOCKET_URL,
        state: socket.connected ? 'connected' : 'disconnected',
        readyState: socket.io?.engine?.readyState
      });
      clearTimeout(timeout);
      socket.close();
      reject(error);
    });

    socket.connect();
  });
};

const HomePage = () => {
  const navigate = useNavigate();
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [newRoomId, setNewRoomId] = useState('');
  const [activeRooms, setActiveRooms] = useState([]);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [isCheckingRoom, setIsCheckingRoom] = useState(false);
  const [isRoomActive, setIsRoomActive] = useState(false);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  useEffect(() => {
    localStorage.removeItem('currentRoom');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    
    console.log('🔄 Iniciando conexão com o servidor:', BACKEND_URL);
    
    // Iniciar conexão do socket
    ensureSocketConnection()
      .then(() => {
        console.log('✅ Conexão estabelecida com sucesso. ID do Socket:', socket.id);
      })
      .catch((error) => {
        console.error('❌ Erro na conexão inicial:', error);
        setError('Não foi possível conectar ao servidor. Tentando reconectar...');
      });

    socket.on('connect_error', (error) => {
      console.error('❌ Erro na conexão com o servidor:', error);
      setError('Não foi possível conectar ao servidor. Por favor, tente novamente.');
    });

    socket.on('error', (error) => {
      console.error('❌ Erro recebido do servidor:', error);
      setError(error.message);
    });

    socket.on('roomCreated', (data) => {
      console.log('✅ Nova sala criada:', data);
      if (data?.roomId) {
        setNewRoomId(data.roomId);
      } else {
        console.error('❌ Resposta inválida do servidor:', data);
        setError('Erro ao criar sala: resposta inválida do servidor');
        setShowCreateRoomModal(false);
      }
    });

    socket.on('activeRooms', (rooms) => {
      console.log('📋 Lista de salas ativas recebida:', rooms);
      setActiveRooms(rooms);
    });

    // Adicionar listener para todos os eventos
    socket.onAny((eventName, ...args) => {
      console.log('📡 Evento recebido:', eventName, args);
    });

    return () => {
      socket.off('connect');
      socket.off('connect_error');
      socket.off('error');
      socket.off('roomCreated');
      socket.off('activeRooms');
      socket.offAny();
    };
  }, []);

  // Adicionar log para monitorar mudanças no estado do modal
  useEffect(() => {
    console.log('Estado do modal atualizado:', { showCreateRoomModal });
    if (showCreateRoomModal) {
      setIsCreatingRoom(true);
      setError('');
      
      ensureSocketConnection()
        .then(() => {
          console.log('✅ Socket conectado, enviando requisição...');
          return new Promise((resolve, reject) => {
            socket.emit('createRoom', {
              roomName: 'Nova Sala',
              userName: 'Host'
            }, (response) => {
              if (response?.error) {
                reject(new Error(response.error));
                return;
              }
              resolve(response);
            });
          });
        })
        .then((response) => {
          console.log('✅ Sala criada com sucesso:', response);
          setNewRoomId(response.roomId);
          setIsCreatingRoom(false);
        })
        .catch((error) => {
          console.error('❌ Erro:', error);
          setError(error.message || 'Erro ao criar sala. Por favor, tente novamente.');
          setShowCreateRoomModal(false);
          setIsCreatingRoom(false);
        });
    }
  }, [showCreateRoomModal]);

  const handleCopyRoomLink = () => {
    console.log('📋 Copiando ID da sala:', newRoomId);
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(newRoomId)
        .then(() => {
          console.log('✅ ID copiado com sucesso');
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        })
        .catch((error) => {
          console.error('❌ Erro ao copiar ID:', error);
          fallbackCopyToClipboard(newRoomId);
        });
    } else {
      fallbackCopyToClipboard(newRoomId);
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
    console.log('🚀 Iniciando sala...', { newRoomId });
    if (!newRoomId) {
      console.error('❌ ID da sala não disponível');
      setError('Erro ao iniciar sala. ID não disponível.');
      return;
    }
    // Salvar o ID da sala no localStorage antes de navegar
    localStorage.setItem('currentRoom', newRoomId);
    navigate(`/login?roomId=${newRoomId}`);
  };

  const verifyRoomId = (id) => {
    if (!id.trim()) {
      setError('');
      setIsRoomActive(false);
      return;
    }

    setIsCheckingRoom(true);
    ensureSocketConnection()
      .then(() => {
        socket.emit('joinRoom', {
          roomId: id.trim(),
          userName: 'Verification'
        }, (response) => {
          setIsCheckingRoom(false);
          if (response?.error) {
            setError(response.error);
            setIsRoomActive(false);
          } else {
            setError('');
            setIsRoomActive(true);
            // Leave the room after verification
            socket.emit('leaveRoom', {
              roomId: id.trim(),
              userName: 'Verification'
            });
          }
        });
      })
      .catch((error) => {
        setIsCheckingRoom(false);
        setError('Erro ao verificar sala: ' + error.message);
        setIsRoomActive(false);
      });
  };

  const handleJoinRoom = () => {
    if (!roomId.trim()) {
      setError('Por favor, insira o ID da sala');
      return;
    }

    if (error) {
      return;
    }

    if (!isRoomActive) {
      setError('A sala não está ativa. Por favor, verifique o ID.');
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
          <button className="start-game-btn" onClick={() => navigate('/dashboard')}>
            Trello
          </button>
        </nav>
      </header>

      <main className="home-main">
        <div className="main-content">
          <h1>Scrum Poker para<br />times ágeis</h1>
          <p>Estimativas fáceis e divertidas.</p>
          <div className="room-buttons">
            <button 
              className="start-game-btn large" 
              onClick={() => {
                console.log('Botão Criar Nova Sala clicado');
                setShowCreateRoomModal(true);
              }}
            >
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
                const newRoomId = e.target.value;
                setRoomId(newRoomId);
                verifyRoomId(newRoomId);
              }}
              maxLength={6}
            />
            {error && <p className="error-message">{error}</p>}
            {isCheckingRoom && <p className="checking-message">Verificando sala...</p>}
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
                      setIsRoomActive(true);
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
              <button 
                className="join-btn" 
                onClick={handleJoinRoom}
                disabled={!isRoomActive}
                style={{ 
                  opacity: isRoomActive ? 1 : 0.5,
                  cursor: isRoomActive ? 'pointer' : 'not-allowed'
                }}
              >
                Entrar na Sala
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateRoomModal && (
        <div className="modal-overlay" onClick={() => {
          if (!isCreatingRoom) {
            console.log('Modal overlay clicado - fechando modal');
            setShowCreateRoomModal(false);
          }
        }}>
          <div className="room-modal create-room-modal" onClick={e => {
            console.log('Modal clicado - prevenindo propagação');
            e.stopPropagation();
          }}>
            <h2>Nova Sala Criada</h2>
            <div className="room-info">
              <p>ID da Sala: <strong>{isCreatingRoom ? 'Criando sala...' : (newRoomId || 'Erro')}</strong></p>
              <button 
                className="copy-link-btn"
                onClick={handleCopyRoomLink}
                disabled={!newRoomId || isCreatingRoom}
              >
                <FaCopy /> {copySuccess ? 'ID Copiado!' : 'Copiar ID'}
              </button>
            </div>
            <p className="room-instructions">
              {isCreatingRoom ? 'Criando sua sala...' : 'Compartilhe o ID da sala com sua equipe para que eles possam se juntar à votação.'}
            </p>
            <div className="modal-buttons">
              <button 
                className="cancel-btn" 
                onClick={() => {
                  console.log('Botão Cancelar clicado');
                  setShowCreateRoomModal(false);
                }}
                disabled={isCreatingRoom}
              >
                Cancelar
              </button>
              <button 
                className="join-btn" 
                onClick={handleStartRoom}
                disabled={!newRoomId || isCreatingRoom}
                style={{ 
                  opacity: (newRoomId && !isCreatingRoom) ? 1 : 0.5,
                  cursor: (newRoomId && !isCreatingRoom) ? 'pointer' : 'not-allowed'
                }}
              >
                {isCreatingRoom ? 'Criando...' : 'Iniciar Sala'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage; 