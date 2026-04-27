import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { type GymEvent } from "@/data/mockData";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import {
  appendUserCreatedEvent,
  getUserCreatedEventById,
  localDateTimeToIsoRange,
  parseCategory,
  subscribeUserCreatedEvents,
  updateUserCreatedEvent,
} from "@/lib/userCreatedEvents";
import { displayNameForUser, initialsForUser } from "@/lib/userDisplay";

function buildGymEventFromForm(fd: FormData, host: GymEvent["host"]): GymEvent {
  const title = String(fd.get("title") ?? "").trim();
  const description = String(fd.get("description") ?? "").trim();
  const dateStr = String(fd.get("date") ?? "");
  const timeStr = String(fd.get("time") ?? "");
  const location = String(fd.get("location") ?? "").trim();
  const spots = Number(fd.get("spots"));
  const maxSpots = Number.isFinite(spots) && spots > 0 ? Math.floor(spots) : 10;
  const priceRaw = fd.get("price");
  const priceNum =
    priceRaw === null || priceRaw === "" ? null : Number(priceRaw);
  const priceCents =
    priceNum !== null && Number.isFinite(priceNum)
      ? Math.round(priceNum * 100)
      : null;
  const category = parseCategory(String(fd.get("category") ?? "Mobility"));
  const { startsAt, endsAt } = localDateTimeToIsoRange(dateStr, timeStr);

  return {
    id: `evt-local-${crypto.randomUUID()}`,
    title,
    description,
    longDescription: description,
    startsAt,
    endsAt,
    location,
    host,
    priceCents,
    maxSpots,
    reservedCount: 0,
    category,
    waitlistEnabled: true,
    imageHint: "community session",
  };
}

export function CreateEvent() {
  const toast = useToast();
  const navigate = useNavigate();
  const { eventId } = useParams();
  const { user } = useAuth();
  const [catalogVersion, setCatalogVersion] = useState(0);
  useEffect(
    () => subscribeUserCreatedEvents(() => setCatalogVersion((v) => v + 1)),
    [],
  );
  void catalogVersion;
  const editingEvent = eventId ? getUserCreatedEventById(eventId) : undefined;
  const isEditMode = Boolean(editingEvent);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const host: GymEvent["host"] = user
      ? {
          name: displayNameForUser(user),
          title: "Organizer",
          initials: initialsForUser(user),
        }
      : { name: "Host", title: "Organizer", initials: "HO" };
    const event = buildGymEventFromForm(fd, host);
    if (editingEvent) {
      updateUserCreatedEvent(editingEvent.id, {
        ...event,
        id: editingEvent.id,
        creatorUid: editingEvent.creatorUid,
      });
    } else {
      appendUserCreatedEvent({
        ...event,
        creatorUid: user?.uid,
      });
    }
    toast.push({
      variant: "success",
      title: isEditMode
        ? "Event updated and visible on the event board"
        : "Event is live and visible now on the event board",
    });
    navigate("/events", { replace: true });
  }

  const initialDate = editingEvent ? new Date(editingEvent.startsAt) : null;
  const initialDateValue = initialDate
    ? `${initialDate.getFullYear()}-${String(initialDate.getMonth() + 1).padStart(2, "0")}-${String(initialDate.getDate()).padStart(2, "0")}`
    : "";
  const initialTimeValue = initialDate
    ? `${String(initialDate.getHours()).padStart(2, "0")}:${String(initialDate.getMinutes()).padStart(2, "0")}`
    : "";

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button to="/events" variant="ghost" className="h-10 px-3">
          ← Cancel
        </Button>
        <p className="text-xs text-muted">Coach / admin posting flow (mock)</p>
      </div>

      <div className="mx-auto max-w-3xl space-y-3">
        <h1 className="font-display text-3xl tracking-tight text-fg sm:text-4xl">
          {isEditMode ? "Edit event" : "Create event"}
        </h1>
        <p className="text-sm text-muted">
          Publish a session with clear expectations. Members decide faster when
          pricing, capacity, and coaching voice are upfront.
        </p>
      </div>

      <form className="mx-auto max-w-3xl" onSubmit={onSubmit}>
        <Card>
          <CardHeader>
            <h2 className="font-display text-lg text-fg">Details</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <Input
              label="Title"
              name="title"
              placeholder="Aurora Flow — breath-led mobility"
              defaultValue={editingEvent?.title}
              required
            />
            <div>
              <label
                className="text-xs font-medium tracking-wide text-fg-soft"
                htmlFor="desc"
              >
                Description
              </label>
              <textarea
                id="desc"
                name="description"
                required
                rows={5}
                defaultValue={editingEvent?.description}
                placeholder="What should members expect? What should they bring?"
                className="mt-1.5 w-full resize-y rounded-xl border border-border bg-surface px-3 py-2 text-sm text-fg outline-none ring-white/0 transition placeholder:text-muted focus:border-accent/45 focus:ring-2 focus:ring-accent/20"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Date"
                name="date"
                type="date"
                defaultValue={initialDateValue}
                required
              />
              <Input
                label="Time"
                name="time"
                type="time"
                defaultValue={initialTimeValue}
                required
              />
            </div>

            <Input
              label="Location"
              name="location"
              placeholder="Studio B · Harbor Line"
              defaultValue={editingEvent?.location}
              required
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Max spots"
                name="spots"
                type="number"
                min={1}
                placeholder="14"
                defaultValue={editingEvent?.maxSpots}
                required
              />
              <Input
                label="Price (USD)"
                name="price"
                type="number"
                min={0}
                step={1}
                placeholder="28 (optional)"
                defaultValue={
                  editingEvent?.priceCents !== null &&
                  editingEvent?.priceCents !== undefined
                    ? Math.round(editingEvent.priceCents / 100)
                    : undefined
                }
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="category"
                className="text-xs font-medium tracking-wide text-fg-soft"
              >
                Category / type
              </label>
              <select
                id="category"
                name="category"
                className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm text-fg outline-none focus:border-accent/45 focus:ring-2 focus:ring-accent/20"
                defaultValue={editingEvent?.category ?? "Mobility"}
              >
                <option>Strength</option>
                <option>Conditioning</option>
                <option>Mobility</option>
                <option>Workshop</option>
                <option>Social</option>
              </select>
            </div>
            <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:justify-end">
              <Button type="submit" variant="primary" className="sm:w-auto">
                {isEditMode ? "Save event changes" : "Publish event"}
              </Button>
            </div>
          </CardBody>
        </Card>
      </form>
    </div>
  );
}
