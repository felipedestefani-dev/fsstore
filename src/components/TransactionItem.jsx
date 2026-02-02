import React from 'react';
import { formatCurrency, formatDate } from '../utils';

export function TransactionItem({ transaction, privacyMode, onEdit, onDelete }) {
  const amountClass =
    transaction.type === 'income'
      ? 'transaction-item__amount--income'
      : transaction.type === 'investment'
        ? 'transaction-item__amount--investment'
        : transaction.type === 'caixinha'
          ? 'transaction-item__amount--caixinha'
          : 'transaction-item__amount--expense';
  const sign =
    transaction.type === 'income'
      ? '+'
      : transaction.type === 'investment' || transaction.type === 'caixinha'
        ? '↑'
        : '-';
  const formattedAmount = privacyMode ? '••••••' : formatCurrency(transaction.amount);
  const displayAmount = privacyMode ? '•••' : `${sign} ${formattedAmount}`;

  return (
    <div className={`transaction-item transaction-item--${transaction.type}`}>
      <div className="transaction-item__content">
        <div className="transaction-item__description">{transaction.description}</div>
        <div className="transaction-item__meta">
          <span className="transaction-item__category">{transaction.category}</span>
          <span>{formatDate(transaction.date)}</span>
        </div>
      </div>
      <div className={`transaction-item__amount ${amountClass}`}>{displayAmount}</div>
      <div className="transaction-item__actions">
        <button
          type="button"
          className="btn--icon btn--icon--edit"
          onClick={() => onEdit(transaction.id)}
          title="Editar"
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.12 5.13L18.87 8.88L20.71 7.04Z" fill="currentColor" />
          </svg>
        </button>
        <button
          type="button"
          className="btn--icon btn--icon--delete"
          onClick={() => onDelete(transaction.id)}
          title="Excluir"
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" fill="currentColor" />
          </svg>
        </button>
      </div>
    </div>
  );
}
