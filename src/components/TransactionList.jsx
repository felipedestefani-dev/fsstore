import React from 'react';
import { TransactionItem } from './TransactionItem';

export function TransactionList({ transactions, filters, privacyMode, onEdit, onDelete }) {
  let filtered = transactions.filter((t) => {
    if (filters.type !== 'all' && t.type !== filters.type) return false;
    if (filters.category !== 'all' && t.category !== filters.category) return false;
    if (filters.search && !t.description.toLowerCase().includes(filters.search)) return false;
    return true;
  });

  filtered = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));
  const count = filtered.length;

  return (
    <section className="transactions">
      <div className="transactions__header">
        <h2 className="transactions__title">Transações</h2>
        <p className="transactions__count">
          {count} {count === 1 ? 'transação' : 'transações'}
        </p>
      </div>
      <div className="transactions__list">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <svg className="empty-state__icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2ZM16 18H8V16H16V18ZM16 14H8V12H16V14ZM13 9V3.5L18.5 9H13Z" fill="currentColor" />
            </svg>
            <p className="empty-state__text">Nenhuma transação encontrada.</p>
            <p className="empty-state__subtext">
              {transactions.length === 0 ? 'Adicione sua primeira transação acima!' : 'Tente ajustar os filtros.'}
            </p>
          </div>
        ) : (
          filtered.map((transaction) => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              privacyMode={privacyMode}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </section>
  );
}
