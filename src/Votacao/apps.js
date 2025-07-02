import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaWhatsapp, FaTelegramPlane, FaSignOutAlt, FaCopy, FaEnvelope, FaChevronRight, FaChevronLeft, FaUsers, FaBars, FaShare, FaComments, FaMinus, FaExpand } from 'react-icons/fa';
import io from 'socket.io-client';
import './style.css';

// Configurações do ambiente
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Validação das variáveis de ambiente
if (!SOCKET_URL) {
  throw new Error('REACT_APP_SOCKET_URL não está definida no arquivo .env');
}

// Log detalhado das configurações
console.log('🔧 Configurações do ambiente (Votação):', {
  NODE_ENV: process.env.NODE_ENV,
  SOCKET_URL,
  IS_PRODUCTION,
  SOCKET_PATH: process.env.REACT_APP_SOCKET_PATH,
  DEV_ORIGINS: process.env.REACT_APP_DEV_ORIGINS,
  PROD_ORIGINS: process.env.REACT_APP_PROD_ORIGINS
});

// Configurações do Socket.IO
const socketConfig = {
  path: process.env.REACT_APP_SOCKET_PATH || '/socket.io/',
  transports: IS_PRODUCTION ? ['polling', 'websocket'] : ['websocket', 'polling'],
  secure: IS_PRODUCTION,
  rejectUnauthorized: false,
  reconnection: true,
  reconnectionAttempts: parseInt(process.env.REACT_APP_SOCKET_RECONNECTION_ATTEMPTS) || 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: parseInt(process.env.REACT_APP_SOCKET_TIMEOUT) || 45000,
  autoConnect: false,
  withCredentials: true,
  upgrade: true,
  pingTimeout: parseInt(process.env.REACT_APP_SOCKET_PING_TIMEOUT) || 60000,
  pingInterval: parseInt(process.env.REACT_APP_SOCKET_PING_INTERVAL) || 25000,
  upgradeTimeout: parseInt(process.env.REACT_APP_SOCKET_UPGRADE_TIMEOUT) || 10000
};

// Log das configurações do Socket.IO
console.log('🔌 Configurações do Socket.IO (Votação):', socketConfig);

const socket = io(SOCKET_URL, socketConfig);

// Função para garantir conexão do socket
const ensureSocketConnection = () => {
  return new Promise((resolve, reject) => {
    if (socket.connected) {
      console.log('✅ Socket já está conectado (Votação):', {
        id: socket.id,
        transport: socket.io.engine?.transport?.name
      });
      resolve(socket);
      return;
    }

    console.log('🔄 Tentando conectar ao servidor (Votação):', SOCKET_URL);

    const timeout = setTimeout(() => {
      console.error('❌ Timeout ao tentar conectar');
      reject(new Error('Timeout ao conectar ao servidor'));
    }, socketConfig.timeout);

    socket.connect();

    socket.once('connect', () => {
      clearTimeout(timeout);
      console.log('✅ Socket conectado (Votação):', {
        id: socket.id,
        transport: socket.io.engine?.transport?.name
      });
      resolve(socket);
    });

    socket.once('connected', (data) => {
      console.log('✅ Conexão confirmada pelo servidor (Votação):', data);
    });

    socket.once('connect_error', (error) => {
      clearTimeout(timeout);
      console.error('❌ Erro de conexão (Votação):', error);
      reject(error);
    });
  });
};

const Votacao = () => {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [selectedCard, setSelectedCard] = useState(null);
  const [users, setUsers] = useState([]);
  const [votesRevealed, setVotesRevealed] = useState(false);
  const [revealedVotesData, setRevealedVotesData] = useState({});
  const [averageVote, setAverageVote] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [userAvatar, setUserAvatar] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [participantsListExpanded, setParticipantsListExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const storedUserName = localStorage.getItem('userName');
    const storedUserRole = localStorage.getItem('userRole');
    const storedUserData = localStorage.getItem('userData');
    let avatarUrl = '';
    
    if (storedUserData) {
      try {
        const userData = JSON.parse(storedUserData);
        avatarUrl = userData.avatar;
        setUserAvatar(avatarUrl);
      } catch (e) {
        console.error('Erro ao carregar dados do usuário:', e);
      }
    }
    
    if (!storedUserName || !roomId) {
      navigate('/');
      return;
    }

    setUserName(storedUserName);
    setUserRole(storedUserRole);

    // Iniciar conexão do socket
    ensureSocketConnection()
      .then(() => {
        console.log('✅ Socket conectado. ID:', socket.id);
        socket.emit('joinRoom', {
          roomId,
          userName: storedUserName,
          userRole: storedUserRole,
          avatar: avatarUrl
        });
      })
      .catch((error) => {
        console.error('❌ Erro na conexão:', error);
        alert('Erro ao conectar com o servidor. Por favor, recarregue a página.');
      });

    socket.on('updateUsers', (userList) => {
      console.log('👥 Lista de usuários atualizada:', userList);
      setUsers(userList);
    });

    socket.on('userJoined', (data) => {
      console.log('👤 Usuário entrou:', data);
      setUsers(data.users);
      if (data.isRevealed) {
        setVotesRevealed(true);
        setRevealedVotesData(data.votes || {});
      }
    });

    socket.on('votesRevealed', (data) => {
      console.log('👀 Votos revelados - dados brutos:', data);
      setVotesRevealed(true);
      setShowResults(true);
      const votesMap = {};
      let sum = 0;
      let count = 0;
      
      data.votes.forEach(vote => {
        console.log('Processando voto:', vote);
        if (vote.vote) {
          votesMap[vote.userName] = vote.vote;
          sum += Number(vote.vote);
          count++;
        }
      });
      
      const calculatedAverage = count > 0 ? (sum / count).toFixed(1) : '0.0';
      console.log('Média calculada:', calculatedAverage);
      
      setRevealedVotesData(votesMap);
      setAverageVote(calculatedAverage);
    });

    socket.on('votingReset', (data) => {
      console.log('🔄 Votos resetados:', data);
      setSelectedCard(null);
      setVotesRevealed(false);
      setRevealedVotesData({});
      setAverageVote(null);
      setShowResults(false);
      setUsers(prevUsers => {
        return prevUsers.map(user => ({
          ...user,
          hasVoted: false
        }));
      });
    });

    socket.on('error', (error) => {
      console.error('❌ Erro:', error);
      alert(error.message);
    });

    socket.on('newVote', (data) => {
      console.log('👤 Novo voto:', data);
      if (data.userName) {
        setUsers(prevUsers => {
          return prevUsers.map(user => {
            if (user.name.toLowerCase() === data.userName.toLowerCase()) {
              return { ...user, hasVoted: true };
            }
            return user;
          });
        });
      }
    });

    socket.on('newChatMessage', (message) => {
      setMessages(prev => [...prev, message]);
    });

    socket.on('chatHistory', (history) => {
      setMessages(history);
    });

    const timeInterval = setInterval(() => {
      // setCurrentTime(new Date());
    }, 1000);

    return () => {
      socket.emit('leaveRoom', roomId);
      socket.disconnect();
      clearInterval(timeInterval);
      socket.off('newChatMessage');
      socket.off('chatHistory');
    };
  }, [roomId, navigate]);

  const handleSelectVote = (value) => {
    if (!votesRevealed) {
      ensureSocketConnection()
        .then(() => {
          setSelectedCard(value);
          socket.emit('vote', { 
            roomId,
            userName: userName,
            vote: value
          });
        })
        .catch((error) => {
          console.error('❌ Erro ao enviar voto:', error);
          alert('Erro ao enviar voto. Por favor, tente novamente.');
        });
    }
  };

  const handleRevealVotes = () => {
    if (!socket || !roomId) return;
    socket.emit('revealVotes', roomId);
  };

  const handleResetVoting = () => {
    if (!socket || !roomId) return;
    socket.emit('resetVoting', roomId);
  };

  const handleLogout = () => {
    ensureSocketConnection()
      .then(() => {
        socket.emit('leaveRoom', {
          roomId: roomId,
          userName: userName
        });
        localStorage.removeItem('userName');
        localStorage.removeItem('userRole');
        localStorage.removeItem('currentRoom');
        localStorage.removeItem('userData');
        navigate('/');
      })
      .catch((error) => {
        console.error('❌ Erro ao sair da sala:', error);
        // Mesmo com erro, vamos limpar os dados e redirecionar
        localStorage.removeItem('userName');
        localStorage.removeItem('userRole');
        localStorage.removeItem('currentRoom');
        localStorage.removeItem('userData');
        navigate('/');
      });
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/login?roomId=${roomId}`;
    console.log('📋 Copiando link da sala:', url);
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url)
        .then(() => {
          console.log('✅ Link copiado com sucesso');
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        })
        .catch((error) => {
          console.error('❌ Erro ao copiar link:', error);
          fallbackCopyToClipboard(url);
        });
    } else {
      fallbackCopyToClipboard(url);
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

  const handleShareModal = () => {
    setShowShareModal(true);
  };

  const handleCloseShareModal = () => {
    setShowShareModal(false);
  };

  const handleCloseResults = () => {
    setShowResults(false);
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent('Entre na votação');
    const body = encodeURIComponent(`Entre na votação: ${window.location.origin}/login?roomId=${roomId}`);
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`;
    window.open(gmailUrl, '_blank');
  };

  const toggleParticipantsList = () => {
    setParticipantsListExpanded(!participantsListExpanded);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSendMessage = (message) => {
    if (!socket || !roomId || !message.trim()) return;
    
    // Encontra o avatar do usuário atual na lista de jogadores
    const currentUser = users.find(user => user.name === userName);
    const userAvatar = currentUser ? currentUser.avatar : `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`;
    
    const messageData = {
      roomId,
      userName,
      message: message.trim(),
      avatar: userAvatar,
      timestamp: new Date()
    };
    
    socket.emit('chatMessage', messageData);
  };

  const ChatComponent = () => {
    const [newMessage, setNewMessage] = useState('');
  
    const handleSubmit = (e) => {
      e.preventDefault();
      if (newMessage.trim()) {
        handleSendMessage(newMessage);
        setNewMessage('');
      }
    };
  
    return (
      <div className={`chat-area ${isChatMinimized ? 'chat-minimized' : ''}`}>
        <div className="chat-header">
          <h3><FaComments /> Chat da Sala</h3>
          <button 
            className="chat-toggle"
            onClick={() => setIsChatMinimized(!isChatMinimized)}
          >
            {isChatMinimized ? <FaExpand /> : <FaMinus />}
          </button>
        </div>
        
        <div className="messages-container">
          {messages.map((msg, index) => {
            // Encontra o avatar do usuário da mensagem na lista de jogadores
            const messageUser = users.find(user => user.name === msg.userName);
            const messageAvatar = messageUser ? messageUser.avatar : `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.userName}`;
            
            return (
              <div 
                key={index}
                className={`message ${msg.userName === userName ? 'mine' : ''}`}
              >
                <img 
                  src={messageAvatar}
                  alt={msg.userName}
                  className="message-avatar"
                />
                <div className="message-content">
                  <div className="message-header">
                    <span className="message-user">{msg.userName}</span>
                    <span className="message-time">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="message-text">{msg.message}</div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
        
        <form onSubmit={handleSubmit} className="message-input">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
          />
          <button type="submit">Enviar</button>
        </form>
      </div>
    );
  };

  const renderVerticalMenu = () => {
    const filteredUsers = users.filter(user => user.name !== 'Host');
    
    return (
      <>
        <div className={`vertical-menu ${isMobileMenuOpen ? 'mobile-expanded' : ''}`}>
          <div className="menu-user-info">
            <img
              src={userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`}
              alt={userName}
              className="user-avatar"
            />
            <div className="user-details">
              <h3>{userName}</h3>
              <p>{userRole === 'moderator' ? 'Moderador' : 'Participante'}</p>
            </div>
          </div>

          <div className="participants-counter" onClick={toggleParticipantsList}>
            <div className="counter-icon">
              <FaUsers />
            </div>
            <div className="counter-details">
              <h3>Participantes</h3>
              <p>{filteredUsers.length} online</p>
            </div>
          </div>

          <div className={`participants-list ${participantsListExpanded ? 'expanded' : ''}`}>
            {filteredUsers.map((user, index) => (
              user.name && (
                <div key={user.id || index} className="participant-item">
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                    alt={user.name}
                    className="participant-avatar"
                  />
                  <span className="participant-name">{user.name}</span>
                </div>
              )
            ))}
          </div>

          <button onClick={handleShareModal} className="menu-share">
            <div className="share-icon">
              <FaShare />
            </div>
            <span className="share-text">Compartilhar Sala</span>
          </button>

          <button onClick={handleLogout} className="menu-logout">
            <div className="logout-icon">
              <FaSignOutAlt />
            </div>
            <span className="logout-text">Sair da Sala</span>
          </button>
        </div>
        <div className={`menu-overlay ${isMobileMenuOpen ? 'show' : ''}`} onClick={() => setIsMobileMenuOpen(false)} />
      </>
    );
  };

  return (
    <div className="Votacao">
      {renderVerticalMenu()}
      <button className="fab-menu-button" onClick={toggleMobileMenu}>
        <FaBars />
      </button>
      <div className="container">
        <div className="voting-area">
          <div className={`table-circle ${users.filter(user => user.name !== 'Host').length > 6 ? 'square-table' : ''}`}>
            {users.filter(user => user.name !== 'Host').map((user, index) => (
              user.name && (
                <div 
                  key={user.id || index} 
                  className="player-slot"
                >
                  <img 
                    src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                    alt={user.name} 
                    className="player-avatar"
                  />
                  <div className={`player-card ${!votesRevealed ? 'face-down' : ''} ${
                    (user.name === userName && selectedCard) || user.hasVoted ? 'selected' : ''
                  } ${votesRevealed ? 'revealing' : ''}`}>
                    {votesRevealed ? revealedVotesData[user.name] || '?' : '?'}
                  </div>
                  <span className="player-name">{user.name}</span>
                </div>
              )
            ))}
            
            <button
              onClick={votesRevealed ? handleResetVoting : handleRevealVotes}
              className="reveal-button"
            >
              {votesRevealed ? 'Nova Votação' : 'Revelar Cartas'}
            </button>
          </div>
        </div>
        <div className="vote-cards-container">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((value) => (
            <div
              key={value}
              className={`vote-card ${selectedCard === value ? 'selected' : ''} ${votesRevealed ? 'disabled' : ''}`}
              onClick={() => handleSelectVote(value)}
            >
              {value}
            </div>
          ))}
        </div>

        {votesRevealed && revealedVotesData && Object.keys(revealedVotesData).length > 0 && showResults && (
          <div className={`results-modal ${showResults ? 'show' : ''}`} onClick={handleCloseResults}>
            <div className="results-content" onClick={e => e.stopPropagation()}>
              <button className="close-results" onClick={handleCloseResults}>×</button>
              <h2>Resultado da Votação</h2>
              <div className="average-vote">
                <span className="label">Média:</span>
                <span className="value">{averageVote}</span>
              </div>
            </div>
          </div>
        )}

        {showShareModal && (
          <div className="modal-overlay" onClick={handleCloseShareModal}>
            <div className="share-modal" onClick={e => e.stopPropagation()}>
              <button className="close-modal" onClick={handleCloseShareModal}>×</button>
              <h2>Compartilhar Sala</h2>
              <div className="share-options">
                <button 
                  className="share-button whatsapp"
                  onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Entre na votação: ${window.location.origin}/login?roomId=${roomId}`)}`, '_blank')}
                >
                  <FaWhatsapp /> WhatsApp
                </button>
                <button 
                  className="share-button telegram"
                  onClick={() => window.open(`https://t.me/share/url?url=${encodeURIComponent(`${window.location.origin}/login?roomId=${roomId}`)}&text=${encodeURIComponent('Entre na votação')}`, '_blank')}
                >
                  <FaTelegramPlane /> Telegram
                </button>
                <button 
                  className="share-button email"
                  onClick={handleEmailShare}
                >
                  <FaEnvelope /> Email
                </button>
                <button 
                  className="share-button copy"
                  onClick={handleCopyLink}
                >
                  <FaCopy /> {copySuccess ? 'Copiado!' : 'Copiar Link'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <ChatComponent />
    </div>
  );
};

export default Votacao;