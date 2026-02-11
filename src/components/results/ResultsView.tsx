import styled from 'styled-components';
import { useState, useMemo } from 'react';
import { StatusDashboard } from './StatusDashboard';
import { GameCard } from './GameCard';
import { CheckTogglePanel } from './CheckTogglePanel';
import { CHECK_NAMES } from '../../constants/checks';
import { CheckDataRow } from '../../ResultsTable';

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
  padding: 0 ${({ theme }) => theme.spacing.md};

  @media (min-width: ${({ theme }) => theme.breakpoints.tablet}) {
    max-width: 1000px;
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.desktop}) {
    max-width: 1200px;
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.wide}) {
    max-width: 1400px;
  }
`;

function deriveGameData(
  game: GameDataRow,
  enabledChecks: Record<string, boolean>
): { effectiveOverallResult: string; effectivePlayerResults: string[]; filteredDetails: CheckDataRow[] } {
  // Special games (handwarmer, too old, parse error) have no details — leave unchanged
  if (!game.details || game.details.length === 0) {
    return {
      effectiveOverallResult: game.overallResult,
      effectivePlayerResults: game.results,
      filteredDetails: [],
    };
  }

  const filteredDetails = game.details.filter(
    (check: CheckDataRow) => check.name === 'Control Stick Visualization' || enabledChecks[check.name] !== false
  );

  const effectivePlayerResults = game.results.map((originalResult, i) => {
    // Preserve non-active port markers
    if (originalResult === '' || originalResult === '⦻') return originalResult;

    const anyFailed = filteredDetails.some((check: CheckDataRow) => {
      if (check.name === 'Control Stick Visualization') return false;
      return check.passed[i].includes('❌');
    });
    return anyFailed ? '❌' : '✅';
  });

  const activePorts = effectivePlayerResults.filter(r => r !== '' && r !== '⦻');
  const anyPlayerFailed = activePorts.some(r => r.includes('❌'));
  const effectiveOverallResult = anyPlayerFailed ? '❌ Failed' : '✅ Passed';

  return { effectiveOverallResult, effectivePlayerResults, filteredDetails };
}

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

  const [enabledChecks, setEnabledChecks] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    CHECK_NAMES.forEach(name => { initial[name] = true; });
    return initial;
  });

  const toggleCheck = (checkName: string) => {
    setEnabledChecks(prev => ({ ...prev, [checkName]: !prev[checkName] }));
  };

  const enableAllChecks = () => {
    const all: Record<string, boolean> = {};
    CHECK_NAMES.forEach(name => { all[name] = true; });
    setEnabledChecks(all);
  };

  const disableAllChecks = () => {
    const none: Record<string, boolean> = {};
    CHECK_NAMES.forEach(name => { none[name] = false; });
    setEnabledChecks(none);
  };

  // Derive effective results based on enabled checks
  const derivedResults = useMemo(() =>
    results.map(game => {
      const derived = deriveGameData(game, enabledChecks);
      return { ...game, ...derived };
    }),
    [results, enabledChecks]
  );

  // Calculate stats from derived results
  const stats = useMemo(() => {
    let passed = 0, failed = 0, special = 0;
    derivedResults.forEach(game => {
      const category = getResultCategory(game.effectiveOverallResult);
      if (category === 'passed') passed++;
      else if (category === 'failed') failed++;
      else special++;
    });
    return { passed, failed, special };
  }, [derivedResults]);

  const toggleVisibility = (category: keyof VisibilityState) => {
    setVisibility(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // Filter results based on visibility state
  const filteredResults = derivedResults.filter(game => {
    const category = getResultCategory(game.effectiveOverallResult);
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

      <CheckTogglePanel
        enabledChecks={enabledChecks}
        onToggleCheck={toggleCheck}
        onEnableAll={enableAllChecks}
        onDisableAll={disableAllChecks}
      />

      <GamesContainer>
        {filteredResults.map((game, index) => (
          <GameCard
            key={`${game.filename}-${index}`}
            filename={game.filename}
            stage={game.stage}
            overallResult={game.effectiveOverallResult}
            results={game.effectivePlayerResults}
            controllerTypes={game.controllerTypes}
            characterIds={game.characterIds}
            costumes={game.costumes}
            details={game.filteredDetails}
            $delay={index * 50}
          />
        ))}
      </GamesContainer>
    </ResultsContainer>
  );
};
