import {
  useEffect,
  useState,
  type FormEventHandler,
  type MouseEvent as ReactMouseEvent
} from 'react';

import usersData from '../data/users.json';
import { setTikiBalance, setUserSession } from '../stores';
import type { User } from '../types';

type Tab = 'login' | 'register';

interface LoginState {
  username: string;
  password: string;
}

interface RegisterState {
  name: string;
  username: string;
  password: string;
  confirmPassword: string;
}

interface AuthModalProps {
  defaultTab?: 'login' | 'register';
}

const knownUsers = usersData as User[];

const sessionKey = 'aloha_session';
const authChangedEvent = 'aloha:auth-changed';
const openAuthEvent = 'aloha:open-auth';

function getStoredBalance(userId: string, fallbackBalance: number): number {
  if (typeof window === 'undefined') {
    return fallbackBalance;
  }

  const storedBalance = window.localStorage.getItem(`aloha_user_${userId}_balance`);
  return storedBalance ? Number(storedBalance) : fallbackBalance;
}

function buildMockUser(username: string, name?: string): User {
  const userId = `u-${username.toLowerCase().replace(/\s+/g, '-')}`;

  return {
    id: userId,
    username,
    name: name?.trim() || username,
    role: username === 'admin' ? 'admin' : 'customer',
    tikiBalance: getStoredBalance(userId, 0),
    tierId: username === 'admin' ? null : 'rise',
    createdAt: new Date().toISOString()
  };
}

function hydrateUserBalance(user: User): User {
  return {
    ...user,
    tikiBalance: getStoredBalance(user.id, user.tikiBalance)
  };
}

function redirectForUser(user: User): void {
  window.location.href = user.role === 'admin' ? '/admin' : '/dashboard';
}

export default function AuthModal({ defaultTab = 'login' }: AuthModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>(defaultTab);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loginForm, setLoginForm] = useState<LoginState>({ username: '', password: '' });
  const [registerForm, setRegisterForm] = useState<RegisterState>({
    name: '',
    username: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const openModal = (event?: Event) => {
      const requestedTab = (event as CustomEvent<{ defaultTab?: Tab }> | undefined)?.detail?.defaultTab;

      setActiveTab(requestedTab ?? defaultTab);
      setErrorMessage('');
      setIsOpen(true);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener(openAuthEvent, openModal);
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener(openAuthEvent, openModal);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const closeModal = () => {
    setIsOpen(false);
    setErrorMessage('');
  };

  const persistSession = (user: User) => {
    setUserSession(user);
    setTikiBalance(user.tikiBalance);
    window.localStorage.setItem(sessionKey, JSON.stringify(user));
    window.localStorage.setItem('aloha_tikis', JSON.stringify(user.tikiBalance));
    window.dispatchEvent(new CustomEvent(authChangedEvent));
  };

  const handleLogin: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    const username = loginForm.username.trim();
    const password = loginForm.password.trim();

    if (!username || !password) {
      setErrorMessage('Ingresá usuario y contraseña para continuar.');
      return;
    }

    const existingUser = knownUsers.find((user) => user.username.toLowerCase() === username.toLowerCase());
    const nextUser = existingUser ? hydrateUserBalance(existingUser) : buildMockUser(username);

    persistSession(nextUser);
    closeModal();
    redirectForUser(nextUser);
  };

  const handleRegister: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    const name = registerForm.name.trim();
    const username = registerForm.username.trim();
    const password = registerForm.password.trim();
    const confirmPassword = registerForm.confirmPassword.trim();

    if (!name || !username || !password || !confirmPassword) {
      setErrorMessage('Completá todos los campos para crear tu cuenta.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    const existingUser = knownUsers.find((user) => user.username.toLowerCase() === username.toLowerCase());
    const nextUser = existingUser ? hydrateUserBalance(existingUser) : buildMockUser(username, name);

    persistSession(nextUser);
    closeModal();
    redirectForUser(nextUser);
  };

  const handleBackdropClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      closeModal();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-10 backdrop-blur-md"
      onClick={handleBackdropClick}
      role="dialog"
    >
      <div className="w-full max-w-md rounded-[2rem] border border-white/50 bg-white p-6 shadow-2xl shadow-brand/15">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-text-muted">Acceso Aloha</p>
            <h2 className="mt-2 text-3xl font-black text-slate-950">
              {activeTab === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
            </h2>
          </div>
          <button
            aria-label="Cerrar modal"
            className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-xl font-bold text-slate-700 transition hover:bg-slate-200"
            onClick={closeModal}
            type="button"
          >
            ×
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 rounded-full bg-slate-100 p-1">
          <button
            className={`rounded-full px-4 py-2 text-sm font-bold transition ${
              activeTab === 'login' ? 'bg-brand text-white shadow-md' : 'text-slate-600'
            }`}
            onClick={() => {
              setActiveTab('login');
              setErrorMessage('');
            }}
            type="button"
          >
            Iniciar Sesión
          </button>
          <button
            className={`rounded-full px-4 py-2 text-sm font-bold transition ${
              activeTab === 'register' ? 'bg-brand text-white shadow-md' : 'text-slate-600'
            }`}
            onClick={() => {
              setActiveTab('register');
              setErrorMessage('');
            }}
            type="button"
          >
            Registrarse
          </button>
        </div>

        {errorMessage ? (
          <p className="mt-4 rounded-2xl border border-deep-cta/20 bg-deep-cta/8 px-4 py-3 text-sm font-medium text-deep-cta">
            {errorMessage}
          </p>
        ) : null}

        {activeTab === 'login' ? (
          <form className="mt-6 space-y-4" onSubmit={handleLogin}>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-700">Usuario</span>
              <input
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
                onChange={(event) => setLoginForm((current) => ({ ...current, username: event.target.value }))}
                placeholder="Ingresá tu usuario"
                type="text"
                value={loginForm.username}
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-700">Contraseña</span>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/10">
                <input
                  className="w-full border-none bg-transparent py-1 outline-none"
                  onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
                  placeholder="Ingresá tu contraseña"
                  type={showLoginPassword ? 'text' : 'password'}
                  value={loginForm.password}
                />
                <button
                  className="text-sm font-semibold text-brand"
                  onClick={() => setShowLoginPassword((current) => !current)}
                  type="button"
                >
                  {showLoginPassword ? 'Ocultar' : 'Ver'}
                </button>
              </div>
            </label>

            <button
              className="w-full rounded-full bg-cta px-5 py-3.5 text-base font-bold text-white shadow-xl shadow-cta/25 transition hover:bg-deep-cta"
              type="submit"
            >
              Entrar
            </button>

            <button
              className="text-sm font-semibold text-brand underline-offset-4 hover:underline"
              onClick={() => {
                setActiveTab('register');
                setErrorMessage('');
              }}
              type="button"
            >
              ¿No tenés cuenta? Registrate
            </button>

            <p className="text-sm text-text-muted">Demo: usá cualquier usuario y contraseña</p>
            <p className="text-xs text-text-muted">Admin: admin / admin123</p>
          </form>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={handleRegister}>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-700">Nombre completo</span>
              <input
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
                onChange={(event) => setRegisterForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Tu nombre"
                type="text"
                value={registerForm.name}
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-700">Usuario</span>
              <input
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
                onChange={(event) => setRegisterForm((current) => ({ ...current, username: event.target.value }))}
                placeholder="Elegí un usuario"
                type="text"
                value={registerForm.username}
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-700">Contraseña</span>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/10">
                <input
                  className="w-full border-none bg-transparent py-1 outline-none"
                  onChange={(event) => setRegisterForm((current) => ({ ...current, password: event.target.value }))}
                  placeholder="Creá una contraseña"
                  type={showRegisterPassword ? 'text' : 'password'}
                  value={registerForm.password}
                />
                <button
                  className="text-sm font-semibold text-brand"
                  onClick={() => setShowRegisterPassword((current) => !current)}
                  type="button"
                >
                  {showRegisterPassword ? 'Ocultar' : 'Ver'}
                </button>
              </div>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-700">Confirmar contraseña</span>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/10">
                <input
                  className="w-full border-none bg-transparent py-1 outline-none"
                  onChange={(event) =>
                    setRegisterForm((current) => ({ ...current, confirmPassword: event.target.value }))
                  }
                  placeholder="Repetí tu contraseña"
                  type={showRegisterConfirmPassword ? 'text' : 'password'}
                  value={registerForm.confirmPassword}
                />
                <button
                  className="text-sm font-semibold text-brand"
                  onClick={() => setShowRegisterConfirmPassword((current) => !current)}
                  type="button"
                >
                  {showRegisterConfirmPassword ? 'Ocultar' : 'Ver'}
                </button>
              </div>
            </label>

            <button
              className="w-full rounded-full bg-cta px-5 py-3.5 text-base font-bold text-white shadow-xl shadow-cta/25 transition hover:bg-deep-cta"
              type="submit"
            >
              Crear Cuenta
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
