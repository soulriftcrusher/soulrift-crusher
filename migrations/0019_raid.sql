alter table crusaders add column if not exists shield_until timestamptz;
alter table crusaders add column if not exists stash_gold double precision not null default 0;
alter table crusaders add column if not exists stash_souls double precision not null default 0;
alter table crusaders add column if not exists last_plunder_at timestamptz;

create table if not exists plunder_log (
  id serial primary key,
  attacker_id text not null,
  defender_id text not null,
  gold double precision not null default 0,
  souls double precision not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists plunder_log_attacker_idx on plunder_log (attacker_id, created_at desc);
