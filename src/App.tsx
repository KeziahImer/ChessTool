import { Container, Typography, Stack } from '@mui/material';
import Chessboard from './components/Chessboard';

function App() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={4}>
        <Typography variant="h3" component="h1" align="center">
          Puzzles
        </Typography>
        <Chessboard />
      </Stack>
    </Container>
  );
}

export default App;
