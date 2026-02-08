import styled from 'styled-components';
import { CheckDataRow } from '../../ResultsTable';
import { CheckList } from '../checks/CheckList';
import { PlayerCheckSection } from '../checks/PlayerCheckSection';

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

  // Collect all violations per player
  const playerViolations: any[][] = [[], [], [], []];

  details.forEach((check) => {
    check.violations.forEach((violations, playerIndex) => {
      violations.forEach((violation) => {
        playerViolations[playerIndex].push(violation);
      });
    });
  });

  // Find players with violations
  const playersWithViolations = playerViolations
    .map((violations, index) => ({ index, violations, count: violations.length }))
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
            🎉 All players passed all checks! No violations detected.
          </p>
        )}
      </Section>
    </Container>
  );
};
