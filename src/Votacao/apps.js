import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaWhatsapp, FaTelegramPlane, FaSignOutAlt, FaCopy, FaEnvelope, FaChevronRight, FaChevronLeft, FaUsers, FaBars, FaShare, FaComments, FaMinus, FaExpand, FaTasks, FaCheckCircle, FaTrello } from 'react-icons/fa';
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

// Função para obter token de autenticação
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

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
  upgradeTimeout: parseInt(process.env.REACT_APP_SOCKET_UPGRADE_TIMEOUT) || 10000,
  auth: {
    token: getAuthToken()
  }
};

// Log das configurações do Socket.IO
console.log('🔌 Configurações do Socket.IO (Votação):', socketConfig);
console.log('🔑 Token de autenticação:', getAuthToken() ? 'Presente' : 'Ausente');

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
      if (data.user) {
        console.log('👤 Usuário autenticado no Socket.IO:', data.user);
      }
    });

    socket.once('auth_error', (data) => {
      console.error('❌ Erro de autenticação no Socket.IO:', data);
      clearTimeout(timeout);
      reject(new Error('Erro de autenticação: ' + data.message));
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
  const [showSprintModal, setShowSprintModal] = useState(false);
  const [sprintTasks, setSprintTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [sprintName, setSprintName] = useState('Sprint Atual');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    console.log('🔄 Votacao useEffect executado para roomId:', roomId);
    
    const storedUserName = localStorage.getItem('userName');
    const storedUserRole = localStorage.getItem('userRole');
    const storedUserData = localStorage.getItem('userData');
    const storedUserAvatar = localStorage.getItem('userAvatar');
    let avatarUrl = '';
    let userNameFromAuth = '';
    let userRoleFromAuth = '';
    
    // Primeiro, tentar obter dados do sistema de autenticação
    if (storedUserData) {
      try {
        const userData = JSON.parse(storedUserData);
        userNameFromAuth = userData.name;
        userRoleFromAuth = userData.role || 'collaborator';
        // Priorizar avatar selecionado pelo usuário, senão usar do authService
        avatarUrl = storedUserAvatar || userData.avatar_url || userData.avatar;
        setUserAvatar(avatarUrl);
        console.log('👤 Dados do usuário obtidos do authService:', userData);
        console.log('🎭 Avatar selecionado pelo usuário:', storedUserAvatar);
      } catch (e) {
        console.error('Erro ao carregar dados do usuário:', e);
      }
    }
    
    // Usar dados do authService se disponíveis, senão usar dados do localStorage
    const finalUserName = userNameFromAuth || storedUserName;
    const finalUserRole = userRoleFromAuth || storedUserRole;
    
    console.log('🔍 Verificação de dados:', {
      storedUserName,
      storedUserRole,
      userNameFromAuth,
      userRoleFromAuth,
      finalUserName,
      finalUserRole,
      roomId,
      avatarUrl
    });
    
    if (!finalUserName || !roomId) {
      console.log('❌ Dados insuficientes, redirecionando para home');
      navigate('/');
      return;
    }

    setUserName(finalUserName);
    setUserRole(finalUserRole);

    // Iniciar conexão do socket
    ensureSocketConnection()
      .then(() => {
        console.log('✅ Socket conectado. ID:', socket.id);
        console.log('🚀 Emitindo joinRoom com dados:', {
          roomId,
          userName: finalUserName,
          userRole: finalUserRole,
          avatar: avatarUrl
        });
        socket.emit('joinRoom', {
          roomId,
          userName: finalUserName,
          userRole: finalUserRole,
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
      console.log('👤 Dados recebidos:', {
        users: data.users,
        isRevealed: data.isRevealed,
        messages: data.messages,
        timestamp: new Date().toISOString()
      });
      setUsers(data.users);
      if (data.isRevealed) {
        setVotesRevealed(true);
        setRevealedVotesData(data.votes || {});
      }
    });

    socket.on('connect', () => {
      console.log('✅ Socket conectado na votação:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket desconectado na votação');
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Erro de conexão na votação:', error);
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
    console.log('🎴 Tentando votar:', { value, votesRevealed, roomId, userName });
    
    if (!votesRevealed) {
      ensureSocketConnection()
        .then(() => {
          console.log('✅ Socket conectado para votar, emitindo voto:', { 
            roomId,
            userName: userName,
            vote: value
          });
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
    } else {
      console.log('⚠️ Votação já revelada, não é possível votar');
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

  const handleSprintClick = () => {
    console.log('📋 Abrindo modal do Sprint');
    setShowSprintModal(true);
    // Simular carregamento de tarefas do sprint
    loadSprintTasks();
  };

  const loadSprintTasks = () => {
    // Simular tarefas do sprint (em produção, viria da API)
    const mockTasks = [
      { 
        id: 1, 
        title: 'Implementar autenticação JWT', 
        description: 'Criar sistema de login seguro com tokens JWT e refresh tokens', 
        priority: 'Alta', 
        status: 'Em Progresso',
        estimated_hours: 8,
        actual_hours: 5,
        assignee: 'João Silva',
        created_at: '2024-01-10',
        due_date: '2024-01-15'
      },
      { 
        id: 2, 
        title: 'Criar dashboard de usuários', 
        description: 'Interface para gerenciar usuários com filtros e busca avançada', 
        priority: 'Média', 
        status: 'Pendente',
        estimated_hours: 12,
        actual_hours: 0,
        assignee: 'Maria Santos',
        created_at: '2024-01-12',
        due_date: '2024-01-20'
      },
      { 
        id: 3, 
        title: 'Configurar banco de dados PostgreSQL', 
        description: 'Setup inicial do PostgreSQL com todas as tabelas e relacionamentos', 
        priority: 'Alta', 
        status: 'Concluído',
        estimated_hours: 6,
        actual_hours: 6,
        assignee: 'Pedro Costa',
        created_at: '2024-01-08',
        due_date: '2024-01-12'
      },
      { 
        id: 4, 
        title: 'Implementar testes unitários', 
        description: 'Cobertura de testes para todas as APIs principais', 
        priority: 'Baixa', 
        status: 'Pendente',
        estimated_hours: 16,
        actual_hours: 0,
        assignee: 'Ana Lima',
        created_at: '2024-01-14',
        due_date: '2024-01-25'
      },
      { 
        id: 5, 
        title: 'Documentar API com Swagger', 
        description: 'Criar documentação completa da API com exemplos de uso', 
        priority: 'Média', 
        status: 'Em Progresso',
        estimated_hours: 4,
        actual_hours: 2,
        assignee: 'Carlos Oliveira',
        created_at: '2024-01-13',
        due_date: '2024-01-18'
      },
      { 
        id: 6, 
        title: 'Implementar sistema de notificações', 
        description: 'Push notifications para mobile e email notifications', 
        priority: 'Média', 
        status: 'Pendente',
        estimated_hours: 10,
        actual_hours: 0,
        assignee: 'Fernanda Rocha',
        created_at: '2024-01-15',
        due_date: '2024-01-22'
      },
      { 
        id: 7, 
        title: 'Otimizar performance do frontend', 
        description: 'Implementar lazy loading e code splitting', 
        priority: 'Baixa', 
        status: 'Pendente',
        estimated_hours: 8,
        actual_hours: 0,
        assignee: 'Roberto Alves',
        created_at: '2024-01-16',
        due_date: '2024-01-28'
      },
      { 
        id: 8, 
        title: 'Implementar sistema de backup', 
        description: 'Backup automático do banco de dados com retenção de 30 dias', 
        priority: 'Alta', 
        status: 'Em Progresso',
        estimated_hours: 6,
        actual_hours: 3,
        assignee: 'Lucas Ferreira',
        created_at: '2024-01-11',
        due_date: '2024-01-17'
      }
    ];
    
    setSprintTasks(mockTasks);
    console.log('📋 Tarefas do sprint carregadas (MOCK):', mockTasks);
  };

  const handleTaskSelect = (task) => {
    console.log('📋 Tarefa selecionada:', task);
    setSelectedTask(task);
    setShowSprintModal(false);
  };

  const handleCloseSprintModal = () => {
    setShowSprintModal(false);
  };

  const handleTrelloRedirect = () => {
    console.log('🔗 Redirecionando para Trello');
    
    // Obter dados do usuário logado
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        console.log('👤 Usuário logado:', user);
        
        // Construir URL do Trello baseado no usuário
        const trelloUrl = `/trello?userId=${user.id}&userName=${encodeURIComponent(user.name)}&userEmail=${encodeURIComponent(user.email)}`;
        
        console.log('🔗 URL do Trello:', trelloUrl);
        
        // Redirecionar para a tela do Trello
        navigate(trelloUrl);
        
      } catch (error) {
        console.error('❌ Erro ao obter dados do usuário:', error);
        // Fallback: redirecionar para Trello sem dados específicos
        navigate('/trello');
      }
    } else {
      console.log('❌ Usuário não logado, redirecionando para login');
      navigate('/login');
    }
  };

  const handleSendMessage = (message) => {
    console.log('💬 Tentando enviar mensagem:', { message, socket: !!socket, roomId, userName });
    
    if (!socket || !roomId || !message.trim()) {
      console.log('❌ Dados insuficientes para enviar mensagem:', { socket: !!socket, roomId, message: message.trim() });
      return;
    }
    
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
    
    console.log('💬 Enviando mensagem:', messageData);
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

          <button onClick={handleSprintClick} className="menu-sprint">
            <div className="sprint-icon">
              <FaTasks />
            </div>
            <span className="sprint-text">Sprint</span>
          </button>

          <button onClick={handleTrelloRedirect} className="menu-trello">
            <div className="trello-icon">
              <FaTrello />
            </div>
            <span className="trello-text">Trello</span>
          </button>

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
        {/* Exibição da tarefa selecionada */}
        {selectedTask && (
          <div className="selected-task-display">
            <div className="task-header">
              <FaCheckCircle className="task-icon" />
              <h3>Tarefa Selecionada</h3>
            </div>
            <div className="task-content">
              <h4>{selectedTask.title}</h4>
              <p>{selectedTask.description}</p>
              <div className="task-meta">
                <span className={`priority priority-${selectedTask.priority.toLowerCase()}`}>
                  {selectedTask.priority}
                </span>
                <span className={`status status-${selectedTask.status.toLowerCase().replace(' ', '-')}`}>
                  {selectedTask.status}
                </span>
              </div>
            </div>
          </div>
        )}

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

        {showSprintModal && (
          <div className="modal-overlay" onClick={handleCloseSprintModal}>
            <div className="sprint-modal" onClick={e => e.stopPropagation()}>
              <button className="close-modal" onClick={handleCloseSprintModal}>×</button>
              <h2>{sprintName}</h2>
              
              {sprintTasks.length > 0 ? (
                <div className="sprint-tasks">
                  <h3>Tarefas do Sprint ({sprintTasks.length})</h3>
                  <div className="tasks-list">
                    {sprintTasks.map((task) => (
                      <div 
                        key={task.id} 
                        className="task-item"
                        onClick={() => handleTaskSelect(task)}
                      >
                        <div className="task-info">
                          <h4>{task.title}</h4>
                          <p>{task.description}</p>
                        </div>
                        <div className="task-meta">
                          <span className={`priority priority-${task.priority.toLowerCase()}`}>
                            {task.priority}
                          </span>
                          <span className={`status status-${task.status.toLowerCase().replace(' ', '-')}`}>
                            {task.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="empty-sprint">
                  <FaTasks className="empty-icon" />
                  <h3>Sprint Vazio</h3>
                  <p>Não há tarefas neste sprint ainda.</p>
                  <p>Adicione tarefas ao sprint para começar a votação.</p>
                </div>
              )}
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