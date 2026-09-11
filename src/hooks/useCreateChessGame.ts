import { useMutation } from '@tanstack/react-query';

async function createChessGame() {
  const apiUrl = process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_CHESS_API_URL_PROD
    : process.env.NEXT_PUBLIC_CHESS_API_URL;
  const res = await fetch(`${apiUrl}/api/game/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  const responseText = await res.text();
  let data: unknown = responseText;

  try {
    data = responseText ? JSON.parse(responseText) : null;
  } catch {
    // Keep a plain-text response usable as a game id.
  }

  if (!res.ok) {
    const message = typeof data === "object" && data !== null && "message" in data
      ? String(data.message)
      : `Unable to create a game (${res.status})`;
    throw new Error(message);
  }

  if (typeof data === "number" || typeof data === "string") {
    return String(data).trim();
  }

  if (typeof data === "object" && data !== null) {
    const result = data as { id?: string | number; gameId?: string | number; game_id?: string | number };
    const id = result.id ?? result.gameId ?? result.game_id;
    if (id !== undefined && id !== null) return String(id);
  }

  return data;
}

export function useCreateChessGame() {
  const {mutate, isPending, isError, isSuccess, data} = useMutation({
    mutationFn: createChessGame,
  });

  return {mutate, isPending, isError, isSuccess, data}
}
