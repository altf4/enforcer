import styled from 'styled-components';
import { ViolationsDataRow } from '../../ResultsTable';
import { ViolationCard } from './ViolationCard';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface PlayerCheckSectionProps {
  playerIndex: number;
  violations: ViolationsDataRow[];
  characterId: number;
  costume: number;
  controllerType: string;
}

const Container = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const PlayerHeader = styled.div<{ $hasViolations: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme, $hasViolations }) =>
    $hasViolations ? theme.colors.background.elevated : theme.colors.background.secondary};
  border: 1px solid ${({ theme, $hasViolations }) =>
    $hasViolations ? theme.colors.status.error : theme.colors.status.success};
  border-left: 4px solid ${({ theme, $hasViolations }) =>
    $hasViolations ? theme.colors.status.error : theme.colors.status.success};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const StatusIconWrapper = styled.div<{ $status: 'passed' | 'failed' }>`
  width: 28px;
  height: 28px;
  color: ${({ theme, $status }) =>
    $status === 'passed' ? theme.colors.status.success : theme.colors.status.error};
  flex-shrink: 0;
`;

const PlayerInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  flex: 1;
`;

const PlayerTitle = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.body};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const PlayerMeta = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.small};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ViolationsContainer = styled.div`
  padding-left: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 768px) {
    padding-left: 0;
  }
`;

const NoViolationsMessage = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.text.tertiary};
  font-style: italic;
  font-size: ${({ theme }) => theme.typography.sizes.small};
`;

export const PlayerCheckSection: React.FC<PlayerCheckSectionProps> = ({
  playerIndex,
  violations,
  characterId,
  costume,
  controllerType,
}) => {
  const hasViolations = violations.length > 0;
  const status = hasViolations ? 'failed' : 'passed';

  return (
    <Container>
      <PlayerHeader $hasViolations={hasViolations}>
        <StatusIconWrapper $status={status}>
          {status === 'passed' ? <CheckCircleIcon /> : <XCircleIcon />}
        </StatusIconWrapper>
        <PlayerInfo>
          <PlayerTitle>Player {playerIndex + 1}</PlayerTitle>
          <PlayerMeta>
            {hasViolations
              ? `${violations.length} violation${violations.length > 1 ? 's' : ''} detected`
              : 'All checks passed'}
          </PlayerMeta>
        </PlayerInfo>
      </PlayerHeader>

      {hasViolations ? (
        <ViolationsContainer>
          {violations.map((violation, index) => (
            <ViolationCard key={index} violation={violation} />
          ))}
        </ViolationsContainer>
      ) : (
        <NoViolationsMessage>
          No violations detected for this player
        </NoViolationsMessage>
      )}
    </Container>
  );
};
