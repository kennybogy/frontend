"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useEffect, useMemo, useState } from "react";
import { Column } from "./Column";
import { initialBoard } from "@/lib/dummy-data";
import type { Board, Card as CardType, ColumnId } from "@/lib/types";

function findColumnId(board: Board, id: string): ColumnId | undefined {
  if (board.columns.some((c) => c.id === id)) return id;
  return board.columns.find((c) => c.cardIds.includes(id))?.id;
}

export function KanbanBoard() {
  const [board, setBoard] = useState<Board>(initialBoard);
  const [activeCard, setActiveCard] = useState<CardType | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const cardsByColumn = useMemo(() => {
    return board.columns.map((column) => ({
      column,
      cards: column.cardIds
        .map((id) => board.cards[id])
        .filter((card): card is CardType => Boolean(card)),
    }));
  }, [board]);

  function renameColumn(columnId: string, title: string) {
    setBoard((prev) => ({
      ...prev,
      columns: prev.columns.map((col) =>
        col.id === columnId ? { ...col, title } : col,
      ),
    }));
  }

  function addCard(columnId: string, title: string, details: string) {
    const id = `card-${crypto.randomUUID()}`;
    setBoard((prev) => ({
      cards: {
        ...prev.cards,
        [id]: { id, title, details },
      },
      columns: prev.columns.map((col) =>
        col.id === columnId
          ? { ...col, cardIds: [...col.cardIds, id] }
          : col,
      ),
    }));
  }

  function updateCard(id: string, title: string, details: string) {
    setBoard((prev) => ({
      ...prev,
      cards: {
        ...prev.cards,
        [id]: { ...prev.cards[id], title, details },
      },
    }));
  }

  function deleteCard(id: string) {
    setBoard((prev) => {
      const cards = { ...prev.cards };
      delete cards[id];
      return {
        cards,
        columns: prev.columns.map((col) => ({
          ...col,
          cardIds: col.cardIds.filter((cardId) => cardId !== id),
        })),
      };
    });
  }

  function handleDragStart(event: DragStartEvent) {
    const card = board.cards[String(event.active.id)];
    setActiveCard(card ?? null);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const activeColumnId = findColumnId(board, activeId);
    const overColumnId = findColumnId(board, overId);
    if (!activeColumnId || !overColumnId || activeColumnId === overColumnId) {
      return;
    }

    setBoard((prev) => {
      const fromIndex = prev.columns.findIndex((c) => c.id === activeColumnId);
      const toIndex = prev.columns.findIndex((c) => c.id === overColumnId);
      if (fromIndex < 0 || toIndex < 0) return prev;

      const fromColumn = prev.columns[fromIndex];
      const toColumn = prev.columns[toIndex];
      if (!fromColumn.cardIds.includes(activeId)) return prev;

      const overIsColumn = overId === overColumnId;
      const overCardIndex = toColumn.cardIds.indexOf(overId);
      const insertIndex = overIsColumn
        ? toColumn.cardIds.length
        : overCardIndex >= 0
          ? overCardIndex
          : toColumn.cardIds.length;

      const nextFromIds = fromColumn.cardIds.filter((id) => id !== activeId);
      const nextToIds = [...toColumn.cardIds];
      if (!nextToIds.includes(activeId)) {
        nextToIds.splice(insertIndex, 0, activeId);
      }

      const columns = prev.columns.map((col, i) => {
        if (i === fromIndex) return { ...col, cardIds: nextFromIds };
        if (i === toIndex) return { ...col, cardIds: nextToIds };
        return col;
      });

      return { ...prev, columns };
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveCard(null);
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    setBoard((prev) => {
      const columnId = findColumnId(prev, activeId);
      if (!columnId) return prev;

      const columnIndex = prev.columns.findIndex((c) => c.id === columnId);
      const column = prev.columns[columnIndex];
      const oldIndex = column.cardIds.indexOf(activeId);
      const newIndex =
        overId === columnId
          ? column.cardIds.length - 1
          : column.cardIds.indexOf(overId);

      if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return prev;

      const columns = prev.columns.map((col, i) =>
        i === columnIndex
          ? { ...col, cardIds: arrayMove(col.cardIds, oldIndex, newIndex) }
          : col,
      );

      return { ...prev, columns };
    });
  }

  return (
    <div
      data-testid="kanban-board"
      data-ready={ready ? "true" : "false"}
      className="flex min-h-0 flex-1 flex-col"
    >
      <header className="shrink-0 border-b border-[var(--border)] px-6 py-5">
        <p className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-[var(--ink)] sm:text-4xl">
          Flowboard
        </p>
        <p className="mt-1 max-w-xl text-sm text-[var(--muted)]">
          One board, five columns — rename, add, delete, and drag cards. Changes
          live only in this session.
        </p>
      </header>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div
          data-testid="kanban-columns"
          className="flex flex-1 gap-4 overflow-x-auto px-6 py-6"
        >
          {cardsByColumn.map(({ column, cards }) => (
            <Column
              key={column.id}
              column={column}
              cards={cards}
              onRename={renameColumn}
              onAddCard={addCard}
              onUpdateCard={updateCard}
              onDeleteCard={deleteCard}
            />
          ))}
        </div>

        <DragOverlay>
          {activeCard ? (
            <div className="w-[256px] rounded-lg border border-[var(--accent)] bg-[var(--card)] p-3 shadow-lg">
              <h3 className="text-sm font-semibold text-[var(--ink)]">
                {activeCard.title}
              </h3>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {activeCard.details}
              </p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
