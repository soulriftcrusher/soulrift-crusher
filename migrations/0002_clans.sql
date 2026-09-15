-- Crusaders, clans, raids, and duels
create table if not exists crusaders (
  user_id text primary key,
  name text not null,
  power double precision not null default 0,
  max_floor integer not null default 1,
  clan_id integer,
  last_raid_at timestamptz,
  last_duel_at timestamptz,
  last_seen timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists crusaders_clan_id_idx on crusaders (clan_id);
create index if not exists crusaders_last_seen_idx on crusaders (last_seen desc);

create table if not exists clans (
  id serial primary key,
  name text not null unique,
  tag text not null unique,
  code text not null unique,
  founder_id text not null,
  influence integer not null default 0,
  raid_wave integer not null default 1,
  raid_hp double precision not null default 0,
  raid_max double precision not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists clans_influence_idx on clans (influence desc);

create table if not exists clan_members (
  clan_id integer not null references clans(id) on delete cascade,
  user_id text not null,
  role text not null default 'member',
  raid_damage double precision not null default 0,
  joined_at timestamptz not null default now(),
  primary key (clan_id, user_id)
);
create index if not exists clan_members_user_id_idx on clan_members (user_id);

create table if not exists duels (
  id serial primary key,
  attacker_id text not null,
  defender_id text not null,
  win boolean not null,
  created_at timestamptz not null default now()
);
create index if not exists duels_attacker_idx on duels (attacker_id, created_at desc);
