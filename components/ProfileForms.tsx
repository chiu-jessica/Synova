"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const inputClass =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm";
const buttonClass =
  "px-4 py-2 rounded-lg bg-teal text-white text-sm flex items-center gap-2 disabled:opacity-50 w-fit";

type Status =
  | { type: "idle" }
  | { type: "saving" }
  | { type: "error"; message: string }
  | { type: "success"; message: string };

async function patchProfile(body: Record<string, unknown>) {
  const res = await fetch("/api/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
  return data;
}

function StatusMessage({ status }: { status: Status }) {
  if (status.type === "error") {
    return <p className="text-xs text-red-600">{status.message}</p>;
  }
  if (status.type === "success") {
    return <p className="text-xs text-teal-dark">{status.message}</p>;
  }
  return null;
}

export function EditNameForm({ initialName }: { initialName: string }) {
  const [name, setName] = useState(initialName);
  const [status, setStatus] = useState<Status>({ type: "idle" });
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus({ type: "saving" });
    try {
      await patchProfile({ action: "name", name });
      setStatus({ type: "success", message: "Name updated." });
      // Re-render the server components so the sidebar picks up the new name.
      router.refresh();
    } catch (err) {
      setStatus({ type: "error", message: (err as Error).message });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div>
        <label htmlFor="profile-name" className="text-sm text-gray-600 block mb-1">
          Full name
        </label>
        <input
          id="profile-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete="name"
          className={inputClass}
        />
      </div>
      <StatusMessage status={status} />
      <button
        type="submit"
        disabled={status.type === "saving" || name.trim() === initialName}
        className={buttonClass}
      >
        {status.type === "saving" && <Loader2 size={14} className="animate-spin" />}
        Save name
      </button>
    </form>
  );
}

export function ChangePasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<Status>({ type: "idle" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setStatus({ type: "error", message: "The two passwords do not match." });
      return;
    }
    setStatus({ type: "saving" });
    try {
      await patchProfile({ action: "password", currentPassword, newPassword });
      setStatus({
        type: "success",
        message: hasPassword ? "Password updated." : "Password set.",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setStatus({ type: "error", message: (err as Error).message });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {hasPassword && (
        <div>
          <label
            htmlFor="current-password"
            className="text-sm text-gray-600 block mb-1"
          >
            Current password
          </label>
          <input
            id="current-password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            autoComplete="current-password"
            className={inputClass}
          />
        </div>
      )}

      <div>
        <label htmlFor="new-password" className="text-sm text-gray-600 block mb-1">
          New password
        </label>
        <input
          id="new-password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
          className={inputClass}
        />
        <p className="text-xs text-gray-400 mt-1">At least 8 characters.</p>
      </div>

      <div>
        <label
          htmlFor="confirm-password"
          className="text-sm text-gray-600 block mb-1"
        >
          Confirm new password
        </label>
        <input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
          className={inputClass}
        />
      </div>

      <StatusMessage status={status} />
      <button
        type="submit"
        disabled={status.type === "saving" || !newPassword}
        className={buttonClass}
      >
        {status.type === "saving" && <Loader2 size={14} className="animate-spin" />}
        {hasPassword ? "Update password" : "Set password"}
      </button>
    </form>
  );
}
