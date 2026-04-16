import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Logo } from "@/components/brand/Logo";
import { Avatar } from "@/components/ui/Avatar";
import { currentUser } from "@/data/mockData";
import { cn } from "@/lib/cn";
import { getProfileAvatarUrl, subscribeProfileAvatar } from "@/lib/profileAvatarStorage";

const links = [
  { to: "/", label: "Home" },
  { to: "/events", label: "Events" },
  { to: "/members", label: "Memebers" },
  { to: "/community", label: "Feed" },
  { to: "/me/reservations", label: "Reservations" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [avatarSrc, setAvatarSrc] = useState<string | null>(() => getProfileAvatarUrl());

  useEffect(() => {
    return subscribeProfileAvatar(() => setAvatarSrc(getProfileAvatarUrl()));
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <button
          type="button"
          className="inline-flex rounded-xl border border-border bg-surface-2 p-2 text-fg md:hidden"
          aria-expanded={open}
          aria-label="Open menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>

        <Logo />

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                cn(
                  "rounded-xl px-3 py-2 text-sm font-medium text-fg-soft transition hover:bg-surface-2 hover:text-fg",
                  isActive && "bg-surface-2 text-fg ring-1 ring-accent/15",
                )
              }
              end={l.to === "/"}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/events/new"
            className="hidden rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm font-semibold text-fg transition hover:border-border-strong hover:bg-surface-3 sm:inline-flex"
          >
            Create event
          </Link>
          <Link
            to="/settings/notifications"
            className="hidden rounded-xl p-2 text-fg-soft transition hover:bg-surface-2 hover:text-fg md:inline-flex"
            aria-label="Notification settings"
          >
            <BellIcon />
          </Link>
          <Link
            to="/me/profile"
            className="inline-flex items-center gap-2 px-0 py-0.5 transition"
          >
            <Avatar
              initials={currentUser.initials}
              src={(avatarSrc ?? currentUser.avatarUrl) || undefined}
              title={currentUser.name}
              className="size-8"
            />
            <span className="hidden max-w-[9rem] truncate pr-1 text-xs font-semibold text-fg-soft sm:block">
              {currentUser.name}
            </span>
          </Link>
        </div>
      </div>

      {open ? (
        <div className="border-t border-border bg-surface/95 px-4 py-3 md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-2">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "rounded-xl px-3 py-2 text-sm font-semibold text-fg-soft hover:bg-surface-2",
                    isActive && "bg-surface-2 text-fg",
                  )
                }
                end={l.to === "/"}
              >
                {l.label}
              </NavLink>
            ))}
            <Link
              to="/settings/notifications"
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-2 text-sm font-semibold text-fg-soft hover:bg-surface-2"
            >
              Notifications
            </Link>
            <Link
              to="/me/profile"
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-2 text-sm font-semibold text-fg-soft hover:bg-surface-2"
            >
              My Profile
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2Z"
        fill="currentColor"
        opacity=".85"
      />
      <path
        d="M18 16v-5a6 6 0 1 0-12 0v5l-2 2h16l-2-2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 7h14M5 12h14M5 17h14"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 7l10 10M17 7 7 17"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
