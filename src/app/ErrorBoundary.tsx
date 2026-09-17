import { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorState } from '../ui/components/feedback/ErrorState';
import { logger } from '../infrastructure/logging/logger';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.error('Erro não capturado na árvore de componentes React', 'ErrorBoundary', {
      error: error.message,
      componentStack: errorInfo.componentStack,
    });
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  public override render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      return (
        <div id="error-boundary-fallback" className="p-8 max-w-2xl mx-auto">
          <ErrorState
            id="error-boundary-state"
            title="Ocorreu uma falha inesperada na aplicação"
            message={this.state.error.message || 'Erro interno não tratado.'}
            details={this.state.error.stack}
            onRetry={this.handleReset}
            retryLabel="Restaurar interface"
          />
        </div>
      );
    }

    return this.props.children;
  }
}
