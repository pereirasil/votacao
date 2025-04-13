import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaWhatsapp, FaTelegramPlane, FaSignOutAlt, FaCopy } from 'react-icons/fa';
import io from 'socket.io-client';
import './style.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://192.168.0.127:3001';

const socket = io(BACKEND_URL, {
  transports: ['websocket'],
  reconnectionAttempts: 5,
  reconnection: true,
  reconnectionDelay: 1000,
});

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
  const [votesStatus, setVotesStatus] = useState({});
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showResults, setShowResults] = useState(false);
  const [userAvatar, setUserAvatar] = useState(null);

  useEffect(() => {
    if (votesRevealed) {
      setShowResults(true);
    }
  }, [votesRevealed]);

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

    socket.disconnect();
    socket.connect();

    socket.on('connect', () => {
      console.log('✅ Socket conectado. ID:', socket.id);
      socket.emit('joinRoom', {
        roomId,
        userName: storedUserName,
        userRole: storedUserRole,
        avatar: avatarUrl
      });
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
    });

    socket.on('error', (error) => {
      console.error('❌ Erro:', error);
      alert(error.message);
    });

    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      socket.emit('leaveRoom', roomId);
      socket.disconnect();
      clearInterval(timeInterval);
    };
  }, [roomId, navigate]);

  const handleSelectVote = (value) => {
      setSelectedCard(value);
    socket.emit('vote', { 
      roomId,
      userName,
      vote: value
    });
  };

  const handleRevealVotes = () => {
    socket.emit('revealVotes', roomId);
  };

  const handleResetVoting = () => {
    socket.emit('resetVoting', roomId);
    setSelectedCard(null);
    setVotesRevealed(false);
    setRevealedVotesData({});
    setAverageVote(null);
  };

  const handleLogout = () => {
    socket.emit('leaveRoom', {
      roomId: roomId,
      userName: userName
    });
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('currentRoom');
    localStorage.removeItem('userData');
    navigate('/');
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/login?roomId=${roomId}`;
    navigator.clipboard.writeText(url)
      .then(() => alert('Link copiado com sucesso!'))
      .catch(() => alert('Erro ao copiar o link.'));
  };

  const handleCloseResults = () => {
    setShowResults(false);
  };

  const renderVoteResults = () => {
    if (!votesRevealed) return null;

    // Group votes by value
    const voteGroups = {};
    let totalVotes = 0;
    let sum = 0;

    Object.entries(revealedVotesData).forEach(([userId, vote]) => {
      if (vote) {
        const voteValue = vote.toString();
        voteGroups[voteValue] = voteGroups[voteValue] || [];
        voteGroups[voteValue].push(userId);
        totalVotes++;
        sum += parseFloat(vote);
      }
    });

    const average = totalVotes > 0 ? (sum / totalVotes).toFixed(1) : 0;

      return (
      <div className="vote-results">
        <div className="average-vote">
          Média dos votos: {average}
        </div>
        <div className="vote-distribution">
          {Object.entries(voteGroups)
            .sort(([a], [b]) => parseFloat(a) - parseFloat(b))
            .map(([value, users]) => {
              const percentage = ((users.length / totalVotes) * 100).toFixed(1);
      return (
                <div key={value} className="vote-group">
                  <span className="vote-value">{value}</span>
                  <span className="vote-percentage">{percentage}%</span>
                  <div className="vote-users">
                    {users.map(userId => {
                      const user = users.find(u => u.id === userId);
                      return user ? (
                        <img
                          key={userId}
                          src={user.avatar}
                          alt={user.username}
                          title={user.username}
                          className="user-avatar"
                        />
                      ) : null;
                    })}
                </div>
              </div>
            );
          })}
        </div>
        </div>
      );
  };

  const renderParticipants = () => {
    return (
      <div className="participants">
        <h2>Participantes ({Object.keys(users).length})</h2>
        <div className="users-list">
          {Object.entries(users).map(([userId, user]) => (
            <div key={userId} className="user-item">
              <img
                src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                alt={user.username}
                className="user-avatar"
              />
              <span>{user.username}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="Votacao">
      <div className="container">
        <div className="header">
          <div className="user-profile">
            {userAvatar && (
              <img 
                src={userAvatar} 
                alt={userName} 
                className="user-avatar"
              />
            )}
            <div className="user-details">
              <h2>{userName}</h2>
              <p>Função: {userRole === 'moderator' ? 'Moderador' : 'Participante'}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-button">
            <FaSignOutAlt /> Sair
          </button>
        </div>

        {renderParticipants()}

        <div className="voting-area">
          <div className="table-circle">
            {users.map((user, index) => (
              <div 
                key={user.id || index} 
                className="player-slot"
              >
                <img 
                  src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                  alt={user.name} 
                  className="player-avatar"
                />
                <div className={`player-card ${!votesRevealed ? 'face-down' : ''}`}>
                  {votesRevealed ? revealedVotesData[user.name] || '?' : '?'}
          </div>
                <span className="player-name">{user.name}</span>
            </div>
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
                className={`vote-card ${selectedCard === value ? 'selected' : ''}`}
                onClick={() => !votesRevealed && handleSelectVote(value)}
              >
                {value}
              </div>
            ))}
          </div>

          {votesRevealed && revealedVotesData && Object.keys(revealedVotesData).length > 0 && showResults && (
            <div className="results-modal" onClick={handleCloseResults}>
              <div className="results-content" onClick={e => e.stopPropagation()}>
                <button className="close-results" onClick={handleCloseResults}>×</button>
                <h2>Resultado da Votação</h2>
                <div className="results-summary">
                  <div className="average-vote">
                    <span className="label">Média:</span>
                    <span className="value">{averageVote}</span>
                  </div>
                  <div className="votes-breakdown">
                    {Object.entries(revealedVotesData || {}).map(([name, vote]) => (
                      <div key={name} className="vote-item">
                        <span className="voter-name">{name}:</span>
                        <span className="voter-vote">{vote}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="share-container">
          <button onClick={handleCopyLink} className="share-button">
            <FaCopy /> Copiar Link
            </button>
            <a
            href={`https://wa.me/?text=Entre na votação: ${window.location.origin}/login?roomId=${roomId}`}
              target="_blank"
              rel="noopener noreferrer"
            className="social-share"
            >
            <FaWhatsapp />
            </a>
            <a
            href={`https://t.me/share/url?url=${window.location.origin}/login?roomId=${roomId}`}
              target="_blank"
              rel="noopener noreferrer"
            className="social-share"
            >
            <FaTelegramPlane />
            </a>
          </div>
        </div>
    </div>
  );
};

export default Votacao;