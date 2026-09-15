-- World chat, inventories, and player trades
create table if not exists world_chat (
  id serial primary key,
  user_id text not null,
  name text not null,
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists world_chat_created_idx on world_chat (created_at desc);

create table if not exists inventories (
  user_id text not null,
  loot_id text not null,
  qty integer not null default 0,
  primary key (user_id, loot_id)
);

create table if not exists trades (
  id serial primary key,
  from_id text not null,
  to_id text not null,
  from_items text not null default '{}',
  to_items text not null default '{}',
  from_ok boolean not null default false,
  to_ok boolean not null default false,
  status text not null default 'open',
  created_at timestamptz not null default now()
);
create index if not exists trades_from_idx on trades (from_id, status);
create index if not exists trades_to_idx on trades (to_id, status);
