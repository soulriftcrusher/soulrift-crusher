create table if not exists mutes (
  user_id text not null,
  muted_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, muted_id)
);
create index if not exists mutes_user_idx on mutes (user_id);

create table if not exists reports (
  id serial primary key,
  from_id text not null,
  about_id text not null,
  reason text not null default 'report',
  created_at timestamptz not null default now()
);
create index if not exists reports_about_idx on reports (about_id, created_at desc);

create table if not exists clan_mail (
  id serial primary key,
  clan_id integer not null,
  user_id text not null,
  name text not null,
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists clan_mail_clan_idx on clan_mail (clan_id, id desc);

create table if not exists iap_orders (
  id serial primary key,
  user_id text not null,
  pack_id text not null,
  gems integer not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);
create index if not exists iap_orders_user_idx on iap_orders (user_id, created_at desc);
