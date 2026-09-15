alter table clans add column if not exists blurb text not null default '';
alter table clans add column if not exists crest text not null default 'axe';
alter table clans add column if not exists loc text not null default 'USA';
alter table clans add column if not exists open boolean not null default true;
alter table clans add column if not exists min_floor integer not null default 1;
alter table clans add column if not exists science double precision not null default 0;
