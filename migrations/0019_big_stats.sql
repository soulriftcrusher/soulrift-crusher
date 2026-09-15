-- Founder power and raid influence blow past int4 (2.1B).
alter table clans alter column influence type bigint using influence::bigint;
alter table gem_grants alter column gems type bigint using gems::bigint;
alter table staff_gifts alter column souls type bigint using souls::bigint;
alter table staff_gifts alter column gems type bigint using gems::bigint;
alter table staff_gifts alter column chests type bigint using chests::bigint;
