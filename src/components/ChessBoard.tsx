import React from "react";
import Image from "next/image";


const pieceOrder = ["R", "N", "B", "Q", "K", "B", "N", "R"];

const getPieceImage = (piece: string, color: string) => {
	// Map piece to filename
	if (color === "white") {
		return `/chess/${piece}.png`;
	} else {
		// Lowercase and add underscore for black
		return `/chess/${piece.toLowerCase()}_.png`;
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

interface ChessBoardProps{
  id: string;
}

const ChessBoard = ({id}: ChessBoardProps) => {
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

	useEffect(() => {
		if (!username || !id) return;
		const socket = new WebSocket(`wss://chess-production-b906.up.railway.app/game?id=${id}`);
		wsRef.current = socket;
		setWs(socket);
		socket.onopen = () => {
			socket.send(`USER:${username}`);
		};
		socket.onmessage = (event) => {
			setMessages((prev) => [...prev, event.data]);
			//Get broadcast message updated FENstring
			if (event.data && typeof event.data === "string" && event.data.includes("/")) {
				setFen(event.data);
			}
      if (event.data && typeof event.data === "string" && event.data.includes("REGISTERED")){
        setColor(event.data.split(":")[1]);
      } 
      if (event.data && typeof event.data === "string" && event.data.includes("END")){
        setWinner(event.data.split(":")[1])
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
	};

	return (
		<div className="flex flex-col items-center mt-4">
			<div className="mb-2 text-lg">Username: <b>{username}</b></div>
			<div className="mb-4 text-lg">Color: <b>{color}</b></div>
			<div className="flex items-center gap-2 mb-4">
				<input
					type="text"
					value={move}
					onChange={e => setMove(e.target.value)}
					placeholder="Enter move (e.g. e2e4)"
					className="px-3 py-2 border rounded"
				/>
				<button
					onClick={sendMove}
					disabled={!move || (winner !== "" && (winner === "Black" || winner === "White"))}
					className="px-4 py-2 bg-blue-600 text-white rounded font-semibold shadow"
				>Send Move</button>
			</div>
			{/* <div className="mt-2 max-h-32 overflow-y-auto bg-gray-100 border border-gray-300 p-2 w-96">
				<b>Messages:</b>
				<ul className="pl-4">
					{messages.map((msg, idx) => (
						<li key={idx}>{msg}</li>
					))}
				</ul>
			</div> */}
      <div className="mt-6">
        {color === "White" ? (
          <BoardWhite board={board} />
        ) : color === "Black" ? (
          <BoardBlack board={board} />
        ) : null}
      </div>
		</div>
	);

};

const BoardWhite = ({ board }: { board: any[][] }) => (
	<div className="grid grid-rows-8 grid-cols-8 bg-cover w-96 h-96 border-2 border-gray-700 relative" style={{ backgroundImage: 'url(/chess/board.png)' }}>
		{board.map((row, rIdx) =>
			row.map((cell, cIdx) => (
				<div
					key={rIdx + "-" + cIdx}
					className="w-12 h-12 relative"
				>
					{cell && (
						<Image
							src={getPieceImage(cell.piece, cell.color)}
							alt={cell.color + " " + cell.piece}
							width={44}
							height={44}
							className="w-11 h-11 m-0.5"
							priority
						/>
					)}
				</div>
			))
		)}
	</div>
);

const BoardBlack = ({ board }: { board: any[][] }) => (
	<div className="grid grid-rows-8 grid-cols-8 bg-cover w-96 h-96 border-2 border-gray-700 relative" style={{ backgroundImage: 'url(/chess/board.png)' }}>
		{board.slice().reverse().map((row, rIdx) =>
			row.slice().reverse().map((cell, cIdx) => (
				<div
					key={rIdx + "-" + cIdx}
					className="w-12 h-12 relative"
				>
					{cell && (
						<Image
							src={getPieceImage(cell.piece, cell.color)}
							alt={cell.color + " " + cell.piece}
							width={44}
							height={44}
							className="w-11 h-11 m-0.5"
							priority
						/>
					)}
				</div>
			))
		)}
	</div>
);

export default ChessBoard;