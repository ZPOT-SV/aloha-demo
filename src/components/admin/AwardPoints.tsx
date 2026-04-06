import { useMemo, useState } from 'react';

import usersData from '../../data/users.json';
import type { User } from '../../types';
import WhatsAppPanel from '../WhatsAppPanel';

const customers = (usersData as User[]).filter((user) => user.role === 'customer');

function getStoredBalance(user: User): number {
  if (typeof window === 'undefined') {
    return user.tikiBalance;
  }

  const stored = window.localStorage.getItem(`aloha_user_${user.id}_balance`);
  return stored ? Number(stored) : user.tikiBalance;
}

function getTierBadge(balance: number): string {
  if (balance >= 150) {
    return '🏄 Aloha';
  }

  if (balance >= 50) {
    return '🌊 Vibe';
  }

  return '🌺 Rise';
}

export default function AwardPoints() {
  const [query, setQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [toast, setToast] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [lastAward, setLastAward] = useState<{ amount: number; reason: string } | null>(null);

  const filteredUsers = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return customers;
    }

    return customers.filter((user) => {
      return (
        user.name.toLowerCase().includes(normalized) ||
        user.username.toLowerCase().includes(normalized)
      );
    });
  }, [query]);

  const selectUser = (user: User) => {
    setSelectedUser(user);
    setQuery(user.name);
    setCurrentBalance(getStoredBalance(user));
  };

  const confirmAward = () => {
    if (!selectedUser || !amount.trim()) {
      return;
    }

    const awarded = Number(amount);
    const nextBalance = currentBalance + awarded;

    window.localStorage.setItem(`aloha_user_${selectedUser.id}_balance`, String(nextBalance));
    setCurrentBalance(nextBalance);
    setLastAward({
      amount: awarded,
      reason: reason.trim() || 'Sin motivo'
    });
    setShowMessage(true);
    setToast(true);
    setAmount('');
    setReason('');

    window.setTimeout(() => {
      setToast(false);
    }, 3000);
  };

  return (
    <>
      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[1.75rem] border border-brand/10 bg-white p-6 shadow-xl shadow-brand/5">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-text-muted">Paso 1</p>
          <h2 className="mt-2 text-3xl font-black text-slate-950">Buscar usuario</h2>

          <input
            className="mt-6 w-full rounded-2xl border border-slate-200 px-4 py-3"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscá por nombre o usuario"
            value={query}
          />

          <div className="mt-5 max-h-80 space-y-3 overflow-auto">
            {filteredUsers.map((user) => (
              <button
                key={user.id}
                className={`w-full rounded-[1.5rem] border p-4 text-left transition ${
                  selectedUser?.id === user.id
                    ? 'border-brand bg-brand/5 shadow-md'
                    : 'border-brand/10 bg-slate-50 hover:border-brand/30'
                }`}
                onClick={() => selectUser(user)}
                type="button"
              >
                <p className="font-black text-slate-950">{user.name}</p>
                <p className="mt-1 text-sm text-text-muted">@{user.username}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-brand/10 bg-white p-6 shadow-xl shadow-brand/5">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-text-muted">Paso 2</p>
          <h2 className="mt-2 text-3xl font-black text-slate-950">Otorgar Tikis</h2>

          {selectedUser ? (
            <>
              <div className="mt-6 rounded-[1.5rem] bg-surface p-5">
                <p className="text-xl font-black text-slate-950">{selectedUser.name}</p>
                <p className="mt-2 text-sm text-text-muted">Saldo actual: {currentBalance} Tikis</p>
                <p className="mt-3 inline-flex rounded-full bg-brand px-3 py-1 text-sm font-bold text-white">
                  {getTierBadge(currentBalance)}
                </p>
              </div>

              <div className="mt-6 space-y-4">
                <input
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3"
                  min="1"
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="Cantidad de Tiki Points"
                  type="number"
                  value={amount}
                />
                <input
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3"
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Motivo (opcional)"
                  value={reason}
                />
                <button
                  className="rounded-full bg-cta px-5 py-3 font-bold text-white transition hover:bg-deep-cta"
                  onClick={confirmAward}
                  type="button"
                >
                  Otorgar Tikis
                </button>
              </div>
            </>
          ) : (
            <div className="mt-6 rounded-[1.5rem] border border-dashed border-brand/20 bg-surface p-6 text-text-muted">
              Seleccioná primero un usuario para continuar.
            </div>
          )}
        </div>
      </section>

      {showMessage && selectedUser ? (
        <WhatsAppPanel
          onDismiss={() => setShowMessage(false)}
          customerName=""
          storeName="Administrador Aloha"
          storePhone="+503 7000-0101"
          tikiEarned={lastAward?.amount ?? 0}
          transactionId={`AWARD-${selectedUser.id}`}
        />
      ) : null}

      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-[1.25rem] bg-slate-950 px-5 py-4 text-sm font-bold text-white shadow-2xl">
          ✓ Tikis otorgados correctamente
        </div>
      ) : null}
    </>
  );
}
