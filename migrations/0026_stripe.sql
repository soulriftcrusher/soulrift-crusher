create table if not exists stripe_payments (
  session_id text primary key,
  user_id text not null,
  pack_id text not null,
  created_at timestamptz not null default now()
);

create table if not exists paid_gods (
  user_id text not null,
  hero_id text not null,
  primary key (user_id, hero_id)
);

create table if not exists paid_perks (
  user_id text primary key,
  first_blood boolean not null default false
);
