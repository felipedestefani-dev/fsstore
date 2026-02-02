import React, { useState, useEffect } from 'react';
import { getCategoryList } from '../constants';
import { getDefaultDate } from '../utils';

export function EditModal({ isOpen, transaction, onClose, onSave }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('income');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(getDefaultDate());

  const categoryList = type ? getCategoryList(type) : [];

  useEffect(() => {
    if (transaction) {
      setDescription(transaction.description);
      setAmount(String(transaction.amount));
      setType(transaction.type);
      setCategory(transaction.category);
      setDate(transaction.date);
    }
  }, [transaction]);

  useEffect(() => {
    setCategory((prev) => {
      const list = getCategoryList(type);
      return list.includes(prev) ? prev : (list[0] || '');
    });
  }, [type]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const desc = description.trim();
    const amt = parseFloat(amount);
    if (!desc || !amt || !type || !category || !date) {
      alert('Por favor, preencha todos os campos.');
      return;
    }
    onSave({
      ...transaction,
      description: desc,
      amount: amt,
      type,
      category,
      date,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal active" onClick={(e) => e.target.className === 'modal active' && onClose()}>
      <div className="modal__content" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">Editar Transação</h2>
          <button type="button" className="modal__close" onClick={onClose} aria-label="Fechar">
            &times;
          </button>
        </div>
        <form className="form" onSubmit={handleSubmit}>
          <div className="form__group">
            <label htmlFor="edit-description" className="form__label">Descrição</label>
            <input
              type="text"
              id="edit-description"
              className="form__input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="form__group">
            <label htmlFor="edit-amount" className="form__label">Valor (R$)</label>
            <input
              type="number"
              id="edit-amount"
              className="form__input"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div className="form__group">
            <label htmlFor="edit-type" className="form__label">Tipo</label>
            <select id="edit-type" className="form__input" value={type} onChange={(e) => setType(e.target.value)} required>
              <option value="income">Ganho</option>
              <option value="expense">Gasto</option>
              <option value="investment">Investimento</option>
              <option value="caixinha">Caixinha</option>
            </select>
          </div>
          <div className="form__group">
            <label htmlFor="edit-category" className="form__label">Categoria</label>
            <select id="edit-category" className="form__input" value={category} onChange={(e) => setCategory(e.target.value)} required>
              {categoryList.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="form__group">
            <label htmlFor="edit-date" className="form__label">Data</label>
            <input
              type="date"
              id="edit-date"
              className="form__input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="modal__actions">
            <button type="button" className="btn btn--secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn--primary">
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
