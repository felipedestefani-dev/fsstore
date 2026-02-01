// ===== CATEGORIES =====
const categories = {
    income: [
        'Salário',
        'Freelance',
        'Retorno de Investimentos',
        'Dividendos',
        'Vendas',
        'Aluguel Recebido',
        'Outros Ganhos'
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
        'Outros Gastos'
    ]
};

// Investment categories (for calculating total invested)
const investmentCategories = [
    'Investimentos',
    'Ações',
    'Fundos Imobiliários',
    'Tesouro Direto',
    'Criptomoedas'
];

// ===== STATE =====
let transactions = [];
let addedBalance = 0;
let editingId = null;
let privacyMode = false;
let filters = {
    type: 'all',
    category: 'all',
    search: ''
};

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', () => {
    loadTransactions();
    setupEventListeners();
    populateCategories();
    setDefaultDate();
    updateSummary();
    renderTransactions();
    
    // Initialize exchange rates
    setTimeout(() => {
        if (document.getElementById('exchange-rates-container')) {
            fetchExchangeRates();
        }
    }, 500);
});

// ===== LOAD FROM LOCALSTORAGE =====
function loadTransactions() {
    const stored = localStorage.getItem('transactions');
    if (stored) {
        transactions = JSON.parse(stored);
    }
    
    const storedAddedBalance = localStorage.getItem('addedBalance');
    if (storedAddedBalance) {
        addedBalance = parseFloat(storedAddedBalance) || 0;
    }
}

// ===== SAVE TO LOCALSTORAGE =====
function saveTransactions() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

function saveAddedBalance() {
    localStorage.setItem('addedBalance', addedBalance.toString());
}

// ===== SETUP EVENT LISTENERS =====
function setupEventListeners() {
    // Form submission
    const form = document.getElementById('transaction-form');
    form.addEventListener('submit', handleAddTransaction);

    // Edit form submission
    const editForm = document.getElementById('edit-form');
    editForm.addEventListener('submit', handleEditTransaction);

    // Modal controls
    document.getElementById('close-modal').addEventListener('click', closeModal);
    document.getElementById('cancel-edit').addEventListener('click', closeModal);
    document.getElementById('edit-modal').addEventListener('click', (e) => {
        if (e.target.id === 'edit-modal') {
            closeModal();
        }
    });

    // Filters
    document.getElementById('filter-type').addEventListener('change', (e) => {
        filters.type = e.target.value;
        renderTransactions();
    });

    document.getElementById('filter-category').addEventListener('change', (e) => {
        filters.category = e.target.value;
        renderTransactions();
    });

    document.getElementById('search').addEventListener('input', (e) => {
        filters.search = e.target.value.toLowerCase();
        renderTransactions();
    });

    document.getElementById('clear-filters').addEventListener('click', clearFilters);

    // Privacy toggle
    document.getElementById('privacy-toggle').addEventListener('click', togglePrivacy);
    
    // Load privacy state
    const savedPrivacyState = localStorage.getItem('privacyMode');
    if (savedPrivacyState === 'true') {
        privacyMode = true;
        updatePrivacyMode();
    }

    // Add balance modal
    document.getElementById('add-balance-btn').addEventListener('click', openAddBalanceModal);
    document.getElementById('close-add-balance-modal').addEventListener('click', closeAddBalanceModal);
    document.getElementById('cancel-add-balance').addEventListener('click', closeAddBalanceModal);
    document.getElementById('add-balance-modal').addEventListener('click', (e) => {
        if (e.target.id === 'add-balance-modal') {
            closeAddBalanceModal();
        }
    });
    document.getElementById('add-balance-form').addEventListener('submit', handleAddBalance);

    // Reset buttons
    document.getElementById('reset-balance-btn').addEventListener('click', resetBalance);
    document.getElementById('reset-all-btn').addEventListener('click', resetAll);

    // Category change updates options
    document.getElementById('type').addEventListener('change', (e) => {
        populateCategories(e.target.value);
    });
}

// ===== POPULATE CATEGORIES =====
function populateCategories(type = null) {
    const categorySelect = document.getElementById('category');
    const editCategorySelect = document.getElementById('edit-category');
    
    const typeValue = type || document.getElementById('type').value;
    const categoryList = typeValue === 'income' ? categories.income : 
                        typeValue === 'expense' ? categories.expense : [];

    // Clear and populate category select
    categorySelect.innerHTML = '<option value="">Selecione uma categoria...</option>';
    categoryList.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        categorySelect.appendChild(option);
    });

    // Populate filter categories
    populateFilterCategories();
}

// ===== POPULATE FILTER CATEGORIES =====
function populateFilterCategories() {
    const filterCategorySelect = document.getElementById('filter-category');
    const allCategories = [...categories.income, ...categories.expense];
    const uniqueCategories = [...new Set(allCategories)];

    filterCategorySelect.innerHTML = '<option value="all">Todas</option>';
    uniqueCategories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        filterCategorySelect.appendChild(option);
    });
}

// ===== SET DEFAULT DATE =====
function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
}

// ===== HANDLE ADD TRANSACTION =====
function handleAddTransaction(e) {
    e.preventDefault();

    const description = document.getElementById('description').value.trim();
    const amount = parseFloat(document.getElementById('amount').value);
    const type = document.getElementById('type').value;
    const category = document.getElementById('category').value;
    const date = document.getElementById('date').value;

    if (!description || !amount || !type || !category || !date) {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    const transaction = {
        id: Date.now().toString(),
        description,
        amount,
        type,
        category,
        date,
        createdAt: new Date().toISOString()
    };

    transactions.unshift(transaction);
    saveTransactions();
    updateSummary();
    renderTransactions();
    
    // Reset form
    e.target.reset();
    setDefaultDate();
    populateCategories();
}

// ===== HANDLE EDIT TRANSACTION =====
function handleEditTransaction(e) {
    e.preventDefault();

    const id = document.getElementById('edit-id').value;
    const description = document.getElementById('edit-description').value.trim();
    const amount = parseFloat(document.getElementById('edit-amount').value);
    const type = document.getElementById('edit-type').value;
    const category = document.getElementById('edit-category').value;
    const date = document.getElementById('edit-date').value;

    if (!description || !amount || !type || !category || !date) {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    const index = transactions.findIndex(t => t.id === id);
    if (index !== -1) {
        transactions[index] = {
            ...transactions[index],
            description,
            amount,
            type,
            category,
            date
        };
        saveTransactions();
        updateSummary();
        renderTransactions();
        closeModal();
    }
}

// ===== DELETE TRANSACTION =====
function deleteTransaction(id) {
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
        transactions = transactions.filter(t => t.id !== id);
        saveTransactions();
        updateSummary();
        renderTransactions();
    }
}

// ===== EDIT TRANSACTION =====
function editTransaction(id) {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;

    editingId = id;
    
    // Populate edit form categories
    const editCategorySelect = document.getElementById('edit-category');
    const categoryList = transaction.type === 'income' ? categories.income : categories.expense;
    editCategorySelect.innerHTML = '';
    categoryList.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        editCategorySelect.appendChild(option);
    });

    // Fill form
    document.getElementById('edit-id').value = transaction.id;
    document.getElementById('edit-description').value = transaction.description;
    document.getElementById('edit-amount').value = transaction.amount;
    document.getElementById('edit-type').value = transaction.type;
    document.getElementById('edit-category').value = transaction.category;
    document.getElementById('edit-date').value = transaction.date;

    // Update categories when type changes
    document.getElementById('edit-type').addEventListener('change', function() {
        const categoryList = this.value === 'income' ? categories.income : categories.expense;
        editCategorySelect.innerHTML = '';
        categoryList.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            editCategorySelect.appendChild(option);
        });
    }, { once: true });

    // Show modal
    document.getElementById('edit-modal').classList.add('active');
}

// ===== CLOSE MODAL =====
function closeModal() {
    document.getElementById('edit-modal').classList.remove('active');
    editingId = null;
    document.getElementById('edit-form').reset();
}

// ===== UPDATE SUMMARY =====
function updateSummary() {
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const expense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const investment = transactions
        .filter(t => t.type === 'expense' && investmentCategories.includes(t.category))
        .reduce((sum, t) => sum + t.amount, 0);

    const calculatedBalance = income - expense;
    const totalBalance = calculatedBalance + addedBalance;

    if (privacyMode) {
        document.getElementById('total-income').textContent = '••••••';
        document.getElementById('total-expense').textContent = '••••••';
        document.getElementById('total-investment').textContent = '••••••';
        document.getElementById('balance').textContent = '••••••';
        document.getElementById('balance-detail').textContent = 'Dinheiro adicionado: ••••••';
    } else {
        document.getElementById('total-income').textContent = formatCurrency(income);
        document.getElementById('total-expense').textContent = formatCurrency(expense);
        document.getElementById('total-investment').textContent = formatCurrency(investment);
        document.getElementById('balance').textContent = formatCurrency(totalBalance);
        document.getElementById('balance-detail').textContent = `Dinheiro adicionado: ${formatCurrency(addedBalance)}`;
    }

    // Update balance color
    const balanceElement = document.getElementById('balance');
    if (totalBalance < 0) {
        balanceElement.style.color = 'var(--expense-color)';
    } else {
        balanceElement.style.color = 'var(--balance-color)';
    }
}

// ===== ADD BALANCE MODAL =====
function openAddBalanceModal() {
    document.getElementById('add-balance-amount').value = '';
    document.getElementById('add-balance-modal').classList.add('active');
}

function closeAddBalanceModal() {
    document.getElementById('add-balance-modal').classList.remove('active');
    document.getElementById('add-balance-form').reset();
}

function handleAddBalance(e) {
    e.preventDefault();
    const amountToAdd = parseFloat(document.getElementById('add-balance-amount').value) || 0;
    
    if (amountToAdd <= 0) {
        alert('Por favor, insira um valor maior que zero.');
        return;
    }
    
    addedBalance += amountToAdd;
    saveAddedBalance();
    updateSummary();
    closeAddBalanceModal();
    
    // Show success message
    alert(`R$ ${formatCurrency(amountToAdd)} adicionado ao saldo com sucesso!`);
}

// ===== RESET BALANCE =====
function resetBalance() {
    if (!confirm('Zerar o saldo adicionado? O valor que você adicionou manualmente será removido.')) {
        return;
    }
    addedBalance = 0;
    saveAddedBalance();
    updateSummary();
}

// ===== RESET ALL =====
function resetAll() {
    if (!confirm('Tem certeza que deseja resetar tudo? Todas as transações e o saldo adicionado serão apagados. Esta ação não pode ser desfeita.')) {
        return;
    }
    transactions = [];
    addedBalance = 0;
    saveTransactions();
    saveAddedBalance();
    clearFilters();
    updateSummary();
    renderTransactions();
}

// ===== PRIVACY MODE =====
function togglePrivacy() {
    privacyMode = !privacyMode;
    localStorage.setItem('privacyMode', privacyMode.toString());
    updatePrivacyMode();
    updateSummary();
    renderTransactions();
}

function updatePrivacyMode() {
    const toggle = document.getElementById('privacy-toggle');
    const visibleIcon = toggle.querySelector('.privacy-toggle__icon--visible');
    const hiddenIcon = toggle.querySelector('.privacy-toggle__icon--hidden');
    const text = toggle.querySelector('.privacy-toggle__text');
    
    if (privacyMode) {
        visibleIcon.style.display = 'none';
        hiddenIcon.style.display = 'block';
        text.textContent = 'Mostrar Valores';
        toggle.classList.add('privacy-toggle--active');
    } else {
        visibleIcon.style.display = 'block';
        hiddenIcon.style.display = 'none';
        text.textContent = 'Ocultar Valores';
        toggle.classList.remove('privacy-toggle--active');
    }
}

function maskValue(value) {
    if (privacyMode) {
        return '••••••';
    }
    return value;
}


// ===== RENDER TRANSACTIONS =====
function renderTransactions() {
    const container = document.getElementById('transactions-list');
    
    // Filter transactions
    let filtered = transactions.filter(t => {
        // Type filter
        if (filters.type !== 'all' && t.type !== filters.type) {
            return false;
        }
        
        // Category filter
        if (filters.category !== 'all' && t.category !== filters.category) {
            return false;
        }
        
        // Search filter
        if (filters.search && !t.description.toLowerCase().includes(filters.search)) {
            return false;
        }
        
        return true;
    });

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Update count
    document.getElementById('transactions-count').textContent = 
        `${filtered.length} ${filtered.length === 1 ? 'transação' : 'transações'}`;

    // Clear container
    container.innerHTML = '';

    // Render transactions or empty state
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg class="empty-state__icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2ZM16 18H8V16H16V18ZM16 14H8V12H16V14ZM13 9V3.5L18.5 9H13Z" fill="currentColor"/>
                </svg>
                <p class="empty-state__text">Nenhuma transação encontrada.</p>
                <p class="empty-state__subtext">${transactions.length === 0 ? 'Adicione sua primeira transação acima!' : 'Tente ajustar os filtros.'}</p>
            </div>
        `;
        return;
    }

    // Render transactions
    filtered.forEach(transaction => {
        const item = createTransactionElement(transaction);
        container.appendChild(item);
    });
}

// ===== CREATE TRANSACTION ELEMENT =====
function createTransactionElement(transaction) {
    const div = document.createElement('div');
    div.className = `transaction-item transaction-item--${transaction.type}`;
    
    const formattedDate = formatDate(transaction.date);
    const formattedAmount = privacyMode ? '••••••' : formatCurrency(transaction.amount);
    const amountClass = transaction.type === 'income' ? 'transaction-item__amount--income' : 'transaction-item__amount--expense';
    const sign = transaction.type === 'income' ? '+' : '-';

    div.innerHTML = `
        <div class="transaction-item__content">
            <div class="transaction-item__description">${escapeHtml(transaction.description)}</div>
            <div class="transaction-item__meta">
                <span class="transaction-item__category">${escapeHtml(transaction.category)}</span>
                <span>${formattedDate}</span>
            </div>
        </div>
        <div class="transaction-item__amount ${amountClass}">
            ${privacyMode ? '•••' : sign} ${formattedAmount}
        </div>
        <div class="transaction-item__actions">
            <button class="btn--icon btn--icon--edit" onclick="editTransaction('${transaction.id}')" title="Editar">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.12 5.13L18.87 8.88L20.71 7.04Z" fill="currentColor"/>
                </svg>
            </button>
            <button class="btn--icon btn--icon--delete" onclick="deleteTransaction('${transaction.id}')" title="Excluir">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" fill="currentColor"/>
                </svg>
            </button>
        </div>
    `;

    return div;
}

// ===== CLEAR FILTERS =====
function clearFilters() {
    filters = {
        type: 'all',
        category: 'all',
        search: ''
    };
    
    document.getElementById('filter-type').value = 'all';
    document.getElementById('filter-category').value = 'all';
    document.getElementById('search').value = '';
    
    renderTransactions();
}

// ===== FORMAT CURRENCY =====
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

// ===== FORMAT DATE =====
function formatDate(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(date);
}

// ===== ESCAPE HTML =====
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Make functions available globally for onclick handlers
window.editTransaction = editTransaction;
window.deleteTransaction = deleteTransaction;

// ===== EXCHANGE RATES =====
const currencies = [
    { code: 'USD', name: 'Dólar Americano', flag: '🇺🇸', isCrypto: false },
    { code: 'BTC', name: 'Bitcoin', flag: '₿', isCrypto: true }
];

let exchangeRates = {};

// Fetch exchange rates
async function fetchExchangeRates() {
    const container = document.getElementById('exchange-rates-container');
    container.innerHTML = `
        <div class="exchange-rates__loading">
            <div class="loading-spinner"></div>
            <p>Carregando cotações...</p>
        </div>
    `;

    try {
        // Using ExchangeRate-API (free tier) for regular currencies
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/BRL');
        
        if (!response.ok) {
            throw new Error('Erro ao buscar cotações');
        }
        
        const data = await response.json();
        exchangeRates = data.rates || {};
        
        // Fetch Bitcoin separately using CoinGecko API (more reliable)
        try {
            const btcResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=brl');
            if (btcResponse.ok) {
                const btcData = await btcResponse.json();
                if (btcData.bitcoin && btcData.bitcoin.brl) {
                    const btcPriceBRL = btcData.bitcoin.brl;
                    // Store as BRL per BTC, we'll invert when displaying
                    exchangeRates['BTC'] = btcPriceBRL;
                }
            }
        } catch (btcError) {
            console.log('Erro ao buscar cotação do Bitcoin:', btcError);
            // Try alternative API
            try {
                const altBtcResponse = await fetch('https://api.coindesk.com/v1/bpi/currentprice/BRL.json');
                if (altBtcResponse.ok) {
                    const altBtcData = await altBtcResponse.json();
                    if (altBtcData.bpi && altBtcData.bpi.BRL && altBtcData.bpi.BRL.rate_float) {
                        exchangeRates['BTC'] = altBtcData.bpi.BRL.rate_float;
                    }
                }
            } catch (altError) {
                console.log('Erro ao buscar cotação do Bitcoin (API alternativa):', altError);
            }
        }
        
        // Verify ARS is in the response, if not try alternative
        if (!exchangeRates['ARS']) {
            try {
                const arsResponse = await fetch('https://api.exchangerate-api.com/v4/latest/ARS');
                if (arsResponse.ok) {
                    const arsData = await arsResponse.json();
                    if (arsData.rates && arsData.rates.BRL) {
                        // Convert ARS to BRL rate
                        exchangeRates['ARS'] = 1 / arsData.rates.BRL;
                    }
                }
            } catch (arsError) {
                console.log('Erro ao buscar cotação do Peso Argentino:', arsError);
            }
        }
        
        renderExchangeRates();
    } catch (error) {
        console.error('Erro ao buscar cotações:', error);
        container.innerHTML = `
            <div class="exchange-rates__error">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 48px; height: 48px; color: var(--danger-color); margin-bottom: 1rem;">
                    <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor"/>
                </svg>
                <p>Erro ao carregar cotações</p>
                <p class="exchange-rates__error-subtext">Verifique sua conexão e tente novamente</p>
                <button class="btn btn--primary btn--small" onclick="fetchExchangeRates()">Tentar Novamente</button>
            </div>
        `;
    }
}

function renderExchangeRates() {
    const container = document.getElementById('exchange-rates-container');
    
    if (Object.keys(exchangeRates).length === 0) {
        container.innerHTML = `
            <div class="exchange-rates__error">
                <p>Nenhuma cotação disponível</p>
            </div>
        `;
        return;
    }

    const ratesHTML = currencies.map(currency => {
        let rate = null;
        let displayRate = 'N/A';
        
        if (currency.code === 'BTC') {
            // Bitcoin: rate is already BRL per BTC, so we display it directly
            rate = exchangeRates['BTC'];
            if (rate) {
                displayRate = formatCurrency(rate);
            }
        } else {
            // Regular currencies: rate is currency per BRL, so we invert
            rate = exchangeRates[currency.code];
            if (rate && rate > 0) {
                // Invert because we want BRL per currency unit
                displayRate = formatCurrency(1 / rate);
            }
        }

        const change = rate ? calculateChange(currency.code, rate) : null;
        const changeClass = change && change > 0 ? 'positive' : change && change < 0 ? 'negative' : '';

        const cardClass = currency.code === 'BTC' ? 'exchange-rate-card--bitcoin' : 
                         currency.code === 'USD' ? 'exchange-rate-card--dollar' : '';
        
        return `
            <div class="exchange-rate-card ${cardClass}">
                <div class="exchange-rate-card__header">
                    <div class="exchange-rate-card__flag">${currency.flag}</div>
                    <div class="exchange-rate-card__info">
                        <h3 class="exchange-rate-card__code">${currency.code}</h3>
                        <p class="exchange-rate-card__name">${currency.name}</p>
                    </div>
                </div>
                <div class="exchange-rate-card__rate">
                    <span class="exchange-rate-card__value">${displayRate}</span>
                    ${change ? `
                        <span class="exchange-rate-card__change ${changeClass}">
                            ${change > 0 ? '↑' : '↓'} ${Math.abs(change).toFixed(2)}%
                        </span>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = ratesHTML;
}

function calculateChange(code, currentRate) {
    // This is a simplified version - in a real app, you'd store previous rates
    // For now, we'll just return null or simulate a small random change
    return null; // Could implement historical tracking here
}

// Initialize exchange rates on page load
document.addEventListener('DOMContentLoaded', () => {
    // Add refresh button listener
    const refreshBtn = document.getElementById('refresh-rates');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', fetchExchangeRates);
    }
    
    // Load rates after a short delay
    setTimeout(fetchExchangeRates, 500);
    
    // Auto-refresh every 5 minutes
    setInterval(fetchExchangeRates, 5 * 60 * 1000);
});
