export type Currency = {
  code: string;
  name: string;
  symbol: string;
  decimalPlaces: number;
};

export type ExchangeRate = {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  source: 'manual' | 'api';
  validFrom: string;
};
