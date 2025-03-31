import React, { useState, useEffect } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { FaTelegramPlane } from 'react-icons/fa';
import io from 'socket.io-client';
import api from './utils/api';

// Instância única do socket para evitar reconexões a cada render
const socket = io(process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000', {
  transports: ['websocket'], // Garante que está usando WebSocket direto
  reconnectionAttempts: 5, // Tenta reconectar até 5 vezes
});

socket.on('connect', () => {
  console.log('✅ Conectado ao backend via Socket.io');
});

socket.on('connect_error', (err) => {
  console.error('❌ Erro ao conectar ao backend:', err);
});
const App = () => {
  const [username, setUsername] = useState('');
  const [selectedCard, setSelectedCard] = useState(null); // Voto selecionado pelo usuário (bottom row)
  const [userVote, setUserVote] = useState(null); // Número escolhido pelo usuário
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userLimitReached, setUserLimitReached] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#006B5B');
  const [users, setUsers] = useState([]); // Lista de usuários conectados
  const [votesRevealed, setVotesRevealed] = useState(false); // Indica se os votos já foram revelados
  const [revealedVotesData, setRevealedVotesData] = useState([]); // Dados reais dos votos após revelação
  const [averageVote, setAverageVote] = useState(null); // Média dos votos
  // votesStatus mapeia (username em lowercase) para o voto; antes da revelação, o valor será 'X'
  const [votesStatus, setVotesStatus] = useState({});
  const [currentTime, setCurrentTime] = useState(new Date());


  useEffect(() => {
    socket.on('updateUsers', (updatedUsers) => {
      setUsers(updatedUsers);
    });

    socket.on('userLeft', (socketId) => {
      setUsers((prevUsers) =>
        prevUsers.filter((user) => user.socketId !== socketId)
      );
    });

    // Quando um usuário vota, o backend emite "newVote" com { username, vote: 'X' }
    socket.on('newVote', (data) => {
      const key = data.username.trim().toLowerCase();
      setVotesStatus((prev) => {
        // Se já temos um valor real (diferente de 'X') para esse usuário, não sobrescreve
        if (prev[key] && prev[key] !== 'X') return prev;
        return { ...prev, [key]: 'X' };
      });
    });

    // Ao revelar os votos, o backend envia os dados reais e emite para todos os clientes
    socket.on('showVotes', (data) => {
      const newStatus = {};
      data.revealedVotes.forEach((item) => {
        newStatus[item.username.trim().toLowerCase()] = item.vote;
      });
      setVotesStatus(newStatus);
      setRevealedVotesData(data.revealedVotes);
      setVotesRevealed(true);

      // Calcula a média dos votos
      const totalVotes = data.revealedVotes.reduce((sum, vote) => sum + vote.vote, 0);
      const average = totalVotes / data.revealedVotes.length;
      setAverageVote(average.toFixed(2));
    });

    // Controle de limite de usuários (exemplo simples com sessionStorage)
    const userCount = parseInt(sessionStorage.getItem('userCount')) || 0;
    if (userCount >= 12) {
      setUserLimitReached(true);
    } else {
      sessionStorage.setItem('userCount', userCount + 1);
    }

    return () => {
      socket.off('updateUsers');
      socket.off('userLeft');
      socket.off('newVote');
      socket.off('showVotes');
    };
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      socket.emit('join', username);
    }
  }, [isLoggedIn, username]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/some-endpoint');
        console.log('Dados do backend:', response.data);
      } catch (error) {
        console.error('Erro ao buscar dados do backend:', error);
      }
    };

    fetchData();
  }, []);

  const handleLogin = () => {
    if (username.trim() === '') {
      alert('Por favor, digite seu nome!');
      return;
    }
    setIsLoggedIn(true);
  };

  // Quando o usuário seleciona uma carta (na bottom row)
  const handleSelectVote = (value) => {
    if (selectedCard === null) {
      setUserVote(value);
      setSelectedCard(value);
      // Atualiza o estado local: para esse usuário, guarda o número escolhido
      setVotesStatus((prev) => ({
        ...prev,
        [username.trim().toLowerCase()]: value,
      }));
      socket.emit('vote', { username, vote: value });
    }
  };

  // Ao clicar em "VER VOTO", verifica se todos os jogadores votaram antes de emitir o evento para revelar os votos
  const handleRevealVote = () => {
    // Verifica se todos os jogadores conectados já votaram
    const allVoted = users.every((user) => {
      const key = user.username.trim().toLowerCase();
      return votesStatus.hasOwnProperty(key);
    });
    if (!allVoted) {
      alert('Aguardando todos os jogadores votarem!');
      return;
    }
    socket.emit('revealVotes');
    // O estado votesRevealed será atualizado via o listener de "showVotes" para todos os clientes
  };

  // Reseta os estados para uma nova rodada de votação
  const handleResetVote = () => {
    setSelectedCard(null);
    setUserVote(null);
    setVotesRevealed(false);
    setRevealedVotesData([]);
    setVotesStatus({});
    setSelectedColor('#006B5B');
    setAverageVote(null);
  };

  // Função que renderiza o "slot" de exibição para cada número (1 a 5)
  // Se houver votos para o número, renderiza uma carta para cada voto; caso contrário, exibe um placeholder com "?"
  const renderVoteSlot = (cardValue) => {
    // Se os votos já foram revelados, utiliza o array revealedVotesData
    const votesForValue = votesRevealed
      ? revealedVotesData.filter((item) => parseInt(item.vote) === cardValue)
      : Object.entries(votesStatus).filter(
          ([, vote]) => parseInt(vote) === cardValue
        );

    if (votesForValue.length === 0) {
      return (
        <div className="vote-slot" style={styles.voteSlot}>
          <div className="vote-card not-clickable" style={getDisplayCardStyle(cardValue)}>
            ?
          </div>
        </div>
      );
    } else {
      return (
        <div className="vote-slot" style={styles.voteSlot}>
          {votesForValue.map((data, index) => {
            // Quando os votos não estão revelados, data é [username, vote]
            // Caso contrário, é um objeto { username, vote }
            const username = votesRevealed ? data.username.trim().toLowerCase() : data[0];
            const vote = votesRevealed ? data.vote : data[1];
            return (
              <div key={index} className="vote-card not-clickable" style={getDisplayCardStyle(cardValue)}>
                <span>{votesRevealed ? vote : 'X'}</span>
                <div className="user-name" style={styles.userName}>
                  {votesRevealed ? username : ''}
                </div>
              </div>
            );
          })}
        </div>
      );
    }
  };

  // Estilo dos cards da área de exibição: se houver um voto para esse valor, usa a cor selecionada
  const getDisplayCardStyle = (cardValue) => {
    const found = Object.values(votesStatus).some(
      (vote) => parseInt(vote) === cardValue
    );
    if (found) {
      return { ...styles.card, backgroundColor: selectedColor, color: 'white' };
    }
    return styles.card;
  };

  // Estilo dos cards na área de seleção (bottom-row)
  const getBottomCardStyle = (value) => {
    return value === selectedCard
      ? { ...styles.card, backgroundColor: selectedColor, color: 'white' }
      : styles.card;
  };

  const handleLogout = () => {
    socket.emit('leave', username);
    setIsLoggedIn(false);
    setUsername('');
    setUsers((prevUsers) =>
      prevUsers.filter((user) => user.username !== username)
    );
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(url)
        .then(() => alert('Link copiado com sucesso!'))
        .catch((err) => alert('Erro ao copiar o link.'));
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        alert('Link copiado com sucesso!');
      } catch (err) {
        alert('Erro ao copiar o link.');
      }
      document.body.removeChild(textArea);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval); // Limpa o intervalo ao desmontar o componente
  }, []);

  return (
    <div style={styles.app}>
      {!isLoggedIn ? (
        <div className="login-container" style={styles.loginContainer}>
          <h2>Digite seu Nome</h2>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="Seu nome"
            style={styles.input}
          />
          <button onClick={handleLogin} style={styles.button}>
            Entrar
          </button>
        </div>
      ) : (
        <div className="container" id="voting-screen">
          <h2>Votação</h2>
          <p>Hora atual: {currentTime.toLocaleTimeString()}</p>
          <p id="welcome-user">{`Bem-vindo, ${username}!`}</p>
          <p>Participantes: {users.map((user) => user.username).join(', ')}</p>
          <div style={styles.colorPickerContainer}>
            <label style={styles.colorLabel}>
              Escolha a cor do seu voto:
            </label>
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
            />
          </div>
          {/* Área de exibição dos votos */}
          <div className="vote-container" style={styles.voteContainer}>
            <div className="vote-row" style={styles.voteRow}>
              {renderVoteSlot(1)}
              {renderVoteSlot(2)}
            </div>
            <div className="vote-row" style={styles.voteRow}>
              {renderVoteSlot(3)}
              <button
                onClick={votesRevealed ? handleResetVote : handleRevealVote}
                style={styles.button}
              >
                {votesRevealed ? 'RESETAR' : 'VER VOTO'}
              </button>
              {renderVoteSlot(4)}
            </div>
            <div className="vote-row" style={styles.voteRow}>
              {renderVoteSlot(5)}
            </div>
          </div>
          {/* Área de seleção do voto */}
          <div className="bottom-row" style={styles.bottomRow}>
            {[1, 2, 3, 4, 5].map((value) => (
              <div
                key={value}
                className="vote-card"
                data-value={value}
                onClick={() => handleSelectVote(value)}
                style={getBottomCardStyle(value)}
              >
                {value}
              </div>
            ))}
          </div>
          {votesRevealed && (
            <div className="revealed-votes" style={styles.revealedVotes}>
              <p>Média dos Votos: {averageVote}</p>
              {revealedVotesData.map((voteInfo, index) => (
                <p key={index}></p>
              ))}
            </div>
          )}
          <div className="share-container" style={styles.shareContainer}>
            <button onClick={handleCopyLink} style={styles.button}>
              Copiar Link para Compartilhar
            </button>
            <a
              href="https://wa.me/?text=Olá!%20Venha%20participar%20da%20votação%20neste%20link:%20"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaWhatsapp size={30} color="#25D366" style={{ cursor: 'pointer' }} />
            </a>
            <a
              href="https://t.me/seu_usuario"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaTelegramPlane size={30} color="#0088cc" style={{ cursor: 'pointer' }} />
            </a>
          </div>
        </div>
      )}
      {isLoggedIn && (
        <div className="top-left-button" style={styles.logoutContainer}>
          <button onClick={handleLogout} style={styles.button}>
            Sair
          </button>
        </div>
      )}
      
    </div>
  );
};

const styles = {
  app: {
    fontFamily: 'Arial, sans-serif',
    textAlign: 'center',
    padding: '20px',
    backgroundColor: '#f4f4f4',
  },
  loginContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    marginTop: '50px',
  },
  input: {
    padding: '10px',
    fontSize: '12px',
    width: '200px',
    marginBottom: '10px',
  },
  button: {
    padding: '15px 30px',
    fontSize: '16px',
    backgroundColor: '#006B5B',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  colorPickerContainer: {
    marginBottom: '20px',
  },
  colorLabel: {
    marginRight: '10px',
  },
  voteContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
  },
  voteRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '30px',
  },
  bottomRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    marginTop: '30px',
  },
  revealedVotes: {
    marginTop: '20px',
  },
  shareContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '10px',
    marginTop: '20px',
  },
  logoutContainer: {
    position: 'absolute',
    top: '10px',
    left: '10px',
  },
  voteSlot: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
  },
  card: {
    width: '60px',
    height: '90px',
    backgroundColor: 'white',
    border: '2px solid #006B5B',
    borderRadius: '10px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#006B5B',
    cursor: 'pointer',
    padding: '5px',
  },
  userName: {
    fontSize: '12px',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
    whiteSpace: 'normal',
    textAlign: 'center',
    width: '100%',
  },
};

export default App;