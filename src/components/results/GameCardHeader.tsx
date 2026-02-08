import styled from 'styled-components';
import { StageIcon, ResultIcons } from '../../ResultsTable';
import { StatusBadge, StatusType } from '../shared/StatusBadge';

interface GameCardHeaderProps {
  filename: string;
  stage: number;
  overallResult: string;
  results: string[];
  controllerTypes: string[];
  characterIds: number[];
  costumes: number[];
  statusType: StatusType;
}

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  flex: 1;
`;

const StageIconWrapper = styled.div`
  flex-shrink: 0;
`;

const Filename = styled.h3`
  font-size: ${({ theme }) => theme.typography.sizes.small};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (max-width: 768px) {
    font-size: ${({ theme }) => theme.typography.sizes.caption};
  }
`;

const PlayersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${({ theme }) => theme.spacing.sm};
  padding-top: ${({ theme }) => theme.spacing.sm};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const PlayerSlot = styled.div<{ $portIndex?: number }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.typography.sizes.small};
  color: ${({ theme }) => theme.colors.text.secondary};
  ${({ $portIndex }) => $portIndex !== undefined && `grid-column: ${$portIndex + 1};`}
`;

const PlayerLabel = styled.span`
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  min-width: 24px;
`;

const getStatusLabel = (result: string): string => {
  if (result.includes('✅') || result.includes('Passed')) return 'Passed';
  if (result.includes('❌') || result.includes('Failed')) return 'Failed';
  if (result.includes('🔥') || result.includes('Handwarmer')) return 'Handwarmer';
  if (result.includes('💀') || result.includes('Too Old')) return 'SLP Too Old';
  return result;
};

export const GameCardHeader: React.FC<GameCardHeaderProps> = ({
  filename,
  stage,
  overallResult,
  results,
  controllerTypes,
  characterIds,
  costumes,
  statusType,
}) => {
  const violationCount = results.filter(r => r.includes('❌')).length;

  return (
    <HeaderContainer>
      <TopRow>
        <LeftSection>
          <StageIconWrapper>
            <StageIcon stageId={stage} />
          </StageIconWrapper>
          <Filename>{filename}</Filename>
        </LeftSection>
        <div>
          <StatusBadge status={statusType} label={getStatusLabel(overallResult)} size="medium" />
        </div>
      </TopRow>

      <PlayersGrid>
        {results.map((result, index) => {
          if (!result || result === '') return null;

          return (
            <PlayerSlot key={index} $portIndex={index}>
              <PlayerLabel>P{index + 1}:</PlayerLabel>
              <ResultIcons
                characterId={characterIds[index]}
                costume={costumes[index]}
                results={result}
                controllerType={controllerTypes[index]}
              />
            </PlayerSlot>
          );
        })}
      </PlayersGrid>

      {violationCount > 0 && (
        <PlayerSlot style={{ color: '#ef4444', fontWeight: 600 }}>
          🚨 {violationCount} player{violationCount > 1 ? 's' : ''} with violations
        </PlayerSlot>
      )}
    </HeaderContainer>
  );
};
