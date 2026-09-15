create index if not exists crusaders_last_seen_idx on crusaders (last_seen desc);
create index if not exists crusaders_power_idx on crusaders (power desc);
create index if not exists shard_members_shard_idx on shard_members (shard_id);
create index if not exists world_chat_id_desc_idx on world_chat (id desc);
