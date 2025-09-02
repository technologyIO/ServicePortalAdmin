"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  X,
  Plus,
  Save,
  Mail,
  Users,
  Settings,
  AlertTriangle,
  Shield,
  Loader2,
} from "lucide-react";

// Utility function for className merging
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

// Email validation utility
function isValidEmail(email) {
  const e = email.trim();
  if (!e) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(e);
}

// Email Chips Input Component
function EmailChipsInput({
  value,
  onChange,
  placeholder = "Type email and press Enter",
  disabled,
  className,
}) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const [selected, setSelected] = useState(new Set());

  const normalizedSet = useMemo(
    () => new Set(value.map((v) => v.toLowerCase())),
    [value]
  );

  function addFromString(raw) {
    const parts = raw
      .split(/[,;\s]+/g)
      .map((p) => p.trim())
      .filter(Boolean);

    if (parts.length === 0) return;

    const toAdd = [];
    const invalids = [];

    for (const p of parts) {
      if (!isValidEmail(p)) {
        invalids.push(p);
        continue;
      }
      const lower = p.toLowerCase();
      if (
        !normalizedSet.has(lower) &&
        !toAdd.some((t) => t.toLowerCase() === lower)
      ) {
        toAdd.push(p);
      }
    }

    setError(invalids.length ? `Invalid: ${invalids.join(", ")}` : null);
    if (toAdd.length) {
      onChange((prev) => {
        const lowerSeen = new Set(prev.map((e) => e.toLowerCase()));
        const merged = [...prev];
        for (const email of toAdd) {
          const lower = email.toLowerCase();
          if (!lowerSeen.has(lower)) {
            lowerSeen.add(lower);
            merged.push(email);
          }
        }
        return merged;
      });
    }
  }

  function handleKeyDown(e) {
    if (disabled) return;
    const key = e.key;
    if (["Enter", "Tab", ",", " "].includes(key)) {
      e.preventDefault();
      if (input.trim()) {
        addFromString(input);
        setInput("");
      }
    } else if (key === "Backspace" && !input && value.length) {
      onChange((prev) => prev.slice(0, -1));
      setError(null);
    }
  }

  function handlePaste(e) {
    const text = e.clipboardData.getData("text");
    if (text && /[,;\s]/.test(text)) {
      e.preventDefault();
      addFromString(text);
      setInput("");
    }
  }

  function removeAt(index) {
    onChange((prev) => prev.filter((_, i) => i !== index));
    setError(null);
    inputRef.current?.focus();
  }

  function toggleSelect(index) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function removeSelected() {
    if (selected.size === 0) return;
    onChange((prev) => prev.filter((_, idx) => !selected.has(idx)));
    setSelected(new Set());
    setError(null);
    inputRef.current?.focus();
  }

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "flex min-h-[50px] w-full flex-wrap items-center gap-2 rounded-xl border-2 px-4 py-3 transition-all duration-200",
          "border-gray-200 bg-white text-gray-900 shadow-sm",
          "hover:border-blue-300 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onClick={() => !disabled && inputRef.current?.focus()}
      >
        {value.map((email, idx) => (
          <span
            key={`${email}-${idx}`}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition-all duration-200 select-none",
              "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:shadow-sm",
              selected.has(idx) && "ring-2 ring-blue-400 bg-blue-100"
            )}
            onClick={() => !disabled && toggleSelect(idx)}
            role="button"
            aria-pressed={selected.has(idx)}
            title={selected.has(idx) ? "Deselect" : "Select"}
          >
            <Mail className="h-4 w-4" />
            <span>{email}</span>
            <button
              type="button"
              className={cn(
                "inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200",
                "hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
              )}
              onClick={(e) => {
                e.stopPropagation();
                removeAt(idx);
              }}
              aria-label={`Remove ${email}`}
              title={`Remove ${email}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onBlur={() => {
            if (input.trim()) {
              addFromString(input);
              setInput("");
            }
          }}
          placeholder={value.length === 0 ? placeholder : ""}
          disabled={disabled}
          className={cn(
            "h-8 min-w-[180px] flex-1 bg-transparent px-2 text-sm",
            "border-0 outline-none placeholder-gray-400 focus:ring-0"
          )}
        />
      </div>
      {selected.size > 0 && (
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={removeSelected}
            disabled={disabled}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-200",
              "bg-red-600 text-white border-red-700 hover:bg-red-700 disabled:opacity-50"
            )}
            title="Delete selected emails"
          >
            Delete selected ({selected.size})
          </button>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-200",
              "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
            )}
            title="Clear selection"
          >
            Clear selection
          </button>
        </div>
      )}
      {error && (
        <div
          role="status"
          aria-live="polite"
          className="mt-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200"
        >
          <X className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  );
}

// Individual Section Component
function NotificationSection({
  title,
  description,
  icon: Icon,
  iconBgColor,
  iconColor,
  emails,
  setEmails,
  placeholder,
  buttonText = "Save Configuration",
  buttonColor = "blue",
  sectionType, // "abort" or "cic"
  showRefresh,
  onRefresh,
}) {
  const [saved, setSaved] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sectionRefreshing, setSectionRefreshing] = useState(false);

  async function handleSave() {
    if (emails.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const endpoint = `${process.env.REACT_APP_BASE_URL}/api/notifications/${sectionType}`;
      
      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emails: emails })
      });

      const result = await response.json();

      if (result.success) {
        setSaved({ at: Date.now() });
        console.log("Saved successfully:", result.data);
        toast.success("Recipients saved successfully");
      } else {
        const err = result.error || "Failed to save";
        setError(err);
        toast.error(err);
      }
    } catch (error) {
      console.error("Network error:", error);
      setError("Network error. Please try again.");
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }

    // Auto-hide saved message after 3 seconds
    setTimeout(() => setSaved(null), 3000);
    // Auto-hide error message after 5 seconds
    setTimeout(() => setError(null), 5000);
  }

  async function handleDeleteEmail(index, email) {
    try {
      // Optimistic update
      setEmails((prev) => prev.filter((_, i) => i !== index));

      const endpoint = `${process.env.REACT_APP_BASE_URL}/api/notifications/${sectionType}`;
      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Failed to delete email");
      }
      toast.success("Email deleted");
    } catch (err) {
      console.error("Delete failed:", err);
      setError("Failed to delete email. Please try again.");
      toast.error("Failed to delete email. Restoring list...");
      // Reload from server to resync
      try {
        const res = await fetch(`${process.env.REACT_APP_BASE_URL}/api/notifications`);
        const data = await res.json();
        if (data.success && data.data) {
          if (sectionType === "abort") {
            setEmails(data.data.abortInstallationRecipients || []);
          } else {
            setEmails(data.data.cicRecipients || []);
          }
        }
      } catch (_) {}
    }
  }

  const buttonColors = {
    blue: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
    red: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
    green: "bg-green-600 hover:bg-green-700 focus:ring-green-500",
    purple: "bg-purple-600 hover:bg-purple-700 focus:ring-purple-500",
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
      {/* Section Header */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl",
                iconBgColor
              )}
            >
              <Icon className={cn("h-6 w-6", iconColor)} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{title}</h2>
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {saved && (
              <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700 border border-green-200">
                <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
                Configuration Saved
              </span>
            )}
            {error && (
              <span className="inline-flex items-center gap-2 rounded-full bg-red-100 px-4 py-2 text-sm font-medium text-red-700 border border-red-200">
                <X className="h-4 w-4" />
                {error}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Section Content */}
      <div className="p-8">
        <div className="space-y-6">
          {/* Email Input */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-gray-700">
                Email Recipients ({emails.length})
              </label>
              {showRefresh && (
                <button
                  type="button"
                  onClick={async () => {
                    if (!onRefresh) return;
                    setSectionRefreshing(true);
                    try {
                      await onRefresh();
                    } finally {
                      setSectionRefreshing(false);
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gray-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-gray-700 disabled:opacity-60"
                  disabled={loading || sectionRefreshing}
                  title="Refresh Abort recipients"
                >
                  {sectionRefreshing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Refreshing
                    </>
                  ) : (
                    <>Refresh</>
                  )}
                </button>
              )}
            </div>
            <EmailChipsInput
              value={emails}
              onChange={setEmails}
              placeholder={placeholder}
              disabled={loading}
            />
            <p className="text-xs text-gray-500">
              Separate multiple emails with commas, spaces, or press Enter after
              each email
            </p>
          </div>

          {/* Email List Preview */}
          {emails.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Current Recipients:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {emails.map((email, idx) => (
                  <div
                    key={`${email}-${idx}`}
                    className="flex items-center justify-between gap-3 text-sm text-gray-700 bg-white px-3 py-2 rounded-lg border"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{email}</span>
                    </div>
                    <button
                      type="button"
                      className="shrink-0 inline-flex items-center rounded-md bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700 focus:outline-none"
                      onClick={() => handleDeleteEmail(idx, email)}
                      title="Delete this email"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={emails.length === 0 || loading}
              className={cn(
                "inline-flex items-center gap-3 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200",
                emails.length === 0 || loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : cn(
                      buttonColors[buttonColor],
                      "hover:shadow-xl transform hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-opacity-50"
                    )
              )}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {loading ? "Saving..." : buttonText}
              {emails.length > 0 && !loading && (
                <span className="bg-white/20 rounded-full px-2 py-1 text-xs">
                  {emails.length} email{emails.length !== 1 ? "s" : ""}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Access Form Component
export default function AccessForm() {
  const [abortEmails, setAbortEmails] = useState([]);
  const [cicEmails, setCicEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadNotificationSettings(showToast = false) {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/notifications`
      );
      const result = await response.json();

      if (result.success && result.data) {
        setAbortEmails(result.data.abortInstallationRecipients || []);
        setCicEmails(result.data.cicRecipients || []);
        if (showToast) toast.success("Settings refreshed");
      } else if (showToast) {
        toast.error(result.error || "Failed to load settings");
      }
    } catch (error) {
      console.error("Failed to load notification settings:", error);
      if (showToast) toast.error("Failed to load settings");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  // Load initial data
  useEffect(() => {
    loadNotificationSettings(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading notification settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-y-auto bg-gray-50 py-8">
      <div className="w-full max-w-7xl mx-auto px-6">
        {/* Main Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600">
              <Settings className="h-8 w-8 text-white" />
            </div>
            
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Access & Notification Management
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Configure email recipients for system notifications, installation
            alerts, and custom notification groups
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-12">
          {/* Abort Installation Recipients Section */}
          <NotificationSection
            title="Abort Installation Recipients"
            description="Contacts who will be notified when installations are aborted or failed"
            icon={AlertTriangle}
            iconBgColor="bg-red-100"
            iconColor="text-red-600"
            emails={abortEmails}
            setEmails={setAbortEmails}
            placeholder="Enter email addresses for abort installation notifications"
            buttonText="Save Abort Recipients"
            buttonColor="red"
            sectionType="abort"
            showRefresh
            onRefresh={() => loadNotificationSettings(true)}
          />

          {/* CIC Contacts Section */}
          <NotificationSection
            title="CIC Contacts"
            description="Primary contacts for communication, visibility, and critical system updates"
            icon={Shield}
            iconBgColor="bg-blue-100"
            iconColor="text-blue-600"
            emails={cicEmails}
            setEmails={setCicEmails}
            placeholder="Enter CIC contact email addresses"
            buttonText="Save CIC Contacts"
            buttonColor="blue"
            sectionType="cic"
          />
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-500">
            All notification settings are saved automatically. Changes take
            effect immediately.
          </p>
        </div>
      </div>
    </div>
  );
}
