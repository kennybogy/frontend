"use client";

import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { useState } from "react";
import { Card } from "./Card";
import type { Card as CardType, Column as ColumnType } from "@/lib/types";

interface ColumnProps {
  column: ColumnType;
  cards: CardType[];
  onRename: (columnId: string, title: string) => void;
  onAddCard: (columnId: string, title: string, details: string) => void;
  onUpdateCard: (id: string, title: string, details: string) => void;
  onDeleteCard: (id: string) => void;
}

export function Column({
  column,
  cards,
  onRename,
  onAddCard,
  onUpdateCard,
  onDeleteCard,
}: ColumnProps) {
  const [renaming, setRenaming] = useState(false);
  const [titleDraft, setTitleDraft] = useState(column.title);
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDetails, setNewDetails] = useState("");

  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  function startRename() {
    setTitleDraft(column.title);
    setRenaming(true);
  }

  function commitRename() {
    const next = titleDraft.trim();
    if (next) onRename(column.id, next);
    else setTitleDraft(column.title);
    setRenaming(false);
  }

  function cancelRename() {
    setTitleDraft(column.title);
    setRenaming(false);
  }

  function submitAdd(e: React.FormEvent) {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;
    onAddCard(column.id, title, newDetails.trim());
    setNewTitle("");
    setNewDetails("");
    setAdding(false);
  }

  return (
    <section
      data-testid={`column-${column.id}`}
      data-column-id={column.id}
      className={`flex w-[280px] shrink-0 flex-col rounded-xl border border-[var(--border)] bg-[var(--column)] ${
        isOver ? "ring-2 ring-[var(--accent)]" : ""
      }`}
    >
      <header className="flex items-center justify-between gap-2 border-b border-[var(--border)] px-3 py-3">
        {renaming ? (
          <input
            aria-label="Column title"
            data-testid={`column-title-input-${column.id}`}
            className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-sm font-semibold text-[var(--ink)] outline-none focus:border-[var(--accent)]"
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename();
              if (e.key === "Escape") cancelRename();
            }}
            autoFocus
          />
        ) : (
          <button
            type="button"
            data-testid={`column-title-${column.id}`}
            onClick={startRename}
            className="truncate text-left text-sm font-semibold tracking-wide text-[var(--ink)] hover:text-[var(--accent)]"
            title="Click to rename"
          >
            {column.title}
          </button>
        )}
        <span
          data-testid={`column-count-${column.id}`}
          className="shrink-0 rounded-md bg-[var(--surface)] px-2 py-0.5 text-xs font-medium text-[var(--muted)]"
        >
          {cards.length}
        </span>
      </header>

      <div
        ref={setNodeRef}
        data-testid={`column-drop-${column.id}`}
        className="flex min-h-[120px] flex-1 flex-col gap-2 overflow-y-auto p-3"
      >
        <SortableContext
          items={column.cardIds}
          strategy={verticalListSortingStrategy}
        >
          {cards.map((card) => (
            <Card
              key={card.id}
              card={card}
              onUpdate={onUpdateCard}
              onDelete={onDeleteCard}
            />
          ))}
        </SortableContext>
      </div>

      <footer className="border-t border-[var(--border)] p-3">
        {adding ? (
          <form
            onSubmit={submitAdd}
            data-testid={`add-card-form-${column.id}`}
            className="flex flex-col gap-2"
          >
            <input
              required
              aria-label="New card title"
              data-testid={`add-card-title-${column.id}`}
              placeholder="Title"
              className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-sm outline-none focus:border-[var(--accent)]"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              autoFocus
            />
            <textarea
              aria-label="New card details"
              data-testid={`add-card-details-${column.id}`}
              placeholder="Details"
              className="min-h-[64px] w-full resize-y rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-sm outline-none focus:border-[var(--accent)]"
              value={newDetails}
              onChange={(e) => setNewDetails(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                data-testid={`add-card-submit-${column.id}`}
                className="rounded-md bg-[var(--accent)] px-2.5 py-1.5 text-xs font-semibold text-[var(--accent-ink)]"
              >
                Add card
              </button>
              <button
                type="button"
                onClick={() => {
                  setAdding(false);
                  setNewTitle("");
                  setNewDetails("");
                }}
                className="rounded-md px-2.5 py-1.5 text-xs font-medium text-[var(--muted)]"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            data-testid={`add-card-${column.id}`}
            onClick={() => setAdding(true)}
            className="w-full rounded-md border border-dashed border-[var(--border)] px-2 py-2 text-left text-sm text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--ink)]"
          >
            + Add card
          </button>
        )}
      </footer>
    </section>
  );
}
