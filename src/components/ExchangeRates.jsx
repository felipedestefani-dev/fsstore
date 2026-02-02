import React, { useState, useEffect } from 'react';
import { currencies } from '../constants';
import { formatCurrency } from '../utils';

export function ExchangeRates() {
  const [rates, setRates] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRates = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/BRL');
      if (!response.ok) throw new Error('Erro ao buscar cotações');
      const data = await response.json();
      const newRates = { ...(data.rates || {}) };

      try {
        const btcRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=brl');
        if (btcRes.ok) {
          const btcData = await btcRes.json();
          if (btcData.bitcoin?.brl) newRates['BTC'] = btcData.bitcoin.brl;
        }
      } catch {
        try {
          const altBtc = await fetch('https://api.coindesk.com/v1/bpi/currentprice/BRL.json');
          if (altBtc.ok) {
            const altData = await altBtc.json();
            if (altData.bpi?.BRL?.rate_float) newRates['BTC'] = altData.bpi.BRL.rate_float;
          }
        } catch {}
      }

      setRates(newRates);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
    const interval = setInterval(fetchRates, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <section className="exchange-rates">
        <div className="exchange-rates__header">
          <h2 className="exchange-rates__title">Cotações em Tempo Real</h2>
          <button type="button" className="btn btn--secondary btn--small" disabled title="Atualizar cotações">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 16, height: 16 }}>
              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4C7.58 4 4 7.58 4 12C4 16.42 7.58 20 12 20C15.73 20 18.84 17.45 19.73 14H17.65C16.83 16.33 14.61 18 12 18C8.69 18 6 15.31 6 12C6 8.69 8.69 6 12 6C13.66 6 15.14 6.69 16.22 7.78L13 11H20V4L17.65 6.35Z" fill="currentColor" />
            </svg>
            Atualizar
          </button>
        </div>
        <div className="exchange-rates__container">
          <div className="exchange-rates__loading">
            <div className="loading-spinner" />
            <p>Carregando cotações...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="exchange-rates">
        <div className="exchange-rates__header">
          <h2 className="exchange-rates__title">Cotações em Tempo Real</h2>
          <button type="button" className="btn btn--secondary btn--small" onClick={fetchRates} title="Atualizar cotações">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 16, height: 16 }}>
              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4C7.58 4 4 7.58 4 12C4 16.42 7.58 20 12 20C15.73 20 18.84 17.45 19.73 14H17.65C16.83 16.33 14.61 18 12 18C8.69 18 6 15.31 6 12C6 8.69 8.69 6 12 6C13.66 6 15.14 6.69 16.22 7.78L13 11H20V4L17.65 6.35Z" fill="currentColor" />
            </svg>
            Atualizar
          </button>
        </div>
        <div className="exchange-rates__container">
          <div className="exchange-rates__error">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 48, height: 48, color: 'var(--danger-color)', marginBottom: '1rem' }}>
              <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor" />
            </svg>
            <p>Erro ao carregar cotações</p>
            <p className="exchange-rates__error-subtext">Verifique sua conexão e tente novamente</p>
            <button type="button" className="btn btn--primary btn--small" onClick={fetchRates}>
              Tentar Novamente
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="exchange-rates">
      <div className="exchange-rates__header">
        <h2 className="exchange-rates__title">Cotações em Tempo Real</h2>
        <button type="button" className="btn btn--secondary btn--small" onClick={fetchRates} title="Atualizar cotações">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 16, height: 16 }}>
            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4C7.58 4 4 7.58 4 12C4 16.42 7.58 20 12 20C15.73 20 18.84 17.45 19.73 14H17.65C16.83 16.33 14.61 18 12 18C8.69 18 6 15.31 6 12C6 8.69 8.69 6 12 6C13.66 6 15.14 6.69 16.22 7.78L13 11H20V4L17.65 6.35Z" fill="currentColor" />
          </svg>
          Atualizar
        </button>
      </div>
      <div className="exchange-rates__container">
        {currencies.map((currency) => {
          let rate = null;
          let displayRate = 'N/A';
          if (currency.code === 'BTC') {
            rate = rates['BTC'];
            if (rate) displayRate = formatCurrency(rate);
          } else {
            rate = rates[currency.code];
            if (rate && rate > 0) displayRate = formatCurrency(1 / rate);
          }
          const cardClass =
            currency.code === 'BTC' ? 'exchange-rate-card--bitcoin' : currency.code === 'USD' ? 'exchange-rate-card--dollar' : '';
          return (
            <div key={currency.code} className={`exchange-rate-card ${cardClass}`}>
              <div className="exchange-rate-card__header">
                <div className="exchange-rate-card__flag">{currency.flag}</div>
                <div className="exchange-rate-card__info">
                  <h3 className="exchange-rate-card__code">{currency.code}</h3>
                  <p className="exchange-rate-card__name">{currency.name}</p>
                </div>
              </div>
              <div className="exchange-rate-card__rate">
                <span className="exchange-rate-card__value">{displayRate}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
