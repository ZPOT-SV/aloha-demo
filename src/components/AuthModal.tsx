import {
  useEffect,
  useState,
  type FormEventHandler,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";

import usersData from "../data/users.json";
import { setTikiBalance, setUserSession } from "../stores";
import type { User } from "../types";

type Tab = "login" | "register";

interface LoginState {
  username: string;
  password: string;
}

interface RegisterState {
  name: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 4) return digits;
  return `${digits.slice(0, 4)}-${digits.slice(4)}`;
}

interface AuthModalProps {
  defaultTab?: "login" | "register";
}

const knownUsers = usersData as User[];

const sessionKey = "aloha_session";
const authChangedEvent = "aloha:auth-changed";
const openAuthEvent = "aloha:open-auth";

function getStoredBalance(userId: string, fallbackBalance: number): number {
  if (typeof window === "undefined") {
    return fallbackBalance;
  }

  const storedBalance = window.localStorage.getItem(
    `aloha_user_${userId}_balance`,
  );
  return storedBalance ? Number(storedBalance) : fallbackBalance;
}

function buildMockUser(username: string, name?: string): User {
  const userId = `u-${username.toLowerCase().replace(/\s+/g, "-")}`;

  return {
    id: userId,
    username,
    name: name?.trim() || username,
    role: username === "admin" ? "admin" : "customer",
    tikiBalance: getStoredBalance(userId, 0),
    tierId: username === "admin" ? null : "rise",
    createdAt: new Date().toISOString(),
  };
}

function hydrateUserBalance(user: User): User {
  return {
    ...user,
    tikiBalance: getStoredBalance(user.id, user.tikiBalance),
  };
}

function redirectForUser(user: User): void {
  window.location.href = user.role === "admin" ? "/admin" : "/dashboard";
}

function SocialButton({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:shadow"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

export default function AuthModal({ defaultTab = "login" }: AuthModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>(defaultTab);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loginForm, setLoginForm] = useState<LoginState>({
    username: "",
    password: "",
  });
  const [registerForm, setRegisterForm] = useState<RegisterState>({
    name: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const openModal = (event?: Event) => {
      const requestedTab = (
        event as CustomEvent<{ defaultTab?: Tab }> | undefined
      )?.detail?.defaultTab;

      setActiveTab(requestedTab ?? defaultTab);
      setErrorMessage("");
      setIsOpen(true);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setVisible(true)),
      );
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener(openAuthEvent, openModal);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener(openAuthEvent, openModal);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const closeModal = () => {
    setVisible(false);
    setTimeout(() => {
      setIsOpen(false);
      setErrorMessage("");
    }, 260);
  };

  const persistSession = (user: User) => {
    setUserSession(user);
    setTikiBalance(user.tikiBalance);
    window.localStorage.setItem(sessionKey, JSON.stringify(user));
    window.localStorage.setItem(
      "aloha_tikis",
      JSON.stringify(user.tikiBalance),
    );
    window.dispatchEvent(new CustomEvent(authChangedEvent));
  };

  const handleLogin: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    const username = loginForm.username.trim();
    const password = loginForm.password.trim();

    if (!username || !password) {
      setErrorMessage("Ingresá usuario y contraseña para continuar.");
      return;
    }

    const existingUser = knownUsers.find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
    const nextUser = existingUser
      ? hydrateUserBalance(existingUser)
      : buildMockUser(username);

    persistSession(nextUser);
    closeModal();
    redirectForUser(nextUser);
  };

  const handleRegister: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    const name = registerForm.name.trim();
    const phone = registerForm.phone.trim();
    const password = registerForm.password.trim();
    const confirmPassword = registerForm.confirmPassword.trim();

    if (!name || !phone || !password || !confirmPassword) {
      setErrorMessage("Completá todos los campos para crear tu cuenta.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden.");
      return;
    }

    if (phone.replace(/\D/g, "").length < 8) {
      setErrorMessage("Ingresá un número válido (ej: 1234-5678).");
      return;
    }

    const identifier = phone.replace("-", "");
    const nextUser = buildMockUser(identifier, name);

    persistSession(nextUser);
    closeModal();
    redirectForUser(nextUser);
  };

  const handleBackdropClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) closeModal();
  };

  const handleSocial = () => {
    const user = buildMockUser("social-user", "Usuario Social");
    persistSession(user);
    closeModal();
    redirectForUser(user);
  };

  if (!isOpen) return null;

  return (
    <div
      aria-modal="true"
      role="dialog"
      onClick={handleBackdropClick}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        background: visible ? "rgba(2,6,23,0.55)" : "transparent",
        backdropFilter: visible ? "blur(10px)" : "none",
        transition: "background 0.25s ease, backdrop-filter 0.25s ease",
      }}
    >
      <div
        style={{
          width: "440px",
          height: "580px",
          opacity: visible ? 1 : 0,
          transform: visible
            ? "translateY(0) scale(1)"
            : "translateY(24px) scale(0.95)",
          transition:
            "opacity 0.25s ease, transform 0.3s cubic-bezier(0.34,1.3,0.64,1)",
        }}
      >
        <div className="flex h-full flex-col rounded-[2rem] border border-slate-100 bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 px-7 pt-7 pb-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-text-muted">
                Acceso Aloha
              </p>
              <h2 className="mt-1 text-2xl font-black text-slate-950">
                {activeTab === "login"
                  ? "Bienvenido de vuelta"
                  : "Cre\u00e1 tu cuenta"}
              </h2>
            </div>
            <button
              aria-label="Cerrar"
              onClick={closeModal}
              type="button"
              className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="mx-7 grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => {
                setActiveTab("login");
                setErrorMessage("");
              }}
              className={`rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-200 ${
                activeTab === "login"
                  ? "bg-white text-brand shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("register");
                setErrorMessage("");
              }}
              className={`rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-200 ${
                activeTab === "register"
                  ? "bg-white text-brand shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Registrarse
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-7 pb-6 pt-4">
            {activeTab === "login" ? (
              <form className="space-y-3.5" onSubmit={handleLogin}>
                <label className="block space-y-1.5">
                  <span className="text-sm font-semibold text-slate-700">
                    Usuario
                  </span>
                  <input
                    autoComplete="username"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10"
                    onChange={(e) =>
                      setLoginForm((c) => ({ ...c, username: e.target.value }))
                    }
                    placeholder="Ingresá tu usuario"
                    type="text"
                    value={loginForm.username}
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="text-sm font-semibold text-slate-700">
                    Contraseña
                  </span>
                  <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-brand focus-within:bg-white focus-within:ring-4 focus-within:ring-brand/10">
                    <input
                      autoComplete="current-password"
                      className="w-full border-none bg-transparent text-sm outline-none"
                      onChange={(e) =>
                        setLoginForm((c) => ({
                          ...c,
                          password: e.target.value,
                        }))
                      }
                      placeholder="Contraseña"
                      type={showLoginPassword ? "text" : "password"}
                      value={loginForm.password}
                    />
                    <button
                      className="text-xs font-bold text-brand"
                      onClick={() => setShowLoginPassword((v) => !v)}
                      type="button"
                    >
                      {showLoginPassword ? "Ocultar" : "Ver"}
                    </button>
                  </div>
                </label>

                {errorMessage ? (
                  <p className="rounded-2xl border border-deep-cta/20 bg-deep-cta/8 px-4 py-3 text-sm font-medium text-deep-cta">
                    {errorMessage}
                  </p>
                ) : null}

                <button
                  className="w-full rounded-full bg-accent py-3.5 text-sm font-bold text-white shadow-lg shadow-accent/25 transition hover:brightness-105 active:scale-[0.98]"
                  type="submit"
                >
                  Entrar
                </button>

                <p className="text-center text-xs text-text-muted">
                  Demo: cualquier usuario ·{" "}
                  <span className="font-semibold">admin / admin123</span>
                </p>
              </form>
            ) : (
              <form className="space-y-3" onSubmit={handleRegister}>
                <label className="block space-y-1">
                  <span className="text-sm font-semibold text-slate-700">
                    Nombre completo
                  </span>
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10"
                    onChange={(e) =>
                      setRegisterForm((c) => ({ ...c, name: e.target.value }))
                    }
                    placeholder="Tu nombre"
                    type="text"
                    value={registerForm.name}
                  />
                </label>

                <label className="block space-y-1">
                  <span className="text-sm font-semibold text-slate-700">
                    Número de teléfono
                  </span>
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10"
                    inputMode="numeric"
                    onChange={(e) =>
                      setRegisterForm((c) => ({
                        ...c,
                        phone: formatPhone(e.target.value),
                      }))
                    }
                    placeholder="1234-5678"
                    type="tel"
                    value={registerForm.phone}
                  />
                </label>

                <label className="block space-y-1">
                  <span className="text-sm font-semibold text-slate-700">
                    Contraseña
                  </span>
                  <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 transition focus-within:border-brand focus-within:bg-white focus-within:ring-4 focus-within:ring-brand/10">
                    <input
                      className="w-full border-none bg-transparent text-sm outline-none"
                      onChange={(e) =>
                        setRegisterForm((c) => ({
                          ...c,
                          password: e.target.value,
                        }))
                      }
                      placeholder="Creá una contraseña"
                      type={showRegisterPassword ? "text" : "password"}
                      value={registerForm.password}
                    />
                    <button
                      className="text-xs font-bold text-brand"
                      onClick={() => setShowRegisterPassword((v) => !v)}
                      type="button"
                    >
                      {showRegisterPassword ? "Ocultar" : "Ver"}
                    </button>
                  </div>
                </label>

                <label className="block space-y-1">
                  <span className="text-sm font-semibold text-slate-700">
                    Confirmar contraseña
                  </span>
                  <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 transition focus-within:border-brand focus-within:bg-white focus-within:ring-4 focus-within:ring-brand/10">
                    <input
                      className="w-full border-none bg-transparent text-sm outline-none"
                      onChange={(e) =>
                        setRegisterForm((c) => ({
                          ...c,
                          confirmPassword: e.target.value,
                        }))
                      }
                      placeholder="Repetí tu contraseña"
                      type="password"
                      value={registerForm.confirmPassword}
                    />
                  </div>
                </label>

                {errorMessage ? (
                  <p className="rounded-2xl border border-deep-cta/20 bg-deep-cta/8 px-4 py-3 text-sm font-medium text-deep-cta">
                    {errorMessage}
                  </p>
                ) : null}

                <button
                  className="w-full rounded-full bg-brand py-3.5 text-sm font-bold text-white shadow-lg shadow-brand/25 transition hover:brightness-105 active:scale-[0.98]"
                  type="submit"
                >
                  Crear Cuenta
                </button>
              </form>
            )}

            {/* Divider */}
            <div className="mt-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs font-medium text-slate-400">
                o continúa con
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            {/* Social buttons */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <SocialButton
                label="Google"
                onClick={handleSocial}
                icon={
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                }
              />
              <SocialButton
                label="Facebook"
                onClick={handleSocial}
                icon={
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="#1877F2"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
