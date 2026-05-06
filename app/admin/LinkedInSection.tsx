"use client";

import { useRef, useState, useTransition } from "react";
import { upsertLinkedInCampaign } from "./actions";

interface Campaign {
  id: string;
  week_start: string;
  impressions: number;
  clicks: number;
  spend_euros: number;
  notes: string | null;
}

export default function LinkedInSection({ campaigns }: { campaigns: Campaign[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  // Default week_start: Monday of current week
  const defaultWeek = (() => {
    const d = new Date();
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return d.toISOString().slice(0, 10);
  })();

  const totalImpressions = campaigns.reduce((s, c) => s + c.impressions, 0);
  const totalClicks = campaigns.reduce((s, c) => s + c.clicks, 0);
  const totalSpend = campaigns.reduce((s, c) => s + Number(c.spend_euros), 0);
  const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : "—";
  const avgCpc = totalClicks > 0 ? (totalSpend / totalClicks).toFixed(2) : "—";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData(formRef.current!);
    startTransition(async () => {
      const res = await upsertLinkedInCampaign(fd);
      if ("error" in res) {
        setFeedback("Fout: " + res.error);
      } else {
        setFeedback("Opgeslagen!");
        formRef.current?.reset();
        setTimeout(() => setFeedback(null), 3000);
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      {campaigns.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: "Impressies", value: totalImpressions.toLocaleString("nl-NL") },
            { label: "Klikken", value: totalClicks.toLocaleString("nl-NL") },
            { label: "Besteed", value: `€${totalSpend.toFixed(2)}` },
            { label: "CTR", value: `${avgCtr}%` },
            { label: "CPC", value: `€${avgCpc}` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-3">
              <p className="text-xs text-neutral-500 mb-1">{label}</p>
              <p className="text-lg font-bold text-white">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Form */}
      <form ref={formRef} onSubmit={handleSubmit} className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-neutral-300 mb-4">Week invoeren / bijwerken</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs text-neutral-500 mb-1">Week (ma)</label>
            <input
              name="week_start"
              type="date"
              defaultValue={defaultWeek}
              required
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Impressies</label>
            <input
              name="impressions"
              type="number"
              min={0}
              defaultValue={0}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Klikken</label>
            <input
              name="clicks"
              type="number"
              min={0}
              defaultValue={0}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Spend (€)</label>
            <input
              name="spend_euros"
              type="number"
              min={0}
              step={0.01}
              defaultValue={0}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs text-neutral-500 mb-1">Notities</label>
            <input
              name="notes"
              type="text"
              placeholder="optioneel..."
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all"
            >
              {isPending ? "..." : "Opslaan"}
            </button>
          </div>
        </div>
        {feedback && (
          <p className={`mt-3 text-xs ${feedback.startsWith("Fout") ? "text-red-400" : "text-violet-300"}`}>
            {feedback}
          </p>
        )}
      </form>

      {/* History table */}
      {campaigns.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-left text-xs text-neutral-500">
                <th className="pb-2 pr-4 font-medium">Week</th>
                <th className="pb-2 pr-4 font-medium text-right">Impressies</th>
                <th className="pb-2 pr-4 font-medium text-right">Klikken</th>
                <th className="pb-2 pr-4 font-medium text-right">CTR</th>
                <th className="pb-2 pr-4 font-medium text-right">Spend</th>
                <th className="pb-2 font-medium text-right">CPC</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => {
                const ctr = c.impressions > 0 ? ((c.clicks / c.impressions) * 100).toFixed(2) : "—";
                const cpc = c.clicks > 0 ? (Number(c.spend_euros) / c.clicks).toFixed(2) : "—";
                return (
                  <tr key={c.id} className="border-b border-neutral-800/50 hover:bg-neutral-900/30 transition-colors">
                    <td className="py-2.5 pr-4 text-neutral-300">
                      {new Date(c.week_start).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="py-2.5 pr-4 text-right text-neutral-400">{c.impressions.toLocaleString("nl-NL")}</td>
                    <td className="py-2.5 pr-4 text-right text-neutral-400">{c.clicks.toLocaleString("nl-NL")}</td>
                    <td className="py-2.5 pr-4 text-right text-neutral-400">{ctr}%</td>
                    <td className="py-2.5 pr-4 text-right text-neutral-400">€{Number(c.spend_euros).toFixed(2)}</td>
                    <td className="py-2.5 text-right text-neutral-400">€{cpc}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {campaigns.length === 0 && (
        <p className="text-sm text-neutral-600 italic">Nog geen campagnedata ingevoerd.</p>
      )}
    </div>
  );
}
