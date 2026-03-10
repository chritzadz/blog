'use client';

import ChessBoard from "@/components/ChessBoard";
import { useCreateChessGame } from "@/hooks/useCreateChessGame";
import { useLazyGetChessGame } from "@/hooks/useGetChessGame";

import { useState } from "react";

export default function ChessScreen() {
    const [gameStarted, setGameStarted] = useState(false);
    const [gameId, setGameId] = useState<string>("");
    const [inputId, setInputId] = useState("");
    const {mutate, isError, isPending, isSuccess, data} = useCreateChessGame();
    const { getGame } = useLazyGetChessGame();
    const [joinLoading, setJoinLoading] = useState(false);
    const [joinError, setJoinError] = useState<string | null>(null);

    const handleCreateGame = () => {
        mutate(undefined, {
            onSuccess: (id: string) => {
                setGameId(id);
                setGameStarted(true);
                console.log("Game created with ID:", id);
            },
            onError: (error: Error) => {
                console.error("Failed to create game: " + error);
            }
        })
    };

    const handleJoinGame = async () => {
        setJoinLoading(true);
        setJoinError(null);
        try {
            const result = await getGame(inputId);
            if (result) {
            setGameId(inputId);
            setGameStarted(true);
            } else {
            setJoinError("Game not found");
            }
        } catch (e) {
            setJoinError("Game not found");
        } finally {
            setJoinLoading(false);
        }
        };

    return (
        <div className="bg-gray-500 w-full h-full flex flex-row" style={{ fontFamily: 'Consolas, Times, serif' }}>
            {gameStarted ? (
                <div className="w-full h-full flex items-center justify-center">
                    <ChessBoard id={gameId}/>
                </div>
            ) : (
                <>
                    <div className="flex flex-col items-center justify-center w-6/10">
                        <div className="mt-8">
                            <ChessBoard id={gameId}/>
                        </div>
                    </div>
                    <div className="flex flex-col justify-center items-center gap-2 w-4/10 px-6 ">
                        <div className="flex items-center gap-2">
                          <button
                              className="px-2 py-3 bg-blue-600 text-white rounded text-lg font-semibold shadow"
                              onClick={handleCreateGame}
                          >
                              {isPending ? "Creating..." : "Create Game"}
                          </button>
                        </div>
                        <div className="flex items-center gap-2 w-full">
                            <input
                                type="text"
                                value={inputId}
                                onChange={e => setInputId(e.target.value)}
                                placeholder="Enter Game ID to join"
                                className="border rounded px-3 py-2 w-full"
                            />
                            <button
                                className=" bg-green-600 text-white rounded font-semibold shadow px-4 py-2"
                                onClick={handleJoinGame}
                                disabled={!inputId || joinLoading}
                                >
                                {joinLoading ? "Checking..." : "Join Game"}
                            </button>
                        </div>
                        {joinError && (
                            <div>{joinError}</div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

