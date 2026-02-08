import styled from 'styled-components';
import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { fadeInUp } from '../../styles/animations';
import { GameCardHeader } from './GameCardHeader';
import { GameCardDetails } from './GameCardDetails';

interface GameCardProps {
  filename: string;
  stage: number;
  overallResult: string;
  results: string[];
  controllerTypes: string[];
  characterIds: number[];
  costumes: number[];
  details?: any[];
  $delay?: number;
}

const getStatusColor = (result: string, theme: any) => {
  if (result.includes('Passed') || result.includes('✅')) return theme.colors.status.success;
  if (result.includes('Failed') || result.includes('❌')) return theme.colors.status.error;
  if (result.includes('Handwarmer') || result.includes('🔥')) return theme.colors.status.warning;
  if (result.includes('Too Old') || result.includes('💀')) return theme.colors.text.tertiary;
  return theme.colors.border;
};

const getStatusType = (result: string): 'passed' | 'failed' | 'warning' => {
  if (result.includes('Passed') || result.includes('✅')) return 'passed';
  if (result.includes('Failed') || result.includes('❌')) return 'failed';
  return 'warning';
};

const CardContainer = styled.div<{ $statusColor: string; $delay: number }>`
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-left: 4px solid ${({ $statusColor }) => $statusColor};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  overflow: hidden;
  transition: all ${({ theme }) => theme.transitions.normal};
  animation: ${fadeInUp} 0.4s ease-out forwards;
  animation-delay: ${({ $delay }) => $delay}ms;
  opacity: 0;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.medium};
    border-color: ${({ $statusColor }) => $statusColor};
  }
`;

const CardHeaderWrapper = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  cursor: pointer;
  user-select: none;
  outline: none;
  border-radius: ${({ theme }) => theme.borderRadius.lg} ${({ theme }) => theme.borderRadius.lg} 0 0;
  transition: background ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.background.elevated};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent.primary};
    outline-offset: -2px;
  }
`;

const ExpandButton = styled.button`
  background: ${({ theme }) => theme.colors.background.elevated};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.text.secondary};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.typography.sizes.small};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  transition: all ${({ theme }) => theme.transitions.fast};
  margin-top: ${({ theme }) => theme.spacing.md};
  width: 100%;
  justify-content: center;

  svg {
    width: 16px;
    height: 16px;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.accent.primary};
    color: ${({ theme }) => theme.colors.text.primary};
    border-color: ${({ theme }) => theme.colors.accent.primary};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent.primary};
    outline-offset: 2px;
  }
`;

const DetailsContainer = styled.div<{ $isExpanded: boolean }>`
  max-height: ${({ $isExpanded }) => ($isExpanded ? '5000px' : '0')};
  overflow: hidden;
  transition: max-height ${({ theme }) => theme.transitions.slow};
  background: ${({ theme }) => theme.colors.background.primary};
  border-top: ${({ $isExpanded, theme }) =>
    $isExpanded ? `1px solid ${theme.colors.border}` : 'none'};
`;

const DetailsContent = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const GameCard: React.FC<GameCardProps> = ({
  filename,
  stage,
  overallResult,
  results,
  controllerTypes,
  characterIds,
  costumes,
  details,
  $delay = 0,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <CardContainer
      $statusColor={getStatusColor(overallResult, { colors: { status: { success: '#10b981', error: '#ef4444', warning: '#f59e0b' }, text: { tertiary: '#9ca3af' }, border: '#3a3f4b' } })}
      $delay={$delay}
      role="article"
      aria-label={`Game result for ${filename}`}
    >
      <CardHeaderWrapper
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        aria-controls={`details-${filename}`}
        aria-label={`${isExpanded ? 'Hide' : 'Show'} details for ${filename}`}
      >
        <GameCardHeader
          filename={filename}
          stage={stage}
          overallResult={overallResult}
          results={results}
          controllerTypes={controllerTypes}
          characterIds={characterIds}
          costumes={costumes}
          statusType={getStatusType(overallResult)}
        />
        <ExpandButton
          onClick={(e) => { e.stopPropagation(); handleToggle(); }}
          aria-label={isExpanded ? 'Hide details' : 'View details'}
        >
          {isExpanded ? (
            <>
              <ChevronUpIcon /> Hide Details
            </>
          ) : (
            <>
              <ChevronDownIcon /> View Details
            </>
          )}
        </ExpandButton>
      </CardHeaderWrapper>

      <DetailsContainer
        $isExpanded={isExpanded}
        id={`details-${filename}`}
        role="region"
        aria-hidden={!isExpanded}
      >
        <DetailsContent>
          <GameCardDetails
            details={details || []}
            characterIds={characterIds}
            costumes={costumes}
            controllerTypes={controllerTypes}
          />
        </DetailsContent>
      </DetailsContainer>
    </CardContainer>
  );
};
