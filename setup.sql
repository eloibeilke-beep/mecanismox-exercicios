-- 0. Garantir que a extensão para IDs (UUID) esteja ativa
-- 0. Garantir extensoes necessarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Tabela de Pacientes (Fundamental para as outras)
CREATE TABLE IF NOT EXISTS pacientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  numero text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- 2. Tabela de Histórico (Registra o que foi enviado para cada paciente)
CREATE TABLE IF NOT EXISTS historico (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id uuid REFERENCES pacientes(id) ON DELETE CASCADE,
  aberrancia text,
  exercicios text[],
  created_at timestamptz DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_historico_paciente_id ON historico(paciente_id);

-- Tabela para armazenar as credenciais do Gateway de WhatsApp (Evolution API / Z-API)
CREATE TABLE IF NOT EXISTS configuracoes_venda (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT auth.uid(), -- Vinculado ao usuario autenticado
  gateway_url text, -- Ex: https://sua-api.com
  gateway_key text, -- Token da API
  instancia_id text, -- Nome da instância conectada
  created_at timestamptz default now() not null
);

-- Tabela de Logs (Ajustada para bater com o nome usado no script.js)
CREATE TABLE IF NOT EXISTS logs_envios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id uuid REFERENCES pacientes(id) ON DELETE CASCADE,
  tipo_mensagem text, 
  status text,        
  detalhes text,
  created_at timestamptz default now() not null
);
CREATE INDEX IF NOT EXISTS idx_logs_paciente_id ON logs_envios(paciente_id);

-- Cria a tabela da Biblioteca de Exercícios
CREATE TABLE IF NOT EXISTS biblioteca_exercicios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria text NOT NULL,
  nome text NOT NULL,
  video_url text NOT NULL,
  reps text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- ==========================================
-- CONFIGURAÇÃO DE SEGURANÇA (RLS)
-- ==========================================

ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes_venda ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs_envios ENABLE ROW LEVEL SECURITY;
ALTER TABLE biblioteca_exercicios ENABLE ROW LEVEL SECURITY;

-- Reset de Políticas para evitar erros de duplicidade ao rodar o script novamente
DROP POLICY IF EXISTS "Leitura pública" ON biblioteca_exercicios;
DROP POLICY IF EXISTS "Acesso total pacientes" ON pacientes;
DROP POLICY IF EXISTS "Acesso total historico" ON historico;
DROP POLICY IF EXISTS "Acesso total configuracoes" ON configuracoes_venda;
DROP POLICY IF EXISTS "Inserção de logs" ON logs_envios;
DROP POLICY IF EXISTS "Leitura de logs" ON logs_envios;

CREATE POLICY "Leitura pública" ON biblioteca_exercicios FOR SELECT USING (true);
CREATE POLICY "Acesso total pacientes" ON pacientes FOR ALL USING (true);
CREATE POLICY "Acesso total historico" ON historico FOR ALL USING (true);
CREATE POLICY "Acesso total configuracoes" ON configuracoes_venda FOR ALL USING (true);
CREATE POLICY "Inserção de logs" ON logs_envios FOR INSERT WITH CHECK (true);
CREATE POLICY "Leitura de logs" ON logs_envios FOR SELECT USING (true);

-- ==========================================
-- DADOS INICIAIS
-- ==========================================

-- Garante que exista a linha de configuração para o App encontrar
INSERT INTO configuracoes_venda (id, gateway_url) 
VALUES ('00000000-0000-0000-0000-000000000000', NULL) 
ON CONFLICT (id) DO NOTHING;

-- Inserir dados de exemplo para teste
TRUNCATE TABLE biblioteca_exercicios;

INSERT INTO biblioteca_exercicios (categoria, nome, video_url, reps) VALUES
-- QUEIXO RODADO
('QUEIXO RODADO', 'Isometria em rotação', 'https://youtu.be/6WktWfRt4iE', '2X 20 segundos de resistência para cada lado'),
('QUEIXO RODADO', 'Ante e Retroversão em Pé', 'https://youtu.be/Gh4YNRy8OZ8', '2X 16 repetições'),
('QUEIXO RODADO', 'Isometria em Anteriorização', 'https://youtu.be/CF0F2ZoXNP0', '2X 20 segundos de resistência para cada lado'),
('QUEIXO RODADO', 'Movimento Semicircular dos ombros', 'https://youtu.be/cfYiUvDyYBQ', '2X 8 repetições'),

-- CABEÇA INCLINADA
('CABEÇA INCLINADA', 'Autoliberação da Lateral do Pescoço', 'https://youtu.be/G-NoJC96jEc', '2X 16 repetições para cada lado'),
('CABEÇA INCLINADA', 'Mobilidade em Dorsiflexão', 'https://youtu.be/rbmM_O_-QFk', '2X 16 repetições para cada lado'),
('CABEÇA INCLINADA', 'Isometria em Inclinação do Pescoço', 'https://youtu.be/l8SLbkodYUw', '2X 20 segundos de resistência para cada lado'),
('CABEÇA INCLINADA', 'Movimento Semicircular do Ombro', 'https://youtu.be/cfYiUvDyYBQ', '2X 10 repetições'),

-- CABEÇA FAT FAMILY
('CABEÇA FAT FAMILY', 'Protração e Retração Escapular', 'https://youtu.be/jjo2kmBvETQ', '2X 16 repetições'),
('CABEÇA FAT FAMILY', 'Pêndulo com a Perna', 'https://youtu.be/rll3KLme2Xk', '2X 16 repetições para cada lado'),
('CABEÇA FAT FAMILY', 'Rotação Torácica na Parede', 'https://youtu.be/oLQT6K0LwrA', '2X 16 repetições cada lado'),
('CABEÇA FAT FAMILY', 'Posição Fetal', 'https://youtu.be/cpkcC2mx6Lg', '2X 16 repetições'),

-- QUEIXO ELEVADO
('QUEIXO ELEVADO', 'Alongamento do Gato', 'https://youtu.be/tggvlRnGsJw', '2X 16 repetições'),
('QUEIXO ELEVADO', 'Dissociação Pélvica', 'https://youtu.be/ljaDFzRimp8', '2X 14 repetições para cada lado'),
('QUEIXO ELEVADO', 'Autoliberação dos Eretores Cervicais', 'https://youtu.be/O9WoNApOCNE', '2X 14 repetições'),
('QUEIXO ELEVADO', 'Autoliberação dos Peitorais', 'https://youtu.be/neez2X837Q4', '2X 10 repetições'),

-- CLAVICULA COM PERNA DE "V"
('CLAVICULA COM PERNA DE "V"', 'Direção Joelho - Hálux', 'https://youtu.be/D1sdwwgModo', '2X 16 repetições para cada lado'),
('CLAVICULA COM PERNA DE "V"', 'Rotação à posterior dos Ombros', 'https://youtu.be/vzD-83Jtzeo', '2X 16 repetições'),
('CLAVICULA COM PERNA DE "V"', 'Expansão Respiratória', 'https://youtu.be/Iq34QAvrn6Q', '2X 10 repetições'),
('CLAVICULA COM PERNA DE "V"', 'Autoliberação do Trapézio', 'https://youtu.be/Lv9G2zqSsZY', '2X 16 repetições'),

-- BIGODE DO UMBIGO
('BIGODE DO UMBIGO', 'Balanço da Marcha', 'https://youtu.be/L7qY_QQm8gc', '2X 16 repetições para cada lado'),
('BIGODE DO UMBIGO', 'Expansão Diagonal', 'https://youtu.be/l0CGB3sCApU', '2X 12 repetições para cada lado'),
('BIGODE DO UMBIGO', 'Mobilidade TQTL', 'https://youtu.be/0o8NpVqrrrw', '2X 16 repetições para cada lado'),
('BIGODE DO UMBIGO', 'Mobilidade Torácica', 'https://youtu.be/AZX5nVlzoOw', '2X 16 repetições para cada lado'),

-- VENTRE GIRADO PARA...
('VENTRE GIRADO PARA...', 'Equilíbrio Contralateral', 'https://youtu.be/PPhNACpOGH8', '2X 30 segundos para cada lado'),
('VENTRE GIRADO PARA...', 'Rotação Contralateral', 'https://youtu.be/b6nSXnDgDrw', '2X 24 repetições'),
('VENTRE GIRADO PARA...', 'Cotovelo Para a Coxa', 'https://youtu.be/fHf8PgpPG_k', '2X 12 repetições para cada lado'),
('VENTRE GIRADO PARA...', 'Subida no Degrau com Rotação', 'https://youtu.be/NqV5OCW-NIo', '2X 12 repetições para cada lado'),

-- LATERAL MAIS BAIXA PARA...
('LATERAL MAIS BAIXA PARA...', 'Deslocamento Pélvico Lateral', 'https://youtu.be/FdxqZa1nCdU', '2X 20 segundos para cada lado'),
('LATERAL MAIS BAIXA PARA...', 'Inclinação em Semi Joelho', 'https://youtu.be/09mOaaOltZ4', '2X 16 repetições para cada lado'),
('LATERAL MAIS BAIXA PARA...', 'Autoliberação do Diafragma', 'https://youtu.be/BTswHzXUXXw', '2X 14 repetições para cada lado'),
('LATERAL MAIS BAIXA PARA...', 'Ciclo Respiratório', 'https://youtu.be/IFfugNVL80g', '2X 14 repetições'),

-- PELVE MAIS ALTA A...
('PELVE MAIS ALTA A...', 'Planador', 'https://youtu.be/TjjLaRRVPls', '2X 20 segundos para cada lado'),
('PELVE MAIS ALTA A...', 'Dissociação de Adutores', 'https://youtu.be/zds4l12L3Ys', '2X 16 repetições para cada lado'),
('PELVE MAIS ALTA A...', 'Afastamento dos Joelhos', 'https://youtu.be/44PRvRZDxjc', '2X 16 repetições para cada lado'),
('PELVE MAIS ALTA A...', 'Esfinge', 'https://youtu.be/1ijlpffMZkg', '2X 12 repetições'),

-- ÂNGULO INFERIOR DA PATELA PARA...
('ÂNGULO INFERIOR DA PATELA PARA...', 'Ante e Retroversão em Pé', 'https://youtu.be/XoDJNA6AFcw', '2X 16 repetições'),
('ÂNGULO INFERIOR DA PATELA PARA...', 'Autoliberação da Lateral da Coxa', 'https://youtu.be/3VO3Axrm3xI', '2X 25 repetições para cada lado'),
('ÂNGULO INFERIOR DA PATELA PARA...', 'Caminhada nos Calcanhares', 'https://youtu.be/ZQVWy_MuTJg', '2X 8 repetições'),
('ÂNGULO INFERIOR DA PATELA PARA...', 'Elevação Pélvica em Isometria', 'https://youtu.be/K56XAa-jTSE', '2X de 20 segundos'),
('ÂNGULO INFERIOR DA PATELA PARA...', 'Autoliberação do Vasto Medial', 'https://youtu.be/Qnsjca2Bze0', '2X 25 repetições para cada lado'),

-- ARCO MEDIAL ELEVADO
('ARCO MEDIAL ELEVADO', 'Mobilidade em Dorsiflexão', 'https://youtu.be/1XN8qntLZY8', '2X 16 repetições para cada lado'),
('ARCO MEDIAL ELEVADO', 'Mobilidade de Tornozelo Frente a Parede', 'https://youtu.be/PZTJ1QdkL7M', '2X 16 repetições para cada lado'),
('ARCO MEDIAL ELEVADO', 'Joelho ao Hálux', 'https://youtu.be/ERSnwnPYp5o', '2X 16 repetições para cada lado'),
('ARCO MEDIAL ELEVADO', 'Autoliberação do Tibial Anterior', 'https://youtu.be/6Hp2hxlJemY', '2X 18 repetições para cada lado'),

-- ARCO MEDIAL DESABADO
('ARCO MEDIAL DESABADO', 'Caminhada Frontal nos Calcanhares', 'https://youtu.be/vzHktXCUsro', '2X 14 repetições'),
('ARCO MEDIAL DESABADO', 'Joelho ao Hálux', 'https://youtu.be/ERSnwnPYp5o', '2X 16 repetições para cada lado'),
('ARCO MEDIAL DESABADO', 'Elasticidade para o TFL', 'https://youtu.be/feL6n_Voejw', '2X 18 repetições para cada lado'),
('ARCO MEDIAL DESABADO', 'Alongamento Para Panturrilha', 'https://youtu.be/l_FrFliCB90', '2X 20 segundos para cada lado'),

-- 1º METATARSO GIRADO OU ELEVADO
('1º METATARSO GIRADO OU ELEVADO', 'Alcance Unipodal', 'https://youtu.be/OUwIaX1h-_k', '2X 12 repetições para cada lado'),
('1º METATARSO GIRADO OU ELEVADO', 'Propulsão Unipodal', 'https://youtu.be/rdWHwNRocc0', '2X 16 repetições para cada lado'),
('1º METATARSO GIRADO OU ELEVADO', 'Autoliberação dos Interósseos Plantares', 'https://youtu.be/eygfqzukjQY', '2X 8 repetições para cada interósseo'),
('1º METATARSO GIRADO OU ELEVADO', 'Mobilização do 1º, 2º e 3º Metatarsos', 'https://youtu.be/PEpHJMLcSmg', '2X 16 repetições para cada metatarso'),

-- MÃO VOLTADA PARA TRÁS
('MÃO VOLTADA PARA TRÁS', 'Rotação Externa dos Ombros', 'https://youtu.be/71jUmFflKg4', '2X 20 repetições'),
('MÃO VOLTADA PARA TRÁS', 'Extensão Contralateral na Parede', 'https://youtu.be/nutcKCIGt8s', '2X 24 repetições'),
('MÃO VOLTADA PARA TRÁS', 'Rotação em Semi Joelho', 'https://youtu.be/ori41iyJAlQ', '2X 14 repetições para cada lado'),
('MÃO VOLTADA PARA TRÁS', 'Extensão Peitoral', 'https://youtu.be/F0kFrFsjiWM', '2X 16 repetições para cada lado'),

-- MÃO VOLTADA P/ FRENTE...
('MÃO VOLTADA P/ FRENTE OU PESSOA QUE FORÇA O TÓRAX PARA TRÁS', 'Expansão Peitoral', 'https://youtu.be/hxQwR7d1s90', '2X 32 repetições'),
('MÃO VOLTADA P/ FRENTE OU PESSOA QUE FORÇA O TÓRAX PARA TRÁS', 'Alcance Lateral', 'https://youtu.be/4TtVlz8Xt-c', '2X 10 repetições para cada lado'),
('MÃO VOLTADA P/ FRENTE OU PESSOA QUE FORÇA O TÓRAX PARA TRÁS', 'Prancha Frontal', 'https://youtu.be/LeMBR_GMFrM', '2X 25 segundos'),
('MÃO VOLTADA P/ FRENTE OU PESSOA QUE FORÇA O TÓRAX PARA TRÁS', 'Protração Escapular Unilateral', 'https://youtu.be/Xx6w7bw02VA', '2X 16 repetições para cada lado'),

-- "C" DA COLUNA ABERTO PARA...
('"C" DA COLUNA ABERTO PARA...', 'Perdigueiro', 'https://youtu.be/yUeWN3rktWY', '2X 20 segundos para cada lado'),
('"C" DA COLUNA ABERTO PARA...', 'Dissociação Escapular', 'https://youtu.be/2b4rhCKkETo', '2X 16 repetições'),
('"C" DA COLUNA ABERTO PARA...', 'Extensão de Paravertebrais', 'https://youtu.be/tpr96uCilU8', '2X 16 repetições'),
('"C" DA COLUNA ABERTO PARA...', 'Mobilidade Escapular na Parede', 'https://youtu.be/V_YWeCFjamE', '2X 16 repetições'),

-- CABEÇA ANTERIORIZADA LADO...
('CABEÇA ANTERIORIZADA LADO...', 'Elevação Com Cotovelos Unidos', 'https://youtu.be/NV3bbu-fAYI', '2X 14 repetições'),
('CABEÇA ANTERIORIZADA LADO...', 'Estabilidade Escapular', 'https://youtu.be/v7BipIq_eqk', '2X 14 repetições para cada lado'),
('CABEÇA ANTERIORIZADA LADO...', 'Insistência em Rotação', 'https://youtu.be/naAZOmq7Kjg', '2X 12 repetições para cada lado'),
('CABEÇA ANTERIORIZADA LADO...', 'Mobilidade Cervical', 'https://youtu.be/5hD2qbwnKNs', '2X 14 repetições'),

-- CABEÇA ANTERIORIZADA BILATERAL
('CABEÇA ANTERIORIZADA BILATERAL', 'Elevação Com Cotovelos Unidos', 'https://youtu.be/NV3bbu-fAYI', '2X 14 repetições'),
('CABEÇA ANTERIORIZADA BILATERAL', 'Estabilidade Escapular', 'https://youtu.be/v7BipIq_eqk', '2X 14 repetições para cada lado'),
('CABEÇA ANTERIORIZADA BILATERAL', 'Insistência em Rotação', 'https://youtu.be/naAZOmq7Kjg', '2X 12 repetições para cada lado'),
('CABEÇA ANTERIORIZADA BILATERAL', 'Mobilidade Cervical', 'https://youtu.be/5hD2qbwnKNs', '2X 14 repetições'),

-- ÚMERO ANTERIORIZADO
('ÚMERO ANTERIORIZADO', 'Rotação Externa dos Ombros', 'https://youtu.be/ho1hNv0Jzb0', '2X 16 repetições para cada lado'),
('ÚMERO ANTERIORIZADO', 'Elasticidade da Lateral do Tronco', 'https://youtu.be/yG2Q9G_LcN0', '2X 16 repetições para cada lado'),
('ÚMERO ANTERIORIZADO', 'Autoliberação do Serrátil Anterior', 'https://youtu.be/QPmVeq-4k9A', '2X 18 repetições para cada lado'),
('ÚMERO ANTERIORIZADO', 'Autoliberação do Peitoral com Rotação', 'https://youtu.be/grwt4OWT1Lg', '2X 14 repetições'),

-- PELVE INCLINADA ANTERIORMENTE EM RELAÇÃO AO FEMUR
('PELVE INCLINADA ANTERIORMENTE EM RELAÇÃO AO FEMUR', 'Fortalecimento Para os Glúteos', 'https://youtu.be/3MdZmPCUFx0', '2X 16 repetições para cada lado'),
('PELVE INCLINADA ANTERIORMENTE EM RELAÇÃO AO FEMUR', 'Estabilidade Lombar', 'https://youtu.be/pVwVeGDi4kY', '2X 10 repetições para cada lado'),
('PELVE INCLINADA ANTERIORMENTE EM RELAÇÃO AO FEMUR', 'Elasticidade para Piriforme', 'https://youtu.be/VHzrfXBiaSo', '2X 16 repetições para cada lado'),
('PELVE INCLINADA ANTERIORMENTE EM RELAÇÃO AO FEMUR', 'Elasticidade para quadríceps', 'https://youtu.be/j6R44TZZfpw', '2X 16 repetições para cada lado'),

-- PELVE INCLINADA POSTERIORMENTE EM RELAÇÃO AO FEMUR
('PELVE INCLINADA POSTERIORMENTE EM RELAÇÃO AO FEMUR', 'Abraçar Joelho Alternado', 'https://youtu.be/ob8dq-31S2o', '2X 16 repetições'),
('PELVE INCLINADA POSTERIORMENTE EM RELAÇÃO AO FEMUR', 'Flexão de Quadril', 'https://youtu.be/I4r7iOavmAA', '2X 16 repetições para cada lado'),
('PELVE INCLINADA POSTERIORMENTE EM RELAÇÃO AO FEMUR', 'Mobilidade GOC', 'https://youtu.be/V_KLjtsEx0M', '2X 16 repetições para cada lado'),
('PELVE INCLINADA POSTERIORMENTE EM RELAÇÃO AO FEMUR', 'Agachamento Isométrico na Parede', 'https://youtu.be/ZWzDvosYakA', '2X 20 segundos'),

-- ÂNGULO MAIOR QUE 90º ENTRE TÍBIA E PÉ
('ÂNGULO MAIOR QUE 90º ENTRE TÍBIA E PÉ', 'Mobilidade TFL', 'https://youtu.be/bfd0QVxP9Is', '2X 16 repetições para cada lado'),
('ÂNGULO MAIOR QUE 90º ENTRE TÍBIA E PÉ', 'Balanço para Tornozelo', 'https://youtu.be/IVcua4JDuDA', '2X 16 repetições para cada lado'),
('ÂNGULO MAIOR QUE 90º ENTRE TÍBIA E PÉ', 'Autoliberação dos Fibulares', 'https://youtu.be/5e9SJnUWfzg', '2X 10 repetições (ciclo) para cada lado'),
('ÂNGULO MAIOR QUE 90º ENTRE TÍBIA E PÉ', 'Alongamento dos Fibulares', 'https://youtu.be/UvEEkZWfJrI', '2X 20 segundos para cada lado'),

-- TESTE DE QUADRADO LOMBAR – PELVE NÃO DESCE
('TESTE DE QUADRADO LOMBAR – PELVE NÃO DESCE', 'Elasticidade da Cadeia Lateral', 'https://youtu.be/Qo2ttMoPjpM', '2X 18 repetições para cada lado'),
('TESTE DE QUADRADO LOMBAR – PELVE NÃO DESCE', 'Elasticidade para Quadrado Lombar', 'https://youtu.be/TnA03HUKRYI', '2X 16 repetições para cada lado'),
('TESTE DE QUADRADO LOMBAR – PELVE NÃO DESCE', 'Alcance Cruzado', 'https://youtu.be/Vb0UGxL_Mso', '2X 14 repetições para cada lado'),
('TESTE DE QUADRADO LOMBAR – PELVE NÃO DESCE', 'Desnivelamento Pélvico', 'https://youtu.be/WfVDQlnI4Kw', '2X 20 repetições'),

-- TESTE DE QUADRADO LOMBAR – PELVE NÃO DESCE E AINDA GIRA
('TESTE DE QUADRADO LOMBAR – PELVE NÃO DESCE E AINDA GIRA', 'Elasticidade da Cadeia Lateral', 'https://youtu.be/Qo2ttMoPjpM', '2X 18 repetições para cada lado'),
('TESTE DE QUADRADO LOMBAR – PELVE NÃO DESCE E AINDA GIRA', 'Elasticidade para Quadrado Lombar', 'https://youtu.be/TnA03HUKRYI', '2X 16 repetições para cada lado'),
('TESTE DE QUADRADO LOMBAR – PELVE NÃO DESCE E AINDA GIRA', 'Balanço da Marcha', 'https://youtu.be/L7qY_QQm8gc', '2X 16 repetições para cada lado'),
('TESTE DE QUADRADO LOMBAR – PELVE NÃO DESCE E AINDA GIRA', 'Desnivelamento Pélvico', 'https://youtu.be/WfVDQlnI4Kw', '2X 20 repetições'),

-- TESTE DE QUADRADO LOMBAR – PELVE DESCE, MAS GIRA
('TESTE DE QUADRADO LOMBAR – PELVE DESCE, MAS GIRA', 'Elasticidade para piriforme', 'https://youtu.be/VHzrfXBiaSo', '2X 16 repetições para cada lado'),
('TESTE DE QUADRADO LOMBAR – PELVE DESCE, MAS GIRA', 'Elasticidade para Quadrado Lombar', 'https://youtu.be/TnA03HUKRYI', '2X 16 repetições para cada lado'),
('TESTE DE QUADRADO LOMBAR – PELVE DESCE, MAS GIRA', 'Balanço da Marcha', 'https://youtu.be/L7qY_QQm8gc', '2X 16 repetições para cada lado'),
('TESTE DE QUADRADO LOMBAR – PELVE DESCE, MAS GIRA', 'Desnivelamento Pélvico', 'https://youtu.be/WfVDQlnI4Kw', '2X 20 repetições'),

-- TESTE DE ADUTORES - CARGA EM UM JOELHO E UMBIGO SAI DO CENTRO
('TESTE DE ADUTORES - CARGA EM UM JOELHO E UMBIGO SAI DO CENTRO', 'Planador', 'https://youtu.be/TjjLaRRVPls', '2X 20 segundos para cada lado'),
('TESTE DE ADUTORES - CARGA EM UM JOELHO E UMBIGO SAI DO CENTRO', 'Dissociação de Adutores', 'https://youtu.be/zds4l12L3Ys', '2X 16 repetições para cada lado'),
('TESTE DE ADUTORES - CARGA EM UM JOELHO E UMBIGO SAI DO CENTRO', 'Afastamento dos Joelhos', 'https://youtu.be/44PRvRZDxjc', '2X 16 repetições para cada lado'),
('TESTE DE ADUTORES - CARGA EM UM JOELHO E UMBIGO SAI DO CENTRO', 'Esfinge', 'https://youtu.be/1ijlpffMZkg', '2X 12 repetições'),

-- TESTE DE ADUTORES - CARGA NO JOELHO, UMBIGO SAI DO CENTRO E TRONCO VAI A FRENTE
('TESTE DE ADUTORES - CARGA NO JOELHO, UMBIGO SAI DO CENTRO E TRONCO VAI A FRENTE', 'Planador', 'https://youtu.be/TjjLaRRVPls', '2X 20 segundos para cada lado'),
('TESTE DE ADUTORES - CARGA NO JOELHO, UMBIGO SAI DO CENTRO E TRONCO VAI A FRENTE', 'Dissociação de Adutores', 'https://youtu.be/zds4l12L3Ys', '2X 16 repetições para cada lado'),
('TESTE DE ADUTORES - CARGA NO JOELHO, UMBIGO SAI DO CENTRO E TRONCO VAI A FRENTE', 'Afastamento dos Joelhos', 'https://youtu.be/44PRvRZDxjc', '2X 16 repetições para cada lado'),
('TESTE DE ADUTORES - CARGA NO JOELHO, UMBIGO SAI DO CENTRO E TRONCO VAI A FRENTE', 'Esfinge', 'https://youtu.be/1ijlpffMZkg', '2X 12 repetições'),

-- TESTE DE ADUTORES - CARGA NO JOELHO, UMBIGO SAI DO CENTRO E TRONCO VAI P/ POSTERIOR
('TESTE DE ADUTORES - CARGA NO JOELHO, UMBIGO SAI DO CENTRO E TRONCO VAI P/ POSTERIOR', 'Planador', 'https://youtu.be/TjjLaRRVPls', '2X 20 segundos para cada lado'),
('TESTE DE ADUTORES - CARGA NO JOELHO, UMBIGO SAI DO CENTRO E TRONCO VAI P/ POSTERIOR', 'Dissociação de Adutores', 'https://youtu.be/zds4l12L3Ys', '2X 16 repetições para cada lado'),
('TESTE DE ADUTORES - CARGA NO JOELHO, UMBIGO SAI DO CENTRO E TRONCO VAI P/ POSTERIOR', 'Afastamento dos Joelhos', 'https://youtu.be/44PRvRZDxjc', '2X 16 repetições para cada lado'),
('TESTE DE ADUTORES - CARGA NO JOELHO, UMBIGO SAI DO CENTRO E TRONCO VAI P/ POSTERIOR', 'Esfinge', 'https://youtu.be/1ijlpffMZkg', '2X 12 repetições'),

-- BATE A PORTA DO CARRO P/ UM DOS LADOS E A PELVE GIRA OU O TRONCO INCLINA
('BATE A PORTA DO CARRO P/ UM DOS LADOS E A PELVE GIRA OU O TRONCO INCLINA', 'Planador', 'https://youtu.be/TjjLaRRVPls', '2X 20 segundos para cada lado'),
('BATE A PORTA DO CARRO P/ UM DOS LADOS E A PELVE GIRA OU O TRONCO INCLINA', 'Mobilidade TFL', 'https://youtu.be/bfd0QVxP9Is', '2X 16 repetições para cada lado'),
('BATE A PORTA DO CARRO P/ UM DOS LADOS E A PELVE GIRA OU O TRONCO INCLINA', 'Deslocamento Pélvico Lateral', 'https://youtu.be/FdxqZa1nCdU', '2X 20 segundos para cada lado'),
('BATE A PORTA DO CARRO P/ UM DOS LADOS E A PELVE GIRA OU O TRONCO INCLINA', 'Esfinge', 'https://youtu.be/1ijlpffMZkg', '2X 12 repetições'),

-- UMBIGO NÃO ACOMPANHA O GIRO DO TRONCO
('UMBIGO NÃO ACOMPANHA O GIRO DO TRONCO', 'Equilíbrio Contralateral', 'https://youtu.be/PPhNACpOGH8', '2X 30 segundos para cada lado'),
('UMBIGO NÃO ACOMPANHA O GIRO DO TRONCO', 'Rotação Contralateral', 'https://youtu.be/b6nSXnDgDrw', '2X 24 repetições'),
('UMBIGO NÃO ACOMPANHA O GIRO DO TRONCO', 'Cotovelo Para a Coxa', 'https://youtu.be/fHf8PgpPG_k', '2X 12 repetições para cada lado'),
('UMBIGO NÃO ACOMPANHA O GIRO DO TRONCO', 'Subida no Degrau com Rotação', 'https://youtu.be/NqV5OCW-NIo', '2X 12 repetições para cada lado'),

-- TÍBIA NÃO VAI PARA DORSIFLEXÃO
('TÍBIA NÃO VAI PARA DORSIFLEXÃO', 'Mobilidade TFL', 'https://youtu.be/bfd0QVxP9Is', '2X 16 repetições para cada lado'),
('TÍBIA NÃO VAI PARA DORSIFLEXÃO', 'Balanço para Tornozelo', 'https://youtu.be/IVcua4JDuDA', '2X 16 repetições para cada lado'),
('TÍBIA NÃO VAI PARA DORSIFLEXÃO', 'Autoliberação dos Fibulares', 'https://youtu.be/5e9SJnUWfzg', '2X 10 repetições (ciclo) para cada lado'),
('TÍBIA NÃO VAI PARA DORSIFLEXÃO', 'Alongamento dos Fibulares', 'https://youtu.be/UvEEkZWfJrI', '2X 20 segundos para cada lado'),

-- PÉ NÃO PRONA
('PÉ NÃO PRONA', 'Mobilidade em Dorsiflexão', 'https://youtu.be/1XN8qntLZY8', '2X 16 repetições para cada lado'),
('PÉ NÃO PRONA', 'Mobilidade de Tornozelo Frente a Parede', 'https://youtu.be/PZTJ1QdkL7M', '2X 16 repetições para cada lado'),
('PÉ NÃO PRONA', 'Joelho ao Hálux', 'https://youtu.be/ERSnwnPYp5o', '2X 16 repetições para cada lado'),
('PÉ NÃO PRONA', 'Autoliberação do Tibial Anterior', 'https://youtu.be/6Hp2hxlJemY', '2X 18 repetições para cada lado'),

-- PÉ NÃO SUPINA
('PÉ NÃO SUPINA', 'Caminhada Frontal nos Calcanhares', 'https://youtu.be/vzHktXCUsro', '2X 14 repetições'),
('PÉ NÃO SUPINA', 'Joelho ao Hálux', 'https://youtu.be/ERSnwnPYp5o', '2X 16 repetições para cada lado'),
('PÉ NÃO SUPINA', 'Elasticidade para o TFL', 'https://youtu.be/feL6n_Voejw', '2X 18 repetições para cada lado'),
('PÉ NÃO SUPINA', 'Alongamento Para Panturrilha', 'https://youtu.be/l_FrFliCB90', '2X 20 segundos para cada lado'),

-- TIBIA/TORNOZELO RODA PARA MEDIAL
('TIBIA/TORNOZELO RODA PARA MEDIAL', 'Abraçar Joelho Alternado', 'https://youtu.be/ob8dq-31S2o', '2X 16 repetições'),
('TIBIA/TORNOZELO RODA PARA MEDIAL', 'Flexão de Quadril', 'https://youtu.be/I4r7iOavmAA', '2X 16 repetições para cada lado'),
('TIBIA/TORNOZELO RODA PARA MEDIAL', 'Mobilidade GOC', 'https://youtu.be/V_KLjtsEx0M', '2X 16 repetições para cada lado'),
('TIBIA/TORNOZELO RODA PARA MEDIAL', 'Agachamento Isométrico na Parede', 'https://youtu.be/ZWzDvosYakA', '2X 20 segundos'),

-- TIBIA/TORNOZELO RODA PARA LATERAL
('TIBIA/TORNOZELO RODA PARA LATERAL', 'Abraçar Joelho Alternado', 'https://youtu.be/ob8dq-31S2o', '2X 16 repetições'),
('TIBIA/TORNOZELO RODA PARA LATERAL', 'Flexão de Quadril', 'https://youtu.be/I4r7iOavmAA', '2X 16 repetições para cada lado'),
('TIBIA/TORNOZELO RODA PARA LATERAL', 'Mobilidade GOC', 'https://youtu.be/V_KLjtsEx0M', '2X 16 repetições para cada lado'),
('TIBIA/TORNOZELO RODA PARA LATERAL', 'Agachamento Isométrico na Parede', 'https://youtu.be/ZWzDvosYakA', '2X 20 segundos'),

-- NÃO VAI PARA ANTE
('NÃO VAI PARA ANTE', 'Fortalecimento Para os Glúteos', 'https://youtu.be/3MdZmPCUFx0', '2X 16 repetições para cada lado'),
('NÃO VAI PARA ANTE', 'Estabilidade Lombar', 'https://youtu.be/pVwVeGDi4kY', '2X 10 repetições para cada lado'),
('NÃO VAI PARA ANTE', 'Elasticidade para Piriforme', 'https://youtu.be/VHzrfXBiaSo', '2X 16 repetições para cada lado'),
('NÃO VAI PARA ANTE', 'Elasticidade para quadríceps', 'https://youtu.be/j6R44TZZfpw', '2X 16 repetições para cada lado'),

-- NÃO VAI PARA RETRO
('NÃO VAI PARA RETRO', 'Abraçar Joelho Alternado', 'https://youtu.be/ob8dq-31S2o', '2X 16 repetições'),
('NÃO VAI PARA RETRO', 'Flexão de Quadril', 'https://youtu.be/I4r7iOavmAA', '2X 16 repetições para cada lado'),
('NÃO VAI PARA RETRO', 'Mobilidade GOC', 'https://youtu.be/V_KLjtsEx0M', '2X 16 repetições para cada lado'),
('NÃO VAI PARA RETRO', 'Agachamento Isométrico na Parede', 'https://youtu.be/ZWzDvosYakA', '2X 20 segundos'),

-- COSTELA NÃO ABRE
('COSTELA NÃO ABRE', 'Deslocamento Pélvico Lateral', 'https://youtu.be/FdxqZa1nCdU', '2X 20 segundos para cada lado'),
('COSTELA NÃO ABRE', 'Inclinação em Semi Joelho', 'https://youtu.be/09mOaaOltZ4', '2X 16 repetições para cada lado'),
('COSTELA NÃO ABRE', 'Autoliberação do Diafragma', 'https://youtu.be/BTswHzXUXXw', '2X 14 repetições para cada lado'),
('COSTELA NÃO ABRE', 'Ciclo Respiratório', 'https://youtu.be/IFfugNVL80g', '2X 14 repetições'),

-- RESPIRAÇÃO PARADOXAL
('RESPIRAÇÃO PARADOXAL', 'Deslocamento Pélvico Lateral', 'https://youtu.be/FdxqZa1nCdU', '2X 20 segundos para cada lado'),
('RESPIRAÇÃO PARADOXAL', 'Inclinação em Semi Joelho', 'https://youtu.be/09mOaaOltZ4', '2X 16 repetições para cada lado'),
('RESPIRAÇÃO PARADOXAL', 'Autoliberação do Diafragma', 'https://youtu.be/BTswHzXUXXw', '2X 14 repetições para cada lado'),
('RESPIRAÇÃO PARADOXAL', 'Ciclo Respiratório', 'https://youtu.be/IFfugNVL80g', '2X 14 repetições');