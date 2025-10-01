-- Script para configurar board_members
-- Execute este script no banco PostgreSQL

-- Inserir o usuário admin como admin do primeiro board
INSERT INTO board_members (board_id, user_id, role) 
VALUES (1, 15, 'admin') 
ON CONFLICT (board_id, user_id) DO UPDATE SET role = 'admin';

-- Verificar se foi inserido corretamente
SELECT 
    bm.id,
    bm.board_id,
    bm.user_id,
    bm.role,
    bm.joined_at,
    u.name as user_name,
    u.email as user_email,
    b.name as board_name
FROM board_members bm
JOIN users u ON bm.user_id = u.id
JOIN boards b ON bm.board_id = b.id
WHERE bm.user_id = 15;
