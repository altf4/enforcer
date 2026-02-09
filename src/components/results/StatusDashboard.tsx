import styled from 'styled-components';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { fadeInDown } from '../../styles/animations';

interface VisibilityState {
  passed: boolean;
  failed: boolean;
  special: boolean;
}

interface StatusDashboardProps {
  totalFiles: number;
  passedCount: number;
  failedCount: number;
  specialCount: number;
  visibility: VisibilityState;
  onToggleVisibility: (category: keyof VisibilityState) => void;
}

const DashboardContainer = styled.div`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  animation: ${fadeInDown} 0.4s ease-out;
`;

const StatsGrid = styled.div`
  display: flex;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.lg};
  flex-wrap: wrap;

  @media (max-width: 768px) {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

interface StatCardProps {
  $color: string;
  $isVisible: boolean;
}

const StatCard = styled.div<StatCardProps>`
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 2px solid ${({ $color, $isVisible }) => $isVisible ? $color + '80' : $color + '20'};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.md};
  text-align: center;
  transition: all ${({ theme }) => theme.transitions.normal};
  cursor: pointer;
  opacity: ${({ $isVisible }) => $isVisible ? 1 : 0.4};
  user-select: none;
  min-width: 120px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.medium};
    border-color: ${({ $color }) => $color};
    opacity: 1;
  }

  &:active {
    transform: translateY(0);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent.primary};
    outline-offset: 2px;
  }
`;

const IconWrapper = styled.div<{ $color: string }>`
  width: 24px;
  height: 24px;
  margin: 0 auto ${({ theme }) => theme.spacing.xs};
  color: ${({ $color }) => $color};

  svg {
    width: 100%;
    height: 100%;
  }
`;

const Count = styled.div<{ $color: string }>`
  font-size: ${({ theme }) => theme.typography.sizes.h2};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  line-height: 1;
  color: ${({ $color }) => $color};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const Label = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.small};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const HelpText = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.small};
  color: ${({ theme }) => theme.colors.text.tertiary};
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.md};
  font-style: italic;
`;

export const StatusDashboard: React.FC<StatusDashboardProps> = ({
  totalFiles,
  passedCount,
  failedCount,
  specialCount,
  visibility,
  onToggleVisibility,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent, category: keyof VisibilityState) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggleVisibility(category);
    }
  };

  return (
    <DashboardContainer>
      <StatsGrid>
        <StatCard
          $color="#10b981"
          $isVisible={visibility.passed}
          onClick={() => onToggleVisibility('passed')}
          onKeyDown={(e) => handleKeyDown(e, 'passed')}
          role="button"
          tabIndex={0}
          aria-pressed={visibility.passed}
          aria-label={`${visibility.passed ? 'Hide' : 'Show'} passed results`}
        >
          <IconWrapper $color="#10b981">
            <CheckCircleIcon />
          </IconWrapper>
          <Count $color="#10b981">{passedCount}</Count>
          <Label>Passed</Label>
        </StatCard>

        <StatCard
          $color="#ef4444"
          $isVisible={visibility.failed}
          onClick={() => onToggleVisibility('failed')}
          onKeyDown={(e) => handleKeyDown(e, 'failed')}
          role="button"
          tabIndex={0}
          aria-pressed={visibility.failed}
          aria-label={`${visibility.failed ? 'Hide' : 'Show'} failed results`}
        >
          <IconWrapper $color="#ef4444">
            <XCircleIcon />
          </IconWrapper>
          <Count $color="#ef4444">{failedCount}</Count>
          <Label>Failed</Label>
        </StatCard>

        <StatCard
          $color="#f59e0b"
          $isVisible={visibility.special}
          onClick={() => onToggleVisibility('special')}
          onKeyDown={(e) => handleKeyDown(e, 'special')}
          role="button"
          tabIndex={0}
          aria-pressed={visibility.special}
          aria-label={`${visibility.special ? 'Hide' : 'Show'} skipped results`}
        >
          <IconWrapper $color="#f59e0b">
            <ExclamationTriangleIcon />
          </IconWrapper>
          <Count $color="#f59e0b">{specialCount}</Count>
          <Label>Skipped</Label>
        </StatCard>
      </StatsGrid>
      <HelpText>Click cards to show/hide results</HelpText>
    </DashboardContainer>
  );
};
