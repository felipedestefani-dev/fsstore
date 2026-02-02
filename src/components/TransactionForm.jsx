import React, { useState, useEffect } from 'react';
import { getCategoryList } from '../constants';
import { getDefaultDate } from '../utils';

export function TransactionForm({ onSubmit }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(getDefaultDate());

  const categoryList = type ? getCategoryList(type) : [];

  useEffect(() => {
    setCategory('');
  }, [type]);

  useEffect(() => {
    setDate(getDefaultDate());
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const desc = description.trim();
    const amt = parseFloat(amount);
    if (!desc || !amt || !type || !category || !date) {
      alert('Por favor, preencha todos os campos.');
      return;
    }
    onSubmit({
      id: Date.now().toString(),
      description: desc,
      amount: amt,
      type,
      category,
      date,
      createdAt: new Date().toISOString(),
    });
    setDescription('');
    setAmount('');
    setType('');
    setCategory('');
    setDate(getDefaultDate());
  };

  return (
    <section className="form-section">
      <div className="form-container">
        <h2 className="form-section__title">Adicionar Transação</h2>
        <form className="form" onSubmit={handleSubmit}>
          <div className="form__group">
            <label htmlFor="description" className="form__label">Descrição</label>
            <input
              type="text"
              id="description"
              className="form__input"
              placeholder="Ex: Salário, Aluguel, Supermercado..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="form__group">
            <label htmlFor="amount" className="form__label">Valor (R$)</label>
            <input
              type="number"
              id="amount"
              className="form__input"
              placeholder="0.00"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div className="form__group">
            <label htmlFor="type" className="form__label">Tipo</label>
            <select id="type" className="form__input" value={type} onChange={(e) => setType(e.target.value)} required>
              <option value="">Selecione...</option>
              <option value="income">Ganho</option>
              <option value="expense">Gasto</option>
              <option value="investment">Investimento</option>
              <option value="caixinha">Caixinha</option>
            </select>
          </div>
          <div className="form__group">
            <label htmlFor="category" className="form__label">Categoria</label>
            <select id="category" className="form__input" value={category} onChange={(e) => setCategory(e.target.value)} required>
              <option value="">Selecione uma categoria...</option>
              {categoryList.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="form__group">
            <label htmlFor="date" className="form__label">Data</label>
            <input
              type="date"
              id="date"
              className="form__input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn--primary">
            <svg className="btn__icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="currentColor" />
            </svg>
            Adicionar Transação
          </button>
        </form>
      </div>
    </section>
  );
}
