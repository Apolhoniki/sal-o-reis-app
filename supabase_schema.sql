-- =========================================================
-- ESTRUTURA DO BANCO DE DADOS SUPABASE PARA O SALÃO REIS
-- Copie todo este conteúdo e execute no SQL Editor do Supabase
-- =========================================================

-- 1. TABELA DE CONFIGURAÇÕES DO SALÃO E PERFIL (WhatsApp, bio, horários, etc)
CREATE TABLE IF NOT EXISTS configuracoes (
  id TEXT PRIMARY KEY DEFAULT 'saloon_config',
  name TEXT NOT NULL DEFAULT 'Adson Reis',
  title TEXT DEFAULT 'Master Hairstylist & Specialist em Visagismo',
  bio TEXT,
  experience_years INT DEFAULT 8,
  phone TEXT DEFAULT '(92) 98457-0443',
  whatsapp TEXT DEFAULT '5592984570443',
  instagram TEXT DEFAULT '@salaoreis_oficial',
  address TEXT DEFAULT 'Av. das Nações, 1420 - Centro, São Paulo - SP',
  operating_hours TEXT DEFAULT 'Terça a Sábado: 08:00h às 21:00h',
  avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Inserir dados padrões iniciais caso a tabela esteja vazia
INSERT INTO configuracoes (id, name, title, bio, experience_years, phone, whatsapp, instagram, address, operating_hours, avatar_url)
VALUES (
  'saloon_config',
  'Adson Reis',
  'Master Hairstylist & Specialist em Visagismo',
  'Apaixonado pela arte da transformação feminina há mais de 8 anos. Especialista internacional em técnicas de Morena Iluminada sem marcas, Blond Dourado saudável e Visagismo Facial personalizado.',
  8,
  '(92) 98457-0443',
  '5592984570443',
  '@salaoreis_oficial',
  'Av. das Nações, 1420 - Centro, São Paulo - SP',
  'Terça a Sábado: 08:00h às 21:00h',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
)
ON CONFLICT (id) DO NOTHING;


-- 2. TABELA DE AGENDA E BLOQUEIO DE DIAS/HORÁRIOS
CREATE TABLE IF NOT EXISTS dias_agenda (
  id TEXT PRIMARY KEY, -- formato: '2026-07-07'
  day_of_week TEXT,
  day_number TEXT,
  date_formatted TEXT,
  periods JSONB NOT NULL DEFAULT '{"manha": true, "tarde": true, "noite": true}'::jsonb,
  status TEXT DEFAULT 'verde',
  status_label TEXT,
  is_blocked BOOLEAN DEFAULT false,
  extra_slots JSONB DEFAULT '{"manha": false, "tarde": false, "noite": false}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);


-- 3. TABELA DE AGENDAMENTOS E SOLICITAÇÕES DAS CLIENTES
CREATE TABLE IF NOT EXISTS agendamentos (
  id TEXT PRIMARY KEY,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  client_description TEXT,
  date_id TEXT NOT NULL,
  day_formatted TEXT,
  period TEXT NOT NULL,
  service_name TEXT,
  reference_image_url TEXT,
  inspiration_image_url TEXT,
  current_hair_image_url TEXT,
  confirmed_time TEXT,
  status TEXT NOT NULL DEFAULT 'pendente',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);


-- 4. TABELA DE CLIENTES SALVAS E HISTÓRICO DE ATENDIMENTOS
CREATE TABLE IF NOT EXISTS clientes (
  id TEXT PRIMARY KEY,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  client_description TEXT,
  inspiration_image_url TEXT,
  current_hair_image_url TEXT,
  service_date TEXT,
  service_name TEXT,
  notes TEXT,
  amount_paid TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);


-- 5. TABELA DE NOTIFICAÇÕES INDIVIDUAIS POR CLIENTE (Notificações do PWA)
CREATE TABLE IF NOT EXISTS notificacoes (
  id TEXT PRIMARY KEY,
  client_phone TEXT, -- telefone do cliente especifico (se nulo ou 'GERAL', visivel para comunicados gerais)
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'confirmation', -- 'confirmation' | 'alert' | 'general'
  read BOOLEAN DEFAULT false,
  timestamp TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);


-- 6. HABILITAR ROW LEVEL SECURITY (RLS) E POLÍTICAS PÚBLICAS DE LEITURA E ESCRITA
ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dias_agenda ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;

-- Apagar políticas anteriores para reconfiguração limpa
DROP POLICY IF EXISTS "Permitir leitura total em configuracoes" ON configuracoes;
DROP POLICY IF EXISTS "Permitir escrita em configuracoes" ON configuracoes;
DROP POLICY IF EXISTS "Permitir leitura total em dias_agenda" ON dias_agenda;
DROP POLICY IF EXISTS "Permitir escrita em dias_agenda" ON dias_agenda;
DROP POLICY IF EXISTS "Permitir leitura total em agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "Permitir escrita em agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "Permitir leitura total em clientes" ON clientes;
DROP POLICY IF EXISTS "Permitir escrita em clientes" ON clientes;
DROP POLICY IF EXISTS "Permitir leitura total em notificacoes" ON notificacoes;
DROP POLICY IF EXISTS "Permitir escrita em notificacoes" ON notificacoes;

-- Criar políticas de acesso público para o aplicativo PWA
CREATE POLICY "Permitir leitura total em configuracoes" ON configuracoes FOR SELECT USING (true);
CREATE POLICY "Permitir escrita em configuracoes" ON configuracoes FOR ALL USING (true);

CREATE POLICY "Permitir leitura total em dias_agenda" ON dias_agenda FOR SELECT USING (true);
CREATE POLICY "Permitir escrita em dias_agenda" ON dias_agenda FOR ALL USING (true);

CREATE POLICY "Permitir leitura total em agendamentos" ON agendamentos FOR SELECT USING (true);
CREATE POLICY "Permitir escrita em agendamentos" ON agendamentos FOR ALL USING (true);

CREATE POLICY "Permitir leitura total em clientes" ON clientes FOR SELECT USING (true);
CREATE POLICY "Permitir escrita em clientes" ON clientes FOR ALL USING (true);

CREATE POLICY "Permitir leitura total em notificacoes" ON notificacoes FOR SELECT USING (true);
CREATE POLICY "Permitir escrita em notificacoes" ON notificacoes FOR ALL USING (true);


-- 7. HABILITAR RECURSO DE TEMPO REAL (REALTIME) NO SUPABASE
ALTER PUBLICATION supabase_realtime ADD TABLE configuracoes, dias_agenda, agendamentos, clientes, notificacoes;
