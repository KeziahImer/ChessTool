import { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { Box, Button, Stack, Typography, Alert, Chip, CircularProgress } from '@mui/material';
import { Problem, loadProblems, getRandomProblem } from '../data/problems';

const ChessboardComponent = () => {
  const [game, setGame] = useState(new Chess());
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [message, setMessage] = useState<string>('');
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>('white');

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      try {
        console.log('Initializing chessboard component...');
        await loadProblems();
        if (isMounted) {
          loadProblem();
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to initialize:', err);
        if (isMounted) {
          setError('Erreur lors du chargement des problèmes. Veuillez rafraîchir la page.');
          setIsLoading(false);
        }
      }
    };
    init();
    return () => {
      isMounted = false;
    };
  }, []);

  const loadProblem = () => {
    console.log('Loading new problem...');
    const problem = getRandomProblem();
    if (!problem) {
      console.log('No problem available');
      return;
    }

    console.log('Loading problem:', problem.id);
    const newGame = new Chess(problem.fen);
    setGame(newGame);
    setCurrentProblem(problem);
    setCurrentMoveIndex(0);
    setMessage('');
    setBoardOrientation(newGame.turn() === 'w' ? 'black' : 'white');

    setTimeout(() => makeOpponentMove(problem, newGame, 0), 1000);
  };

  const makeOpponentMove = (problem: Problem, currentGame: Chess, currentMoveIndex: number) => {
    if (currentMoveIndex >= problem.moves.length - 1) return;

    const opponentMove = problem.moves[currentMoveIndex];
    const from = opponentMove.substring(0, 2);
    const to = opponentMove.substring(2, 4);

    try {
      console.log(currentGame.fen())
      console.log('Opponent move:', opponentMove, 'at index:', currentMoveIndex);
      currentGame.move({ from, to, promotion: 'q' });
      setGame(new Chess(currentGame.fen()));
      setCurrentMoveIndex(currentMoveIndex + 1);
      setMessage('Trouvez le meilleur coup !');
    } catch (error) {
      console.error('Error making opponent move:', error);
    }
  };

  const checkMove = (from: string, to: string, game: Chess) => {
    if (!currentProblem) return false;
    
    const move = `${from}${to}`;
    const expectedMove = currentProblem.moves[currentMoveIndex];
    console.log('Player move:', move, 'expected:', expectedMove, 'at index:', currentMoveIndex);

    if (move === expectedMove) {
      if (currentMoveIndex === currentProblem.moves.length - 1) {
        setMessage('Bravo ! Vous avez résolu le problème !');
        return true;
      } else {
        setMessage('Bien joué ! Continuez...');
        setTimeout(() => makeOpponentMove(currentProblem, game, currentMoveIndex + 1), 1000);
        return true;
      }
    } else {
      setMessage('Ce n\'est pas le bon coup. Essayez encore !');
      return false;
    }
  };

  const handleShowSolution = () => {
    if (!currentProblem) return;
    setMessage('Solution : ' + currentProblem.moves.join(' → '));
  };

  if (isLoading) {
    return (
      <Stack spacing={2} alignItems="center" justifyContent="center" height="100vh">
        <CircularProgress />
        <Typography>Chargement des problèmes...</Typography>
      </Stack>
    );
  }

  if (error) {
    return (
      <Stack spacing={2} alignItems="center" justifyContent="center" height="100vh">
        <Alert severity="error">{error}</Alert>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Rafraîchir la page
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={2} alignItems="center">
      {currentProblem && (
        <>
          <Stack direction="row" spacing={1}>
            <Typography variant="h6">Problème #{currentProblem.id}</Typography>
            <Chip label={`Elo: ${currentProblem.rating}`} color="primary" />
          </Stack>
          <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
            {currentProblem.themes.map((theme, index) => (
              <Chip key={index} label={theme} size="small" />
            ))}
          </Stack>
        </>
      )}
      <Box sx={{ width: '600px', maxWidth: '100%' }}>
        <Chessboard
          position={game.fen()}
          boardWidth={600}
          boardOrientation={boardOrientation}
          onPieceDrop={(sourceSquare, targetSquare) => {
            try {
              const move = game.move({
                from: sourceSquare,
                to: targetSquare,
                promotion: 'q'
              });
              
              if (move === null) return false;
              
              if (checkMove(sourceSquare, targetSquare, game)) {
                setGame(new Chess(game.fen()));
                return true;
              }
              
              // Si le coup est incorrect, annuler le mouvement
              game.undo();
              setGame(new Chess(game.fen()));
              return false;
            } catch {
              return false;
            }
          }}
        />
      </Box>
      <Stack direction="row" spacing={2}>
        <Button variant="contained" onClick={loadProblem}>
          Nouveau Problème
        </Button>
        <Button 
          variant="contained" 
          onClick={handleShowSolution}
          color="secondary"
        >
          Voir la Solution
        </Button>
      </Stack>
      {message && (
        <Alert severity={message.includes('Bravo') ? 'success' : 'info'}>
          {message}
        </Alert>
      )}
    </Stack>
  );
};

export default ChessboardComponent; 