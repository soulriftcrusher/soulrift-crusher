alter table "user" add column if not exists username text;
alter table "user" add column if not exists "displayUsername" text;
create unique index if not exists user_username_key on "user" (username);

update "user" u
set username = lower(regexp_replace(c.name, '[^A-Za-z0-9_]', '', 'g')),
    "displayUsername" = c.name
from crusaders c
where c.user_id = u.id
  and u.username is null
  and length(regexp_replace(c.name, '[^A-Za-z0-9_]', '', 'g')) >= 3
  and not exists (
    select 1 from "user" taken
    where taken.username = lower(regexp_replace(c.name, '[^A-Za-z0-9_]', '', 'g'))
  )
  and (
    select count(*) from crusaders other
    where lower(regexp_replace(other.name, '[^A-Za-z0-9_]', '', 'g'))
      = lower(regexp_replace(c.name, '[^A-Za-z0-9_]', '', 'g'))
  ) = 1;
