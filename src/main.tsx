import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app/App';
import { ErrorBoundary } from './app/ErrorBoundary';
import { carregarCamadaPublicada } from './repositories/camada-publicada';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Elemento root (#root) não encontrado no documento.');
}

/**
 * O pacote editorial publicado entra ANTES da primeira tela (EE-21): toda
 * leitura de lição, artigo, livreto e livro o funde com o seed. Desenhar antes
 * mostraria o texto antigo e o trocaria por baixo do aluno um instante depois.
 * A busca tem prazo; sem resposta, a plataforma abre com o seed.
 */
carregarCamadaPublicada().finally(() => {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
});
