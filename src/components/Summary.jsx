import React from 'react';
import { formatCurrency } from '../utils';

export function Summary({
  income,
  expense,
  balance,
  addedBalance,
  caixinhaTotal,
  investment,
  privacyMode,
  onAddBalance,
  onResetBalance,
}) {
  const mask = (v) => (privacyMode ? '••••••' : v);

  return (
    <section className="summary">
      <div className="summary__card summary__card--income">
        <div className="summary__icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 6L18.29 8.29L13.41 13.17L9.41 9.17L2 16.59L3.41 18L9.41 12L13.41 16L19.71 9.71L22 12V6H16Z" fill="currentColor" />
          </svg>
        </div>
        <div className="summary__content">
          <h3 className="summary__label">Total de Ganhos</h3>
          <p className="summary__value">{mask(formatCurrency(income))}</p>
        </div>
      </div>
      <div className="summary__card summary__card--expense">
        <div className="summary__icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 18L18.29 15.71L13.41 10.83L9.41 14.83L2 7.41L3.41 6L9.41 12L13.41 8L19.71 14.29L22 12V18H16Z" fill="currentColor" />
          </svg>
        </div>
        <div className="summary__content">
          <h3 className="summary__label">Total de Gastos</h3>
          <p className="summary__value">{mask(formatCurrency(expense))}</p>
        </div>
      </div>
      <div className="summary__card summary__card--balance">
        <div className="summary__icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.8 10.9C9.53 10.31 8.8 9.7 8.8 8.75C8.8 7.66 9.81 6.9 11.5 6.9C13.28 6.9 13.94 7.75 14 9H16.21C16.14 7.28 15.09 5.7 13 5.19V3H10V5.16C8.06 5.58 6.5 6.84 6.5 8.77C6.5 10.65 8.2 11.9 11.2 12.58C13.85 13.15 14.2 14.05 14.2 14.83C14.2 15.95 13.35 16.9 11.5 16.9C9.45 16.9 8.7 15.9 8.6 14.7H6.39C6.5 16.75 8.11 18.1 10 18.5V21H13V18.84C14.95 18.5 16.5 17.35 16.5 15.3C16.5 13.1 14.5 11.7 11.8 10.9Z" fill="currentColor" />
          </svg>
        </div>
        <div className="summary__content">
          <div className="summary__header">
            <h3 className="summary__label">Saldo</h3>
            <div className="summary__balance-actions">
              <button type="button" className="summary__edit-btn" onClick={onAddBalance} title="Adicionar dinheiro ao saldo">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="currentColor" />
                </svg>
              </button>
              <button type="button" className="summary__edit-btn summary__edit-btn--danger" onClick={onResetBalance} title="Zerar saldo adicionado">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" fill="currentColor" />
                </svg>
              </button>
            </div>
          </div>
          <p className="summary__value" id="balance" style={{ color: balance < 0 ? 'var(--expense-color)' : 'var(--balance-color)' }}>
            {mask(formatCurrency(balance))}
          </p>
          <p className="summary__subtext">Dinheiro adicionado: {mask(formatCurrency(addedBalance))}</p>
        </div>
      </div>
      <div className="summary__card summary__card--caixinha">
        <div className="summary__icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 5H5C3.9 5 3 5.9 3 7V17C3 18.1 3.9 19 5 19H19C20.1 19 21 18.1 21 17V7C21 5.9 20.1 5 19 5ZM19 17H5V7H19V17ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z" fill="currentColor" />
          </svg>
        </div>
        <div className="summary__content">
          <h3 className="summary__label">Total Caixinha</h3>
          <p className="summary__value">{mask(formatCurrency(caixinhaTotal))}</p>
        </div>
      </div>
      <div className="summary__card summary__card--investment">
        <div className="summary__icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM7 10H9V17H7V10ZM11 7H13V17H11V7ZM15 13H17V17H15V13Z" fill="currentColor" />
          </svg>
        </div>
        <div className="summary__content">
          <h3 className="summary__label">Total Investido</h3>
          <p className="summary__value">{mask(formatCurrency(investment))}</p>
        </div>
      </div>
    </section>
  );
}
