import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { messageForAuthError } from "@/lib/authErrors";
import { displayNameForUser, initialsForUser } from "@/lib/userDisplay";
import {
  getProfileAvatarUrl,
  setProfileAvatarUrl,
} from "@/lib/profileAvatarStorage";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface/40 p-4">
      <p className="text-xs font-semibold tracking-wide text-muted">{label}</p>
      <p className="mt-2 text-sm font-semibold text-fg">{value}</p>
    </div>
  );
}

export function ProfilePage() {
  const { user, signOutUser, sendPasswordReset } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [preferredName, setPreferredName] = useState(() =>
    displayNameForUser(user),
  );
  const [preferredNameDraft, setPreferredNameDraft] = useState(() =>
    displayNameForUser(user),
  );
  const [phone, setPhone] = useState("+1 (415) 555-0192");
  const [phoneDraft, setPhoneDraft] = useState(phone);
  const [emergencyContact, setEmergencyContact] = useState(
    "Alex Ellis · +1 (415) 555-0148",
  );
  const [emergencyContactDraft, setEmergencyContactDraft] =
    useState(emergencyContact);
  const [trainingFocus, setTrainingFocus] = useState(
    "Strength + mobility balance",
  );
  const [trainingFocusDraft, setTrainingFocusDraft] = useState(trainingFocus);
  const [aboutMe, setAboutMe] = useState(
    "I train to build consistency, confidence, and calm under pressure. I enjoy mobility-focused warmups, technical drilling, and helping newer members feel welcome on the mats.",
  );
  const [aboutDraft, setAboutDraft] = useState(aboutMe);
  const [editingProfile, setEditingProfile] = useState(false);
  const [belt, setBelt] = useState("Blue Belt");
  const [beltDraft, setBeltDraft] = useState(belt);
  const [hobby, setHobby] = useState("Trail running and coffee brewing");
  const [hobbyDraft, setHobbyDraft] = useState(hobby);
  const aboutInputRef = useRef<HTMLTextAreaElement | null>(null);
  const avatarFileRef = useRef<HTMLInputElement | null>(null);
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(() =>
    getProfileAvatarUrl(),
  );
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);

  function onAvatarFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const maxBytes = 1_500_000;
    if (file.size > maxBytes) {
      window.alert("Please choose an image under 1.5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") return;
      setProfileAvatarUrl(result);
      setAvatarDataUrl(result);
    };
    reader.readAsDataURL(file);
  }

  const avatarSrc = (avatarDataUrl ?? user?.photoURL) || undefined;

  useEffect(() => {
    if (!editingProfile || !aboutInputRef.current) return;
    const el = aboutInputRef.current;
    el.style.height = "0px";
    el.style.height = `${el.scrollHeight}px`;
  }, [aboutDraft, editingProfile]);

  if (!user) return null;

  return (
    <div className="space-y-8">
      <p className="text-sm text-muted">
        "You are awesome - your progress is inspiring, and your positive energy
        makes the whole community stronger." - Jen
      </p>

      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardBody className="space-y-5">
            <div className="flex flex-wrap items-start gap-4">
              <div className="relative">
                <Avatar
                  initials={initialsForUser(user)}
                  src={avatarSrc}
                  title={displayNameForUser(user)}
                  className="size-14 text-base"
                />
                {editingProfile ? (
                  <button
                    type="button"
                    aria-label="Edit profile photo"
                    className="absolute -right-2 -bottom-1 inline-flex size-7 items-center justify-center rounded-full border border-border bg-surface-2 text-fg-soft transition hover:text-fg"
                    onClick={() => setAvatarMenuOpen((v) => !v)}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden
                    >
                      <path
                        d="M4 20h4l10.5-10.5a1.8 1.8 0 0 0 0-2.5l-1.5-1.5a1.8 1.8 0 0 0-2.5 0L4 16v4Z"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinejoin="round"
                      />
                      <path
                        d="m13.5 6.5 4 4"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                ) : null}
                {editingProfile && avatarMenuOpen ? (
                  <div className="absolute top-[calc(100%+0.5rem)] left-0 z-10 min-w-40 rounded-xl border border-border bg-surface p-1 shadow-card">
                    <button
                      type="button"
                      className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-fg transition hover:bg-surface-2"
                      onClick={() => {
                        avatarFileRef.current?.click();
                        setAvatarMenuOpen(false);
                      }}
                    >
                      Upload photo
                    </button>
                    <button
                      type="button"
                      className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-fg transition hover:bg-surface-2 disabled:opacity-50"
                      disabled={!avatarSrc}
                      onClick={() => {
                        setProfileAvatarUrl(null);
                        setAvatarDataUrl(null);
                        setAvatarMenuOpen(false);
                      }}
                    >
                      Delete photo
                    </button>
                  </div>
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-lg font-semibold text-fg">{preferredName}</p>
                <p className="text-sm text-muted">{user.email ?? "—"}</p>
              </div>
              <input
                ref={avatarFileRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={onAvatarFile}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {editingProfile ? (
                <div className="rounded-2xl border border-border bg-surface/40 p-4">
                  <p className="text-xs font-semibold tracking-wide text-muted">
                    Preferred name
                  </p>
                  <input
                    value={preferredNameDraft}
                    onChange={(e) => setPreferredNameDraft(e.target.value)}
                    className="mt-2 h-10 w-full border border-border bg-surface px-3 text-sm text-fg outline-none focus:border-accent/45 focus:ring-2 focus:ring-accent/20"
                  />
                </div>
              ) : (
                <Field label="Preferred name" value={preferredName} />
              )}
              {editingProfile ? (
                <div className="rounded-2xl border border-border bg-surface/40 p-4">
                  <p className="text-xs font-semibold tracking-wide text-muted">
                    Phone (SMS)
                  </p>
                  <input
                    value={phoneDraft}
                    onChange={(e) => setPhoneDraft(e.target.value)}
                    className="mt-2 h-10 w-full border border-border bg-surface px-3 text-sm text-fg outline-none focus:border-accent/45 focus:ring-2 focus:ring-accent/20"
                  />
                </div>
              ) : (
                <Field label="Phone (SMS)" value={phone} />
              )}
              {editingProfile ? (
                <div className="rounded-2xl border border-border bg-surface/40 p-4">
                  <p className="text-xs font-semibold tracking-wide text-muted">
                    Emergency contact
                  </p>
                  <input
                    value={emergencyContactDraft}
                    onChange={(e) => setEmergencyContactDraft(e.target.value)}
                    className="mt-2 h-10 w-full border border-border bg-surface px-3 text-sm text-fg outline-none focus:border-accent/45 focus:ring-2 focus:ring-accent/20"
                  />
                </div>
              ) : (
                <Field label="Emergency contact" value={emergencyContact} />
              )}
              {editingProfile ? (
                <div className="rounded-2xl border border-border bg-surface/40 p-4">
                  <p className="text-xs font-semibold tracking-wide text-muted">
                    Training focus
                  </p>
                  <input
                    value={trainingFocusDraft}
                    onChange={(e) => setTrainingFocusDraft(e.target.value)}
                    className="mt-2 h-10 w-full border border-border bg-surface px-3 text-sm text-fg outline-none focus:border-accent/45 focus:ring-2 focus:ring-accent/20"
                  />
                </div>
              ) : (
                <Field label="Training focus" value={trainingFocus} />
              )}
            </div>

            <div className="rounded-2xl border border-border bg-surface/40 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold tracking-wide text-muted">
                  About Me
                </p>
              </div>
              {editingProfile ? (
                <div className="mt-3 space-y-3">
                  <textarea
                    ref={aboutInputRef}
                    value={aboutDraft}
                    onChange={(e) => setAboutDraft(e.target.value)}
                    rows={4}
                    className="w-full resize-none overflow-hidden border border-border bg-surface px-3 py-2 text-sm text-fg outline-none focus:border-accent/45 focus:ring-2 focus:ring-accent/20"
                  />
                  <p className="text-xs font-semibold tracking-wide text-muted">
                    Belt
                  </p>
                  <input
                    value={beltDraft}
                    onChange={(e) => setBeltDraft(e.target.value)}
                    placeholder="Belt"
                    className="h-10 w-full border border-border bg-surface px-3 text-sm text-fg outline-none focus:border-accent/45 focus:ring-2 focus:ring-accent/20"
                  />
                  <p className="text-xs font-semibold tracking-wide text-muted">
                    Hobby
                  </p>
                  <input
                    value={hobbyDraft}
                    onChange={(e) => setHobbyDraft(e.target.value)}
                    placeholder="Hobby"
                    className="h-10 w-full border border-border bg-surface px-3 text-sm text-fg outline-none focus:border-accent/45 focus:ring-2 focus:ring-accent/20"
                  />
                </div>
              ) : (
                <div className="mt-2 space-y-2">
                  <p className="text-sm leading-relaxed text-fg-soft">
                    {aboutMe}
                  </p>
                  <p className="text-sm text-fg-soft">
                    <span className="font-semibold text-fg">Belt:</span> {belt}
                  </p>
                  <p className="text-sm text-fg-soft">
                    <span className="font-semibold text-fg">Hobby:</span>{" "}
                    {hobby}
                  </p>
                </div>
              )}
            </div>
            {editingProfile ? (
              <div className="flex w-full gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="h-9 w-full px-3"
                  onClick={() => {
                    setPreferredNameDraft(preferredName);
                    setPhoneDraft(phone);
                    setEmergencyContactDraft(emergencyContact);
                    setTrainingFocusDraft(trainingFocus);
                    setAboutDraft(aboutMe);
                    setBeltDraft(belt);
                    setHobbyDraft(hobby);
                    setAvatarMenuOpen(false);
                    setEditingProfile(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="h-9 w-full px-3"
                  onClick={() => {
                    setPreferredName(preferredNameDraft.trim());
                    setPhone(phoneDraft.trim());
                    setEmergencyContact(emergencyContactDraft.trim());
                    setTrainingFocus(trainingFocusDraft.trim());
                    setAboutMe(aboutDraft.trim());
                    setBelt(beltDraft.trim());
                    setHobby(hobbyDraft.trim());
                    setAvatarMenuOpen(false);
                    setEditingProfile(false);
                  }}
                >
                  Save
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => {
                  setPreferredNameDraft(preferredName);
                  setPhoneDraft(phone);
                  setEmergencyContactDraft(emergencyContact);
                  setTrainingFocusDraft(trainingFocus);
                  setAboutDraft(aboutMe);
                  setBeltDraft(belt);
                  setHobbyDraft(hobby);
                  setAvatarMenuOpen(false);
                  setEditingProfile(true);
                }}
              >
                Edit my profile
              </Button>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-display text-lg text-fg">Account</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            <Field label="Sign-in email" value={user.email ?? "—"} />
            <Button
              variant="secondary"
              className="w-full"
              onClick={async () => {
                await signOutUser();
                navigate("/sign-in", { replace: true });
              }}
            >
              Log out
            </Button>
            <Button
              variant="secondary"
              className="w-full"
              onClick={async () => {
                const em = user.email;
                if (!em) return;
                try {
                  await sendPasswordReset(em);
                  toast.push({
                    variant: "success",
                    title: "Check your inbox",
                    description:
                      "We sent a password reset link to your email address.",
                  });
                } catch (err) {
                  toast.push({
                    variant: "error",
                    title: "Could not send reset email",
                    description: messageForAuthError(err),
                  });
                }
              }}
            >
              Change password
            </Button>
            <Button
              variant="danger"
              className="w-full"
              onClick={() =>
                toast.push({
                  variant: "error",
                  title: "Not available in the app",
                  description:
                    "To delete your account, contact your gym admin or support.",
                })
              }
            >
              Delete account
            </Button>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
