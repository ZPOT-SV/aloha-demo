import { useEffect, type MouseEvent as ReactMouseEvent } from 'react';

interface AuthPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

export default function AuthPromptModal({
  isOpen,
  onClose,
  onLoginClick,
  onRegisterClick
}: AuthPromptModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleBackdropClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
    >
      <div className="w-full max-w-md rounded-[2rem] border border-brand/10 bg-white p-6 text-center shadow-2xl shadow-brand/20">
        <div className="text-4xl">🔒</div>
        <h2 className="mt-4 text-3xl font-black text-slate-950">Iniciá sesión para comprar</h2>
        <p className="mt-3 text-sm leading-6 text-text-muted">
          Creá tu cuenta gratis y empezá a acumular Tiki Points con cada compra.
        </p>

        <div className="mt-6 space-y-3">
          <button
            className="w-full rounded-full bg-cta px-5 py-3 text-sm font-bold text-white shadow-lg shadow-cta/20 transition hover:bg-deep-cta"
            onClick={onLoginClick}
            type="button"
          >
            Iniciar Sesión
          </button>
          <button
            className="w-full rounded-full border border-brand px-5 py-3 text-sm font-bold text-brand transition hover:bg-brand hover:text-white"
            onClick={onRegisterClick}
            type="button"
          >
            Registrarse
          </button>
        </div>

        <button
          className="mt-5 text-sm font-semibold text-text-muted transition hover:text-brand"
          onClick={onClose}
          type="button"
        >
          Seguir navegando sin cuenta →
        </button>
      </div>
    </div>
  );
}
