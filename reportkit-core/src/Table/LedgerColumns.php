<?php

/**
 * Lorapok ReportKit
 * Copyright (c) 2026 Lorapok Labs (https://lorapok.tech)
 * Licensed under the Lorapok Non-Commercial License 1.0 (Lorapok-NCL-1.0)
 *
 * LedgerColumns — Standard 18-column billing ledger keys (Phase K / bus #16817 parity).
 */

namespace ReportKit\Core\Table;

/**
 * Standard 18-column billing ledger keys (Phase K / bus #16817 parity).
 */
class LedgerColumns
{
    /**
     * @return array list of [key, label] maps
     */
    public static function billing18()
    {
        return array(
            array('key' => 'transaction_date', 'label' => 'Txn Date'),
            array('key' => 'transaction_type', 'label' => 'Type'),
            array('key' => 'pnr', 'label' => 'PNR'),
            array('key' => 'passenger_name', 'label' => 'Passenger'),
            array('key' => 'company_name', 'label' => 'Company'),
            array('key' => 'route_name', 'label' => 'Route'),
            array('key' => 'coach_number', 'label' => 'Coach'),
            array('key' => 'journey_date', 'label' => 'Journey'),
            array('key' => 'from_station', 'label' => 'From'),
            array('key' => 'to_station', 'label' => 'To'),
            array('key' => 'seat_count', 'label' => 'Seats'),
            array('key' => 'ticket_count', 'label' => 'Tickets'),
            array('key' => 'ticket_price', 'label' => 'Ticket Price'),
            array('key' => 'ticket_status', 'label' => 'Status'),
            array('key' => 'credit_amount', 'label' => 'Credit'),
            array('key' => 'debit_amount', 'label' => 'Debit'),
            array('key' => 'balance', 'label' => 'Balance'),
            array('key' => 'comments', 'label' => 'Comments'),
        );
    }

    /**
     * @return array column keys only
     */
    public static function keys()
    {
        $keys = array();

        foreach (self::billing18() as $col) {
            $keys[] = $col['key'];
        }

        return $keys;
    }
}
