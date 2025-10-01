# Integração Trello - Sistema de Votação

Este documento descreve a integração completa do sistema Trello com o projeto de votação, criando uma plataforma unificada para gerenciamento de tarefas e votação.

## 🚀 Funcionalidades Implementadas

### 1. **Sistema de Autenticação**
- ✅ Login com email e senha
- ✅ Cadastro de usuários (Gestor/Colaborador)
- ✅ Validação de formulários
- ✅ Gerenciamento de sessão com JWT
- ✅ Redirecionamento automático baseado no contexto

### 2. **Dashboard Principal**
- ✅ Visão geral de todos os quadros
- ✅ Criação de novos quadros
- ✅ Filtros por status (Todos, Públicos, Privados)
- ✅ Busca de quadros
- ✅ Visualização em grid e lista
- ✅ Estatísticas rápidas

### 3. **Sistema de Quadros (Boards)**
- ✅ Criação de quadros com título, descrição e cor
- ✅ Configuração de visibilidade (público/privado)
- ✅ Navegação para visualização detalhada
- ✅ Gerenciamento de permissões

### 4. **Visualização Kanban**
- ✅ Interface estilo Trello
- ✅ Colunas (listas) arrastáveis
- ✅ Cards com drag & drop
- ✅ Criação de listas e cards
- ✅ Edição inline de cards
- ✅ Atribuição de prioridades e datas
- ✅ Busca de cards

### 5. **Integração com Backend**
- ✅ APIs REST completas
- ✅ Autenticação JWT
- ✅ Interceptors para tratamento de erros
- ✅ Serviços organizados por funcionalidade

## 📁 Estrutura de Arquivos

```
src/
├── components/
│   ├── HomePage.js          # Página inicial com botão Trello
│   ├── LoginPage.js         # Login e cadastro integrados
│   ├── Dashboard.js         # Dashboard principal
│   ├── BoardView.js         # Visualização Kanban
│   └── *.css               # Estilos dos componentes
├── services/
│   ├── authService.js       # Serviços de autenticação
│   ├── boardService.js      # Serviços de quadros
│   └── cardService.js       # Serviços de cards
├── utils/
│   └── api.js              # Configuração do Axios
└── routes.js               # Roteamento da aplicação
```

## 🔧 Configuração

### Variáveis de Ambiente
```env
REACT_APP_BACKEND_URL=http://192.168.0.127:3003
REACT_APP_SOCKET_URL=http://192.168.0.127:3003
NODE_ENV=development
```

### Dependências
```json
{
  "axios": "^1.6.7",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.22.3",
  "react-icons": "^4.12.0"
}
```

## 🎯 Fluxo de Navegação

1. **Página Inicial** → Botão "Trello" → **Dashboard**
2. **Dashboard** → Clicar em quadro → **BoardView (Kanban)**
3. **Login** → Após autenticação → **Dashboard**
4. **BoardView** → Botão voltar → **Dashboard**

## 🔐 Autenticação

### Login
- Email e senha obrigatórios
- Validação em tempo real
- Feedback de erro
- Loading state

### Cadastro
- Nome completo, email, senha
- Confirmação de senha
- Seleção de tipo de usuário
- Validação de senha mínima

## 📊 Dashboard

### Funcionalidades
- **Criação de Quadros**: Modal com formulário completo
- **Filtros**: Todos, Públicos, Privados
- **Busca**: Por título ou descrição
- **Visualização**: Grid responsivo
- **Estatísticas**: Contadores de quadros

### Design
- Header com navegação e busca
- Sidebar com filtros e atalhos
- Grid de quadros responsivo
- Modal de criação

## 🎨 BoardView (Kanban)

### Funcionalidades
- **Colunas**: Listas de cards
- **Cards**: Tarefas com drag & drop
- **Criação**: Listas e cards inline
- **Edição**: Cards editáveis
- **Busca**: Filtro de cards
- **Atribuições**: Prioridade e data

### Drag & Drop
- Mover cards entre listas
- Feedback visual
- Atualização automática do backend

## 🎨 Design System

### Cores
- **Primária**: #006B5B (Verde)
- **Secundária**: #004D40 (Verde escuro)
- **Neutras**: #f8f9fa, #e1e5e9, #666, #333

### Componentes
- **Botões**: Estilo consistente com hover
- **Cards**: Sombras e bordas arredondadas
- **Modais**: Overlay com animações
- **Formulários**: Validação visual

### Responsividade
- **Desktop**: Layout completo
- **Tablet**: Sidebar colapsável
- **Mobile**: Layout vertical

## 🔌 Integração com Backend

### Endpoints Utilizados
```
POST /auth/login          # Login
POST /auth/register       # Cadastro
GET  /auth/profile        # Perfil do usuário
GET  /boards              # Listar quadros
POST /boards              # Criar quadro
GET  /boards/:id          # Obter quadro
GET  /boards/:id/lists    # Listar listas
POST /boards/:id/lists    # Criar lista
GET  /lists/:id/cards     # Listar cards
POST /lists/:id/cards     # Criar card
PUT  /cards/:id           # Atualizar card
DELETE /cards/:id         # Excluir card
PUT  /cards/:id/move      # Mover card
```

### Tratamento de Erros
- Interceptors do Axios
- Redirecionamento automático em 401
- Feedback visual para usuário
- Logs detalhados no console

## 🚀 Como Usar

### 1. Iniciar o Projeto
```bash
cd /Users/andersonpereira/apps/votacao
npm start
```

### 2. Acessar a Aplicação
- **Desenvolvimento**: http://localhost:5000
- **Backend**: http://192.168.0.127:3003

### 3. Fluxo de Uso
1. Acesse a página inicial
2. Clique em "Trello"
3. Faça login ou cadastre-se
4. Crie seu primeiro quadro
5. Adicione listas e cards
6. Use drag & drop para organizar

## 🔄 Próximos Passos

### Funcionalidades Pendentes
- [ ] Menu de opções dos quadros
- [ ] Edição de listas
- [ ] Exclusão de listas
- [ ] Comentários em cards
- [ ] Etiquetas coloridas
- [ ] Checklists
- [ ] Notificações
- [ ] Convites para quadros

### Melhorias
- [ ] Testes unitários
- [ ] Testes de integração
- [ ] PWA (Progressive Web App)
- [ ] Modo offline
- [ ] Temas personalizáveis
- [ ] Atalhos de teclado

## 📱 Compatibilidade

### Navegadores
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Dispositivos
- ✅ Desktop (1920x1080+)
- ✅ Tablet (768x1024)
- ✅ Mobile (375x667+)

## 🐛 Solução de Problemas

### Erro de Conexão
- Verificar se o backend está rodando
- Conferir variáveis de ambiente
- Verificar CORS no backend

### Erro de Autenticação
- Limpar localStorage
- Verificar token JWT
- Fazer logout e login novamente

### Erro de Drag & Drop
- Verificar se o card tem dados válidos
- Conferir IDs das listas
- Verificar permissões do usuário

## 📞 Suporte

Para dúvidas ou problemas:
1. Verificar logs do console
2. Conferir rede no DevTools
3. Verificar estado do backend
4. Consultar documentação da API

---

**Desenvolvido com ❤️ para integração completa entre sistemas de votação e gerenciamento de tarefas.**
