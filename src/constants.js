export const categories = {
  income: [
    'Salário',
    'Freelance',
    'Retorno de Investimentos',
    'Dividendos',
    'Vendas',
    'Aluguel Recebido',
    'Outros Ganhos',
  ],
  expense: [
    'Alimentação',
    'Transporte',
    'Moradia',
    'Saúde',
    'Educação',
    'Lazer',
    'Compras',
    'Contas',
    'Investimentos',
    'Ações',
    'Fundos Imobiliários',
    'Tesouro Direto',
    'Criptomoedas',
    'Outros Gastos',
  ],
};

export const investmentCategories = [
  'Investimentos',
  'Ações',
  'Fundos Imobiliários',
  'Tesouro Direto',
  'Criptomoedas',
];

export const typeOptions = [
  { value: '', label: 'Selecione...' },
  { value: 'income', label: 'Ganho' },
  { value: 'expense', label: 'Gasto' },
  { value: 'investment', label: 'Investimento' },
  { value: 'caixinha', label: 'Caixinha' },
];

export const filterTypeOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'income', label: 'Ganhos' },
  { value: 'expense', label: 'Gastos' },
  { value: 'investment', label: 'Investimentos' },
  { value: 'caixinha', label: 'Caixinha' },
];

export const currencies = [
  { code: 'USD', name: 'Dólar Americano', flag: '🇺🇸', isCrypto: false },
  { code: 'BTC', name: 'Bitcoin', flag: '₿', isCrypto: true },
];

export function getCategoryList(type) {
  if (type === 'income') return categories.income;
  if (type === 'investment' || type === 'caixinha') return investmentCategories;
  return categories.expense;
}

export function getAllCategories() {
  return [...new Set([...categories.income, ...categories.expense, ...investmentCategories])];
}
