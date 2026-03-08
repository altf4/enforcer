import styled from 'styled-components';
import { useState, useMemo } from 'react';
import { FireIcon } from '@heroicons/react/24/solid';
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
  errorReason?: string;
  isHandwarmer?: boolean;
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

const HandwarmerToggleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.md} 0;
`;

const HandwarmerLabel = styled.label`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  transition: background ${({ theme }) => theme.transitions.fast};
  font-size: ${({ theme }) => theme.typography.sizes.small};
  color: ${({ theme }) => theme.colors.text.secondary};
  user-select: none;

  &:hover {
    background: ${({ theme }) => theme.colors.background.elevated};
  }
`;

const HiddenCheckbox = styled.input`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  pointer-events: none;
`;

const CustomCheckbox = styled.div<{ $checked: boolean }>`
  width: 18px;
  height: 18px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: 2px solid ${({ theme, $checked }) =>
    $checked ? '#f59e0b' : theme.colors.border};
  background: ${({ $checked }) =>
    $checked ? '#f59e0b' : 'transparent'};
  transition: all ${({ theme }) => theme.transitions.fast};
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  &::after {
    content: '';
    display: ${({ $checked }) => ($checked ? 'block' : 'none')};
    width: 5px;
    height: 9px;
    border: solid ${({ theme }) => theme.colors.text.primary};
    border-width: 0 2px 2px 0;
    transform: rotate(45deg) translate(-1px, -1px);
  }
`;

const FireIconSmall = styled.div`
  width: 16px;
  height: 16px;
  color: #f59e0b;

  svg {
    width: 100%;
    height: 100%;
  }
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

  const [showHandwarmers, setShowHandwarmers] = useState(false);

  const [enabledChecks, setEnabledChecks] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    CHECK_NAMES.forEach(name => { initial[name] = name !== 'Illegal SDI'; });
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
  // Handwarmers only count as pass/fail when the handwarmer toggle is on;
  // otherwise they are excluded from pass/fail and counted separately.
  const stats = useMemo(() => {
    let passed = 0, failed = 0, special = 0, handwarmers = 0;
    derivedResults.forEach(game => {
      if (game.isHandwarmer) {
        handwarmers++;
        if (!showHandwarmers) return;
      }
      const category = getResultCategory(game.effectiveOverallResult);
      if (category === 'passed') passed++;
      else if (category === 'failed') failed++;
      else special++;
    });
    return { passed, failed, special, handwarmers };
  }, [derivedResults, showHandwarmers]);

  const toggleVisibility = (category: keyof VisibilityState) => {
    setVisibility(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // Filter results based on visibility state
  const filteredResults = derivedResults.filter(game => {
    if (game.isHandwarmer && !showHandwarmers) return false;
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
            errorReason={game.errorReason}
            isHandwarmer={game.isHandwarmer}
            $delay={index * 50}
          />
        ))}
      </GamesContainer>
      {stats.handwarmers > 0 && (
        <HandwarmerToggleRow>
          <HandwarmerLabel>
            <HiddenCheckbox
              type="checkbox"
              checked={showHandwarmers}
              onChange={() => setShowHandwarmers(prev => !prev)}
            />
            <CustomCheckbox $checked={showHandwarmers} />
            <FireIconSmall>
              <FireIcon />
            </FireIconSmall>
            Show {stats.handwarmers} handwarmer{stats.handwarmers !== 1 ? 's' : ''}
          </HandwarmerLabel>
        </HandwarmerToggleRow>
      )}
    </ResultsContainer>
  );
};
