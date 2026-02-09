import styled from 'styled-components';
import { CheckDataRow } from '../../ResultsTable';
import { CheckList } from '../checks/CheckList';
import { PlayerCheckSection } from '../checks/PlayerCheckSection';
import { CoordMap } from '../../CoordMap';

interface GameCardDetailsProps {
  details: CheckDataRow[];
  characterIds: number[];
  costumes: number[];
  controllerTypes: string[];
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

export const GameCardDetails: React.FC<GameCardDetailsProps> = ({
  details,
  characterIds,
  costumes,
  controllerTypes,
}) => {
  if (!details || details.length === 0) {
    return (
      <Container>
        <p style={{ textAlign: 'center', fontStyle: 'italic', color: '#9ca3af' }}>
          No detailed check results available
        </p>
      </Container>
    );
  }

  // Collect all violations and visualizations per player
  const playerViolations: any[][] = [[], [], [], []];
  const playerVisualizations: any[][] = [[], [], [], []];

  details.forEach((check) => {
    check.violations.forEach((violations, playerIndex) => {
      violations.forEach((violation) => {
        // Separate visualizations from actual violations
        if (violation.checkName === "Control Stick Visualization") {
          playerVisualizations[playerIndex].push(violation);
        } else {
          playerViolations[playerIndex].push(violation);
        }
      });
    });
  });

  // Find players with violations
  const playersWithViolations = playerViolations
    .map((violations, index) => ({ index, violations, count: violations.length }))
    .filter(player => player.count > 0);

  // Find players with visualizations
  const playersWithVisualizations = playerVisualizations
    .map((visualizations, index) => ({ index, visualizations, count: visualizations.length }))
    .filter(player => player.count > 0);

  return (
    <Container>
      {/* Check Summary Section */}
      <Section>
        <SectionTitle>Check Results Summary</SectionTitle>
        <CheckList checks={details} />
      </Section>

      <Divider />

      {/* Violations Section */}
      <Section>
        <SectionTitle>
          Detailed Violations
          {playersWithViolations.length > 0 && (
            <span style={{ fontWeight: 400, fontSize: '14px', marginLeft: '12px', color: '#9ca3af' }}>
              ({playersWithViolations.length} player{playersWithViolations.length > 1 ? 's' : ''} with violations)
            </span>
          )}
        </SectionTitle>

        {playersWithViolations.length > 0 ? (
          playersWithViolations.map(({ index, violations }) => (
            <PlayerCheckSection
              key={index}
              playerIndex={index}
              violations={violations}
              characterId={characterIds[index]}
              costume={costumes[index]}
              controllerType={controllerTypes[index]}
            />
          ))
        ) : (
          <p style={{ textAlign: 'center', fontStyle: 'italic', color: '#10b981', padding: '24px' }}>
            No violations detected.
          </p>
        )}
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
