export interface Problem {
  id: string;
  fen: string;
  moves: string[];
  rating: number;
  themes: string[];
}

let problems: Problem[] = [];

export const loadProblems = async () => {
  try {
    console.log('Starting to load problems...');
    const response = await fetch('/puzzles.csv');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    console.log('CSV file fetched successfully');
    const text = await response.text();
    console.log('CSV content loaded, first 100 characters:', text.substring(0, 100));
    
    const lines = text.split('\n').filter(line => line.trim() !== '');
    console.log(`Found ${lines.length} lines in CSV`);
    
    // Ignorer l'en-tête
    const dataLines = lines.slice(1);
    
    problems = dataLines
      .map(line => {
        try {
          const parts = line.split(',');
          if (parts.length < 9) {
            console.warn('Invalid line format:', line);
            return null;
          }
          
          const [_, id, fen, moves, rating, __, ___, ____, themes] = parts;
          
          if (!id || !fen || !moves || !rating || !themes) {
            console.warn('Missing required fields:', { id, fen, moves, rating, themes });
            return null;
          }
          
          return {
            id,
            fen,
            moves: moves.split(' '),
            rating: parseInt(rating) || 1500,
            themes: themes.split(' ')
          };
        } catch (error) {
          console.warn('Error parsing line:', line, error);
          return null;
        }
      })
      .filter((problem): problem is Problem => problem !== null);
    
    console.log('Problems loaded successfully:', problems.length);
  } catch (error) {
    console.error('Error loading problems:', error);
    throw error;
  }
};

export const getRandomProblem = (): Problem | null => {
  if (problems.length === 0) {
    console.warn('No problems available');
    return null;
  }
  const randomIndex = Math.floor(Math.random() * problems.length);
  return problems[randomIndex];
}; 