-- Script para configurar sprints
-- Execute este script no banco PostgreSQL

-- Inserir sprints de exemplo
INSERT INTO sprints (nome, descricao, data_inicio, data_fim, status, board_id) VALUES
('Sprint 1 - Setup Inicial', 'Configuração inicial do projeto e estrutura base', '2025-01-20', '2025-02-03', 'ativa', 1),
('Sprint 2 - Autenticação', 'Implementação do sistema de autenticação e autorização', '2025-02-04', '2025-02-17', 'ativa', 1),
('Sprint 3 - Dashboard', 'Desenvolvimento do dashboard principal e funcionalidades', '2025-02-18', '2025-03-03', 'ativa', 1),
('Sprint 4 - Gestão de Membros', 'Sistema de gerenciamento de membros e permissões', '2025-03-04', '2025-03-17', 'ativa', 1),
('Sprint 5 - Sprints', 'Implementação do sistema de sprints e planejamento', '2025-03-18', '2025-03-31', 'ativa', 1);

-- Atualizar alguns cards para vincular com sprints
UPDATE cards SET sprint_id = 1 WHERE id IN (1, 2);
UPDATE cards SET sprint_id = 2 WHERE id IN (3, 4);
UPDATE cards SET sprint_id = 3 WHERE id IN (5, 6);

-- Verificar dados inseridos
SELECT 
    s.id,
    s.nome,
    s.descricao,
    s.data_inicio,
    s.data_fim,
    s.status,
    s.board_id,
    COUNT(c.id) as total_tasks
FROM sprints s
LEFT JOIN cards c ON s.id = c.sprint_id
GROUP BY s.id, s.nome, s.descricao, s.data_inicio, s.data_fim, s.status, s.board_id
ORDER BY s.data_inicio;
