-- Thrones and coup logs are permanent. Never DELETE FROM server_kings or king_log.
alter table server_kings add column if not exists last_coup_at timestamptz;
