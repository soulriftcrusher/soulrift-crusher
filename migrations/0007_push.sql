-- Web push subscriptions + VAPID keypair (generated on first use)
create table if not exists push_meta (
  id integer primary key,
  public_key text not null,
  private_key text not null
);

create table if not exists push_subscriptions (
  endpoint text primary key,
  user_id text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);
create index if not exists push_sub_user_idx on push_subscriptions (user_id);
