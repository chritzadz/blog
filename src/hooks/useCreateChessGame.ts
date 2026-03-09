import { useMutation } from '@tanstack/react-query';

async function createChessGame() {
  const res = await fetch("https://chess-production-b906.up.railway.app/api/game/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to create game");
  const data = await res.json();
  return data;
}

export function useCreateChessGame() {
  const {mutate, isPending, isError, isSuccess, data} = useMutation({
    mutationFn: createChessGame,
  });

  return {mutate, isPending, isError, isSuccess, data}
}
