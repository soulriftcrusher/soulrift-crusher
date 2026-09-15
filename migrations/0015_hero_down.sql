alter table hero_progress add column if not exists down_until bigint not null default 0;
