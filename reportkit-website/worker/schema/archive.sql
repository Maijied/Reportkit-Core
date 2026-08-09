-- Archive D1: historical trips (2012 → 2017), operator_code references live.operators.code
CREATE TABLE IF NOT EXISTS trips (
  trip_id TEXT PRIMARY KEY,
  booked_at TEXT NOT NULL,
  operator_code TEXT NOT NULL,
  route TEXT NOT NULL,
  channel TEXT NOT NULL,
  seats INTEGER NOT NULL,
  fare_cents INTEGER NOT NULL,
  status TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_archive_booked_at ON trips (booked_at);
CREATE INDEX IF NOT EXISTS idx_archive_operator_code ON trips (operator_code);
CREATE INDEX IF NOT EXISTS idx_archive_route ON trips (route);
CREATE INDEX IF NOT EXISTS idx_archive_booked_operator ON trips (booked_at, operator_code);
CREATE INDEX IF NOT EXISTS idx_archive_status ON trips (status);

CREATE TABLE IF NOT EXISTS report_stats (
  key TEXT PRIMARY KEY,
  value INTEGER NOT NULL,
  updated_at TEXT NOT NULL
);
