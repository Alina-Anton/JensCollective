import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { members } from "@/data/mockData";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { isAdminUser } from "@/lib/adminUsers";
import { isDemoModeEnabled } from "@/lib/demoMode";
import {
  deleteMemberDirectoryEntry,
  getMergedMemberDirectory,
  subscribeMemberDirectory,
} from "@/lib/memberDirectory";
import {
  deleteMemberProfileDoc,
  findMemberProfileForDirectoryMember,
  getMemberProfileByKeys,
  subscribeMemberProfileForUid,
  type MemberProfile,
} from "@/lib/memberProfileStorage";

function initialsFromName(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "M"
  );
}

function pickByName(name: string, items: string[]) {
  const base = Array.from(name).reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return items[base % items.length];
}

function buildTrainingFocus(name: string) {
  return pickByName(name, [
    "Guard retention",
    "Top control",
    "Escapes",
    "Leg locks",
    "Takedowns",
    "Pressure passing",
  ]);
}

function buildBelt(name: string) {
  return pickByName(name, [
    "White belt",
    "Blue belt",
    "Purple belt",
    "Brown belt",
    "Black belt",
  ]);
}

function buildHobby(name: string) {
  return pickByName(name, [
    "Hiking",
    "Coffee roasting",
    "Photography",
    "Chess",
    "Cycling",
    "Cooking",
  ]);
}

export function MemberProfilePage() {
  const { memberName } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const demoMode = isDemoModeEnabled();
  const [directoryVersion, setDirectoryVersion] = useState(0);
  const [remoteProfile, setRemoteProfile] = useState<MemberProfile | null>(
    null,
  );
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const decodedRef = decodeURIComponent(memberName ?? "");
  const canDeleteMember = isAdminUser(user);

  useEffect(
    () => subscribeMemberDirectory(() => setDirectoryVersion((v) => v + 1)),
    [],
  );

  const member = useMemo(() => {
    void directoryVersion;
    const allDirectoryMembers = getMergedMemberDirectory();
    const currentUserMember =
      user && user.displayName
        ? [
            {
              uid: user.uid,
              email: user.email ?? "",
              name: user.displayName,
              initials: initialsFromName(user.displayName),
              avatarUrl: user.photoURL ?? "",
            },
          ]
        : [];
    const merged = [
      ...allDirectoryMembers,
      ...(demoMode ? members : []),
      ...currentUserMember,
    ];
    const refLower = decodedRef.trim().toLowerCase();
    const matches = merged.filter((m) => {
      const row = m as { uid?: string; email?: string; name?: string };
      const em = row.email?.trim().toLowerCase() ?? "";
      const nm = row.name?.trim().toLowerCase() ?? "";
      return (
        row.uid === decodedRef ||
        em === refLower ||
        nm === refLower ||
        row.name === decodedRef
      );
    });
    if (!matches.length) return undefined;
    const preferReal = (list: typeof matches) => {
      const real = list.filter((m) => {
        const u = (m as { uid?: string }).uid;
        return Boolean(u && !u.startsWith("requested-"));
      });
      return real.length ? real : list;
    };
    const pool = preferReal(matches);
    return (
      pool.find((m) => Boolean((m as { avatarUrl?: string }).avatarUrl)) ??
      pool[0]
    );
  }, [decodedRef, user, demoMode, directoryVersion]);

  const profileUid = (member as { uid?: string } | undefined)?.uid;
  useEffect(() => {
    return subscribeMemberProfileForUid(profileUid, setRemoteProfile);
  }, [profileUid]);

  const memberProfile =
    remoteProfile ??
    getMemberProfileByKeys([
      decodedRef,
      (member as { uid?: string }).uid,
      (member as { email?: string }).email,
      member?.name,
    ]) ??
    findMemberProfileForDirectoryMember({
      uid: (member as { uid?: string }).uid,
      email: (member as { email?: string }).email,
      name: member?.name,
    });

  if (!member) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-3xl tracking-tight text-fg sm:text-4xl">
          Member not found
        </h1>
        <p className="text-sm text-muted">
          This member may have been removed from the directory.
        </p>
        <Button to="/members" variant="secondary">
          Back to Members
        </Button>
      </div>
    );
  }

  function onDeleteMember() {
    if (!canDeleteMember) return;
    setShowDeletePopup(true);
  }

  function onConfirmDeleteMember() {
    const currentMember = member;
    if (!currentMember) return;
    const memberUid = (currentMember as { uid?: string }).uid;
    if (!memberUid) {
      toast.push({
        variant: "error",
        title: "Cannot delete member",
        description: "This member does not have a removable account id.",
      });
      setShowDeletePopup(false);
      return;
    }
    deleteMemberDirectoryEntry(memberUid);
    deleteMemberProfileDoc(memberUid);
    setShowDeletePopup(false);
    toast.push({
      variant: "success",
      title: "Member deleted",
      description: `${currentMember.name} was removed from the member directory.`,
    });
    navigate("/members", { replace: true });
  }

  return (
    <div className="space-y-8">
      <div className="mb-[10px]">
        <Link
          to="/members"
          className="text-sm font-medium text-fg-soft transition hover:text-fg"
        >
          ← Back to Members
        </Link>
      </div>

      <Card>
        <CardBody className="space-y-5">
          <div className="flex items-center gap-4">
            <Avatar
              initials={member.initials}
              src={member.avatarUrl}
              title={member.name}
              className="size-14 text-base"
            />
            <div>
              <p className="text-lg font-semibold text-fg">{member.name}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface/40 p-4 space-y-3">
            <div>
              <p className="text-xs font-semibold tracking-wide text-muted">
                Name
              </p>
              <p className="mt-1 text-sm text-fg-soft">{member.name}</p>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wide text-muted">
                Training Focus
              </p>
              <p className="mt-1 text-sm text-fg-soft">
                {memberProfile?.trainingFocus ||
                  (demoMode
                    ? buildTrainingFocus(member.name)
                    : "Not shared yet")}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wide text-muted">
                Belt
              </p>
              <p className="mt-1 text-sm text-fg-soft">
                {memberProfile?.belt ||
                  (demoMode ? buildBelt(member.name) : "Not shared yet")}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wide text-muted">
                Hobby
              </p>
              <p className="mt-1 text-sm text-fg-soft">
                {memberProfile?.hobby ||
                  (demoMode ? buildHobby(member.name) : "Not shared yet")}
              </p>
            </div>
            {memberProfile?.shareContactInfo ? (
              <>
                <div>
                  <p className="text-xs font-semibold tracking-wide text-muted">
                    Phone
                  </p>
                  <p className="mt-1 text-sm text-fg-soft">
                    {memberProfile.phone || "Not shared yet"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-wide text-muted">
                    Emergency Contact
                  </p>
                  <p className="mt-1 text-sm text-fg-soft">
                    {memberProfile.emergencyContact || "Not shared yet"}
                  </p>
                </div>
              </>
            ) : null}
            <div>
              <p className="text-xs font-semibold tracking-wide text-muted">
                About Me
              </p>
              <p className="mt-1 text-sm leading-relaxed text-fg-soft">
                {memberProfile?.aboutMe ||
                  (demoMode
                    ? `${member.name} trains consistently and brings positive energy to the mats. Focused on improving technique, supporting teammates, and building confidence through regular training.`
                    : "No about section shared yet.")}
              </p>
            </div>
          </div>

          {canDeleteMember ? (
            <Button
              type="button"
              variant="danger"
              className="w-full"
              onClick={onDeleteMember}
            >
              Delete this member
            </Button>
          ) : null}
        </CardBody>
      </Card>

      {showDeletePopup ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-5 shadow-card">
            <p className="mt-2 text-sm text-muted">
              Are you sure you want to delete this member permanently?
            </p>
            <div className="mt-5 flex gap-2">
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => setShowDeletePopup(false)}
              >
                No
              </Button>
              <Button
                type="button"
                variant="danger"
                className="w-full"
                onClick={onConfirmDeleteMember}
              >
                Yes
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
