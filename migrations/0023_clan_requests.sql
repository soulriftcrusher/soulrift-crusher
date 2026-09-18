create table if not exists clan_requests (
  clan_id integer not null references clans(id) on delete cascade,
  user_id text not null,
  created_at timestamptz not null default now(),
  primary key (clan_id, user_id)
);
create index if not exists clan_requests_user_id_idx on clan_requests (user_id);
