# Controler - Versão React

O site foi refeito em **React** com **Vite**. Todas as funcionalidades do app original foram mantidas.

## Como rodar

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173` no navegador.

## Build para produção

```bash
npm run build
npm run preview   # visualizar o build
```

## Estrutura do projeto React

- **src/main.jsx** – entrada da aplicação
- **src/App.jsx** – componente principal com estado e lógica
- **src/App.css** – estilos (portados do `styles.css` original)
- **src/constants.js** – categorias, tipos, opções de filtro
- **src/utils.js** – `formatCurrency`, `formatDate`, `getDefaultDate`
- **src/hooks/useLocalStorage.js** – persistência em localStorage
- **src/components/** – Header, Summary, TransactionForm, Filters, TransactionList, TransactionItem, AddBalanceModal, EditModal, ExchangeRates

## Versão original (HTML + JS)

A versão anterior (HTML + JavaScript puro) foi salva em:

- **index-vanilla.html** – página original
- **script.js** – lógica original
- **styles.css** – estilos originais (copiados também para `src/App.css`)

Para usar a versão antiga, abra `index-vanilla.html` no navegador (sem rodar o React).
