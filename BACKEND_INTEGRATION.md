# Integração Frontend com Backend - Documentação

## Resumo das Alterações

Este documento descreve as alterações implementadas para integrar o frontend React com o backend Node.js, utilizando as rotas corretas da API.

## Configurações Atualizadas

### 1. Configuração da API (`src/utils/api.js`)

**Alterações:**
- Atualizada URL base do backend para `http://localhost:3003` (desenvolvimento) e `https://timeboard.site` (produção)
- Mantido sistema robusto de tratamento de erros com classes `ApiError` e `NetworkError`
- Preservado sistema de logs estruturado para debugging

## Serviços Atualizados

### 2. AuthService (`src/services/authService.js`)

**Status:** ✅ Já estava correto
- Rotas utilizadas: `/auth/login`, `/auth/register`, `/auth/profile`
- Mantido tratamento robusto de erros
- Preservado sistema de logs detalhado

### 3. BoardService (`src/services/boardService.js`)

**Alterações Implementadas:**
- ✅ Atualizadas rotas para seguir estrutura hierárquica do backend:
  - `GET /boards` - Listar boards do usuário
  - `GET /boards/:id` - Obter board por ID
  - `POST /boards` - Criar novo board
  - `PUT /boards/:id` - Atualizar board
  - `DELETE /boards/:id` - Deletar board
  - `GET /boards/:boardId/lists` - Listar listas do board
  - `POST /boards/:boardId/lists` - Criar nova lista
  - `PUT /boards/:boardId/lists/:listId` - Atualizar lista
  - `DELETE /boards/:boardId/lists/:listId` - Deletar lista
  - `PUT /boards/:boardId/lists/:listId/move` - Mover lista
  - `GET /boards/:boardId/lists/:listId/cards` - Listar cards da lista
  - `POST /boards/:boardId/lists/:listId/cards` - Criar novo card
  - `GET /boards/:boardId/lists/:listId/cards/:cardId` - Obter card por ID
  - `PUT /boards/:boardId/lists/:listId/cards/:cardId` - Atualizar card
  - `DELETE /boards/:boardId/lists/:listId/cards/:cardId` - Deletar card
  - `PUT /boards/:boardId/lists/:listId/cards/:cardId/move` - Mover card
  - `PUT /boards/:boardId/lists/:listId/cards/:cardId/assign` - Atribuir card

**Novos Métodos Adicionados:**
- `addBoardMember(boardId, memberData)` - Adicionar membro ao board
- `updateBoardMember(boardId, memberId, memberData)` - Atualizar membro do board
- `removeBoardMember(boardId, memberId)` - Remover membro do board
- `moveList(boardId, listId, newPosition)` - Mover lista dentro do board
- `assignCard(boardId, listId, cardId, userId)` - Atribuir card a usuário

### 4. CardService (`src/services/cardService.js`)

**Alterações Implementadas:**
- ✅ Atualizadas rotas para seguir estrutura hierárquica do backend
- ✅ Corrigidos métodos para incluir `boardId` e `listId` nos parâmetros
- ✅ Atualizada rota de tarefas para usar `/sprints/my/tasks`

**Métodos Atualizados:**
- `getCards(boardId, listId)` - Obtém cards de uma lista específica
- `getCard(boardId, listId, cardId)` - Obtém card específico
- `createCard(boardId, listId, cardData)` - Cria novo card
- `updateCard(boardId, listId, cardId, cardData)` - Atualiza card
- `deleteCard(boardId, listId, cardId)` - Deleta card
- `moveCard(boardId, listId, cardId, newListId, newPosition)` - Move card
- `assignCard(boardId, listId, cardId, userId)` - Atribui card
- `unassignCard(boardId, listId, cardId)` - Remove atribuição
- `getMyTasks()` - Obtém tarefas usando `/sprints/my/tasks`

## Novos Serviços Criados

### 5. SprintService (`src/services/sprintService.js`)

**Funcionalidades Implementadas:**
- `createSprint(sprintData)` - Criar nova sprint
- `getBoardSprints(boardId)` - Obter sprints de um board
- `getSprint(sprintId)` - Obter sprint específica
- `updateSprint(sprintId, sprintData)` - Atualizar sprint
- `deleteSprint(sprintId)` - Deletar sprint
- `getSprintTasks(sprintId)` - Obter tarefas da sprint
- `addTaskToSprint(taskData)` - Adicionar tarefa à sprint
- `updateSprintTask(taskId, taskData)` - Atualizar tarefa da sprint
- `removeTaskFromSprint(taskId)` - Remover tarefa da sprint
- `getMyTasks()` - Obter minhas tarefas

**Rotas Utilizadas:**
- `POST /sprints` - Criar sprint
- `GET /sprints/board/:boardId` - Obter sprints do board
- `GET /sprints/:id` - Obter sprint por ID
- `PUT /sprints/:id` - Atualizar sprint
- `DELETE /sprints/:id` - Deletar sprint
- `GET /sprints/:id/tasks` - Obter tarefas da sprint
- `POST /sprints/tasks` - Adicionar tarefa à sprint
- `PUT /sprints/tasks/:taskId` - Atualizar tarefa da sprint
- `DELETE /sprints/tasks/:taskId` - Remover tarefa da sprint
- `GET /sprints/my/tasks` - Obter minhas tarefas

### 6. TeamMemberService (`src/services/teamMemberService.js`)

**Funcionalidades Implementadas:**
- `getBoardMembers(boardId)` - Obter membros de um board
- `addMember(memberData)` - Adicionar membro ao board
- `updateMember(memberId, memberData)` - Atualizar função do membro
- `removeMember(memberId)` - Remover membro do board
- `inviteMember(inviteData)` - Convidar membro para o board
- `getBoardInvites(boardId)` - Obter convites do board
- `acceptInvite(inviteData)` - Aceitar convite
- `updateInvite(inviteId, inviteData)` - Atualizar status do convite
- `deleteInvite(inviteId)` - Deletar convite
- `getTeamMembers()` - Obter membros da equipe
- `inviteTeamMember(inviteData)` - Convidar membro para equipe
- `updateTeamMember(memberId, memberData)` - Atualizar membro da equipe
- `removeTeamMember(memberId)` - Remover membro da equipe

**Rotas Utilizadas:**
- `GET /team-members/board/:boardId` - Obter membros do board
- `POST /team-members` - Adicionar membro ao board
- `PUT /team-members/:id` - Atualizar função do membro
- `DELETE /team-members/:id` - Remover membro do board
- `POST /team-members/invite` - Convidar membro para o board
- `GET /team-members/invites/board/:boardId` - Obter convites do board
- `POST /team-members/accept-invite` - Aceitar convite
- `PUT /team-members/invites/:inviteId` - Atualizar status do convite
- `DELETE /team-members/invites/:inviteId` - Deletar convite
- `GET /team/members` - Obter membros da equipe
- `POST /team/invite` - Convidar membro para equipe
- `PUT /team/members/:memberId` - Atualizar membro da equipe
- `DELETE /team/members/:memberId` - Remover membro da equipe

### 7. GitHubService (`src/services/githubService.js`)

**Funcionalidades Implementadas:**
- `getAuthUrl()` - Gerar URL de autorização GitHub
- `processCallback(callbackData)` - Processar callback do GitHub OAuth
- `getUserInfo()` - Obter informações do usuário GitHub
- `getRepositories()` - Obter repositórios do usuário
- `createWebhook(webhookData)` - Criar webhook para repositório
- `getDebugInfo()` - Debug informações do GitHub OAuth
- `checkEnvironmentVariables()` - Verificar variáveis de ambiente
- `getConnectionStatus()` - Verificar status da conexão GitHub
- `validateToken(token)` - Validar token de acesso GitHub
- `disconnect()` - Desconectar integração GitHub

**Rotas Utilizadas:**
- `POST /github/auth-url` - Gerar URL de autorização GitHub
- `POST /github/callback` - Callback POST do GitHub OAuth
- `GET /github/user` - Obter informações do usuário GitHub
- `GET /github/repositories` - Obter repositórios do usuário
- `POST /github/webhook` - Criar webhook para repositório
- `GET /github/debug` - Debug informações do GitHub OAuth
- `GET /github/env-check` - Verificar variáveis de ambiente
- `GET /github/status` - Verificar status da conexão GitHub
- `POST /github/validate-token` - Validar token de acesso GitHub
- `DELETE /github/disconnect` - Desconectar integração GitHub

### 8. NotificationService (`src/services/notificationService.js`)

**Funcionalidades Implementadas:**
- `createNotification(notificationData)` - Criar notificação
- `getNotifications()` - Obter notificações do usuário
- `getUnreadNotifications()` - Obter notificações não lidas
- `getNotificationStats()` - Obter estatísticas de notificações
- `getNotification(notificationId)` - Obter notificação por ID
- `markAsRead(markData)` - Marcar notificações como lidas
- `updateNotification(notificationId, notificationData)` - Atualizar notificação
- `deleteNotification(notificationId)` - Deletar notificação

**Rotas Utilizadas:**
- `POST /notifications` - Criar notificação
- `GET /notifications` - Obter notificações do usuário
- `GET /notifications/unread` - Obter notificações não lidas
- `GET /notifications/stats` - Obter estatísticas de notificações
- `GET /notifications/:id` - Obter notificação por ID
- `PUT /notifications/mark-read` - Marcar notificações como lidas
- `PUT /notifications/:id` - Atualizar notificação
- `DELETE /notifications/:id` - Deletar notificação

### 9. VotingService (`src/services/votingService.js`)

**Funcionalidades Implementadas:**
- `createRoom(roomData)` - Criar sala de votação
- `getActiveRooms()` - Obter salas ativas
- `getRoom(roomId)` - Obter sala por ID
- `deactivateRoom(roomId)` - Desativar sala
- `getChatHistory(roomId)` - Obter histórico do chat

**Rotas Utilizadas:**
- `POST /voting/rooms` - Criar sala de votação
- `GET /voting/rooms` - Obter salas ativas
- `GET /voting/rooms/:roomId` - Obter sala por ID
- `DELETE /voting/rooms/:roomId` - Desativar sala
- `GET /voting/rooms/:roomId/history` - Obter histórico do chat

## Características dos Serviços

### Padrões Implementados

1. **Tratamento de Erros Robusto:**
   - Classes `ApiError` e `NetworkError` para diferentes tipos de erro
   - Método `_handleError()` padronizado em todos os serviços
   - Logs estruturados para debugging

2. **Logs Estruturados:**
   - Console logs com emojis para fácil identificação
   - Informações detalhadas sobre requisições e respostas
   - Tratamento de erros com contexto específico

3. **Estrutura de Resposta Padronizada:**
   ```javascript
   {
     success: boolean,
     data?: any,
     error?: string,
     type?: string,
     status?: number
   }
   ```

4. **Documentação JSDoc:**
   - Todos os métodos documentados com parâmetros e tipos de retorno
   - Descrições claras das funcionalidades

## Próximos Passos

### Implementações Pendentes

1. **Atualização de Componentes:**
   - Atualizar componentes React para usar os novos serviços
   - Implementar loading states
   - Adicionar tratamento de erros na UI

2. **WebSocket Integration:**
   - Implementar comunicação em tempo real para votação
   - Configurar reconexão automática
   - Implementar notificações push

3. **Melhorias de Performance:**
   - Implementar cache de dados
   - Adicionar retry automático para erros de rede
   - Implementar métricas de performance

4. **Testes:**
   - Criar testes unitários para os serviços
   - Implementar testes de integração
   - Adicionar testes E2E

## Configuração do Ambiente

### Variáveis de Ambiente

```bash
# Desenvolvimento
REACT_APP_BACKEND_URL=http://localhost:3003

# Produção
REACT_APP_BACKEND_URL=https://timeboard.site
```

### CORS Configuration

O backend está configurado para aceitar requisições dos seguintes domínios:
- **Desenvolvimento:** localhost:3000, localhost:5000, localhost:5001, localhost:5002
- **Produção:** https://timeboard.site, https://app.timeboard.site

## Conclusão

A integração do frontend com o backend foi implementada com sucesso, seguindo as melhores práticas de desenvolvimento:

- ✅ Todas as rotas do backend foram mapeadas corretamente
- ✅ Tratamento robusto de erros implementado
- ✅ Logs estruturados para debugging
- ✅ Documentação completa dos serviços
- ✅ Padrões consistentes em todos os serviços
- ✅ Estrutura hierárquica respeitada nas rotas

O sistema está pronto para ser testado e utilizado com o backend em `http://localhost:3003`.
