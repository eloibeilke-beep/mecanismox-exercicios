-- Tabela para armazenar as credenciais do Gateway de WhatsApp (Evolution API / Z-API)
create table if not exists configuracoes_venda (
  id uuid default gen_random_uuid() primary key,
  user_id uuid default auth.uid(), -- Vinculado ao usuário autenticado
  gateway_url text, -- Ex: https://sua-api.com
  gateway_key text, -- Token da API
  instancia_id text, -- Nome da instância conectada
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de Logs para você monitorar os envios dos seus clientes
create table if not exists logs_envios_automáticos (
  id uuid default gen_random_uuid() primary key,
  paciente_id uuid references pacientes(id),
  status text, -- 'sucesso' ou 'erro'
  detalhes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);