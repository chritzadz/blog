import { type BoardGrid, type PieceColor, squareToIndices } from "./notation";

const KNIGHT_OFFSETS = [
  [-2, -1], [-2, 1], [-1, -2], [-1, 2],
  [1, -2], [1, 2], [2, -1], [2, 1],
];

const KING_OFFSETS = [
  [-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1],
];

const ORTHOGONAL_DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];
const DIAGONAL_DIRS = [[-1, -1], [-1, 1], [1, -1], [1, 1]];

/** Pure display helper derived from the authoritative FEN: is `square` attacked by `by`? */
export function isSquareAttacked(board: BoardGrid, square: string, by: PieceColor): boolean {
  const target = squareToIndices(square);
  if (!target) return false;
  const at = (r: number, c: number) => (r < 0 || r > 7 || c < 0 || c > 7 ? null : board[r][c]);

  for (const [dr, dc] of KNIGHT_OFFSETS) {
    const p = at(target.r + dr, target.c + dc);
    if (p && p.color === by && p.piece === "N") return true;
  }
  for (const [dr, dc] of KING_OFFSETS) {
    const p = at(target.r + dr, target.c + dc);
    if (p && p.color === by && p.piece === "K") return true;
  }
  // A white pawn attacks upward, so it threatens the target from the rank below.
  const pawnRow = by === "white" ? target.r + 1 : target.r - 1;
  for (const dc of [-1, 1]) {
    const p = at(pawnRow, target.c + dc);
    if (p && p.color === by && p.piece === "P") return true;
  }
  const scanRays = (dirs: number[][], pieces: string[]) => {
    for (const [dr, dc] of dirs) {
      let r = target.r + dr;
      let c = target.c + dc;
      while (r >= 0 && r <= 7 && c >= 0 && c <= 7) {
        const p = board[r][c];
        if (p) {
          if (p.color === by && pieces.includes(p.piece)) return true;
          break;
        }
        r += dr;
        c += dc;
      }
    }
    return false;
  };
  return (
    scanRays(ORTHOGONAL_DIRS, ["R", "Q"]) || scanRays(DIAGONAL_DIRS, ["B", "Q"])
  );
}
