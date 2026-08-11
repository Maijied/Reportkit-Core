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

DELETE FROM demo_records;

INSERT INTO demo_records (record_date, category, amount, status, operator_code) VALUES
('2026-01-02', 'recharge', 1500.00, 'posted', 'NORTHSTAR'),
('2026-01-03', 'ticket_sell', 420.50, 'posted', 'NORTHSTAR'),
('2026-01-04', 'ticket_cancel', 80.00, 'posted', 'NORTHSTAR'),
('2026-01-05', 'recharge', 900.00, 'posted', 'BLUELINE'),
('2026-01-06', 'admin_debit', 25.00, 'posted', 'BLUELINE'),
('2026-01-07', 'ticket_sell', 310.00, 'posted', 'NORTHSTAR'),
('2026-01-08', 'ticket_sell', 155.75, 'posted', 'BLUELINE'),
('2026-01-09', 'ticket_cancel', 45.00, 'posted', 'NORTHSTAR'),
('2026-01-10', 'recharge', 2200.00, 'posted', 'COASTLINE'),
('2026-01-11', 'admin_debit', 12.50, 'posted', 'COASTLINE'),
('2026-01-12', 'ticket_sell', 88.00, 'posted', 'COASTLINE'),
('2026-01-13', 'balance_reset', 0.00, 'posted', 'NORTHSTAR'),
('2026-01-14', 'recharge', 640.00, 'posted', 'BLUELINE'),
('2026-01-15', 'ticket_sell', 199.99, 'posted', 'NORTHSTAR');
