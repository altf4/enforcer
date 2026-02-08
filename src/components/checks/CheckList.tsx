import styled from 'styled-components';
import { CheckCircleIcon, XCircleIcon, MinusCircleIcon } from '@heroicons/react/24/outline';
import { CheckDataRow } from '../../ResultsTable';

interface CheckListProps {
  checks: CheckDataRow[];
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const CheckRow = styled.div`
  display: grid;
  grid-template-columns: minmax(200px, 2fr) repeat(4, 1fr);
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  align-items: center;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
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
  return (
    <Container>
      {checks.map((check, index) => {
        // Skip Control Stick Visualization as it's not really a check
        if (check.name === "Control Stick Visualization") {
          return null;
        }

        return (
          <CheckRow key={index}>
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
          </CheckRow>
        );
      })}
    </Container>
  );
};
