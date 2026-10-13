"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import type { Card as CardType } from "@/lib/types";

interface CardProps {
  card: CardType;
  onUpdate: (id: string, title: string, details: string) => void;
  onDelete: (id: string) => void;
}

export function Card({ card, onUpdate, onDelete }: CardProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(card.title);
  const [details, setDetails] = useState(card.details);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  function startEdit() {
    setTitle(card.title);
    setDetails(card.details);
    setEditing(true);
  }

  function saveEdit() {
    const nextTitle = title.trim();
    if (!nextTitle) return;
    onUpdate(card.id, nextTitle, details.trim());
    setEditing(false);
  }

  function cancelEdit() {
    setTitle(card.title);
    setDetails(card.details);
    setEditing(false);
  }

  function handleDelete() {
    if (window.confirm(`Delete card “${card.title}”?`)) {
      onDelete(card.id);
    }
  }

  return (
    <article
      ref={setNodeRef}
      style={style}
      data-testid={`card-${card.id}`}
      className={`group rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 shadow-sm ${
        isDragging ? "z-10 opacity-80 ring-2 ring-[var(--accent)]" : ""
      }`}
    >
      {editing ? (
        <div className="flex flex-col gap-2">
          <input
            aria-label="Card title"
            data-testid={`card-title-input-${card.id}`}
            className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-sm font-medium text-[var(--ink)] outline-none focus:border-[var(--accent)]"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveEdit();
              if (e.key === "Escape") cancelEdit();
            }}
            autoFocus
          />
          <textarea
            aria-label="Card details"
            data-testid={`card-details-input-${card.id}`}
            className="min-h-[72px] w-full resize-y rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-sm text-[var(--muted)] outline-none focus:border-[var(--accent)]"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") cancelEdit();
            }}
          />
          <div className="flex gap-2">
            <button
              type="button"
              data-testid={`card-save-${card.id}`}
              onClick={saveEdit}
              className="rounded-md bg-[var(--accent)] px-2.5 py-1 text-xs font-semibold text-[var(--accent-ink)]"
            >
              Save
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-md px-2.5 py-1 text-xs font-medium text-[var(--muted)] hover:text-[var(--ink)]"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start gap-2">
            <button
              type="button"
              aria-label={`Drag ${card.title}`}
              data-testid={`card-drag-${card.id}`}
              className="mt-0.5 cursor-grab touch-none rounded px-1 text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--ink)] active:cursor-grabbing"
              {...attributes}
              {...listeners}
            >
              ⋮⋮
            </button>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-[var(--ink)]">
                {card.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">
                {card.details}
              </p>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              data-testid={`card-edit-${card.id}`}
              onClick={startEdit}
              className="rounded-md px-2 py-1 text-xs font-medium text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--ink)]"
            >
              Edit
            </button>
            <button
              type="button"
              data-testid={`card-delete-${card.id}`}
              onClick={handleDelete}
              className="rounded-md px-2 py-1 text-xs font-medium text-[var(--danger)] hover:bg-[var(--danger-soft)]"
            >
              Delete
            </button>
          </div>
        </>
      )}
    </article>
  );
}
