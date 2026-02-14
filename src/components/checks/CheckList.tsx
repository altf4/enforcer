import { useState } from 'react';
import styled from 'styled-components';
import { CheckCircleIcon, XCircleIcon, MinusCircleIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { CheckDataRow } from '../../ResultsTable';
import { ViolationCard } from './ViolationCard';

interface CheckListProps {
  checks: CheckDataRow[];
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const CheckRowHeader = styled.div<{ $hasViolations: boolean }>`
  display: grid;
  grid-template-columns: 24px minmax(200px, 2fr) repeat(4, 1fr);
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  align-items: center;
  cursor: ${({ $hasViolations }) => ($hasViolations ? 'pointer' : 'default')};
  user-select: none;
  transition: background ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme, $hasViolations }) =>
      $hasViolations ? theme.colors.background.elevated : theme.colors.background.secondary};
  }

  @media (max-width: 768px) {
    grid-template-columns: 24px 1fr;
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

const CheckName = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.small};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};

  @media (max-width: 768px) {
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }
`;

const PlayerResults = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: 768px) {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: ${({ theme }) => theme.spacing.sm};
    grid-column: 1;
  }
`;

const PlayerResult = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.typography.sizes.small};
  color: ${({ theme }) => theme.colors.text.secondary};

  @media (min-width: 769px) {
    justify-content: center;
  }
`;

const IconWrapper = styled.div<{ $status: 'passed' | 'failed' | 'empty' }>`
  width: 20px;
  height: 20px;
  color: ${({ theme, $status }) => {
    if ($status === 'passed') return theme.colors.status.success;
    if ($status === 'failed') return theme.colors.status.error;
    return theme.colors.text.tertiary;
  }};
  flex-shrink: 0;
`;

const PlayerLabel = styled.span`
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  min-width: 20px;

  @media (max-width: 768px) {
    font-size: ${({ theme }) => theme.typography.sizes.caption};
  }
`;

const ChevronWrapper = styled.div<{ $isExpanded: boolean }>`
  width: 20px;
  height: 20px;
  color: ${({ theme }) => theme.colors.text.tertiary};
  transition: transform ${({ theme }) => theme.transitions.fast};
  transform: rotate(${({ $isExpanded }) => ($isExpanded ? '180deg' : '0deg')});
  flex-shrink: 0;
`;

const ViolationsPanel = styled.div<{ $isExpanded: boolean }>`
  max-height: ${({ $isExpanded }) => ($isExpanded ? '2000px' : '0')};
  overflow: hidden;
  transition: max-height ${({ theme }) => theme.transitions.slow};
`;

const ViolationsPanelContent = styled.div`
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};

  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing.md};
  }
`;

const PlayerViolationGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const PlayerViolationLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.small};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const getResultStatus = (result: string): 'passed' | 'failed' | 'empty' => {
  if (!result || result === '') return 'empty';
  if (result.includes('✅') || result.toLowerCase().includes('passed')) return 'passed';
  if (result.includes('❌') || result.toLowerCase().includes('failed')) return 'failed';
  return 'empty';
};

const getResultIcon = (status: 'passed' | 'failed' | 'empty') => {
  if (status === 'passed') return <CheckCircleIcon />;
  if (status === 'failed') return <XCircleIcon />;
  return <MinusCircleIcon />;
};

export const CheckList: React.FC<CheckListProps> = ({ checks }) => {
  const [expandedChecks, setExpandedChecks] = useState<Set<number>>(new Set());

  const toggleCheck = (index: number) => {
    setExpandedChecks((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <Container>
      {checks.map((check, index) => {
        // Skip Control Stick Visualization as it's not really a check
        if (check.name === "Control Stick Visualization") {
          return null;
        }

        // Collect violations across all players for this check
        const violationsByPlayer = check.violations
          .map((violations, playerIndex) => ({ playerIndex, violations }))
          .filter(({ violations }) => violations.length > 0);
        const hasViolations = violationsByPlayer.length > 0;
        const isExpanded = expandedChecks.has(index);

        return (
          <div key={index}>
            <CheckRowHeader
              $hasViolations={hasViolations}
              onClick={() => hasViolations && toggleCheck(index)}
            >
              {hasViolations ? (
                <ChevronWrapper $isExpanded={isExpanded}>
                  <ChevronDownIcon />
                </ChevronWrapper>
              ) : <div />}
              <CheckName>{check.name}</CheckName>
              <PlayerResults>
                {check.passed.map((result, playerIndex) => {
                  const status = getResultStatus(result);
                  return (
                    <PlayerResult key={playerIndex}>
                      <IconWrapper $status={status}>
                        {getResultIcon(status)}
                      </IconWrapper>
                      <PlayerLabel>P{playerIndex + 1}</PlayerLabel>
                    </PlayerResult>
                  );
                })}
              </PlayerResults>
            </CheckRowHeader>
            {hasViolations && (
              <ViolationsPanel $isExpanded={isExpanded}>
                <ViolationsPanelContent>
                  {violationsByPlayer.map(({ playerIndex, violations }) => (
                    <PlayerViolationGroup key={playerIndex}>
                      <PlayerViolationLabel>Player {playerIndex + 1}</PlayerViolationLabel>
                      {violations.map((violation, vIndex) => (
                        <ViolationCard key={vIndex} violation={violation} />
                      ))}
                    </PlayerViolationGroup>
                  ))}
                </ViolationsPanelContent>
              </ViolationsPanel>
            )}
          </div>
        );
      })}
    </Container>
  );
};
