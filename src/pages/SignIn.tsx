import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { getAuthMode } from "@/lib/authMode";
import { messageForAuthError } from "@/lib/authErrors";
import { useToast } from "@/hooks/useToast";
import {
  getLatestApprovedMemberRequestForEmail,
  markApprovedRequestActivated,
} from "@/lib/memberRequests";

export function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { user, signInWithEmail, signUpWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [loading, setLoading] = useState(false);

  const fromPath =
    (location.state as { from?: { pathname?: string } } | null)?.from
      ?.pathname ?? "/";

  useEffect(() => {
    if (user) navigate(fromPath, { replace: true });
  }, [user, fromPath, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (!email.includes("@"))
      next.email = "Please enter a valid email address.";
    if (password.length < 8)
      next.password = "Password must be at least 8 characters.";
    setErrors(next);
    if (Object.keys(next).length) {
      toast.push({
        variant: "error",
        title: "Check the highlighted fields",
        description: "We could not sign you in with the information provided.",
      });
      return;
    }
    setLoading(true);
    try {
      await signInWithEmail(email, password);
      toast.push({
        variant: "success",
        title: "Welcome back",
        description: "Redirecting to your home…",
      });
      navigate(fromPath, { replace: true });
    } catch (err) {
      const code = (err as { code?: string } | null)?.code;
      const canAutoCreate =
        getAuthMode() === "firebase" &&
        (code === "auth/user-not-found" || code === "auth/invalid-credential");
      if (canAutoCreate) {
        const approved = await getLatestApprovedMemberRequestForEmail(email);
        if (approved) {
          await signUpWithEmail(
            email,
            password,
            approved.name?.trim() || email.split("@")[0] || "Member",
          );
          markApprovedRequestActivated(email);
          toast.push({
            variant: "success",
            title: "Account activated",
            description: "Your approved request is now active. Redirecting…",
          });
          navigate(fromPath, { replace: true });
          return;
        }
      }
      toast.push({
        variant: "error",
        title: "Sign-in failed",
        description: messageForAuthError(err),
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh bg-transparent">
      <div className="mx-auto grid min-h-dvh max-w-6xl lg:grid-cols-2">
        <aside className="relative hidden overflow-hidden border-r border-border lg:block">
          <div className="absolute inset-0 bg-gradient-to-b from-page-top to-page-bottom" />
          <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_10%,rgba(142,69,133,0.2),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(700px_circle_at_80%_40%,rgba(163,216,244,0.55),transparent_55%)]" />
          <div className="relative flex h-full flex-col justify-between p-10">
            <Logo to="/" variant="onGradient" />
            <div className="max-w-md space-y-4">
              <p className="font-display text-3xl font-semibold leading-tight tracking-tight text-accent text-balance">
                A calmer way to run a high-trust gym community.
              </p>
              <p className="text-sm font-medium leading-relaxed text-white drop-shadow-sm">
                Jen’s Collective helps members discover sessions, reserve
                fairly, and stay connected—without the noise of public social
                feeds.
              </p>
            </div>
            <p className="text-xs font-medium text-white/65">
              {getAuthMode() === "firebase"
                ? "Secure sign-in with Firebase Authentication"
                : "Local sign-in — your credentials stay on this device"}
            </p>
          </div>
        </aside>

        <div className="flex items-center justify-center px-4 py-10 sm:px-8">
          <div className="w-full max-w-md space-y-8">
            <div className="flex items-center justify-center lg:hidden">
              <Logo to="/" className="w-full justify-center" />
            </div>

            <div className="rounded-2xl border border-border bg-surface/95 p-6 shadow-card backdrop-blur-sm sm:p-8">
              <div className="space-y-1">
                <h1 className="font-display text-2xl tracking-tight text-fg">
                  Sign in
                </h1>
                <p className="text-sm text-muted">
                  Access your member portal, reservations, and community
                  updates.
                </p>
              </div>

              <form className="mt-8 space-y-4" onSubmit={onSubmit}>
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                  hint="Use the email you registered with."
                />
                <Input
                  label="Password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                />

                <Button type="submit" className="w-full" loading={loading}>
                  Continue
                </Button>
              </form>

              <p className="mt-6 text-center text-xs text-muted">
                New to Jen’s Collective?{" "}
                <Link
                  className="font-semibold text-fg-soft hover:text-fg"
                  to="/sign-up"
                >
                  Create an account
                </Link>
              </p>
            </div>

            <p className="text-center text-[11px] text-muted">
              By continuing you agree to member guidelines and privacy
              practices.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
