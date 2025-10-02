import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaPlus, 
  FaEllipsisH, 
  FaEdit, 
  FaTrash, 
  FaUsers,
  FaCog,
  FaSearch,
  FaFilter,
  FaUserPlus,
  FaUserMinus,
  FaCrown,
  FaUser,
  FaUserTie
} from 'react-icons/fa';
import BoardService from '../services/boardService';
import CardService from '../services/cardService';
import authService from '../services/authService';
import './BoardView.css';

const BoardView = () => {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [board, setBoard] = useState(null);
  const [lists, setLists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateList, setShowCreateList] = useState(false);
  const [showCreateCard, setShowCreateCard] = useState(null);
  const [draggedCard, setDraggedCard] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userBoards, setUserBoards] = useState([]);
  const [isTrelloMain, setIsTrelloMain] = useState(false);
  const [showMemberManagement, setShowMemberManagement] = useState(false);
  const [boardMembers, setBoardMembers] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    // Verificar se estamos na rota principal do Trello
    if (location.pathname === '/trello') {
      setIsTrelloMain(true);
      loadUserBoards();
    } else if (boardId) {
      setIsTrelloMain(false);
      loadBoardData();
    }
  }, [boardId, location.pathname]);

  const loadUserBoards = async () => {
    try {
      setIsLoading(true);
      setError('');

      console.log('🔗 Carregando boards do usuário para Trello');
      
      // Obter dados do usuário logado
      const userData = localStorage.getItem('userData');
      if (!userData) {
        setError('Usuário não autenticado');
        return;
      }

      const user = JSON.parse(userData);
      console.log('👤 Usuário logado:', user);

      // Temporariamente usar dados mock até o backend estar funcionando
      const mockBoards = [
        {
          id: 1,
          title: 'Projeto Principal',
          description: 'Quadro principal do projeto de desenvolvimento',
          created_at: new Date().toISOString(),
          member_count: 3,
          user_id: user.id
        },
        {
          id: 2,
          title: 'Backlog de Funcionalidades',
          description: 'Lista de funcionalidades pendentes para implementação',
          created_at: new Date(Date.now() - 86400000).toISOString(), // 1 dia atrás
          member_count: 2,
          user_id: user.id
        },
        {
          id: 3,
          title: 'Sprint Atual',
          description: 'Tarefas do sprint atual em desenvolvimento',
          created_at: new Date(Date.now() - 172800000).toISOString(), // 2 dias atrás
          member_count: 5,
          user_id: user.id
        },
        {
          id: 4,
          title: 'Bugs e Melhorias',
          description: 'Quadro para reportar e corrigir bugs',
          created_at: new Date(Date.now() - 259200000).toISOString(), // 3 dias atrás
          member_count: 4,
          user_id: user.id
        }
      ];

      setUserBoards(mockBoards);
      console.log('📋 Boards carregados (mock):', mockBoards);
      
    } catch (err) {
      setError('Erro ao carregar boards do usuário');
      console.error('Erro ao carregar boards:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadBoardMembers = async () => {
    try {
      console.log('👥 Carregando membros do board...');
      
      // Obter dados do usuário atual
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        console.log('❌ Usuário não autenticado');
        return;
      }

      // Dados mock para membros do board
      const mockMembers = [
        {
          id: 1,
          board_id: parseInt(boardId),
          user_id: 15, // anderjulya580@gmail.com (admin)
          role: 'admin',
          joined_at: new Date().toISOString(),
          user: {
            id: 15,
            name: 'ander pereira da silva',
            email: 'anderjulya580@gmail.com',
            avatar_url: null
          }
        },
        {
          id: 2,
          board_id: parseInt(boardId),
          user_id: 16,
          role: 'member',
          joined_at: new Date(Date.now() - 86400000).toISOString(),
          user: {
            id: 16,
            name: 'João Silva',
            email: 'joao@email.com',
            avatar_url: null
          }
        },
        {
          id: 3,
          board_id: parseInt(boardId),
          user_id: 17,
          role: 'member',
          joined_at: new Date(Date.now() - 172800000).toISOString(),
          user: {
            id: 17,
            name: 'Maria Santos',
            email: 'maria@email.com',
            avatar_url: null
          }
        }
      ];

      setBoardMembers(mockMembers);

      // Verificar role do usuário atual
      const currentUserMember = mockMembers.find(member => member.user_id === currentUser.id);
      if (currentUserMember) {
        setUserRole(currentUserMember.role);
        console.log('👤 Role do usuário atual:', currentUserMember.role);
      } else {
        setUserRole('guest');
        console.log('👤 Usuário não é membro do board');
      }

    } catch (error) {
      console.error('❌ Erro ao carregar membros:', error);
    }
  };


  const loadBoardData = async () => {
    try {
      setIsLoading(true);
      setError('');
      console.log('📋 Carregando dados do board (MOCK)...');

      // Dados mock detalhados para o board
      const mockBoard = {
        id: parseInt(boardId),
        title: 'Projeto Principal',
        description: 'Quadro principal do projeto de desenvolvimento',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_public: false,
        user_id: 16
      };

      // Carregar membros do board e verificar permissões
      await loadBoardMembers();

      const mockLists = [
        {
          id: 1,
          title: 'To Do',
          position: 1,
          board_id: parseInt(boardId),
          cards: [
            {
              id: 1,
              title: 'Implementar autenticação JWT',
              description: 'Criar sistema de login seguro com tokens JWT',
              priority: 'high',
              due_date: '2024-01-15',
              position: 1,
              list_id: 1,
              labels: [
                { id: 1, name: 'Frontend', color: '#3498db' },
                { id: 2, name: 'Backend', color: '#e74c3c' }
              ],
              assigned_user: { id: 16, name: 'Usuario Teste', email: 'teste@votacao.com' },
              checklists: [
                {
                  id: 1,
                  title: 'Tarefas de Autenticação',
                  position: 1,
                  items: [
                    { id: 1, title: 'Criar endpoint de login', completed: true, position: 1 },
                    { id: 2, title: 'Implementar middleware JWT', completed: false, position: 2 },
                    { id: 3, title: 'Criar tela de login no frontend', completed: false, position: 3 }
                  ]
                }
              ],
              comments: [
                {
                  id: 1,
                  content: 'Precisamos implementar refresh token também',
                  created_at: new Date().toISOString(),
                  user: { id: 16, name: 'Usuario Teste', email: 'teste@votacao.com' }
                }
              ]
            },
            {
              id: 2,
              title: 'Configurar banco de dados PostgreSQL',
              description: 'Setup inicial do banco de dados com todas as tabelas',
              priority: 'medium',
              due_date: '2024-01-20',
              position: 2,
              list_id: 1,
              labels: [
                { id: 3, name: 'Database', color: '#2ecc71' }
              ],
              assigned_user: { id: 17, name: 'João Silva', email: 'joao@email.com' },
              checklists: [],
              comments: []
            }
          ]
        },
        {
          id: 2,
          title: 'In Progress',
          position: 2,
          board_id: parseInt(boardId),
          cards: [
            {
              id: 3,
              title: 'Criar dashboard principal',
              description: 'Interface principal do sistema com métricas e gráficos',
              priority: 'high',
              due_date: '2024-01-18',
              position: 1,
              list_id: 2,
              labels: [
                { id: 4, name: 'UI/UX', color: '#f39c12' },
                { id: 5, name: 'Frontend', color: '#3498db' }
              ],
              assigned_user: { id: 18, name: 'Maria Santos', email: 'maria@email.com' },
              checklists: [
                {
                  id: 2,
                  title: 'Componentes do Dashboard',
                  position: 1,
                  items: [
                    { id: 4, title: 'Criar componente de métricas', completed: true, position: 1 },
                    { id: 5, title: 'Implementar gráficos', completed: true, position: 2 },
                    { id: 6, title: 'Adicionar filtros', completed: false, position: 3 }
                  ]
                }
              ],
              comments: [
                {
                  id: 2,
                  content: 'O design está ficando muito bom!',
                  created_at: new Date(Date.now() - 3600000).toISOString(),
                  user: { id: 19, name: 'Pedro Costa', email: 'pedro@email.com' }
                }
              ]
            }
          ]
        },
        {
          id: 3,
          title: 'Done',
          position: 3,
          board_id: parseInt(boardId),
          cards: [
            {
              id: 4,
              title: 'Setup inicial do projeto',
              description: 'Configuração inicial do ambiente de desenvolvimento',
              priority: 'low',
              due_date: '2024-01-10',
              position: 1,
              list_id: 3,
              labels: [
                { id: 6, name: 'Setup', color: '#95a5a6' }
              ],
              assigned_user: { id: 16, name: 'Usuario Teste', email: 'teste@votacao.com' },
              checklists: [
                {
                  id: 3,
                  title: 'Configurações Iniciais',
                  position: 1,
                  items: [
                    { id: 7, title: 'Instalar dependências', completed: true, position: 1 },
                    { id: 8, title: 'Configurar ESLint', completed: true, position: 2 },
                    { id: 9, title: 'Configurar Prettier', completed: true, position: 3 },
                    { id: 10, title: 'Setup do banco de dados', completed: true, position: 4 }
                  ]
                }
              ],
              comments: [
                {
                  id: 3,
                  content: 'Tudo configurado e funcionando!',
                  created_at: new Date(Date.now() - 86400000).toISOString(),
                  user: { id: 16, name: 'Usuario Teste', email: 'teste@votacao.com' }
                }
              ]
            }
          ]
        }
      ];

      setBoard(mockBoard);
      setLists(mockLists);
      console.log('✅ Board carregado com sucesso (MOCK):', mockBoard);
      console.log('✅ Lists carregadas com sucesso (MOCK):', mockLists);
      
    } catch (error) {
      setError('Erro ao carregar dados do quadro');
      console.error('❌ Erro ao carregar board:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteMember = async () => {
    if (!inviteEmail.trim()) {
      setError('Por favor, digite um email válido');
      return;
    }

    setIsInviting(true);
    try {
      console.log('📧 Enviando convite para:', inviteEmail);
      
      // Simular convite (em produção, chamaria a API)
      setTimeout(() => {
        console.log('✅ Convite enviado com sucesso');
        setInviteEmail('');
        setIsInviting(false);
        // Recarregar membros
        loadBoardMembers();
      }, 1000);
      
    } catch (error) {
      console.error('❌ Erro ao enviar convite:', error);
      setError('Erro ao enviar convite');
      setIsInviting(false);
    }
  };

  const handleChangeMemberRole = async (memberId, newRole) => {
    try {
      console.log('🔄 Alterando role do membro:', memberId, 'para:', newRole);
      
      // Simular alteração de role
      setBoardMembers(prev => 
        prev.map(member => 
          member.id === memberId 
            ? { ...member, role: newRole }
            : member
        )
      );
      
      console.log('✅ Role alterado com sucesso');
      
    } catch (error) {
      console.error('❌ Erro ao alterar role:', error);
      setError('Erro ao alterar permissão');
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Tem certeza que deseja remover este membro do quadro?')) {
      return;
    }

    try {
      console.log('🗑️ Removendo membro:', memberId);
      
      // Simular remoção
      setBoardMembers(prev => prev.filter(member => member.id !== memberId));
      
      console.log('✅ Membro removido com sucesso');
      
    } catch (error) {
      console.error('❌ Erro ao remover membro:', error);
      setError('Erro ao remover membro');
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <FaCrown className="role-icon admin" />;
      case 'member':
        return <FaUser className="role-icon member" />;
      case 'guest':
        return <FaUserTie className="role-icon guest" />;
      default:
        return <FaUser className="role-icon" />;
    }
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
        return 'Desconhecido';
    }
  };

  const handleCreateList = async (listData) => {
    try {
      const result = await BoardService.createList(boardId, listData);
      if (result.success) {
        setLists(prev => [...prev, { ...result.list, cards: [] }]);
        setShowCreateList(false);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Erro ao criar lista');
    }
  };

  const handleCreateCard = async (listId, cardData) => {
    try {
      const result = await BoardService.createCard(boardId, listId, cardData);
      if (result.success) {
        setLists(prev => prev.map(list => 
          list.id === listId 
            ? { ...list, cards: [...list.cards, result.card] }
            : list
        ));
        setShowCreateCard(null);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Erro ao criar card');
    }
  };

  const handleUpdateCard = async (cardId, cardData) => {
    try {
      const result = await BoardService.updateCard(cardId, cardData);
      if (result.success) {
        setLists(prev => prev.map(list => ({
          ...list,
          cards: list.cards.map(card => 
            card.id === cardId ? result.card : card
          )
        })));
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Erro ao atualizar card');
    }
  };

  const handleDeleteCard = async (cardId) => {
    try {
      const result = await BoardService.deleteCard(cardId);
      if (result.success) {
        setLists(prev => prev.map(list => ({
          ...list,
          cards: list.cards.filter(card => card.id !== cardId)
        })));
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Erro ao excluir card');
    }
  };

  const handleDragStart = (e, card) => {
    setDraggedCard(card);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, targetListId) => {
    e.preventDefault();
    
    if (!draggedCard) return;

    const sourceListId = draggedCard.list_id;
    
    if (sourceListId === targetListId) {
      setDraggedCard(null);
      return;
    }

    try {
      const result = await BoardService.moveCard(draggedCard.id, targetListId, 0);
      if (result.success) {
        // Atualizar estado local
        setLists(prev => {
          const newLists = [...prev];
          
          // Remover card da lista origem
          const sourceList = newLists.find(list => list.id === sourceListId);
          if (sourceList) {
            sourceList.cards = sourceList.cards.filter(card => card.id !== draggedCard.id);
          }
          
          // Adicionar card na lista destino
          const targetList = newLists.find(list => list.id === targetListId);
          if (targetList) {
            targetList.cards = [...targetList.cards, { ...draggedCard, list_id: targetListId }];
          }
          
          return newLists;
        });
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Erro ao mover card');
    } finally {
      setDraggedCard(null);
    }
  };

  const filteredLists = lists.map(list => ({
    ...list,
    cards: list.cards.filter(card => 
      card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }));

  if (isLoading) {
    return (
      <div className="board-view-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Carregando quadro...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="board-view-container">
        <div className="error-state">
          <h3>Erro ao carregar quadro</h3>
          <p>{error}</p>
          <button onClick={() => navigate('/dashboard')} className="back-btn">
            <FaArrowLeft /> Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Renderizar tela principal do Trello
  if (isTrelloMain) {
    return (
      <div className="board-view-container">
        <header className="board-header">
          <div className="board-header-left">
            <button 
              className="back-btn"
              onClick={() => navigate('/dashboard')}
            >
              <FaArrowLeft /> Dashboard
            </button>
            <div className="board-title-section">
              <h1 className="board-title">Meus Quadros Trello</h1>
              <p className="board-description">Gerencie seus quadros e projetos</p>
            </div>
          </div>
        </header>

        <div className="trello-main-content">
          {userBoards.length > 0 ? (
            <div className="boards-grid">
              {userBoards.map((board) => (
                <div 
                  key={board.id} 
                  className="board-card"
                  onClick={() => navigate(`/board/${board.id}`)}
                >
                  <div className="board-card-header">
                    <h3>{board.title}</h3>
                    <span className="board-date">
                      {new Date(board.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  {board.description && (
                    <p className="board-card-description">{board.description}</p>
                  )}
                  <div className="board-card-footer">
                    <span className="board-members">
                      <FaUsers /> {board.member_count || 0} membros
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-boards">
              <h3>Nenhum quadro encontrado</h3>
              <p>Você ainda não possui quadros. Crie um novo quadro para começar!</p>
              <button 
                className="create-board-btn"
                onClick={() => navigate('/dashboard')}
              >
                <FaPlus /> Criar Quadro
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="board-view-container">
      {/* Header */}
      <header className="board-header">
        <div className="board-header-left">
          <button 
            className="back-btn"
            onClick={() => navigate('/dashboard')}
          >
            <FaArrowLeft /> Dashboard
          </button>
          <div className="board-title-section">
            <h1 className="board-title">{board?.title}</h1>
            {board?.description && (
              <p className="board-description">{board.description}</p>
            )}
          </div>
        </div>

        <div className="board-header-center">
          <div className="search-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar cards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="board-header-right">
          {userRole === 'admin' && (
            <button 
              className="header-btn member-management-btn"
              onClick={() => setShowMemberManagement(true)}
              title="Gerenciar Membros"
            >
              <FaUsers />
            </button>
          )}
          <button className="header-btn">
            <FaCog />
          </button>
        </div>
      </header>

      {/* Board Content */}
      <div className="board-content">
        <div className="lists-container">
          {filteredLists.map(list => (
            <ListColumn
              key={list.id}
              list={list}
              onAddCard={() => setShowCreateCard(list.id)}
              onUpdateCard={handleUpdateCard}
              onDeleteCard={handleDeleteCard}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            />
          ))}

          {/* Add List Button */}
          <div className="add-list-container">
            {showCreateList ? (
              <CreateListForm
                onSubmit={handleCreateList}
                onCancel={() => setShowCreateList(false)}
              />
            ) : (
              <button 
                className="add-list-btn"
                onClick={() => setShowCreateList(true)}
              >
                <FaPlus /> Adicionar Lista
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Create Card Modal */}
      {showCreateCard && (
        <CreateCardModal
          listId={showCreateCard}
          onSubmit={(cardData) => handleCreateCard(showCreateCard, cardData)}
          onClose={() => setShowCreateCard(null)}
        />
      )}

      {/* Modal de Gerenciamento de Membros */}
      {showMemberManagement && (
        <div className="modal-overlay" onClick={() => setShowMemberManagement(false)}>
          <div className="modal-content member-management-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Gerenciar Membros</h2>
              <button 
                className="close-btn"
                onClick={() => setShowMemberManagement(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              {/* Lista de Membros Atuais */}
              <div className="members-section">
                <h3>Membros Atuais</h3>
                <div className="members-list">
                  {boardMembers.map(member => (
                    <div key={member.id} className="member-item">
                      <div className="member-info">
                        <div className="member-avatar">
                          {member.user.avatar_url ? (
                            <img src={member.user.avatar_url} alt={member.user.name} />
                          ) : (
                            <div className="avatar-placeholder">
                              {member.user.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="member-details">
                          <span className="member-name">{member.user.name}</span>
                          <span className="member-email">{member.user.email}</span>
                        </div>
                      </div>
                      
                      <div className="member-actions">
                        <div className="member-role">
                          {getRoleIcon(member.role)}
                          <span className="role-label">{getRoleLabel(member.role)}</span>
                        </div>
                        
                        {userRole === 'admin' && member.role !== 'admin' && (
                          <div className="action-buttons">
                            <select
                              value={member.role}
                              onChange={(e) => handleChangeMemberRole(member.id, e.target.value)}
                              className="role-select"
                            >
                              <option value="member">Membro</option>
                              <option value="guest">Convidado</option>
                            </select>
                            <button
                              className="remove-btn"
                              onClick={() => handleRemoveMember(member.id)}
                              title="Remover do quadro"
                            >
                              <FaUserMinus />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Convidar Novo Membro */}
              <div className="invite-section">
                <h3>Convidar Novo Membro</h3>
                <div className="invite-form">
                  <div className="input-group">
                    <input
                      type="email"
                      placeholder="Digite o email do usuário"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="invite-input"
                    />
                    <button
                      className="invite-btn"
                      onClick={handleInviteMember}
                      disabled={isInviting || !inviteEmail.trim()}
                    >
                      {isInviting ? 'Enviando...' : (
                        <>
                          <FaUserPlus /> Enviar Convite
                        </>
                      )}
                    </button>
                  </div>
                  <p className="invite-help">
                    Se o usuário não existir no sistema, será criado um convite pendente.
                  </p>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="cancel-btn"
                onClick={() => setShowMemberManagement(false)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente para coluna de lista
const ListColumn = ({ 
  list, 
  onAddCard, 
  onUpdateCard, 
  onDeleteCard, 
  onDragStart, 
  onDragOver, 
  onDrop 
}) => {
  const [showCardOptions, setShowCardOptions] = useState(null);

  return (
    <div 
      className="list-column"
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, list.id)}
    >
      <div className="list-header">
        <h3 className="list-title">{list.title}</h3>
        <div className="list-actions">
          <button 
            className="action-btn"
            onClick={() => setShowCardOptions(showCardOptions === list.id ? null : list.id)}
          >
            <FaEllipsisH />
          </button>
          {showCardOptions === list.id && (
            <div className="list-options">
              <button className="option-btn">
                <FaEdit /> Editar
              </button>
              <button className="option-btn">
                <FaTrash /> Excluir
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="cards-container">
        {list.cards.map(card => (
          <CardItem
            key={card.id}
            card={card}
            onUpdate={onUpdateCard}
            onDelete={onDeleteCard}
            onDragStart={onDragStart}
          />
        ))}
        
        <button className="add-card-btn" onClick={onAddCard}>
          <FaPlus /> Adicionar Card
        </button>
      </div>
    </div>
  );
};

// Componente para card
const CardItem = ({ card, onUpdate, onDelete, onDragStart }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: card.title,
    description: card.description || ''
  });

  const handleSave = () => {
    onUpdate(card.id, editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      title: card.title,
      description: card.description || ''
    });
    setIsEditing(false);
  };

  return (
    <div 
      className="card-item"
      draggable
      onDragStart={(e) => onDragStart(e, card)}
    >
      {isEditing ? (
        <div className="card-edit-form">
          <input
            type="text"
            value={editData.title}
            onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
            className="card-title-input"
            placeholder="Título do card"
          />
          <textarea
            value={editData.description}
            onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
            className="card-description-input"
            placeholder="Descrição (opcional)"
            rows={3}
          />
          <div className="card-edit-actions">
            <button className="save-btn" onClick={handleSave}>
              Salvar
            </button>
            <button className="cancel-btn" onClick={handleCancel}>
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="card-content">
            <h4 className="card-title">{card.title}</h4>
            {card.description && (
              <p className="card-description">{card.description}</p>
            )}
            {card.due_date && (
              <div className="card-due-date">
                📅 {new Date(card.due_date).toLocaleDateString('pt-BR')}
              </div>
            )}
            {card.priority && (
              <div className={`card-priority ${card.priority}`}>
                {card.priority === 'high' ? '🔴' : card.priority === 'medium' ? '🟡' : '🟢'} 
                {card.priority}
              </div>
            )}
          </div>
          <div className="card-actions">
            <button 
              className="card-action-btn"
              onClick={() => setIsEditing(true)}
            >
              <FaEdit />
            </button>
            <button 
              className="card-action-btn"
              onClick={() => onDelete(card.id)}
            >
              <FaTrash />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// Componente para criar lista
const CreateListForm = ({ onSubmit, onCancel }) => {
  const [title, setTitle] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) {
      onSubmit({ title: title.trim() });
    }
  };

  return (
    <form className="create-list-form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Título da lista"
        className="list-title-input"
        autoFocus
      />
      <div className="create-list-actions">
        <button type="submit" className="save-btn">
          Adicionar
        </button>
        <button type="button" className="cancel-btn" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  );
};

// Componente para criar card
const CreateCardModal = ({ listId, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'medium'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title.trim()) {
      onSubmit({
        ...formData,
        due_date: formData.due_date || null
      });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Novo Card</h2>
        
        <form onSubmit={handleSubmit} className="create-card-form">
          <div className="form-group">
            <label>Título</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Título do card"
              required
              maxLength={255}
            />
          </div>

          <div className="form-group">
            <label>Descrição</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrição do card"
              rows={3}
              maxLength={500}
            />
          </div>

          <div className="form-group">
            <label>Data de Vencimento</label>
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label>Prioridade</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
            >
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancelar
            </button>
            <button type="submit" className="create-btn">
              Criar Card
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BoardView;
