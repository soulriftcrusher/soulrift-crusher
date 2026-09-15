-- Cloud crusade saves and founder staff
create table if not exists game_saves (
  user_id text primary key,
  payload text not null,
  updated_at timestamptz not null default now()
);

create table if not exists staff (
  user_id text primary key,
  role text not null default 'admin',
  claimed_at timestamptz not null default now()
);

create table if not exists gem_grants (
  user_id text primary key,
  gems integer not null default 0
);
