export type CardId = string;
export type ColumnId = string;

export interface Card {
  id: CardId;
  title: string;
  details: string;
}

export interface Column {
  id: ColumnId;
  title: string;
  cardIds: CardId[];
}

export interface Board {
  columns: Column[];
  cards: Record<CardId, Card>;
}
