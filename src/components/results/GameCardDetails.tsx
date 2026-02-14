import styled from 'styled-components';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { CheckDataRow } from '../../ResultsTable';
import { CheckList } from '../checks/CheckList';
import { CoordMap } from '../../CoordMap';

interface GameCardDetailsProps {
  details: CheckDataRow[];
  characterIds: number[];
  costumes: number[];
  controllerTypes: string[];
  errorReason?: string;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xl};
  padding: ${({ theme }) => theme.spacing.lg};
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const SectionTitle = styled.h4`
  font-size: ${({ theme }) => theme.typography.sizes.h4};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  padding-bottom: ${({ theme }) => theme.spacing.sm};
  border-bottom: 2px solid ${({ theme }) => theme.colors.border};
`;

const Divider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.border};
  margin: ${({ theme }) => theme.spacing.md} 0;
`;

const VisualizationsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${({ theme }) => theme.spacing.md};
  padding-top: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.border};

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const VisualizationSlot = styled.div<{ $portIndex: number }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  grid-column: ${({ $portIndex }) => $portIndex + 1};
`;

const PlayerLabel = styled.span`
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  font-size: ${({ theme }) => theme.typography.sizes.small};
  color: ${({ theme }) => theme.colors.text.secondary};
  min-width: 24px;
`;

const VisualizationWrapper = styled.div`
  background: ${({ theme }) => theme.colors.background.elevated};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.sm};
  overflow: hidden;
`;

const ErrorInfo = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ErrorIcon = styled.div`
  width: 32px;
  height: 32px;
  color: ${({ theme }) => theme.colors.status.error};
`;

const ErrorTitle = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.body};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ErrorMessage = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.small};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-family: ${({ theme }) => theme.typography.fonts.mono};
  background: ${({ theme }) => theme.colors.background.elevated};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.md};
  max-width: 100%;
  word-break: break-word;
`;

const ErrorBanner = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => `${theme.colors.status.warning}15`};
  border: 1px solid ${({ theme }) => `${theme.colors.status.warning}40`};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.sizes.small};
  color: ${({ theme }) => theme.colors.status.warning};

  svg {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }
`;

export const GameCardDetails: React.FC<GameCardDetailsProps> = ({
  details,
  characterIds,
  costumes,
  controllerTypes,
  errorReason,
}) => {
  if (!details || details.length === 0) {
    return (
      <Container>
        {errorReason ? (
          <ErrorInfo>
            <ErrorIcon><ExclamationTriangleIcon /></ErrorIcon>
            <ErrorTitle>Error Details</ErrorTitle>
            <ErrorMessage>{errorReason}</ErrorMessage>
          </ErrorInfo>
        ) : (
          <p style={{ textAlign: 'center', fontStyle: 'italic', color: '#9ca3af' }}>
            No detailed check results available
          </p>
        )}
      </Container>
    );
  }

  // Collect visualizations per player
  const playerVisualizations: any[][] = [[], [], [], []];

  details.forEach((check) => {
    check.violations.forEach((violations, playerIndex) => {
      violations.forEach((violation) => {
        if (violation.checkName === "Control Stick Visualization") {
          playerVisualizations[playerIndex].push(violation);
        }
      });
    });
  });

  // Find players with visualizations
  const playersWithVisualizations = playerVisualizations
    .map((visualizations, index) => ({ index, visualizations, count: visualizations.length }))
    .filter(player => player.count > 0);

  return (
    <Container>
      {errorReason && (
        <ErrorBanner>
          <ExclamationTriangleIcon />
          <span>{errorReason}</span>
        </ErrorBanner>
      )}
      {/* Check Summary Section */}
      <Section>
        <SectionTitle>Check Results Summary</SectionTitle>
        <CheckList checks={details} />
      </Section>

      {/* Visualizations Section */}
      {playersWithVisualizations.length > 0 && (
        <>
          <Divider />
          <Section>
            <SectionTitle>
              Control Stick Visualizations
              <span style={{ fontWeight: 400, fontSize: '14px', marginLeft: '12px', color: '#9ca3af' }}>
                ({playersWithVisualizations.length} player{playersWithVisualizations.length > 1 ? 's' : ''})
              </span>
            </SectionTitle>
            <VisualizationsGrid>
              {playersWithVisualizations.map(({ index, visualizations }) => (
                <VisualizationSlot key={index} $portIndex={index}>
                  <PlayerLabel>P{index + 1}:</PlayerLabel>
                  {visualizations.map((visualization: any, vizIndex: number) => (
                    <VisualizationWrapper key={vizIndex}>
                      <CoordMap coords={visualization.evidence} showZones={false} />
                    </VisualizationWrapper>
                  ))}
                </VisualizationSlot>
              ))}
            </VisualizationsGrid>
          </Section>
        </>
      )}
    </Container>
  );
};
