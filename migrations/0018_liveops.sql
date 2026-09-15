create table if not exists gift_codes (
  code text primary key,
  gems integer not null default 0,
  gold double precision not null default 0,
  souls integer not null default 0,
  chests integer not null default 0,
  max_uses integer not null default 50,
  uses integer not null default 0,
  by_id text not null,
  created_at timestamptz not null default now()
);

create table if not exists code_redemptions (
  code text not null,
  user_id text not null,
  created_at timestamptz not null default now(),
  primary key (code, user_id)
);

create table if not exists inbox (
  id serial primary key,
  user_id text not null,
  title text not null,
  body text not null default '',
  gold double precision not null default 0,
  souls integer not null default 0,
  gems integer not null default 0,
  chests integer not null default 0,
  claimed boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists inbox_user_idx on inbox (user_id, claimed, id desc);

create table if not exists friend_gifts (
  from_id text not null,
  to_id text not null,
  day text not null,
  created_at timestamptz not null default now(),
  primary key (from_id, to_id, day)
);
