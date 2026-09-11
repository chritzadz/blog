import { useQueryClient } from '@tanstack/react-query';

async function fetchChessGame(id: string) {
  const apiUrl = process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_CHESS_API_URL_PROD
    : process.env.NEXT_PUBLIC_CHESS_API_URL;
  const res = await fetch(`${apiUrl}/api/game/id?id=${id}`);
  if (!res.ok) throw new Error('Game not found');
  return await res.json();
}

export function useLazyGetChessGame() {
  const queryClient = useQueryClient();

  const getGame = async (id: string) => {
    return await queryClient.fetchQuery({
      queryKey: ['chessGame', id],
      queryFn: () => fetchChessGame(id),
    });
  };

  return { ...queryClient, getGame };
}