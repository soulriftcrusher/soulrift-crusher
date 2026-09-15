-- Friend requests and friendships. Never DELETE these in an account wipe.
create table if not exists friend_requests (
  id serial primary key,
  from_id text not null,
  to_id text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  unique (from_id, to_id)
);
create index if not exists friend_req_to_idx on friend_requests (to_id, status);

create table if not exists friendships (
  user_a text not null,
  user_b text not null,
  created_at timestamptz not null default now(),
  primary key (user_a, user_b)
);
