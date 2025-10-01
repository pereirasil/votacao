import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaUsers, 
  FaUserPlus, 
  FaUserMinus, 
  FaCrown, 
  FaUser, 
  FaUserTie,
  FaSearch,
  FaFilter,
  FaCog
} from 'react-icons/fa';
import authService from '../services/authService';
import './MemberManagement.css';

const MemberManagement = () => {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [isInviting, setIsInviting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    const isAuth = authService.isAuthenticated();
    
    if (!currentUser || !isAuth) {
      navigate('/login', { replace: true });
      return;
    }

    // Verificar se é admin
    const userRole = currentUser.role || 'member';
    if (userRole !== 'admin') {
      navigate('/dashboard', { replace: true });
      return;
    }

    loadMembers();
  }, [navigate]);

  const loadMembers = async () => {
    try {
      setIsLoading(true);
      console.log('👥 Carregando todos os membros do sistema...');
      
      // Dados mock para demonstração
      const mockMembers = [
        {
          id: 1,
          name: 'ander pereira da silva',
          email: 'anderjulya580@gmail.com',
          role: 'admin',
          avatar_url: null,
          created_at: '2025-09-19T16:04:58.824Z',
          last_login: '2025-01-20T10:30:00.000Z',
          boards_count: 3,
          is_active: true
        },
        {
          id: 2,
          name: 'João Silva',
          email: 'joao@email.com',
          role: 'member',
          avatar_url: null,
          created_at: '2025-09-18T14:20:00.000Z',
          last_login: '2025-01-19T15:45:00.000Z',
          boards_count: 2,
          is_active: true
        },
        {
          id: 3,
          name: 'Maria Santos',
          email: 'maria@email.com',
          role: 'member',
          avatar_url: null,
          created_at: '2025-09-17T09:15:00.000Z',
          last_login: '2025-01-18T11:20:00.000Z',
          boards_count: 1,
          is_active: true
        },
        {
          id: 4,
          name: 'Pedro Costa',
          email: 'pedro@email.com',
          role: 'guest',
          avatar_url: null,
          created_at: '2025-09-16T16:30:00.000Z',
          last_login: '2025-01-17T14:10:00.000Z',
          boards_count: 0,
          is_active: false
        }
      ];

      setMembers(mockMembers);
      console.log('✅ Membros carregados:', mockMembers.length);
      
    } catch (error) {
      console.error('❌ Erro ao carregar membros:', error);
      setError('Erro ao carregar membros');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteUser = async () => {
    if (!inviteEmail.trim()) {
      setError('Por favor, digite um email válido');
      return;
    }

    setIsInviting(true);
    try {
      console.log('📧 Enviando convite para:', inviteEmail, 'com role:', inviteRole);
      
      // Simular convite
      setTimeout(() => {
        console.log('✅ Convite enviado com sucesso');
        setInviteEmail('');
        setInviteRole('member');
        setShowInviteModal(false);
        setIsInviting(false);
        // Recarregar membros
        loadMembers();
      }, 1000);
      
    } catch (error) {
      console.error('❌ Erro ao enviar convite:', error);
      setError('Erro ao enviar convite');
      setIsInviting(false);
    }
  };

  const handleChangeUserRole = async (userId, newRole) => {
    try {
      console.log('🔄 Alterando role do usuário:', userId, 'para:', newRole);
      
      // Simular alteração de role
      setMembers(prev => 
        prev.map(member => 
          member.id === userId 
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

  const handleToggleUserStatus = async (userId) => {
    try {
      console.log('🔄 Alterando status do usuário:', userId);
      
      // Simular alteração de status
      setMembers(prev => 
        prev.map(member => 
          member.id === userId 
            ? { ...member, is_active: !member.is_active }
            : member
        )
      );
      
      console.log('✅ Status alterado com sucesso');
      
    } catch (error) {
      console.error('❌ Erro ao alterar status:', error);
      setError('Erro ao alterar status');
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

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || member.role === filterRole;
    return matchesSearch && matchesRole;
  });

  if (isLoading) {
    return (
      <div className="member-management-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Carregando membros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="member-management-container">
      {/* Header */}
      <header className="management-header">
        <div className="header-left">
          <button 
            className="back-btn"
            onClick={() => navigate('/dashboard')}
          >
            <FaArrowLeft /> Dashboard
          </button>
          <div className="title-section">
            <h1>Gerenciamento de Membros</h1>
            <p>Gerencie usuários e permissões do sistema</p>
          </div>
        </div>
        
        <div className="header-right">
          <button 
            className="invite-btn"
            onClick={() => setShowInviteModal(true)}
          >
            <FaUserPlus /> Convidar Usuário
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Buscar membros..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-container">
          <FaFilter className="filter-icon" />
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="role-filter"
          >
            <option value="all">Todos os Roles</option>
            <option value="admin">Administradores</option>
            <option value="member">Membros</option>
            <option value="guest">Convidados</option>
          </select>
        </div>
      </div>

      {/* Members List */}
      <div className="members-section">
        <div className="members-header">
          <h2>Membros do Sistema ({filteredMembers.length})</h2>
        </div>
        
        <div className="members-list">
          {filteredMembers.map(member => (
            <div key={member.id} className={`member-card ${!member.is_active ? 'inactive' : ''}`}>
              <div className="member-info">
                <div className="member-avatar">
                  {member.avatar_url ? (
                    <img src={member.avatar_url} alt={member.name} />
                  ) : (
                    <div className="avatar-placeholder">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="member-details">
                  <h3 className="member-name">{member.name}</h3>
                  <p className="member-email">{member.email}</p>
                  <div className="member-meta">
                    <span className="member-date">
                      Cadastrado em: {new Date(member.created_at).toLocaleDateString('pt-BR')}
                    </span>
                    <span className="member-boards">
                      {member.boards_count} quadro(s)
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="member-actions">
                <div className="member-role">
                  {getRoleIcon(member.role)}
                  <span className="role-label">{getRoleLabel(member.role)}</span>
                </div>
                
                <div className="action-buttons">
                  <select
                    value={member.role}
                    onChange={(e) => handleChangeUserRole(member.id, e.target.value)}
                    className="role-select"
                    disabled={member.id === 1} // Não permitir alterar o próprio role
                  >
                    <option value="admin">Administrador</option>
                    <option value="member">Membro</option>
                    <option value="guest">Convidado</option>
                  </select>
                  
                  <button
                    className={`status-btn ${member.is_active ? 'active' : 'inactive'}`}
                    onClick={() => handleToggleUserStatus(member.id)}
                    disabled={member.id === 1} // Não permitir desativar o próprio usuário
                    title={member.is_active ? 'Desativar usuário' : 'Ativar usuário'}
                  >
                    {member.is_active ? 'Ativo' : 'Inativo'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
          <div className="modal-content invite-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Convidar Novo Usuário</h2>
              <button 
                className="close-btn"
                onClick={() => setShowInviteModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Email do usuário</label>
                <input
                  type="email"
                  placeholder="Digite o email do usuário"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="invite-input"
                />
              </div>
              
              <div className="form-group">
                <label>Role inicial</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="role-select"
                >
                  <option value="member">Membro</option>
                  <option value="guest">Convidado</option>
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="cancel-btn"
                onClick={() => setShowInviteModal(false)}
              >
                Cancelar
              </button>
              <button
                className="invite-btn"
                onClick={handleInviteUser}
                disabled={isInviting || !inviteEmail.trim()}
              >
                {isInviting ? 'Enviando...' : 'Enviar Convite'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberManagement;
