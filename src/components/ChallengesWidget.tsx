import { useMemo } from 'react';

import { useStore } from '@nanostores/react';

import { challenges } from '../stores';

export default function ChallengesWidget() {
  const challengeList = useStore(challenges);

  const activeChallenges = useMemo(() => {
    return challengeList.filter((challenge) => !challenge.isCompleted).slice(0, 2);
  }, [challengeList]);

  return (
    <section className="rounded-[2rem] border border-brand/10 bg-white/90 p-6 shadow-2xl shadow-brand/10">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-text-muted">Retos activos</p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">No dejés puntos sobre la mesa</h2>
        </div>
        <a className="text-sm font-bold text-brand transition hover:text-deep-cta" href="/retos">
          Ver todos los retos →
        </a>
      </div>

      <div className="mt-6 space-y-4">
        {activeChallenges.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-brand/20 bg-surface p-5 text-text-muted">
            Ya completaste los retos disponibles. Pronto habrá más desafíos.
          </div>
        ) : (
          activeChallenges.map((challenge) => {
            const progress = Math.min((challenge.currentCount / challenge.targetCount) * 100, 100);

            return (
              <article key={challenge.id} className="rounded-[1.5rem] border border-brand/10 bg-slate-50/90 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-950">{challenge.name}</h3>
                    <p className="mt-1 text-sm text-text-muted">
                      {challenge.currentCount} de {challenge.targetCount} completados
                    </p>
                  </div>
                  <span className="rounded-full bg-highlight px-3 py-1 text-sm font-bold text-slate-900">
                    +{challenge.bonusTiki} Tikis al completar
                  </span>
                </div>

                <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-brand to-cta transition-[width] duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
