const pieceOrder = ["R", "N", "B", "Q", "K", "B", "N", "R"];

const getPieceImage = (piece: string, color: string) => {
	// Map piece to filename
  if (piece){
    if (color === "white") {
      return `/chess/${piece}.png`;
    } else {
      // Lowercase and add underscore for black
      return `/chess/${piece.toLowerCase()}_.png`;
    }
  }
};

const initialBoard = () => {
	const board = Array(8)
		.fill(null)
		.map(() => Array(8).fill(null));
	// Place black pieces
	for (let i = 0; i < 8; i++) {
		board[0][i] = { piece: pieceOrder[i], color: "black" };
		board[1][i] = { piece: "P", color: "black" };
		board[6][i] = { piece: "P", color: "white" };
		board[7][i] = { piece: pieceOrder[i], color: "white" };
	}
	return board;
};

import { useEffect, useRef, useState } from "react";
import { PieceBox } from "./chess/PieceBox";
import { DragDropProvider } from "@dnd-kit/react";
import { Cell } from "./chess/Cell";

interface ChessBoardProps{
  id: string;
}

const ChessBoard = ({id}: ChessBoardProps) => {
  const requestMoves = (square: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(`REQUEST:${square}`);
    }
  };
	const [highlightedSquares, setHighlightedSquares] = useState<string[]>([]);
	const [board, setBoard] = useState(initialBoard());
	const [ws, setWs] = useState<WebSocket | null>(null);
	const [username] = useState(() =>
		typeof window !== "undefined" ? "p" + Math.floor(Math.random() * 10000) : ""
	);
	const [messages, setMessages] = useState<string[]>([]);
	const [move, setMove] = useState("");
	const wsRef = useRef<WebSocket | null>(null);
	const [fen, setFen] = useState<string>("");
	const [color, setColor] = useState<string>("White");
	const [winner, setWinner] = useState<string>("");
	const [error, setError] = useState<string>("");

	useEffect(() => {
		if (!username || !id) return;
		const socket = new WebSocket(`wss://chess-production-b906.up.railway.app/game?id=${id}`);
		wsRef.current = socket;
		setWs(socket);
		socket.onopen = () => {
			socket.send(`USER:${username}`);
		};
		socket.onmessage = (event) => {
						// Highlight moves if MOVES: message received
						if (event.data && typeof event.data === "string" && event.data.startsWith("MOVES:")) {
							// Example: MOVES:e2,3e
							const movesStr = event.data.split(":")[1];
							if (movesStr) {
								// Split by comma, trim, and filter non-empty
								const moves = movesStr.split(",").map(m => m.trim()).filter(Boolean);
								setHighlightedSquares(moves);
							}else{
                setHighlightedSquares([]);
              }
						}
			setMessages((prev) => [...prev, event.data]);
			//Get broadcast message updated FENstring
			if (event.data && typeof event.data === "string" && event.data.includes("/")) {
				setFen(event.data);
			}
      if (event.data && typeof event.data === "string" && event.data.includes("REGISTERED")){
        setColor(event.data.split(":")[1]);
      } 
      if (event.data && typeof event.data === "string" && event.data.includes("END")){
        setWinner(event.data.split(":")[1]);
      }
			if (event.data && typeof event.data === "string" && event.data.includes("ERROR")){
				const errMsg = event.data.split(":")[1]?.trim() || "Illegal move";
				setError(errMsg);
			}
		};
		socket.onerror = (err) => {
			setMessages((prev) => [...prev, "WebSocket error"]);
		};
		socket.onclose = () => {
			setMessages((prev) => [...prev, "WebSocket closed"]);
		};
		return () => {
			socket.close();
		};
	}, [username, id]);

	useEffect(() => {
		if (!fen) return;
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
      // Synchronize board state with external FEN gameState from WebSocket
			setBoard(newBoard);
		} catch {}
	}, [fen]);

	// Helper: parse move string (e.g. e2e4) to board indices
	const notationToIdx = (notation: string) => {
		const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
		const ranks = [8,7,6,5,4,3,2,1];
		const file = notation[0];
		const rank = parseInt(notation[1]);
		const cIdx = files.indexOf(file);
		const rIdx = ranks.indexOf(rank);
		return { rIdx, cIdx };
	};

	const sendMove = () => {
		if (winner !== "" && (winner === "Black" || winner === "White")) {
			// Finish game, end game
			if (wsRef.current) {
				wsRef.current.close();
			}
			return;
		}
		if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && move) {
			wsRef.current.send(move);
			setMove("");
		}
		if (move.length === 4) {
			const from = move.slice(0,2);
			const to = move.slice(2,4);
			const { rIdx: fromR, cIdx: fromC } = notationToIdx(from);
			const { rIdx: toR, cIdx: toC } = notationToIdx(to);
			setBoard(prev => {
				const newBoard = prev.map(row => row.map(cell => cell ? { ...cell } : null));
				newBoard[toR][toC] = newBoard[fromR][fromC];
				newBoard[fromR][fromC] = null;
				return newBoard;
			});
		}
	};

	return (
		<DragDropProvider
			onDragEnd={(event) => {
				if (event.canceled) return;
				const { source, target } = event.operation || {};
        //check legal moves first, then allow send fo optimize request

				if (source && target && target.id) {
					let moveStr = `${source.id.toString().replace("piece-","")}${target.id}`;
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
					if (moveStr.length === 4) {
						const from = moveStr.slice(0,2);
						const to = moveStr.slice(2,4);
						const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
						const ranks = [8,7,6,5,4,3,2,1];
						const fromC = files.indexOf(from[0]);
						const fromR = ranks.indexOf(parseInt(from[1]));
						const toC = files.indexOf(to[0]);
						const toR = ranks.indexOf(parseInt(to[1]));
						setBoard(prev => {
							const newBoard = prev.map(row => row.map(cell => cell ? { ...cell } : null));
							newBoard[toR][toC] = newBoard[fromR][fromC];
							newBoard[fromR][fromC] = null;
							return newBoard;
						});
					}
					setMove(moveStr);
					if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
						wsRef.current.send(moveStr);
					}
				}
			}}
		>
			<div className="flex flex-col items-center mt-4">
				<div className="mb-2 text-lg">Username: <b>{username}</b></div>
				<div className="mb-4 text-lg">Color: <b>{color}</b></div>
				{error && (
					<div className="mb-2 text-red-600 font-semibold bg-red-100 border border-red-300 rounded px-3 py-2 w-96 text-center">
						{error}
					</div>
				)}
				<div className="flex items-center gap-2 mb-4">
					<input
						type="text"
						value={move}
						onChange={e => {
							setMove(e.target.value);
							if (error) setError("");
						}}
						placeholder="Enter move (e.g. e2e4)"
						className="px-3 py-2 border rounded"
					/>
					<button
						onClick={sendMove}
						disabled={!move || (winner !== "" && (winner === "Black" || winner === "White"))}
						className="px-4 py-2 bg-blue-600 text-white rounded font-semibold shadow"
					>Send Move</button>
				</div>
				<div className="mt-6">
					{color === "White" ? (
						<BoardWhite board={board} highlightedSquares={highlightedSquares} requestMoves={requestMoves} />
					) : color === "Black" ? (
						<BoardBlack board={board} highlightedSquares={highlightedSquares} requestMoves={requestMoves}/>
					) : null}
				</div>
			</div>
		</DragDropProvider>
	);

};

const BoardWhite = ({ board, highlightedSquares, requestMoves }: { board: any[][], highlightedSquares: string[], requestMoves: (square: string) => void }) => (
	<div className="grid grid-rows-8 grid-cols-8 bg-cover w-96 h-96 border-2 border-gray-700 relative" style={{ backgroundImage: 'url(/chess/board.png)' }}>
		{board.map((row, rIdx) =>
			row.map((cell, cIdx) => {
				const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
				const ranks = [8,7,6,5,4,3,2,1];
				const notation = files[cIdx] + ranks[rIdx];
				const isHighlighted = highlightedSquares.includes(notation);
				return (
					<Cell id={notation} key={notation}>
						<PieceBox id={`piece-${notation}`} cIdx={cIdx} rIdx={rIdx} cell={cell} strPathImage={getPieceImage(cell?.piece, cell?.color)} highlighted={isHighlighted} onRequestMoves={requestMoves} />
					</Cell>
				);
			})
		)}
	</div>
);

const BoardBlack = ({ board, highlightedSquares, requestMoves }: { board: any[][], highlightedSquares: string[], requestMoves : (square: string) => void }) => (
	<div className="grid grid-rows-8 grid-cols-8 bg-cover w-96 h-96 border-2 border-gray-700 relative" style={{ backgroundImage: 'url(/chess/board.png)' }}>
		{board.slice().reverse().map((row, rIdx) =>
			row.slice().reverse().map((cell, cIdx) => {
				const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
				const ranks = [8,7,6,5,4,3,2,1];
				const notation = files[cIdx] + ranks[rIdx];
				const isHighlighted = highlightedSquares.includes(notation);
				return (
					<Cell id={notation} key={notation}>
						<PieceBox id={`piece-${notation}`} cIdx={cIdx} rIdx={rIdx} cell={cell} strPathImage={getPieceImage(cell?.piece, cell?.color)} highlighted={isHighlighted} onRequestMoves={requestMoves} />
					</Cell>
				);
			})
		)}
	</div>
);

export default ChessBoard;