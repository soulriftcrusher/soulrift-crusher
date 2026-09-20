create table if not exists clan_chat (
  id serial primary key,
  clan_id integer not null references clans(id) on delete cascade,
  user_id text not null,
  name text not null,
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists clan_chat_clan_id_idx on clan_chat (clan_id, id desc);
