SELECT 'Tabelas criadas' AS verificacao,
       COUNT(*) AS valor,
       IF(COUNT(*) = 11, 'OK', 'FALTAM TABELAS - reimportar database-mysql.sql') AS estado
FROM information_schema.tables WHERE table_schema = DATABASE()
UNION ALL
SELECT 'Utilizadores', COUNT(*),
       IF(COUNT(*) >= 3, 'OK', 'SEM DADOS - reimportar database-mysql.sql') FROM users
UNION ALL
SELECT 'Contas de teste', COUNT(*),
       IF(COUNT(*) = 3, 'OK', 'EM FALTA')
FROM users WHERE email IN ('alice@test.fr','couple@test.fr','free@test.fr')
UNION ALL
SELECT 'Passwords gravadas', COUNT(*),
       IF(COUNT(*) >= 3, 'OK', 'HASHES INVALIDOS')
FROM users WHERE hashedPassword LIKE '$2%'
UNION ALL
SELECT 'Chaves estrangeiras', COUNT(*),
       IF(COUNT(*) = 9, 'OK', 'INCOMPLETAS')
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE() AND REFERENCED_TABLE_NAME IS NOT NULL
UNION ALL
SELECT 'Grupos', COUNT(*), IF(COUNT(*) >= 1, 'OK', 'SEM GRUPO') FROM `groups`
UNION ALL
SELECT 'Mensagens', COUNT(*), IF(COUNT(*) >= 2, 'OK', 'SEM MENSAGENS') FROM messages
UNION ALL
SELECT 'Acentos (UTF-8)', 1,
       IF(EXISTS(SELECT 1 FROM `groups` WHERE name LIKE '%Soirées%'), 'OK', 'CODIFICACAO ERRADA')
UNION ALL
SELECT 'Codificacao da base', 1, DEFAULT_CHARACTER_SET_NAME
FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = DATABASE();
