CREATE TABLE IF NOT EXISTS trips (
  trip_id TEXT PRIMARY KEY,
  booked_at TEXT NOT NULL,
  operator TEXT NOT NULL,
  route TEXT NOT NULL,
  channel TEXT NOT NULL,
  seats INTEGER NOT NULL,
  fare_cents INTEGER NOT NULL,
  status TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_trips_booked ON trips (booked_at, operator);
