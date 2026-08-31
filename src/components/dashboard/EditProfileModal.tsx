"use client";

import { useRef, useState } from "react";
import { Camera, Check, Loader2, User, X } from "lucide-react";
import { getDriverSession, updateDriverSession, getInitials } from "@/lib/auth";
import { updateDriverProfileApi, uploadImageApi } from "@/lib/api";

type EditProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export function EditProfileModal({ isOpen, onClose, onSuccess }: EditProfileModalProps) {
  const session = getDriverSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(session?.name || "");
  const [phone, setPhone] = useState(session?.phone || "");
  const [licenseNumber, setLicenseNumber] = useState(session?.licenseNumber || "");
  const [licenseExpirationDate, setLicenseExpirationDate] = useState(
    session?.licenseExpirationDate || ""
  );
  const [avatarUrl, setAvatarUrl] = useState(session?.avatarUrl || "");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const initials = getInitials(name || session?.name || "Driver");

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setUploadingAvatar(true);

    const token = session?.token;
    if (token) {
      const res = await uploadImageApi(token, file, "avatars");
      if (res.success && res.data?.url) {
        setAvatarUrl(res.data.url);
      } else {
        setError(res.error?.message || "Failed to upload profile photo to S3.");
      }
    }
    setUploadingAvatar(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Full name is required.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccessMsg("");

    const token = session?.token;
    if (!token) {
      setError("Authentication required.");
      setSubmitting(false);
      return;
    }

    try {
      const res = await updateDriverProfileApi(token, {
        name,
        phone,
        licenseNumber,
        licenseExpirationDate,
        avatarUrl,
      });

      if (res.success) {
        updateDriverSession({
          name,
          phone,
          licenseNumber,
          licenseExpirationDate,
          avatarUrl,
        });
        setSuccessMsg("Profile updated successfully!");
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 600);
      } else {
        setError(res.error?.message || "Failed to update profile.");
      }
    } catch {
      setError("An unexpected error occurred while updating profile.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-2xl sm:p-7">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-blue-50 text-blue-600">
              <User className="size-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-foreground">Edit Profile</h2>
              <p className="text-xs text-muted-foreground">
                Update your driver details and profile avatar.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Avatar Section */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative group">
              <span className="relative grid size-24 shrink-0 place-items-center overflow-hidden rounded-full border-4 border-card bg-secondary text-2xl font-bold text-secondary-foreground shadow-md ring-4 ring-secondary/20">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={name}
                    className="size-full object-cover"
                  />
                ) : (
                  <span>{initials}</span>
                )}
              </span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute bottom-0 right-0 grid size-8 place-items-center rounded-full bg-blue-600 text-white shadow-md transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-70"
                title="Upload profile photo"
              >
                {uploadingAvatar ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Camera className="size-4" />
                )}
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={handleAvatarChange}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Click the camera icon to upload avatar (JPG, PNG to S3)
            </p>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-700">
              <Check className="size-4" />
              {successMsg}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold text-foreground">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5 h-10 w-full rounded-lg border border-input bg-background px-3.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder="Driver Full Name"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1.5 h-10 w-full rounded-lg border border-input bg-background px-3.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground">Driving License Number</label>
              <input
                type="text"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                className="mt-1.5 h-10 w-full rounded-lg border border-input bg-background px-3.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder="License Number (e.g. Y215-5410)"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground">License Expiration Date</label>
              <input
                type="date"
                value={licenseExpirationDate}
                onChange={(e) => setLicenseExpirationDate(e.target.value)}
                className="mt-1.5 h-10 w-full rounded-lg border border-input bg-background px-3.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-lg border border-border px-4 text-xs font-bold text-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || uploadingAvatar}
              className="flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-5 text-xs font-bold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
