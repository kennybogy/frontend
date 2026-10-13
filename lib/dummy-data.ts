import type { Board } from "./types";

export const initialBoard: Board = {
  columns: [
    {
      id: "col-backlog",
      title: "Backlog",
      cardIds: ["card-1", "card-2"],
    },
    {
      id: "col-ready",
      title: "Ready",
      cardIds: ["card-3"],
    },
    {
      id: "col-in-progress",
      title: "In Progress",
      cardIds: ["card-4", "card-5"],
    },
    {
      id: "col-review",
      title: "Review",
      cardIds: ["card-6"],
    },
    {
      id: "col-done",
      title: "Done",
      cardIds: ["card-7"],
    },
  ],
  cards: {
    "card-1": {
      id: "card-1",
      title: "Draft landing copy",
      details: "Write headline and supporting sentence for the hero.",
    },
    "card-2": {
      id: "card-2",
      title: "Collect brand assets",
      details: "Gather logo SVG and color tokens from design.",
    },
    "card-3": {
      id: "card-3",
      title: "Set up board layout",
      details: "Five columns with horizontal scroll on narrow screens.",
    },
    "card-4": {
      id: "card-4",
      title: "Wire drag and drop",
      details: "Move cards within and across columns using dnd-kit.",
    },
    "card-5": {
      id: "card-5",
      title: "Inline column rename",
      details: "Click a column title to edit; Enter saves, Esc cancels.",
    },
    "card-6": {
      id: "card-6",
      title: "Card add and delete",
      details: "Verify create form and delete control before ship.",
    },
    "card-7": {
      id: "card-7",
      title: "Seed dummy data",
      details: "Ship with sample cards so the board is not empty.",
    },
  },
};
