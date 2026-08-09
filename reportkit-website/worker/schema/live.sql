-- Live D1: operator catalog + recent trips (2018 → present)
-- Reset legacy flat schema (operator TEXT) before applying research schema.
DROP TABLE IF EXISTS trips;
DROP TABLE IF EXISTS operators;

CREATE TABLE IF NOT EXISTS operators (
  id INTEGER PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  active_since TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS trips (
  trip_id TEXT PRIMARY KEY,
  booked_at TEXT NOT NULL,
  operator_id INTEGER NOT NULL,
  route TEXT NOT NULL,
  channel TEXT NOT NULL,
  seats INTEGER NOT NULL,
  fare_cents INTEGER NOT NULL,
  status TEXT NOT NULL,
  FOREIGN KEY (operator_id) REFERENCES operators(id)
);

CREATE INDEX IF NOT EXISTS idx_trips_booked_at ON trips (booked_at);
CREATE INDEX IF NOT EXISTS idx_trips_operator_id ON trips (operator_id);
CREATE INDEX IF NOT EXISTS idx_trips_route ON trips (route);
CREATE INDEX IF NOT EXISTS idx_trips_booked_operator ON trips (booked_at, operator_id);
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips (status);

CREATE TABLE IF NOT EXISTS report_stats (
  key TEXT PRIMARY KEY,
  value INTEGER NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS report_meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
