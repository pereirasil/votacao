# 📋 Fluxo Completo do Projeto - Sistema de Votação

## 🎯 Visão Geral do Sistema

Este é um **sistema híbrido** que combina:
- **Sistema de Gestão de Projetos** (estilo Trello)
- **Sistema de Votação em Tempo Real** (Planning Poker)

---

## 🏗️ Arquitetura do Sistema

### **Frontend (React)**
- **Tecnologia:** React 18.2.0 + React Router DOM
- **Comunicação:** Socket.io-client para tempo real
- **Autenticação:** JWT tokens no localStorage
- **Estado:** useState/useEffect para gerenciamento local

### **Backend (NestJS)**
- **Banco de Dados:** PostgreSQL
- **Comunicação:** Socket.io para tempo real
- **Autenticação:** JWT com middleware de validação
- **API:** RESTful endpoints

---

## 🔄 Fluxo Principal do Sistema

### **1. Página Inicial (HomePage)**
```
┌─────────────────────────────────────┐
│           HOMEPAGE                  │
│  ┌─────────────────────────────────┐ │
│  │     Planning Poker Online       │ │
│  │   "Scrum Poker para times ágeis"│ │
│  └─────────────────────────────────┘ │
│                                     │
│  [Criar Nova Sala] [Entrar em Sala] │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │        Salas Ativas             │ │
│  │  Sala ABC123 - 3 participantes  │ │
│  │  Sala XYZ789 - 5 participantes  │ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Funcionalidades:**
- Conecta com Socket.io para listar salas ativas
- Permite criar nova sala de votação
- Permite entrar em sala existente
- Botão "Trello" para acessar sistema de gestão

### **2. Sistema de Autenticação (LoginPage)**
```
┌─────────────────────────────────────┐
│           LOGIN PAGE                │
│  ┌─────────────────────────────────┐ │
│  │        [Entrar]                 │ │
│  │  Email: [________________]      │ │
│  │  Senha: [________________]      │ │
│  │  [Entrar] [Cadastrar-se]        │ │
│  └─────────────────────────────────┘ │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │      [Criar Conta]              │ │
│  │  Nome: [________________]       │ │
│  │  Email: [________________]      │ │
│  │  Senha: [________________]      │ │
│  │  Confirmar: [________________]  │ │
│  │  Role: [Colaborador/Gestor]     │ │
│  │  ✅ Sistema de Roles Globais    │ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Fluxos de Redirecionamento:**
- **Com roomId:** `/login?roomId=ABC123` → `/avatar?roomId=ABC123` → `/votacao/ABC123`
- **Sem roomId:** `/login` → `/dashboard`

**Sistema de Roles Globais (NOVO):**
- **Manager (Gestor):** Acesso completo ao sistema, pode criar boards, gerenciar equipes
- **Collaborator (Colaborador):** Acesso padrão, pode participar de boards e votações
- **Padrão:** Se não especificado, assume 'collaborator'
- **Validação:** Campo opcional com enum UserRole

### **3. Dashboard (Sistema Trello)**
```
┌─────────────────────────────────────┐
│           DASHBOARD                 │
│  ┌─────────────────────────────────┐ │
│  │  TimeBoard    [🔍] [🔔] [👤]    │ │
│  └─────────────────────────────────┘ │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │  [Todos] [Públicos] [Privados]  │ │
│  └─────────────────────────────────┘ │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │  ┌─────────┐ ┌─────────┐       │ │
│  │  │ Projeto │ │ Backlog │       │ │
│  │  │Principal│ │Funcional│       │ │
│  │  │ 3 listas│ │ 2 listas│       │ │
│  │  └─────────┘ └─────────┘       │ │
│  │  ┌─────────┐ ┌─────────┐       │ │
│  │  │ Sprint  │ │ Bugs e  │       │ │
│  │  │ Atual   │ │Melhorias│       │ │
│  │  │ 4 listas│ │ 3 listas│       │ │
│  │  └─────────┘ └─────────┘       │ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Funcionalidades:**
- Visualização de boards (quadros)
- Criação de novos boards
- Filtros por visibilidade (público/privado)
- Busca de boards
- Navegação para BoardView

### **4. BoardView (Visualização de Quadro)**
```
┌─────────────────────────────────────┐
│           BOARD VIEW                │
│  ┌─────────────────────────────────┐ │
│  │  Projeto Principal    [⚙️] [👥]│ │
│  └─────────────────────────────────┘ │
│                                     │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐│
│  │  To Do  │ │In Progress│ │  Done  ││
│  │ ┌─────┐ │ │ ┌─────┐ │ │ ┌─────┐ ││
│  │ │Task1│ │ │ │Task2│ │ │ │Task3│ ││
│  │ │High │ │ │ │Med │ │ │ │Low │ ││
│  │ └─────┘ │ │ └─────┘ │ │ └─────┘ ││
│  │ ┌─────┐ │ │         │ │         ││
│  │ │Task4│ │ │         │ │         ││
│  │ │Med │ │ │         │ │         ││
│  │ └─────┘ │ │         │ │         ││
│  └─────────┘ └─────────┘ └─────────┘│
└─────────────────────────────────────┘
```

**Funcionalidades:**
- Visualização de listas e cards
- Drag & drop de cards
- Criação de novos cards
- Edição de cards existentes
- Gerenciamento de membros

### **5. Sistema de Votação (Planning Poker)**
```
┌─────────────────────────────────────┐
│         VOTACAO PAGE                │
│  ┌─────────────────────────────────┐ │
│  │  Sala ABC123    [👥] [⚙️] [🚪] │ │
│  └─────────────────────────────────┘ │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │        Histórias de Usuário     │ │
│  │  ┌─────────────────────────────┐ │ │
│  │  │ Como usuário, quero fazer    │ │ │
│  │  │ login no sistema            │ │ │
│  │  │ [Votar] [Pular] [Finalizar] │ │ │
│  │  └─────────────────────────────┘ │ │
│  └─────────────────────────────────┘ │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │        Cartas de Votação        │ │
│  │  [0] [1] [2] [3] [5] [8] [13]   │ │
│  │  [?] [☕] [∞]                    │ │
│  └─────────────────────────────────┘ │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │        Participantes            │ │
│  │  👤 João (votou)  👤 Maria (votou)│ │
│  │  👤 Pedro (votou) 👤 Ana (votando)│ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Funcionalidades:**
- Criação de salas de votação
- Entrada em salas existentes
- Votação em tempo real
- Histórico de votações
- Chat em tempo real
- Compartilhamento de salas

---

## 🔐 Sistema de Autenticação

### **Fluxo de Login:**
1. **Usuário insere credenciais** → LoginPage
2. **Validação no frontend** → Campos obrigatórios
3. **Requisição para API** → `/auth/login`
4. **Validação no backend** → JWT token gerado
5. **Armazenamento local** → localStorage (authToken, userData)
6. **Redirecionamento** → Dashboard ou Votação

### **Proteção de Rotas:**
```javascript
// Rotas Privadas (requerem autenticação)
<PrivateRoute>
  <Dashboard />
</PrivateRoute>

// Rotas de Votação (dados específicos)
<VotingRoute>
  <Votacao />
</VotingRoute>
```

---

## 🌐 Comunicação em Tempo Real

### **Socket.io Events:**

#### **Sistema de Votação:**
- `createRoom` → Criar nova sala
- `joinRoom` → Entrar em sala
- `leaveRoom` → Sair da sala
- `vote` → Enviar voto
- `revealVotes` → Revelar votos
- `newStory` → Nova história de usuário

#### **Sistema de Gestão:**
- `boardUpdate` → Atualização de board
- `cardMove` → Movimentação de card
- `memberJoin` → Novo membro no board

---

## 🗄️ Estrutura do Banco de Dados

### **Tabelas Principais:**
```sql
-- Usuários (ATUALIZADO com Roles Globais)
users (id, name, email, password_hash, role, is_admin, created_at, updated_at)
-- role: ENUM('manager', 'collaborator') DEFAULT 'collaborator'

-- Boards (Quadros)
boards (id, name, description, user_id, is_public, created_at, updated_at)

-- Listas
lists (id, name, board_id, position, created_at, updated_at)

-- Cards (Tarefas)
cards (id, title, description, list_id, position, priority, assigned_user_id, due_date, created_at, updated_at)

-- Salas de Votação
voting_rooms (id, name, created_by, is_active, created_at, updated_at)

-- Participantes da Votação
voting_participants (id, room_id, user_id, user_name, joined_at)

-- Votos
voting_votes (id, room_id, user_id, story_id, vote_value, created_at)
```

---

## 🔐 Sistema de Permissões Hierárquico

### **Roles Globais (Nível Sistema):**
- **Manager (Gestor):**
  - Acesso completo ao sistema
  - Pode criar e gerenciar boards
  - Pode convidar usuários
  - Acesso a todas as funcionalidades
  
- **Collaborator (Colaborador):**
  - Acesso padrão ao sistema
  - Pode participar de boards existentes
  - Pode participar de votações
  - Funcionalidades limitadas

### **Roles por Board (Nível Projeto):**
- **Owner:** Criador do board, controle total
- **Admin:** Pode gerenciar membros e configurações
- **Member:** Pode criar e editar cards
- **Viewer:** Apenas visualização

### **Hierarquia de Permissões:**
```
Sistema Global → Board Específico → Card Individual
     ↓              ↓                    ↓
   Manager      Owner/Admin         Assigned User
Collaborator    Member/Viewer       Any Member
```

---

## 🔄 Fluxos de Navegação

### **Fluxo 1: Acesso ao Sistema de Gestão**
```
HomePage → LoginPage → Dashboard → BoardView
```

### **Fluxo 2: Acesso ao Sistema de Votação**
```
HomePage → LoginPage → AvatarSelection → Votacao
```

### **Fluxo 3: Criação de Sala de Votação**
```
HomePage → [Criar Sala] → LoginPage → AvatarSelection → Votacao
```

### **Fluxo 4: Entrada em Sala Existente**
```
HomePage → [Entrar em Sala] → LoginPage → AvatarSelection → Votacao
```

---

## 🛠️ Serviços e Utilitários

### **AuthService:**
- `login(email, password)` → Autenticação
- `register(userData)` → Cadastro com role global
- `isAuthenticated()` → Verificação de autenticação
- `getCurrentUser()` → Dados do usuário atual (inclui role)
- `logout()` → Logout e limpeza

**Exemplo de Cadastro:**
```javascript
await authService.register({
  name: "João Silva",
  email: "joao@exemplo.com",
  password: "minhasenha123",
  role: "manager" // ou "collaborator"
});
```

### **BoardService:**
- `getBoards()` → Listar quadros
- `createBoard(boardData)` → Criar quadro
- `updateBoard(id, data)` → Atualizar quadro
- `deleteBoard(id)` → Excluir quadro

### **CardService:**
- `getCards(listId)` → Listar cards
- `createCard(listId, data)` → Criar card
- `updateCard(id, data)` → Atualizar card
- `moveCard(id, newListId, position)` → Mover card

### **API Utils:**
- Tratamento de erros robusto
- Interceptação de requisições
- Headers automáticos (Authorization)
- Retry automático para erros de rede

---

## 🎨 Interface e UX

### **Design System:**
- **Cores:** Paleta consistente com tema claro/escuro
- **Tipografia:** Fontes legíveis e hierarquia clara
- **Componentes:** Reutilizáveis e modulares
- **Responsividade:** Mobile-first approach

### **Estados de Loading:**
- Spinners para operações assíncronas
- Skeleton screens para carregamento de dados
- Feedback visual para ações do usuário

### **Tratamento de Erros:**
- Mensagens de erro claras e específicas
- Fallbacks para falhas de rede
- Validação em tempo real

---

## 🚀 Deploy e Configuração

### **Ambientes:**
- **Desenvolvimento:** `localhost:3000` (Frontend) + `localhost:3003` (Backend)
- **Produção:** `https://app.timeboard.site` (Frontend) + `https://api.timeboard.site` (Backend)

### **Variáveis de Ambiente:**
```env
REACT_APP_BACKEND_URL=http://localhost:3003
REACT_APP_SOCKET_URL=http://localhost:3003
REACT_APP_SOCKET_PATH=/socket.io/
NODE_ENV=development
```

---

## 📊 Métricas e Monitoramento

### **Logs Estruturados:**
- Console logs com emojis para identificação rápida
- Logs de requisições HTTP
- Logs de eventos Socket.io
- Logs de autenticação e autorização

### **Debugging:**
- Ferramentas de debug no navegador
- Verificação de estado do localStorage
- Monitoramento de conexões Socket.io
- Validação de dados de resposta

---

## 🔧 Manutenção e Evolução

### **Padrões de Código:**
- **SOLID Principles** aplicados
- **Clean Code** practices
- **Comentários em inglês** para funções e classes
- **Nomenclatura consistente** em inglês

### **Estrutura de Arquivos:**
```
src/
├── components/     # Componentes React
├── services/       # Serviços de API
├── utils/          # Utilitários e helpers
├── hooks/          # Custom hooks
├── assets/         # Imagens e recursos
└── Votacao/        # Sistema de votação
```

---

## 🎯 Resumo do Fluxo

Este sistema oferece **duas funcionalidades principais**:

1. **Sistema de Gestão de Projetos** (Trello-like)
   - Criação e gerenciamento de boards
   - Organização de tarefas em listas
   - Colaboração em tempo real

2. **Sistema de Votação** (Planning Poker)
   - Salas de votação em tempo real
   - Estimativas colaborativas
   - Histórico de decisões

Ambos os sistemas compartilham:
- **Autenticação JWT** unificada
- **Comunicação Socket.io** para tempo real
- **Interface responsiva** e moderna
- **Tratamento robusto de erros**

O fluxo é **intuitivo** e **flexível**, permitindo que usuários alternem entre gestão de projetos e sessões de votação conforme necessário.
