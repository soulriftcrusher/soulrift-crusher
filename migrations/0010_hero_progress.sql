-- Hired heroes live here so a fat JSON save can never delete them.
create table if not exists hero_progress (
  user_id text not null,
  hero_id text not null,
  level integer not null default 0,
  gild integer not null default 0,
  prestige integer not null default 0,
  craft integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, hero_id)
);
create index if not exists hero_progress_user_idx on hero_progress (user_id);
