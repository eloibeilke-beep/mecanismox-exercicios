-- Tabela para armazenar as credenciais do Gateway de WhatsApp (Evolution API / Z-API)
CREATE TABLE IF NOT EXISTS configuracoes_venda (
  id uuid default gen_random_uuid() primary key,
  user_id uuid default auth.uid(), -- Vinculado ao usuário autenticado
  gateway_url text, -- Ex: https://sua-api.com
  gateway_key text, -- Token da API
  instancia_id text, -- Nome da instância conectada
  created_at timestamptz default now() not null
);

-- Tabela de Logs (Ajustada para bater com o nome usado no script.js)
CREATE TABLE IF NOT EXISTS logs_envios (
  id uuid default gen_random_uuid() primary key,
  paciente_id uuid references pacientes(id) on delete cascade,
  tipo_mensagem text, -- 'video' ou 'texto'
  status text,        -- 'sucesso', 'erro' ou 'processando'
  detalhes text,
  created_at timestamptz default now() not null
);

-- Tabela da Biblioteca de Exercícios (Onde ficarão os links)
CREATE TABLE IF NOT EXISTS biblioteca_exercicios (
  id uuid default gen_random_uuid() primary key,
  categoria text not null, -- Ex: "QUEIXO RODADO"
  nome text not null,      -- Ex: "Isometria em rotação"
  video_url text not null, -- O link do YouTube
  reps text,               -- A descrição das repetições
  created_at timestamptz default now() not null
);