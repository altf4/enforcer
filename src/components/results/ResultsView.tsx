import styled from 'styled-components';
import { useState } from 'react';
import { StatusDashboard } from './StatusDashboard';
import { GameCard } from './GameCard';

interface GameDataRow {
  filename: string;
  stage: number;
  overallResult: string;
  results: string[];
  controllerTypes: string[];
  characterIds: number[];
  costumes: number[];
  details?: any[];
}

interface ResultsViewProps {
  results: GameDataRow[];
}

interface VisibilityState {
  passed: boolean;
  failed: boolean;
  special: boolean;
}

const ResultsContainer = styled.div`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.lg} 0;
`;

const GamesContainer = styled.div`
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.lg};
`;

const calculateStats = (results: GameDataRow[]) => {
  let passed = 0;
  let failed = 0;
  let special = 0;

  results.forEach((game) => {
    if (game.overallResult.includes('Passed') || game.overallResult.includes('✅')) {
      passed++;
    } else if (game.overallResult.includes('Failed') || game.overallResult.includes('❌')) {
      failed++;
    } else {
      special++;
    }
  });

  return { passed, failed, special };
};

const getResultCategory = (result: string): 'passed' | 'failed' | 'special' => {
  if (result.includes('Passed') || result.includes('✅')) return 'passed';
  if (result.includes('Failed') || result.includes('❌')) return 'failed';
  return 'special';
};

export const ResultsView: React.FC<ResultsViewProps> = ({ results }) => {
  // Default: show only failed results
  const [visibility, setVisibility] = useState<VisibilityState>({
    passed: false,
    failed: true,
    special: false,
  });

  const stats = calculateStats(results);

  const toggleVisibility = (category: keyof VisibilityState) => {
    setVisibility(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // Filter results based on visibility state
  const filteredResults = results.filter(game => {
    const category = getResultCategory(game.overallResult);
    return visibility[category];
  });

  return (
    <ResultsContainer>
      <StatusDashboard
        totalFiles={results.length}
        passedCount={stats.passed}
        failedCount={stats.failed}
        specialCount={stats.special}
        visibility={visibility}
        onToggleVisibility={toggleVisibility}
      />

      <GamesContainer>
        {filteredResults.map((game, index) => (
          <GameCard
            key={`${game.filename}-${index}`}
            filename={game.filename}
            stage={game.stage}
            overallResult={game.overallResult}
            results={game.results}
            controllerTypes={game.controllerTypes}
            characterIds={game.characterIds}
            costumes={game.costumes}
            details={game.details}
            $delay={index * 50}
          />
        ))}
      </GamesContainer>
    </ResultsContainer>
  );
};
