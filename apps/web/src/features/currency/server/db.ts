import {
  char,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const exchangeRateSourceEnum = pgEnum('exchange_rate_source', ['manual', 'api']);

export const currencies = pgTable('currencies', {
  code: char('code', { length: 3 }).primaryKey(),
  name: text('name').notNull(),
  symbol: text('symbol').notNull(),
  decimalPlaces: integer('decimal_places').notNull().default(2),
});

export const exchangeRates = pgTable(
  'exchange_rates',
  {
    id: text('id').primaryKey(),
    fromCurrency: char('from_currency', { length: 3 })
      .notNull()
      .references(() => currencies.code, { onDelete: 'restrict' }),
    toCurrency: char('to_currency', { length: 3 })
      .notNull()
      .references(() => currencies.code, { onDelete: 'restrict' }),
    rate: numeric('rate', { precision: 20, scale: 8 }).notNull(),
    source: exchangeRateSourceEnum('source').notNull().default('manual'),
    validFrom: timestamp('valid_from', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('uniq_exchange_rate_pair_validfrom').on(
      table.fromCurrency,
      table.toCurrency,
      table.validFrom,
    ),
    index('idx_exchange_rate_pair').on(table.fromCurrency, table.toCurrency),
  ],
);
