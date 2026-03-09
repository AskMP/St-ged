import type {
  CostEntry,
  RotationAssignment,
  RotationSettings,
} from "@staged/types";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "../lib/api-client";
import { useAuthStore } from "../lib/auth-store";

export default function HouseholdOps() {
  const user = useAuthStore((s) => s.user);
  const hid = user?.householdId;

  const [total, setTotal] = useState("");
  const [history, setHistory] = useState<CostEntry[]>([]);

  const [frequency, setFrequency] = useState<"weekly" | "biweekly">("weekly");
  const [members, setMembers] = useState<string>("");
  const [rotation, setRotation] = useState<RotationSettings | null>(null);
  const [assignments, setAssignments] = useState<RotationAssignment[]>([]);

  const loadHistory = async () => {
    try {
      const h = await apiClient.households.costHistory(hid!);
      setHistory(h);
    } catch {
      // ignore
    }
  };

  const loadRotation = async () => {
    try {
      const r = await apiClient.households.getRotation(hid!);
      setRotation(r);
      const a = await apiClient.households.getRotationAssignments(hid!, 4);
      setAssignments(a ?? []);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (hid) {
      loadHistory();
      loadRotation();
    }
  }, [hid]);

  const [showReminder, setShowReminder] = useState(false);

  const handleAddCost = async () => {
    if (!total) return;
    try {
      const e = await apiClient.households.addCost(hid!, parseFloat(total));
      setHistory((h) => [...h, e]);
      setTotal("");
      setShowReminder(true);
      setTimeout(() => setShowReminder(false), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSetRotation = async () => {
    const memberList = members
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);
    try {
      const r = await apiClient.households.setRotation(
        hid!,
        frequency,
        memberList,
      );
      setRotation(r);
      const a = await apiClient.households.getRotationAssignments(hid!, 4);
      setAssignments(a ?? []);
    } catch (err) {
      console.error(err);
    }
  };

  if (!hid) {
    return (
      <div
        className="max-w-xl mx-auto py-6 px-4"
        data-testid="household-ops-no-household"
      >
        <p className="text-stone-600 mb-4">
          You need to set up a household first.
        </p>
        <Link
          to="/onboarding"
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Set up a household
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-6 px-4" data-testid="household-ops">
      <h1 className="text-2xl font-bold mb-4">Household Operations</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Cost Splitting</h2>
        {showReminder && (
          <div
            data-testid="cost-reminder"
            className="mb-2 p-2 bg-yellow-100 text-yellow-800 rounded"
          >
            Reminder: notify household members of their share.
          </div>
        )}
        <div className="flex gap-2 mb-2">
          <input
            type="number"
            placeholder="Total amount"
            value={total}
            onChange={(e) => setTotal(e.target.value)}
            className="border px-2 py-1 flex-1"
            data-testid="cost-input"
          />
          <button
            onClick={handleAddCost}
            className="px-4 py-1 bg-green-600 text-white rounded"
            data-testid="cost-submit"
          >
            Add
          </button>
        </div>
        {history.length > 0 && (
          <>
            {/* running totals per member */}
            <div
              data-testid="cost-totals"
              className="mb-2 text-sm text-stone-700"
            >
              {Object.entries(
                history.reduce(
                  (acc, e) => {
                    for (const [u, amt] of Object.entries(e.splits)) {
                      acc[u] = (acc[u] || 0) + amt;
                    }
                    return acc;
                  },
                  {} as Record<string, number>,
                ),
              ).map(([u, amt]) => (
                <span key={u} className="mr-4">
                  {u}: ${amt.toFixed(2)}
                </span>
              ))}
            </div>
            <table className="w-full text-sm" data-testid="cost-history">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Splits</th>
                </tr>
              </thead>
              <tbody>
                {history.map((e) => (
                  <tr key={e.id}>
                    <td>{e.date.split("T")[0]}</td>
                    <td>${e.total.toFixed(2)}</td>
                    <td>
                      {Object.entries(e.splits)
                        .map(([u, amt]) => `${u}: $${amt.toFixed(2)}`)
                        .join(", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Cook Rotation</h2>
        <div className="mb-2">
          <label className="block text-sm mb-1">Frequency</label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as any)}
            className="border px-2 py-1"
            data-testid="rotation-frequency"
          >
            <option value="weekly">Weekly</option>
            <option value="biweekly">Biweekly</option>
          </select>
        </div>
        <div className="mb-2">
          <label className="block text-sm mb-1">
            Members (comma-separated)
          </label>
          <input
            type="text"
            value={members}
            onChange={(e) => setMembers(e.target.value)}
            className="border px-2 py-1 w-full"
            data-testid="rotation-members"
          />
        </div>
        <button
          onClick={handleSetRotation}
          className="px-4 py-1 bg-blue-600 text-white rounded mb-4"
          data-testid="rotation-submit"
        >
          Set Rotation
        </button>
        {rotation && rotation.members && (
          <div data-testid="rotation-settings" className="mb-4">
            <div>Frequency: {rotation.frequency}</div>
            <div>Members: {rotation.members.join(", ")}</div>
          </div>
        )}
        {assignments.length > 0 && (
          <table className="w-full text-sm" data-testid="rotation-assignments">
            <thead>
              <tr>
                <th>Date</th>
                <th>User</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a, idx) => (
                <tr key={idx}>
                  <td>{a.date}</td>
                  <td>{a.userId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
