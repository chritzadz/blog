// Mirrors of the Chess Multiplayer API OpenAPI schemas.

export interface Games {
  id: number;
}

export type MoveColor = "WHITE" | "BLACK";

export type PieceType = "Pawn" | "Knight" | "Bishop" | "Rook" | "Queen" | "King";

export interface PieceMoves {
  /** Algebraic origin square of the piece, e.g. "e2". */
  piece: string;
  /** Legal destination squares from the server payload. */
  moves: string[];
  type?: PieceType;
  color?: MoveColor;
}

export interface MovesPayload {
  turn: MoveColor;
  pieceMoves: PieceMoves[];
}

export type Winner = "WHITE" | "BLACK" | "DRAW";

/** Seat label as sent by the server in `REGISTERED:<White|Black>`. */
export type SeatColor = "White" | "Black";
