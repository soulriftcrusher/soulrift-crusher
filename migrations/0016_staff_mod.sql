create table if not exists bans (
  user_id text primary key,
  reason text not null default 'Banned',
  by_id text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists staff_gifts (
  user_id text primary key,
  gold double precision not null default 0,
  souls integer not null default 0,
  gems integer not null default 0,
  chests integer not null default 0
);
