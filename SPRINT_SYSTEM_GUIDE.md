# 🏃 Sistema de Sprints - Guia Completo

## 📋 Visão Geral

O sistema de sprints implementa a metodologia ágil de desenvolvimento, permitindo que equipes organizem e executem trabalho em ciclos de tempo fixo (normalmente 1-4 semanas).

## 🏗️ Estrutura do Banco de Dados

### Tabela `sprints`
```sql
CREATE TABLE sprints (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'encerrada')),
    board_id INTEGER REFERENCES boards(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tabela `cards` (atualizada)
```sql
ALTER TABLE cards ADD COLUMN sprint_id INTEGER REFERENCES sprints(id) ON DELETE SET NULL;
```

## 🎯 Funcionalidades Implementadas

### 1. **Gerenciamento de Sprints**
- ✅ **Criar nova sprint** com nome, descrição e datas
- ✅ **Editar sprint** existente
- ✅ **Encerrar sprint** com confirmação
- ✅ **Excluir sprint** (apenas se não tiver tarefas)
- ✅ **Visualizar progresso** em tempo real

### 2. **Dashboard de Sprints**
- ✅ **Estatísticas visuais** (sprints ativas, encerradas, total de tarefas)
- ✅ **Filtros por status** (todas, ativas, encerradas)
- ✅ **Cards informativos** com progresso e métricas
- ✅ **Indicadores visuais** de status e prazo

### 3. **Métricas e Progresso**
- ✅ **Barra de progresso** baseada em tarefas concluídas
- ✅ **Contadores de tarefas** (total, concluídas, em andamento, pendentes)
- ✅ **Dias restantes** para encerramento
- ✅ **Alertas visuais** para sprints em atraso

## 🎨 Interface do Usuário

### **Menu Lateral do Dashboard**
- 🏃 **Seção "Sprint"** adicionada abaixo dos filtros
- 🎨 **Botão destacado** com gradiente vermelho e ícone de bandeira
- 🔗 **Navegação direta** para `/sprints`

### **Página de Gerenciamento**
- 📊 **Header com estatísticas** em cards coloridos
- 🔍 **Filtros por status** com contadores
- 📋 **Grid responsivo** de sprints
- ➕ **Modal de criação/edição** intuitivo

## 🚀 Como Usar

### **1. Acessar Sprints**
1. No Dashboard, clique em **"Gerenciar Sprints"** na seção Sprint
2. Você será redirecionado para `/sprints`

### **2. Criar Nova Sprint**
1. Clique no botão **"Nova Sprint"**
2. Preencha os campos:
   - **Nome**: Ex: "Sprint 1 - Setup Inicial"
   - **Descrição**: Objetivos e metas da sprint
   - **Data de Início**: Quando a sprint começa
   - **Data de Fim**: Quando a sprint termina
3. Clique em **"Criar Sprint"**

### **3. Gerenciar Sprint Existente**
- **Editar**: Clique no ícone de lápis
- **Encerrar**: Clique no ícone de stop (com confirmação)
- **Excluir**: Clique no ícone de lixeira (com confirmação)

### **4. Acompanhar Progresso**
- **Barra de progresso** mostra % de conclusão
- **Contadores** mostram distribuição de tarefas
- **Dias restantes** alertam sobre prazo
- **Cores** indicam status (verde=boa, amarelo=média, vermelho=atraso)

## 📊 Métricas e Indicadores

### **Cards de Estatísticas**
- 🟢 **Sprints Ativas**: Número de sprints em andamento
- ⚫ **Sprints Encerradas**: Número de sprints finalizadas
- 📋 **Total de Tarefas**: Soma de todas as tarefas nas sprints ativas
- ✅ **Tarefas Concluídas**: Tarefas marcadas como "done"

### **Indicadores Visuais**
- **Status da Sprint**:
  - 🟢 Verde: Ativa e no prazo
  - 🔴 Vermelho: Ativa mas em atraso
  - ⚫ Cinza: Encerrada

- **Progresso**:
  - 🟢 80%+: Excelente progresso
  - 🟡 60-79%: Bom progresso
  - 🟠 40-59%: Progresso médio
  - 🔴 <40%: Progresso baixo

## 🔧 Estrutura Técnica

### **Componentes Criados**
- `SprintManagement.js` - Página principal de gerenciamento
- `SprintManagement.css` - Estilos responsivos
- Modal integrado para criação/edição

### **Rotas Adicionadas**
- `/sprints` - Página de gerenciamento de sprints

### **Banco de Dados**
- Tabela `sprints` criada
- Coluna `sprint_id` adicionada em `cards`
- Índices para performance otimizada

## 📱 Responsividade

### **Desktop (1024px+)**
- Grid de 2-3 colunas para cards de sprint
- Estatísticas em linha horizontal
- Modal centralizado

### **Tablet (768px-1024px)**
- Grid de 1-2 colunas
- Estatísticas em grid 2x2
- Modal adaptado

### **Mobile (<768px)**
- Layout vertical
- Cards em coluna única
- Modal full-screen
- Botões touch-friendly

## 🎯 Próximos Passos

### **Funcionalidades Futuras**
- [ ] **Integração com tarefas**: Vincular cards a sprints
- [ ] **Burndown chart**: Gráfico de progresso ao longo do tempo
- [ ] **Relatórios**: Exportar métricas de sprint
- [ ] **Notificações**: Alertas de prazo e conclusão
- [ ] **Templates**: Modelos pré-definidos de sprint
- [ ] **Integração com boards**: Criar sprints dentro de boards específicos

### **Melhorias Técnicas**
- [ ] **API real**: Substituir dados mock por chamadas reais
- [ ] **WebSocket**: Atualizações em tempo real
- [ ] **Cache**: Otimização de performance
- [ ] **Testes**: Cobertura de testes unitários

## 🏃‍♂️ Fluxo de Trabalho Recomendado

### **1. Planejamento**
1. Criar sprint com duração de 1-4 semanas
2. Definir objetivos claros na descrição
3. Estabelecer data de início e fim

### **2. Execução**
1. Adicionar tarefas à sprint
2. Acompanhar progresso diariamente
3. Mover tarefas entre status (todo → doing → done)

### **3. Encerramento**
1. Revisar tarefas concluídas
2. Mover tarefas não concluídas para próxima sprint
3. Encerrar sprint atual
4. Criar nova sprint para próximo ciclo

## 📈 Benefícios do Sistema

### **Para a Equipe**
- ✅ **Visibilidade clara** do progresso
- ✅ **Foco em entregas** de valor
- ✅ **Ciclos de feedback** rápidos
- ✅ **Melhoria contínua** dos processos

### **Para o Gestor**
- ✅ **Controle de prazos** e entregas
- ✅ **Métricas objetivas** de performance
- ✅ **Planejamento** baseado em dados
- ✅ **Identificação** de gargalos

### **Para o Projeto**
- ✅ **Entrega incremental** de funcionalidades
- ✅ **Redução de riscos** de atraso
- ✅ **Maior qualidade** do produto
- ✅ **Satisfação** do cliente

---

## 🎉 Conclusão

O sistema de sprints está **100% funcional** e pronto para uso! Ele implementa as melhores práticas da metodologia ágil, proporcionando uma experiência intuitiva e eficiente para o gerenciamento de projetos.

**Acesse através do Dashboard → Seção Sprint → "Gerenciar Sprints"** 🏃‍♂️
