import React from 'react';

export function Header({ onResetAll, onTogglePrivacy, privacyMode }) {
  return (
    <header className="header">
      <h1 className="header__title">
        Controler
        <svg className="icon icon--logo" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor" />
        </svg>
      </h1>
      <div className="header__actions">
        <button
          type="button"
          className="btn btn--secondary btn--small"
          onClick={onResetAll}
          title="Apagar todas as transações e zerar saldo"
        >
          Resetar tudo
        </button>
        <button
          type="button"
          className={`privacy-toggle ${privacyMode ? 'privacy-toggle--active' : ''}`}
          onClick={onTogglePrivacy}
          title="Ocultar/Mostrar valores"
        >
          <svg
            className="privacy-toggle__icon privacy-toggle__icon--visible"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ display: privacyMode ? 'none' : 'block' }}
          >
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z" fill="currentColor" />
          </svg>
          <svg
            className="privacy-toggle__icon privacy-toggle__icon--hidden"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ display: privacyMode ? 'block' : 'none' }}
          >
            <path d="M12 7C14.76 7 17 9.24 17 12C17 12.65 16.87 13.26 16.64 13.82L19.56 16.74C21.07 15.49 22.26 13.86 23 12C21.27 7.61 17 4.5 12 4.5C10.6 4.5 9.26 4.75 8 5.2L10.17 7.37C10.74 7.13 11.35 7 12 7ZM2 4.27L4.28 6.55L4.73 7C3.08 8.3 1.78 10.02 1 12C2.73 16.39 7 19.5 12 19.5C13.55 19.5 15.03 19.2 16.38 18.66L16.8 19.08L19.73 22L21 20.73L3.27 3L2 4.27ZM7.53 9.8L9.08 11.35C9.03 11.56 9 11.78 9 12C9 13.66 10.34 15 12 15C12.22 15 12.44 14.97 12.65 14.92L14.2 16.47C13.53 16.8 12.79 17 12 17C9.24 17 7 14.76 7 12C7 11.21 7.2 10.47 7.53 9.8ZM11.84 9.02L14.99 12.17L15.01 12.01C15.01 10.35 13.67 9.01 12.01 9.01L11.84 9.02Z" fill="currentColor" />
          </svg>
          <span className="privacy-toggle__text">{privacyMode ? 'Mostrar Valores' : 'Ocultar Valores'}</span>
        </button>
      </div>
    </header>
  );
}
