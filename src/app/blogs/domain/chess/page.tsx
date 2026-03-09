'use client';


import ArticleSection from "@/components/ArticleSection";
import ChessBoard from "@/components/ChessBoard";
import { useCreateChessGame } from "@/hooks/useCreateChessGame";
import { useLazyGetChessGame } from "@/hooks/useGetChessGame";

import { useState } from "react";

export default function ChessGame() {
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
        <div className="" style={{ fontFamily: 'Consolas, Times, serif' }}>
            <h1 className="text-6xl font-bold">Chess Game</h1>
            <div className="mt-8">
                <ArticleSection id="intro" title="Introduction">
                    <p className="mt-4">
                        This is a simple page for the Chess game domain. You can expand this page to include rules, strategies, or even an interactive chess board in the future.
                    </p>
                </ArticleSection>
            </div>
            <div className="mt-12 flex flex-col items-center gap-4">
                <button
                    className="px-6 py-3 bg-blue-600 text-white rounded text-lg font-semibold shadow"
                    onClick={handleCreateGame}
                >
                    {isPending ? "Creating..." : "Create Game"}
                </button>
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={inputId}
                        onChange={e => setInputId(e.target.value)}
                        placeholder="Enter Game ID to join"
                        className="px-3 py-2 border rounded"
                    />
                    <button
                        className="px-4 py-2 bg-green-600 text-white rounded font-semibold shadow"
                        onClick={handleJoinGame}
                        disabled={!inputId || joinLoading}
                        >
                        {joinLoading ? "Checking..." : "Join Game"}
                    </button>
                </div>
            </div>
            {gameStarted && (
                <div className="mt-8">
                    <h2 className="text-3xl font-bold mb-4">Game ID: {gameId}</h2>
                    <ChessBoard id={gameId}/>
                </div>
            )}
        </div>
    );
}

