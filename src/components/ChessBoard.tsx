import { useCallback, useEffect, useState } from "react";
import { PieceBox } from "./chess/PieceBox";
import { DragDropProvider } from "@dnd-kit/react";
import { Cell } from "./chess/Cell";
import { BoardCell, BoardType, PieceMove, useWebSocket } from "@/hooks/useWebsocket";

interface ChessBoardProps{
  id: string;
}

// eslint-disable
const pieceOrder = ["R", "N", "B", "Q", "K", "B", "N", "R"];

const getPieceImage = (piece: string, color: string) => {
  if (piece){
    if (color === "white") {
      return `/chess/${piece}.png`;
    } else {
      return `/chess/${piece.toLowerCase()}_.png`;
    }
  }
};

const initialBoard = () => {
	const board = Array(8)
		.fill(null)
		.map(() => Array(8).fill(null));
	for (let i = 0; i < 8; i++) {
		board[0][i] = { piece: pieceOrder[i], color: "black" };
		board[1][i] = { piece: "P", color: "black" };
		board[6][i] = { piece: "P", color: "white" };
		board[7][i] = { piece: pieceOrder[i], color: "white" };
	}
	return board;
};

const ChessBoard = ({id}: ChessBoardProps) => {
  const [username] = useState(() => typeof window !== "undefined" ? "p" + Math.floor(Math.random() * 10000) : "");
  const { wsRef, color, error, moves, fen, setMove } = useWebSocket({id, username });
  const [board, setBoard] = useState<BoardType>(initialBoard());
  const [highlightedSquares, setHighlightedSquares] = useState<string[]>([]);
  const [filteredMoves, setFilteredMoves] = useState<PieceMove[]>([]);

  useEffect(() => {
    if (Array.isArray(moves) && color) {
      setFilteredMoves(moves.filter(m => m.color && m.color.toLowerCase() === color.toLowerCase()));
    } else {
      setFilteredMoves([]);
    }
  }, [moves, color]);

  // WebSocket connection is auto-initialized by useWebSocket
  useEffect(() => {
    console.log("Moves array:", moves);
  }, [moves]);

  // Parse FEN and update board when fen changes
  useEffect(() => {
    if (!fen) return;
    console.log("FEN update:", fen);
    try {
      const rows = fen.split(' ')[0].split('/');
      const newBoard = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      for (let r = 0; r < 8; r++) {
        let c = 0;
        for (const char of rows[r]) {
          if (/[1-8]/.test(char)) {
            c += parseInt(char);
          } else {
            const color = char === char.toUpperCase() ? "white" : "black";
            newBoard[r][c] = {
              piece: char.toUpperCase(),
              color
            };
            c++;
          }
        }
      }
      console.log("Parsed board:", newBoard);
      setBoard(newBoard);
    } catch (e) {
      console.error("FEN parse error:", e);
    }
  }, [fen]);

  const requestMoves = useCallback((moves: string[]) => {
    setHighlightedSquares(moves);
  }, []);

  const handleDragStart = useCallback((event: any) => {
    if (event.moves && Array.isArray(event.moves)) {
      setHighlightedSquares(event.moves);
      console.log("DragStart for", event.notation, "legalMoves:", event.moves);
    }
  }, []);

  if (!id) {
    return (
      <div className="flex flex-col w-full items-center p-3">
        <div className="mt-6">
          <BoardWhite board={initialBoard()} highlightedSquares={[]} requestMoves={() => {}} moves={[]} handleDragStart={() => {}}/>
        </div>
      </div>
    );
  }

	return (
		<DragDropProvider
      onDragStart={handleDragStart}
      onDragEnd={(event) => {
        if (event.canceled) return;
        const { source, target } = event.operation || {};
        if (!source || !target || !target.id) return;
        
        let moveStr = `${source.id.toString().replace("piece-","")}${target.id}`;
        const targetSquare = moveStr.slice(-2);

        if (!highlightedSquares || !highlightedSquares.includes(targetSquare)) {
          return;
        }

        if (color === "Black" && moveStr.length === 4) {
          const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
          const flipRank = (r: string) => (9 - parseInt(r)).toString();
          const flipFile = (f: string) => files[7 - files.indexOf(f)];
          const from = moveStr.slice(0,2);
          const to = moveStr.slice(2,4);
          const flippedFrom = files.indexOf(from[0]) !== -1 ? flipFile(from[0]) + flipRank(from[1]) : from;
          const flippedTo = files.indexOf(to[0]) !== -1 ? flipFile(to[0]) + flipRank(to[1]) : to;
          moveStr = `${flippedFrom}${flippedTo}`;
        }
        if (moveStr.length === 4 && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(moveStr);
          const destNotation = moveStr.slice(2,4);
          const destMoves = moves && Array.isArray(moves) ? moves.find(m => m.piece === destNotation)?.moves || [] : [];
          setMove("");
          setHighlightedSquares([]);
        }
      }}
		>
			<div className="flex flex-col w-full items-center p-3">
				<div className="mb-1 text-md">Username: <b>{username}</b></div>
				<div className="mb-1 text-md">Color: <b>{color}</b></div>
				{error && (
					<div className="mb-2 text-red-600 font-semibold bg-red-100 border border-red-300 rounded px-3 py-2 w-96 text-center">
						{error}
					</div>
				)}
        <div className="mt-6">
          {color === "White" ? (
            <BoardWhite board={Array.isArray(board) && Array.isArray(board[0]) ? board : initialBoard()} highlightedSquares={highlightedSquares} requestMoves={requestMoves} moves={filteredMoves} handleDragStart={handleDragStart} />
          ) : color === "Black" ? (
            <BoardBlack board={Array.isArray(board) && Array.isArray(board[0]) ? board : initialBoard()} highlightedSquares={highlightedSquares} requestMoves={requestMoves} moves={filteredMoves} handleDragStart={handleDragStart}/>
          ) : null}
				</div>
			</div>
		</DragDropProvider>
	);

};

const BoardWhite = ({ board, highlightedSquares, requestMoves, moves, handleDragStart }: { board: BoardType, highlightedSquares: string[], requestMoves: (moves: string[]) => void, moves: PieceMove[], handleDragStart: (event: any) => void }) => (
  <div className="grid grid-cols-8 grid-rows-8 w-full h-full aspect-square items-center justify-center bg-cover border-2 border-gray-700 relative" style={{ backgroundImage: 'url(/chess/board.png)' }}>
    {board.map((row, rIdx) =>
      row.map((cell, cIdx) => {
        const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
        const ranks = [8,7,6,5,4,3,2,1];
        const notation = files[cIdx] + ranks[rIdx];
        const isHighlighted = highlightedSquares && highlightedSquares.includes(notation);
        let legalMoves: string[] = [];
        if (moves && Array.isArray(moves)) {
          const found = moves.find(m => m && m.piece === notation);
          legalMoves = found && Array.isArray(found.moves) ? found.moves : [];
        }
        return (
          <Cell id={notation} key={notation} className={isHighlighted ? "ring-4 ring-yellow-400" : ""}>
            <PieceBox id={`piece-${notation}`} cIdx={cIdx} rIdx={rIdx} cell={cell} strPathImage={getPieceImage(cell?.piece || "", cell?.color || "")} moves={legalMoves} onRequestMoves={requestMoves} onDragStart={handleDragStart} />
          </Cell>
        );
      })
    )}
  </div>
);

const BoardBlack = ({ board, highlightedSquares, requestMoves, moves, handleDragStart}: { board: BoardType, highlightedSquares: string[], requestMoves: (moves: string[]) => void, moves: PieceMove[], handleDragStart: (event: any) => void }) => (
  <div className="grid grid-cols-8 grid-rows-8 w-full h-full aspect-square items-center justify-center bg-cover border-2 border-gray-700 relative" style={{ backgroundImage: 'url(/chess/board.png)' }}>
    {board.slice().reverse().map((row: BoardCell[], rIdx: number) =>
      row.slice().reverse().map((cell: BoardCell, cIdx: number) => {
        const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
        const ranks = [8,7,6,5,4,3,2,1];
        const notation = files[cIdx] + ranks[rIdx];
        const isHighlighted = highlightedSquares.includes(notation);
        let legalMoves: string[] = [];
        if (moves && Array.isArray(moves)) {
          const found = moves.find(m => m && m.piece === notation);
          legalMoves = found && Array.isArray(found.moves) ? found.moves : [];
        }
        return (
          <Cell id={notation} key={notation} className={isHighlighted ? "ring-4 ring-yellow-400" : ""}>
            <PieceBox id={`piece-${notation}`} cIdx={cIdx} rIdx={rIdx} cell={cell} strPathImage={getPieceImage(cell?.piece || "", cell?.color || "")} moves={legalMoves} onRequestMoves={requestMoves} onDragStart={handleDragStart} />
          </Cell>
        );
      })
    )}
  </div>
);

export default ChessBoard;