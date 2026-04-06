import { useEffect, useMemo, useState } from 'react';

import { useStore } from '@nanostores/react';

import usersData from '../../data/users.json';
import { activeRewards, setActiveRewards } from '../../stores';
import type { Reward, User } from '../../types';
import WhatsAppPanel from '../WhatsAppPanel';

interface RewardFormState {
  name: string;
  tikiCost: string;
  description: string;
  expiresAt: string;
}

const users = usersData as User[];

function formatExpiry(expiresAt: string | null): string {
  if (!expiresAt) {
    return 'Sin vencimiento';
  }

  return new Date(expiresAt).toLocaleDateString('es-SV');
}

function getStoredUserBalance(user: User): number {
  if (typeof window === 'undefined') {
    return user.tikiBalance;
  }

  const stored = window.localStorage.getItem(`aloha_user_${user.id}_balance`);
  return stored ? Number(stored) : user.tikiBalance;
}

const emptyForm: RewardFormState = {
  name: '',
  tikiCost: '',
  description: '',
  expiresAt: ''
};

export default function AdminDashboard() {
  const rewards = useStore(activeRewards);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editRewardId, setEditRewardId] = useState<string | null>(null);
  const [rewardForm, setRewardForm] = useState<RewardFormState>(emptyForm);
  const [issuedTikis, setIssuedTikis] = useState(
    users.reduce((total, user) => total + user.tikiBalance, 0)
  );
  const [adminMessage, setAdminMessage] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    setIssuedTikis(users.reduce((total, user) => total + getStoredUserBalance(user), 0));
  }, []);

  const activeRewardCount = useMemo(() => {
    return rewards.filter((reward) => reward.isActive).length;
  }, [rewards]);

  const openCreateModal = () => {
    setEditRewardId(null);
    setRewardForm(emptyForm);
    setIsCreateOpen(true);
  };

  const startEdit = (reward: Reward) => {
    setEditRewardId(reward.id);
    setRewardForm({
      name: reward.name,
      tikiCost: String(reward.tikiCost),
      description: reward.description,
      expiresAt: reward.expiresAt ? reward.expiresAt.slice(0, 10) : ''
    });
  };

  const saveEdit = (rewardId: string) => {
    const nextRewards = rewards.map((reward) =>
      reward.id === rewardId
        ? {
            ...reward,
            name: rewardForm.name.trim(),
            tikiCost: Number(rewardForm.tikiCost),
            description: rewardForm.description.trim(),
            expiresAt: rewardForm.expiresAt ? new Date(rewardForm.expiresAt).toISOString() : null
          }
        : reward
    );

    setActiveRewards(nextRewards);
    setEditRewardId(null);
    setRewardForm(emptyForm);
    setAdminMessage(`El plan ${rewardForm.name.trim()} fue actualizado exitosamente. — Sistema Aloha Loyalty`);
  };

  const createReward = () => {
    const nextReward: Reward = {
      id: `r-${Date.now()}`,
      name: rewardForm.name.trim(),
      tikiCost: Number(rewardForm.tikiCost),
      description: rewardForm.description.trim(),
      expiresAt: rewardForm.expiresAt ? new Date(rewardForm.expiresAt).toISOString() : null,
      isActive: true
    };

    setActiveRewards([nextReward, ...rewards]);
    setIsCreateOpen(false);
    setRewardForm(emptyForm);
    setAdminMessage(`El plan ${nextReward.name} fue creado exitosamente. — Sistema Aloha Loyalty`);
  };

  const toggleReward = (rewardId: string) => {
    const targetReward = rewards.find((reward) => reward.id === rewardId);
    const nextRewards = rewards.map((reward) =>
      reward.id === rewardId ? { ...reward, isActive: !reward.isActive } : reward
    );

    setActiveRewards(nextRewards);
    if (targetReward) {
      setAdminMessage(
        `El plan ${targetReward.name} fue ${targetReward.isActive ? 'desactivado' : 'activado'} exitosamente. — Sistema Aloha Loyalty`
      );
    }
  };

  return (
    <>
      <section className="space-y-8">
        <div className="grid gap-5 md:grid-cols-2">
          {[
            { label: 'Tikis Emitidos', value: issuedTikis },
            { label: 'Recompensas Activas', value: activeRewardCount },
            { label: 'Usuarios Registrados', value: users.length },
            { label: 'Total Canjes', value: 47 }
          ].map((stat) => (
            <article
              key={stat.label}
              className="rounded-[1.75rem] border border-brand/10 bg-white p-6 shadow-xl shadow-brand/5"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-text-muted">{stat.label}</p>
              <p className="mt-4 text-4xl font-black text-slate-950">{stat.value}</p>
            </article>
          ))}
        </div>

        <section className="rounded-[1.75rem] border border-brand/10 bg-white p-6 shadow-xl shadow-brand/5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-text-muted">Planes activos</p>
              <h2 className="mt-2 text-3xl font-black text-slate-950">Recompensas y canjes</h2>
            </div>
            <button
              className="rounded-full bg-cta px-5 py-3 text-sm font-bold text-white shadow-lg shadow-cta/20 transition hover:bg-deep-cta"
              onClick={openCreateModal}
              type="button"
            >
              Crear Plan
            </button>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-text-muted">
                  <th className="px-3 py-3 font-semibold">Nombre</th>
                  <th className="px-3 py-3 font-semibold">Costo en Tikis</th>
                  <th className="px-3 py-3 font-semibold">Estado</th>
                  <th className="px-3 py-3 font-semibold">Vencimiento</th>
                  <th className="px-3 py-3 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rewards.map((reward) => {
                  const isEditing = editRewardId === reward.id;

                  return (
                    <tr key={reward.id} className="border-b border-slate-100 align-top">
                      <td className="px-3 py-4">
                        {isEditing ? (
                          <div className="space-y-2">
                            <input
                              className="w-full rounded-xl border border-slate-200 px-3 py-2"
                              onChange={(event) =>
                                setRewardForm((current) => ({ ...current, name: event.target.value }))
                              }
                              value={rewardForm.name}
                            />
                            <textarea
                              className="w-full rounded-xl border border-slate-200 px-3 py-2"
                              onChange={(event) =>
                                setRewardForm((current) => ({ ...current, description: event.target.value }))
                              }
                              rows={3}
                              value={rewardForm.description}
                            />
                          </div>
                        ) : (
                          <div>
                            <p className="font-bold text-slate-950">{reward.name}</p>
                            <p className="mt-1 text-text-muted">{reward.description}</p>
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-4">
                        {isEditing ? (
                          <input
                            className="w-28 rounded-xl border border-slate-200 px-3 py-2"
                            min="0"
                            onChange={(event) =>
                              setRewardForm((current) => ({ ...current, tikiCost: event.target.value }))
                            }
                            type="number"
                            value={rewardForm.tikiCost}
                          />
                        ) : (
                          `${reward.tikiCost} Tikis`
                        )}
                      </td>
                      <td className="px-3 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            reward.isActive ? 'bg-highlight text-slate-900' : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {reward.isActive ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        {isEditing ? (
                          <input
                            className="rounded-xl border border-slate-200 px-3 py-2"
                            onChange={(event) =>
                              setRewardForm((current) => ({ ...current, expiresAt: event.target.value }))
                            }
                            type="date"
                            value={rewardForm.expiresAt}
                          />
                        ) : (
                          formatExpiry(reward.expiresAt)
                        )}
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex flex-wrap gap-2">
                          {isEditing ? (
                            <>
                              <button
                                className="rounded-full border border-brand px-3 py-2 font-bold text-brand transition hover:bg-brand hover:text-white"
                                onClick={() => saveEdit(reward.id)}
                                type="button"
                              >
                                Guardar
                              </button>
                              <button
                                className="rounded-full px-3 py-2 font-bold text-text-muted transition hover:text-slate-900"
                                onClick={() => {
                                  setEditRewardId(null);
                                  setRewardForm(emptyForm);
                                }}
                                type="button"
                              >
                                Cancelar
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="rounded-full border border-brand px-3 py-2 font-bold text-brand transition hover:bg-brand hover:text-white"
                                onClick={() => startEdit(reward)}
                                type="button"
                              >
                                Editar
                              </button>
                              <button
                                className="rounded-full px-3 py-2 font-bold text-deep-cta transition hover:text-brand"
                                onClick={() => toggleReward(reward.id)}
                                type="button"
                              >
                                {reward.isActive ? 'Desactivar' : 'Activar'}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </section>

      {isCreateOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[2rem] bg-white p-6 shadow-2xl shadow-brand/20">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-text-muted">Nuevo plan</p>
            <h3 className="mt-2 text-3xl font-black text-slate-950">Crear recompensa</h3>

            <div className="mt-6 space-y-4">
              <input
                className="w-full rounded-2xl border border-slate-200 px-4 py-3"
                onChange={(event) => setRewardForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Nombre"
                value={rewardForm.name}
              />
              <input
                className="w-full rounded-2xl border border-slate-200 px-4 py-3"
                min="0"
                onChange={(event) => setRewardForm((current) => ({ ...current, tikiCost: event.target.value }))}
                placeholder="Costo en Tikis"
                type="number"
                value={rewardForm.tikiCost}
              />
              <textarea
                className="w-full rounded-2xl border border-slate-200 px-4 py-3"
                onChange={(event) =>
                  setRewardForm((current) => ({ ...current, description: event.target.value }))
                }
                placeholder="Descripción"
                rows={4}
                value={rewardForm.description}
              />
              <input
                className="w-full rounded-2xl border border-slate-200 px-4 py-3"
                onChange={(event) => setRewardForm((current) => ({ ...current, expiresAt: event.target.value }))}
                type="date"
                value={rewardForm.expiresAt}
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                className="px-4 py-2 font-bold text-text-muted transition hover:text-slate-900"
                onClick={() => {
                  setIsCreateOpen(false);
                  setRewardForm(emptyForm);
                }}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="rounded-full bg-cta px-5 py-3 font-bold text-white transition hover:bg-deep-cta"
                onClick={createReward}
                type="button"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {adminMessage ? (
        <WhatsAppPanel
          onDismiss={() => setAdminMessage('')}
          customerName=""
          storeName="Administrador Aloha"
          storePhone="+503 7000-0101"
          tikiEarned={0}
          transactionId="ADMIN-ACTION"
        />
      ) : null}
    </>
  );
}
