import React, { useState } from 'react';
import { formatCurrency } from '../utils';

export function AddBalanceModal({ isOpen, onClose, onAdd }) {
  const [amount, setAmount] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const value = parseFloat(amount) || 0;
    if (value <= 0) {
      alert('Por favor, insira um valor maior que zero.');
      return;
    }
    onAdd(value);
    setAmount('');
    onClose();
    alert(`${formatCurrency(value)} adicionado ao saldo com sucesso!`);
  };

  const handleClose = () => {
    setAmount('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal active" onClick={(e) => e.target.className === 'modal active' && handleClose()}>
      <div className="modal__content" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">Adicionar Dinheiro ao Saldo</h2>
          <button type="button" className="modal__close" onClick={handleClose} aria-label="Fechar">
            &times;
          </button>
        </div>
        <form className="form" onSubmit={handleSubmit}>
          <div className="form__group">
            <label htmlFor="add-balance-amount" className="form__label">Valor a Adicionar (R$)</label>
            <input
              type="number"
              id="add-balance-amount"
              className="form__input"
              placeholder="0.00"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <p className="form__help">Este valor será somado ao saldo atual (Ganhos - Gastos)</p>
          </div>
          <div className="modal__actions">
            <button type="button" className="btn btn--secondary" onClick={handleClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn--primary">
              Adicionar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
