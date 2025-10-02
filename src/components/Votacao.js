import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import './Votacao.css';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || (IS_PRODUCTION ? 'https://timeboard.site' : 'http://localhost:3003');

const Votacao = () => {
  const location = useLocation();
  const [socket, setSocket] = useState(null);
  const [roomId, setRoomId] = useState('');
  const [userName, setUserName] = useState('');
  const [users, setUsers] = useState([]);
  const [votes, setVotes] = useState({});
  const [isRevealed, setIsRevealed] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [averageVote, setAverageVote] = useState(null);

  useEffect(() => {
    // Pegar roomId da URL
    const params = new URLSearchParams(location.search);
    const roomIdFromUrl = params.get('roomId');
    setRoomId(roomIdFromUrl);

    // Conectar ao socket
    const newSocket = io(BACKEND_URL);
    setSocket(newSocket);

    // Entrar na sala
    newSocket.emit('joinRoom', {
      roomId: roomIdFromUrl,
      userName: localStorage.getItem('userName') || 'Participante'
    });

    // Listeners de eventos
    newSocket.on('userJoined', (data) => {
      console.log('👥 Novo usuário entrou:', data);
      setUsers(data.users);
    });

    newSocket.on('userLeft', (data) => {
      console.log('👋 Usuário saiu:', data);
      setUsers(data.users);
    });

    newSocket.on('newVote', (data) => {
      console.log('🎴 Novo voto:', data);
      setVotes(prev => ({
        ...prev,
        [data.userId]: data.hasVoted
      }));
    });

    newSocket.on('votesRevealed', (data) => {
      console.log('🎲 Votos revelados:', data);
      setIsRevealed(true);
      setVotes(data.votes);
      setAverageVote(data.average);
    });

    newSocket.on('votingReset', (data) => {
      console.log('🔄 Nova votação iniciada:', data);
      setIsRevealed(false);
      setSelectedCard(null);
      setVotes({});
      setAverageVote(null);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [location]);

  const handleVote = (value) => {
    if (!socket || !roomId) return;
    
    setSelectedCard(value);
    socket.emit('vote', {
      roomId,
      vote: value
    });
  };

  const handleRevealVotes = () => {
    if (!socket || !roomId) return;
    
    socket.emit('revealVotes', roomId);
  };

  const handleResetVoting = () => {
    if (!socket || !roomId) return;
    
    socket.emit('resetVoting', roomId);
  };

  return (
    <div className="votacao-container">
      <div className="room-info">
        <h2>Sala: {roomId}</h2>
        <p>Usuários na sala: {users.length}</p>
      </div>

      <div className="voting-cards">
        {['0', '1', '2', '3', '5', '8', '13', '?', '☕'].map((value) => (
          <button
            key={value}
            className={`voting-card ${selectedCard === value ? 'selected' : ''}`}
            onClick={() => handleVote(value)}
            disabled={isRevealed}
          >
            {value}
          </button>
        ))}
      </div>

      <div className="voting-controls">
        <button 
          className="reveal-btn"
          onClick={handleRevealVotes}
          disabled={isRevealed}
        >
          Revelar Cartas
        </button>
        <button 
          className="reset-btn"
          onClick={handleResetVoting}
          disabled={!isRevealed}
        >
          Nova Votação
        </button>
      </div>

      {isRevealed && (
        <div className="voting-results">
          <h3>Resultados</h3>
          {averageVote && (
            <div className="average-vote">
              Média: {averageVote}
            </div>
          )}
          <div className="results-grid">
            {users.map(user => (
              <div key={user.id} className="user-vote">
                <span className="user-name">{user.name}</span>
                <span className="vote-value">{votes[user.id] || '?'}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Votacao; 