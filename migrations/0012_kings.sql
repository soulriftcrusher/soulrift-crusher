create table if not exists server_kings (
  shard_id text primary key,
  season integer not null default 1,
  kind text not null default 'npc',
  user_id text,
  npc_id text,
  name text not null,
  power double precision not null default 0,
  held_at timestamptz not null default now(),
  defenses integer not null default 0,
  thought text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists king_log (
  id serial primary key,
  shard_id text not null,
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists king_log_shard_idx on king_log (shard_id, created_at desc);

create table if not exists king_challenges (
  user_id text primary key,
  at timestamptz not null default now()
);
