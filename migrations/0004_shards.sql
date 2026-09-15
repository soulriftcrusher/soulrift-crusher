-- Cross-server seasons. Cap 1000 living crusaders per shard.
create table if not exists shard_members (
  user_id text primary key,
  shard_id text not null,
  joined_at timestamptz not null default now(),
  switched_at timestamptz
);
create index if not exists shard_members_shard_idx on shard_members (shard_id);

create table if not exists season_results (
  season integer not null,
  shard_id text not null,
  rank integer not null,
  score double precision not null,
  power double precision not null,
  pop integer not null default 0,
  primary key (season, shard_id)
);
create index if not exists season_results_rank_idx on season_results (season, rank);

create table if not exists season_claims (
  user_id text not null,
  season integer not null,
  gems integer not null,
  claimed_at timestamptz not null default now(),
  primary key (user_id, season)
);
