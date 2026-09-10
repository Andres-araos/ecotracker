-- ============================================================
-- ECOTRACKER — Esquema completo de Supabase (PostgreSQL)
-- Ejecutar en el SQL Editor de Supabase, en orden.
-- ============================================================

create extension if not exists "uuid-ossp";

-- =========================================
-- PROFILES
-- =========================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  full_name text,
  avatar_url text,
  weekly_goal_kg numeric default 50,
  green_points integer default 0,
  current_streak integer default 0,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Perfiles visibles para todos (ranking)"
  on profiles for select using (true);

create policy "Usuario edita su propio perfil"
  on profiles for update using (auth.uid() = id);

create policy "Usuario crea su propio perfil"
  on profiles for insert with check (auth.uid() = id);

-- =========================================
-- CATALOGOS
-- =========================================
create table meal_types (
  id serial primary key,
  name text not null,
  category text
);

create table transport_types (
  id serial primary key,
  name text not null unique,
  icon text
);

create table carbon_factors (
  id serial primary key,
  category text not null,
  reference_id integer,
  factor numeric not null,
  unit text not null,
  updated_at timestamptz default now()
);

alter table meal_types enable row level security;
alter table transport_types enable row level security;
alter table carbon_factors enable row level security;

create policy "Catalogo publico meal_types" on meal_types for select using (true);
create policy "Catalogo publico transport_types" on transport_types for select using (true);
create policy "Catalogo publico carbon_factors" on carbon_factors for select using (true);

-- =========================================
-- MEALS
-- =========================================
create table meals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade not null,
  meal_type_id integer references meal_types(id) not null,
  portions numeric not null default 1,
  co2_kg numeric not null,
  recorded_at date not null default current_date,
  created_at timestamptz default now()
);

create index idx_meals_user_date on meals(user_id, recorded_at);

alter table meals enable row level security;

create policy "Usuario ve sus comidas" on meals for select using (auth.uid() = user_id);
create policy "Usuario crea sus comidas" on meals for insert with check (auth.uid() = user_id);
create policy "Usuario borra sus comidas" on meals for delete using (auth.uid() = user_id);
create policy "Usuario edita sus comidas" on meals for update using (auth.uid() = user_id);

-- =========================================
-- TRANSPORT RECORDS
-- =========================================
create table transport_records (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade not null,
  transport_type_id integer references transport_types(id) not null,
  distance_km numeric not null,
  co2_kg numeric not null,
  recorded_at date not null default current_date,
  created_at timestamptz default now()
);

create index idx_transport_user_date on transport_records(user_id, recorded_at);

alter table transport_records enable row level security;

create policy "Usuario ve su transporte" on transport_records for select using (auth.uid() = user_id);
create policy "Usuario crea su transporte" on transport_records for insert with check (auth.uid() = user_id);
create policy "Usuario borra su transporte" on transport_records for delete using (auth.uid() = user_id);
create policy "Usuario edita su transporte" on transport_records for update using (auth.uid() = user_id);

-- =========================================
-- ENERGY RECORDS
-- =========================================
create table energy_records (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade not null,
  kwh numeric not null,
  co2_kg numeric not null,
  recorded_at date not null default current_date,
  created_at timestamptz default now()
);

create index idx_energy_user_date on energy_records(user_id, recorded_at);

alter table energy_records enable row level security;

create policy "Usuario ve su energia" on energy_records for select using (auth.uid() = user_id);
create policy "Usuario crea su energia" on energy_records for insert with check (auth.uid() = user_id);
create policy "Usuario borra su energia" on energy_records for delete using (auth.uid() = user_id);
create policy "Usuario edita su energia" on energy_records for update using (auth.uid() = user_id);

-- =========================================
-- TIPS
-- =========================================
create table tips (
  id serial primary key,
  category text not null,
  content text not null,
  created_at timestamptz default now()
);

alter table tips enable row level security;
create policy "Tips publicos" on tips for select using (true);

-- =========================================
-- COMPETITIONS
-- =========================================
create table competitions (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_by uuid references profiles(id) not null,
  start_date date not null,
  end_date date not null,
  invite_code text unique not null default substr(md5(random()::text), 1, 6),
  created_at timestamptz default now()
);

create table competition_members (
  id uuid primary key default uuid_generate_v4(),
  competition_id uuid references competitions(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  joined_at timestamptz default now(),
  unique (competition_id, user_id)
);

create index idx_comp_members_comp on competition_members(competition_id);

alter table competitions enable row level security;
alter table competition_members enable row level security;

create policy "Miembros ven sus competencias"
  on competitions for select using (
    id in (select competition_id from competition_members where user_id = auth.uid())
    or created_by = auth.uid()
  );

create policy "Usuario crea competencia"
  on competitions for insert with check (auth.uid() = created_by);

create policy "Creador edita su competencia"
  on competitions for update using (auth.uid() = created_by);

create policy "Miembros visibles para miembros de la misma competencia"
  on competition_members for select using (
    competition_id in (select competition_id from competition_members where user_id = auth.uid())
  );

create policy "Usuario se une a competencia"
  on competition_members for insert with check (auth.uid() = user_id);

create policy "Usuario sale de competencia"
  on competition_members for delete using (auth.uid() = user_id);

-- =========================================
-- ACHIEVEMENTS
-- =========================================
create table achievements (
  id serial primary key,
  name text not null,
  description text,
  icon text,
  points_reward integer default 0
);

create table user_achievements (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade not null,
  achievement_id integer references achievements(id) not null,
  achieved_at timestamptz default now(),
  unique (user_id, achievement_id)
);

alter table achievements enable row level security;
alter table user_achievements enable row level security;

create policy "Logros publicos" on achievements for select using (true);

create policy "Usuario ve sus logros obtenidos"
  on user_achievements for select using (auth.uid() = user_id);

create policy "Usuario recibe logro"
  on user_achievements for insert with check (auth.uid() = user_id);

-- ============================================================
-- SEED DATA — catálogos base para que la app funcione de inmediato
-- ============================================================

insert into meal_types (name, category) values
  ('Res', 'meat'),
  ('Cerdo', 'meat'),
  ('Pollo', 'meat'),
  ('Pescado', 'meat'),
  ('Lácteos', 'dairy'),
  ('Vegetariana', 'vegetarian'),
  ('Vegana', 'vegan');

insert into transport_types (name, icon) values
  ('car', '🚗'),
  ('motorcycle', '🏍️'),
  ('bus', '🚌'),
  ('taxi', '🚕'),
  ('metro', '🚇'),
  ('bike', '🚲'),
  ('walk', '🚶');

-- Factores de emisión (kg CO2 por unidad). Valores de referencia educativos.
insert into carbon_factors (category, reference_id, factor, unit) values
  ('meal', 1, 6.0, 'portion'),   -- Res
  ('meal', 2, 3.6, 'portion'),   -- Cerdo
  ('meal', 3, 1.6, 'portion'),   -- Pollo
  ('meal', 4, 2.9, 'portion'),   -- Pescado
  ('meal', 5, 1.2, 'portion'),   -- Lácteos
  ('meal', 6, 0.7, 'portion'),   -- Vegetariana
  ('meal', 7, 0.4, 'portion');   -- Vegana

insert into carbon_factors (category, reference_id, factor, unit)
select 'transport', id,
  case name
    when 'car' then 0.192
    when 'motorcycle' then 0.103
    when 'bus' then 0.089
    when 'taxi' then 0.211
    when 'metro' then 0.041
    when 'bike' then 0
    when 'walk' then 0
  end,
  'km'
from transport_types;

insert into carbon_factors (category, reference_id, factor, unit) values
  ('energy', null, 0.385, 'kwh');

insert into tips (category, content) values
  ('meal', 'Reduce tu consumo de carne roja una vez por semana: puede bajar tu huella alimentaria hasta un 20%.'),
  ('meal', 'Prefiere productos locales y de temporada; requieren menos transporte y refrigeración.'),
  ('transport', 'Camina o usa bicicleta en trayectos cortos de menos de 3 km.'),
  ('transport', 'Comparte vehículo o usa transporte público para reducir emisiones per cápita.'),
  ('energy', 'Desconecta cargadores y electrodomésticos que no estés usando; el consumo fantasma suma.'),
  ('energy', 'Cambia a bombillas LED: consumen hasta 80% menos energía que las incandescentes.'),
  ('general', 'Pequeños cambios diarios generan un gran impacto acumulado a lo largo del año.');

insert into achievements (name, description, icon, points_reward) values
  ('Primer registro', 'Registraste tu primera actividad', '🌱', 10),
  ('Semana verde', 'Cumpliste tu meta semanal de CO2', '🍃', 50),
  ('Racha de 7 días', 'Registraste actividades 7 días seguidos', '🔥', 30),
  ('Competidor', 'Te uniste a tu primera competencia', '🏆', 20);
