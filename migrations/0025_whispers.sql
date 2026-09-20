create table if not exists whispers (
  id serial primary key,
  from_id text not null,
  to_id text not null,
  from_name text not null,
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists whispers_from_idx on whispers (from_id, id desc);
create index if not exists whispers_to_idx on whispers (to_id, id desc);
