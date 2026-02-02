import React, { useState, useEffect, useMemo } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { investmentCategories } from './constants';
import { Header } from './components/Header';
import { Summary } from './components/Summary';
import { TransactionForm } from './components/TransactionForm';
import { Filters } from './components/Filters';
import { TransactionList } from './components/TransactionList';
import { AddBalanceModal } from './components/AddBalanceModal';
import { EditModal } from './components/EditModal';
import { ExchangeRates } from './components/ExchangeRates';
import './App.css';

const initialFilters = { type: 'all', category: 'all', search: '' };

export default function App() {
  const [transactions, setTransactions] = useLocalStorage('transactions', []);
  const [addedBalance, setAddedBalance] = useLocalStorage('addedBalance', 0);
  const [privacyMode, setPrivacyMode] = useState(() => localStorage.getItem('privacyMode') === 'true');
  const [filters, setFilters] = useState(initialFilters);
  const [addBalanceOpen, setAddBalanceOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    localStorage.setItem('privacyMode', String(privacyMode));
  }, [privacyMode]);

  const { income, expense, investment, caixinhaTotal, balance } = useMemo(() => {
    const incomeVal = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenseVal = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const investmentFromExpense = transactions
      .filter((t) => t.type === 'expense' && investmentCategories.includes(t.category))
      .reduce((sum, t) => sum + t.amount, 0);
    const investmentFromType = transactions
      .filter((t) => t.type === 'investment')
      .reduce((sum, t) => sum + t.amount, 0);
    const investmentVal = investmentFromExpense + investmentFromType;
    const caixinhaVal = transactions
      .filter((t) => t.type === 'caixinha')
      .reduce((sum, t) => sum + t.amount, 0);
    const calculatedBalance = incomeVal - expenseVal;
    const totalBalance = calculatedBalance + addedBalance - caixinhaVal;
    return {
      income: incomeVal,
      expense: expenseVal,
      investment: investmentVal,
      caixinhaTotal: caixinhaVal,
      balance: totalBalance,
    };
  }, [transactions, addedBalance]);

  const editingTransaction = useMemo(
    () => (editingId ? transactions.find((t) => t.id === editingId) : null),
    [transactions, editingId]
  );

  const handleAddTransaction = (tx) => {
    setTransactions([tx, ...transactions]);
  };

  const handleEditTransaction = (id) => {
    setEditingId(id);
  };

  const handleSaveEdit = (updated) => {
    setTransactions(transactions.map((t) => (t.id === updated.id ? updated : t)));
    setEditingId(null);
  };

  const handleDeleteTransaction = (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
      setTransactions(transactions.filter((t) => t.id !== id));
    }
  };

  const handleAddBalance = (amount) => {
    setAddedBalance((prev) => prev + amount);
  };

  const handleResetBalance = () => {
    if (window.confirm('Zerar o saldo adicionado? O valor que você adicionou manualmente será removido.')) {
      setAddedBalance(0);
    }
  };

  const handleResetAll = () => {
    if (
      window.confirm(
        'Tem certeza que deseja resetar tudo? Todas as transações e o saldo adicionado serão apagados. Esta ação não pode ser desfeita.'
      )
    ) {
      setTransactions([]);
      setAddedBalance(0);
      setFilters(initialFilters);
    }
  };

  const handleTogglePrivacy = () => {
    setPrivacyMode((prev) => !prev);
  };

  const handleClearFilters = () => {
    setFilters(initialFilters);
  };

  return (
    <div className="container">
      <Header
        onResetAll={handleResetAll}
        onTogglePrivacy={handleTogglePrivacy}
        privacyMode={privacyMode}
      />
      <Summary
        income={income}
        expense={expense}
        balance={balance}
        addedBalance={addedBalance}
        caixinhaTotal={caixinhaTotal}
        investment={investment}
        privacyMode={privacyMode}
        onAddBalance={() => setAddBalanceOpen(true)}
        onResetBalance={handleResetBalance}
      />
      <TransactionForm onSubmit={handleAddTransaction} />
      <Filters
        filters={filters}
        onFilterChange={setFilters}
        onClearFilters={handleClearFilters}
      />
      <TransactionList
        transactions={transactions}
        filters={filters}
        privacyMode={privacyMode}
        onEdit={handleEditTransaction}
        onDelete={handleDeleteTransaction}
      />
      <ExchangeRates />
      <AddBalanceModal
        isOpen={addBalanceOpen}
        onClose={() => setAddBalanceOpen(false)}
        onAdd={handleAddBalance}
      />
      <EditModal
        isOpen={!!editingId}
        transaction={editingTransaction}
        onClose={() => setEditingId(null)}
        onSave={handleSaveEdit}
      />
    </div>
  );
}
