import { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { Box, TextField, Button, Stack, LinearProgress, Typography } from '@mui/material';
import Stockfish from 'stockfish';

const ChessboardComponent = () => {
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState(game.fen());
  const [evaluation, setEvaluation] = useState<number>(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [engine, setEngine] = useState<any>(null);

  useEffect(() => {
    // Initialiser Stockfish
    const stockfish = new Stockfish();
    setEngine(stockfish);

    // Configurer les handlers de messages
    stockfish.onmessage = (event: any) => {
      const message = event.data;
      if (message.includes('cp ')) {
        // Extraire l'évaluation en centipawns
        const cp = parseInt(message.split('cp ')[1].split(' ')[0]);
        setEvaluation(cp / 100); // Convertir en pawns
      }
    };

    return () => {
      stockfish.terminate();
    };
  }, []);

  const handleFenChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFen(event.target.value);
  };

  const loadPosition = () => {
    try {
      const newGame = new Chess(fen);
      setGame(newGame);
    } catch (error) {
      console.error('Invalid FEN:', error);
    }
  };

  const analyzePosition = () => {
    if (!engine) return;

    setIsAnalyzing(true);
    setEvaluation(0);

    // Configurer l'analyse
    engine.postMessage('position fen ' + game.fen());
    engine.postMessage('go depth 20');
  };

  const stopAnalysis = () => {
    if (!engine) return;

    engine.postMessage('stop');
    setIsAnalyzing(false);
  };

  // Convertir l'évaluation en pourcentage pour la barre de progression
  const getEvaluationPercentage = () => {
    // Convertir l'évaluation en une valeur entre 0 et 100
    // On suppose que l'évaluation est entre -10 et 10 pawns
    const normalizedEval = (evaluation + 10) / 20;
    return Math.min(Math.max(normalizedEval * 100, 0), 100);
  };

  return (
    <Stack spacing={2} alignItems="center">
      <Box sx={{ width: '600px', maxWidth: '100%' }}>
        <Chessboard
          position={game.fen()}
          boardWidth={600}
          onPieceDrop={(sourceSquare, targetSquare) => {
            try {
              const move = game.move({
                from: sourceSquare,
                to: targetSquare,
                promotion: 'q'
              });
              if (move === null) return false;
              setGame(new Chess(game.fen()));
              return true;
            } catch {
              return false;
            }
          }}
        />
      </Box>
      <Stack direction="row" spacing={2} width="100%" maxWidth="600px">
        <TextField
          label="FEN Position"
          value={fen}
          onChange={handleFenChange}
          variant="outlined"
          size="small"
          fullWidth
        />
        <Button variant="contained" onClick={loadPosition}>
          Load Position
        </Button>
        <Button 
          variant="contained" 
          onClick={isAnalyzing ? stopAnalysis : analyzePosition}
          color={isAnalyzing ? "error" : "primary"}
        >
          {isAnalyzing ? "Stop Analysis" : "Analyze"}
        </Button>
      </Stack>
      <Box width="100%" maxWidth="600px">
        <LinearProgress 
          variant="determinate" 
          value={getEvaluationPercentage()} 
          sx={{ height: 10, borderRadius: 5 }}
        />
        <Typography variant="body2" align="center" mt={1}>
          Evaluation: {evaluation.toFixed(2)} pawns
        </Typography>
      </Box>
    </Stack>
  );
};

export default ChessboardComponent; 