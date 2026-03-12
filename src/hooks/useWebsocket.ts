import { useCallback, useEffect, useRef, useState } from "react";

export interface UseWebSocketProp{
  id: string;
  username: string;
}

export function useWebSocket ({id, username} : UseWebSocketProp) {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [fen, setFen] = useState<string>("");
  const [color, setColor] = useState<string>("");
  const [winner, setWinner] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [move, setMove] = useState("");
  const [moves, setMoves] = useState<PieceMove[]>([]); // PieceMove[]
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!id || !username) return;
    const socket = new WebSocket(`wss://chess-production-b906.up.railway.app/game?id=${id}`);
    wsRef.current = socket;
    setWs(socket);
    socket.onopen = () => {
      socket.send(`USER:${username}`);
    };
    socket.onmessage = (event) => {
      if (event.data && typeof event.data === "string" && event.data.startsWith("MOVES:")) {
        const jsonStr = event.data.substring(event.data.indexOf(":") + 1);
        const data = JSON.parse(jsonStr);
        console.log(data);
        if (data.pieceMoves) {
          setMoves(data.pieceMoves);
        }
      }
      setMessages((prev) => [...prev, event.data]);
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
    socket.onerror = () => {
      setMessages((prev) => [...prev, "WebSocket error"]);
    };
    socket.onclose = () => {
      setMessages((prev) => [...prev, "WebSocket closed"]);
    };
    return () => {
      socket.close();
    };
  }, [id, username]);

  const notationToIdx = (notation: string) => {
		const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
		const ranks = [8,7,6,5,4,3,2,1];
		const file = notation[0];
		const rank = parseInt(notation[1]);
		const cIdx = files.indexOf(file);
		const rIdx = ranks.indexOf(rank);
		return { rIdx, cIdx };
	};

  const sendMove = useCallback((moveStr: string) => {
    if (winner !== "" && (winner === "Black" || winner === "White")) {
      if (wsRef.current) {
        wsRef.current.close();
      }
      return;
    }
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && moveStr) {
      wsRef.current.send(moveStr);
    }
  }, [winner]);
  
  return { sendMove, setMove, ws, wsRef, messages, color, winner, error, moves, move, fen }
}

// Type for moves array
export interface PieceMove {
  piece: string;
  color: string;
  moves: string[];
  type?: string;
  captures?: string[];
}

export type BoardCell = { piece: string, color: string } | null;
export type BoardType = BoardCell[][];