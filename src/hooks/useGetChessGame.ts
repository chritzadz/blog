import { useQueryClient } from '@tanstack/react-query';

async function fetchChessGame(id: string) {
  const res = await fetch(`https://chess-production-b906.up.railway.app/api/game/id?id=${id}`);
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