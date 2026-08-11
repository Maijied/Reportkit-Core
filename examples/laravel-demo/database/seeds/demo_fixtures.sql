-- Fictional demo fixtures for examples/laravel-demo (SQLite)
-- No real operators, clients, or production identifiers.

CREATE TABLE IF NOT EXISTS demo_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    record_date TEXT NOT NULL,
    category TEXT NOT NULL,
    amount REAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'posted',
    operator_code TEXT NOT NULL DEFAULT 'DEMO'
);

INSERT INTO demo_records (record_date, category, amount, status, operator_code) VALUES
('2026-01-02', 'recharge', 1500.00, 'posted', 'NORTHSTAR'),
('2026-01-03', 'ticket_sell', 420.50, 'posted', 'NORTHSTAR'),
('2026-01-04', 'ticket_cancel', 80.00, 'posted', 'NORTHSTAR'),
('2026-01-05', 'recharge', 900.00, 'posted', 'BLUELINE'),
('2026-01-06', 'admin_debit', 25.00, 'posted', 'BLUELINE');
