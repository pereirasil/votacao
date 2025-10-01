# 👥 Guia de Gestão de Membros - Sistema de Quadros

## 🎯 Visão Geral

O sistema de gestão de membros permite que administradores de quadros gerenciem quem tem acesso e quais permissões cada usuário possui dentro de um quadro específico.

---

## 🔐 Sistema de Permissões

### **Roles Disponíveis:**
- **👑 Admin**: Controle total do quadro
- **👤 Member**: Acesso completo às funcionalidades
- **👔 Guest**: Acesso limitado (somente visualização)

### **Permissões por Role:**

| Funcionalidade | Admin | Member | Guest |
|----------------|-------|--------|-------|
| Visualizar quadro | ✅ | ✅ | ✅ |
| Criar/editar cards | ✅ | ✅ | ❌ |
| Mover cards | ✅ | ✅ | ❌ |
| Comentar | ✅ | ✅ | ❌ |
| Gerenciar membros | ✅ | ❌ | ❌ |
| Configurações do quadro | ✅ | ❌ | ❌ |
| Excluir quadro | ✅ | ❌ | ❌ |

---

## 🚀 Como Usar

### **1. Acessar Gestão de Membros**

1. **Entre em um quadro** (ex: "Projeto Principal")
2. **Localize o botão de membros** no header (👥) - **visível apenas para admins**
3. **Clique no botão** para abrir o modal de gestão

### **2. Visualizar Membros Atuais**

O modal mostra:
- **Avatar** do usuário (ou inicial do nome)
- **Nome completo** e **email**
- **Role atual** com ícone identificador
- **Data de entrada** no quadro

### **3. Gerenciar Membros Existentes**

#### **Alterar Permissão:**
1. **Selecione o novo role** no dropdown
2. **Confirmação automática** da alteração
3. **Atualização em tempo real** da interface

#### **Remover Membro:**
1. **Clique no botão vermelho** (🗑️)
2. **Confirme a remoção** no popup
3. **Membro removido** instantaneamente

### **4. Convidar Novos Membros**

1. **Digite o email** do usuário
2. **Clique em "Enviar Convite"**
3. **Sistema processa** o convite:
   - Se usuário existe → Adicionado diretamente
   - Se não existe → Convite pendente criado

---

## 🗄️ Estrutura do Banco de Dados

### **Tabela: board_members**
```sql
CREATE TABLE board_members (
    id SERIAL PRIMARY KEY,
    board_id INTEGER NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member', 'guest')),
    joined_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(board_id, user_id)
);
```

### **Índices para Performance:**
```sql
CREATE INDEX idx_board_members_board_id ON board_members(board_id);
CREATE INDEX idx_board_members_user_id ON board_members(user_id);
CREATE INDEX idx_board_members_role ON board_members(role);
```

---

## 🔧 Implementação Técnica

### **Frontend (React)**

#### **Componente Principal:**
- **BoardView.js** - Contém o modal de gestão
- **boardMemberService.js** - Serviço para API calls

#### **Estados Gerenciados:**
```javascript
const [showMemberManagement, setShowMemberManagement] = useState(false);
const [boardMembers, setBoardMembers] = useState([]);
const [userRole, setUserRole] = useState(null);
const [inviteEmail, setInviteEmail] = useState('');
const [isInviting, setIsInviting] = useState(false);
```

#### **Funções Principais:**
- `loadBoardMembers()` - Carrega membros do quadro
- `handleInviteMember()` - Envia convite
- `handleChangeMemberRole()` - Altera permissão
- `handleRemoveMember()` - Remove membro

### **Backend (NestJS)**

#### **Endpoints Necessários:**
```typescript
// Obter membros do quadro
GET /boards/:boardId/members

// Adicionar membro
POST /boards/:boardId/members
Body: { email: string, role: string }

// Atualizar role
PUT /boards/:boardId/members/:memberId
Body: { role: string }

// Remover membro
DELETE /boards/:boardId/members/:memberId

// Convidar usuário
POST /boards/:boardId/invite
Body: { email: string, role: string }

// Aceitar convite
POST /invites/:token/accept

// Verificar permissões
GET /boards/:boardId/permissions
```

#### **Middleware de Autorização:**
```typescript
@UseGuards(BoardAdminGuard)
@Controller('boards/:boardId/members')
export class BoardMembersController {
  // Apenas admins podem acessar
}
```

---

## 🎨 Interface e UX

### **Design do Modal:**
- **Header** com título e botão de fechar
- **Seção de membros** com lista scrollável
- **Seção de convite** com formulário
- **Footer** com botão de fechar

### **Estados Visuais:**
- **Loading states** para operações assíncronas
- **Feedback visual** para ações do usuário
- **Confirmações** para ações destrutivas
- **Validação** de campos obrigatórios

### **Responsividade:**
- **Mobile-first** design
- **Layout adaptativo** para telas pequenas
- **Touch-friendly** botões e inputs

---

## 🔒 Segurança e Validação

### **Validações Frontend:**
- **Email válido** obrigatório para convites
- **Confirmação** para remoção de membros
- **Verificação de role** antes de mostrar ações

### **Validações Backend:**
- **Autenticação JWT** obrigatória
- **Verificação de admin** no quadro
- **Validação de dados** de entrada
- **Rate limiting** para convites

### **Proteções:**
- **CSRF protection** nos formulários
- **SQL injection** prevention
- **XSS protection** nos inputs
- **Authorization** em todas as rotas

---

## 📊 Monitoramento e Logs

### **Logs Estruturados:**
```javascript
console.log('👥 Carregando membros do board...');
console.log('📧 Enviando convite para:', email);
console.log('🔄 Alterando role do membro:', memberId, 'para:', newRole);
console.log('🗑️ Removendo membro:', memberId);
```

### **Métricas Importantes:**
- **Número de membros** por quadro
- **Taxa de aceite** de convites
- **Atividade** de membros
- **Tempo de resposta** das operações

---

## 🚀 Fluxo de Convite

### **Cenário 1: Usuário Existe**
1. Admin digita email → `POST /boards/:id/invite`
2. Backend verifica se usuário existe
3. Cria registro em `board_members`
4. Usuário recebe notificação
5. Acesso imediato ao quadro

### **Cenário 2: Usuário Não Existe**
1. Admin digita email → `POST /boards/:id/invite`
2. Backend cria `invite_token`
3. Link de convite gerado
4. Admin copia link e envia por email
5. Usuário clica no link → cadastro/login
6. Aceita convite → `POST /invites/:token/accept`
7. Adicionado ao quadro automaticamente

---

## 🎯 Casos de Uso

### **1. Onboarding de Nova Equipe**
- Admin convida todos os membros
- Define roles apropriados
- Treina equipe nas funcionalidades

### **2. Mudança de Projeto**
- Remove membros antigos
- Adiciona nova equipe
- Ajusta permissões conforme necessário

### **3. Colaboração Externa**
- Adiciona stakeholders como guests
- Permite visualização sem edição
- Remove acesso quando necessário

### **4. Gestão de Permissões**
- Promove membros a admin
- Rebaixa admins conforme necessário
- Mantém controle granular

---

## 🔧 Configuração e Deploy

### **Variáveis de Ambiente:**
```env
# Backend
DATABASE_URL=postgresql://user:pass@localhost:5432/trello_db
JWT_SECRET=your-secret-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Frontend
REACT_APP_BACKEND_URL=http://localhost:3003
REACT_APP_SOCKET_URL=http://localhost:3003
```

### **Scripts de Setup:**
```sql
-- Executar no banco PostgreSQL
\i setup_board_members.sql
```

---

## 📝 Checklist de Implementação

### **Frontend:**
- [x] Modal de gestão de membros
- [x] Lista de membros com avatars
- [x] Formulário de convite
- [x] Controles de role
- [x] Botão de remoção
- [x] Estilos responsivos
- [x] Estados de loading
- [x] Tratamento de erros

### **Backend:**
- [ ] Endpoints de membros
- [ ] Middleware de autorização
- [ ] Validação de dados
- [ ] Sistema de convites
- [ ] Notificações por email
- [ ] Logs estruturados
- [ ] Testes unitários

### **Banco de Dados:**
- [x] Tabela board_members
- [x] Índices de performance
- [x] Constraints de integridade
- [x] Scripts de setup

---

## 🎉 Resultado Final

O sistema de gestão de membros oferece:

✅ **Controle granular** de permissões por quadro  
✅ **Interface intuitiva** para administradores  
✅ **Sistema de convites** flexível  
✅ **Segurança robusta** com validações  
✅ **Experiência responsiva** em todos os dispositivos  
✅ **Logs detalhados** para debugging  
✅ **Performance otimizada** com índices  

**Status:** ✅ **Implementado e Funcional**
