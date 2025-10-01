-- Script para criar tarefas para o usuário anderjulya580@gmail.com
-- Executar este script no banco de dados PostgreSQL

-- Primeiro, vamos verificar se o usuário existe
SELECT id, name, email FROM users WHERE email = 'anderjulya580@gmail.com';

-- Criar uma lista para as tarefas do sprint (se não existir)
INSERT INTO lists (name, board_id, position) 
VALUES ('Sprint Tasks - Ander', 1, 1) 
ON CONFLICT DO NOTHING;

-- Obter o ID da lista criada
SELECT id FROM lists WHERE name = 'Sprint Tasks - Ander' LIMIT 1;

-- Criar 6 tarefas para o usuário anderjulya580@gmail.com
-- Tarefa 1: Implementar autenticação JWT
INSERT INTO cards (title, description, list_id, position, priority, assigned_user_id, due_date, created_at, updated_at)
VALUES (
    'Implementar autenticação JWT',
    'Desenvolver sistema completo de autenticação usando JWT tokens, incluindo login, logout, refresh token e middleware de validação.',
    1, -- Assumindo que a lista tem ID 1
    1,
    'high',
    15, -- ID do usuário anderjulya580@gmail.com
    NOW() + INTERVAL '5 days',
    NOW(),
    NOW()
);

-- Tarefa 2: Criar API de gerenciamento de usuários
INSERT INTO cards (title, description, list_id, position, priority, assigned_user_id, due_date, created_at, updated_at)
VALUES (
    'Criar API de gerenciamento de usuários',
    'Desenvolver endpoints para CRUD de usuários, incluindo criação, listagem, atualização e exclusão com validações apropriadas.',
    1,
    2,
    'high',
    15,
    NOW() + INTERVAL '5 days',
    NOW(),
    NOW()
);

-- Tarefa 3: Implementar sistema de permissões
INSERT INTO cards (title, description, list_id, position, priority, assigned_user_id, due_date, created_at, updated_at)
VALUES (
    'Implementar sistema de permissões',
    'Criar sistema de roles e permissões para controlar acesso a diferentes funcionalidades do sistema.',
    1,
    3,
    'medium',
    15,
    NOW() + INTERVAL '5 days',
    NOW(),
    NOW()
);

-- Tarefa 4: Desenvolver dashboard administrativo
INSERT INTO cards (title, description, list_id, position, priority, assigned_user_id, due_date, created_at, updated_at)
VALUES (
    'Desenvolver dashboard administrativo',
    'Criar interface administrativa para gerenciar usuários, visualizar estatísticas e configurar o sistema.',
    1,
    4,
    'medium',
    15,
    NOW() + INTERVAL '5 days',
    NOW(),
    NOW()
);

-- Tarefa 5: Implementar logs de auditoria
INSERT INTO cards (title, description, list_id, position, priority, assigned_user_id, due_date, created_at, updated_at)
VALUES (
    'Implementar logs de auditoria',
    'Criar sistema de logging para rastrear ações dos usuários e eventos importantes do sistema.',
    1,
    5,
    'low',
    15,
    NOW() + INTERVAL '5 days',
    NOW(),
    NOW()
);

-- Tarefa 6: Otimizar performance do banco de dados
INSERT INTO cards (title, description, list_id, position, priority, assigned_user_id, due_date, created_at, updated_at)
VALUES (
    'Otimizar performance do banco de dados',
    'Analisar e otimizar consultas, criar índices apropriados e implementar cache para melhorar performance.',
    1,
    6,
    'medium',
    15,
    NOW() + INTERVAL '5 days',
    NOW(),
    NOW()
);

-- Verificar as tarefas criadas
SELECT 
    c.id,
    c.title,
    c.description,
    c.priority,
    c.due_date,
    u.name as assigned_to,
    u.email as assigned_email,
    l.name as list_name
FROM cards c
JOIN users u ON c.assigned_user_id = u.id
JOIN lists l ON c.list_id = l.id
WHERE u.email = 'anderjulya580@gmail.com'
ORDER BY c.position;
