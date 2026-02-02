import React from 'react';
import { getAllCategories } from '../constants';

const typeOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'income', label: 'Ganhos' },
  { value: 'expense', label: 'Gastos' },
  { value: 'investment', label: 'Investimentos' },
  { value: 'caixinha', label: 'Caixinha' },
];

export function Filters({ filters, onFilterChange, onClearFilters }) {
  const allCategories = getAllCategories();

  return (
    <section className="filters">
      <div className="filters__container">
        <div className="filter-group">
          <label htmlFor="filter-type" className="filter__label">Filtrar por tipo:</label>
          <select
            id="filter-type"
            className="filter__select"
            value={filters.type}
            onChange={(e) => onFilterChange({ ...filters, type: e.target.value })}
          >
            {typeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="filter-category" className="filter__label">Filtrar por categoria:</label>
          <select
            id="filter-category"
            className="filter__select"
            value={filters.category}
            onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
          >
            <option value="all">Todas</option>
            {allCategories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="search" className="filter__label">Buscar:</label>
          <input
            type="text"
            id="search"
            className="filter__input"
            placeholder="Buscar por descrição..."
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value.toLowerCase() })}
          />
        </div>
        <button type="button" className="btn btn--secondary btn--small" onClick={onClearFilters}>
          Limpar Filtros
        </button>
      </div>
    </section>
  );
}
