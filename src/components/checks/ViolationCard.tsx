import styled from 'styled-components';
import { ViolationsDataRow } from '../../ResultsTable';
import { CoordElement } from '../../CoordElement';
import { CoordMap } from '../../CoordMap';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ViolationCardProps {
  violation: ViolationsDataRow;
}

const CardContainer = styled.div`
  background: ${({ theme }) => theme.colors.background.elevated};
  border: 1px solid ${({ theme }) => theme.colors.status.error};
  border-left: 4px solid ${({ theme }) => theme.colors.status.error};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const ViolationHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const IconWrapper = styled.div`
  width: 24px;
  height: 24px;
  color: ${({ theme }) => theme.colors.status.error};
  flex-shrink: 0;
`;

const ViolationTitle = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.small};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ViolationContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Reason = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.small};
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: ${({ theme }) => theme.typography.lineHeights.small};
`;

const EvidenceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.sm};

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const MetricLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.caption};
  color: ${({ theme }) => theme.colors.text.tertiary};
  font-family: ${({ theme }) => theme.typography.fonts.mono};
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

function RenderViolation(violation: ViolationsDataRow): JSX.Element {
  if (violation.checkName === "Illegal SDI") {
    return (
      <ViolationContent>
        <Reason>{violation.reason}</Reason>
        <EvidenceGrid>
          {violation.evidence.map((coord: any, i: number) => (
            <CoordElement
              key={i}
              frameNumber={violation.metric + i}
              x={coord.x}
              y={coord.y}
            />
          ))}
        </EvidenceGrid>
      </ViolationContent>
    );
  }

  if (violation.checkName === "Box Travel Time") {
    return (
      <ViolationContent>
        <Reason>
          Only {(violation.metric * 100).toFixed(2)}% of main stick movements have travel time
        </Reason>
        <MetricLabel>Expected: Above 25%</MetricLabel>
      </ViolationContent>
    );
  }

  if (violation.checkName === "Uptilt Rounding") {
    return (
      <ViolationContent>
        <Reason>Coordinates detected in uptilt rounding zones</Reason>
        <CoordMap coords={violation.evidence} showZones={true} />
      </ViolationContent>
    );
  }

  if (violation.checkName === "Disallowed Analog C-Stick Values") {
    if (violation.evidence.length === 0) {
      console.error("No evidence provided with this check. There should have been!");
      return <Reason>{violation.reason}</Reason>;
    }
    return (
      <ViolationContent>
        <Reason>
          {violation.reason}: ({violation.evidence[0].x.toFixed(3)}, {violation.evidence[0].y.toFixed(3)})
        </Reason>
      </ViolationContent>
    );
  }

  if (violation.checkName === "Fast Crouch Uptilt") {
    return (
      <ViolationContent>
        <Reason>Fast crouch uptilt detected</Reason>
        <EvidenceGrid>
          {violation.evidence.map((coord: any, i: number) => (
            <CoordElement
              key={i}
              frameNumber={violation.metric + i}
              x={coord.x}
              y={coord.y}
            />
          ))}
        </EvidenceGrid>
      </ViolationContent>
    );
  }

  if (violation.checkName === "Control Stick Visualization") {
    return (
      <ViolationContent>
        <Reason>Control stick coordinate visualization</Reason>
        <CoordMap coords={violation.evidence} showZones={false} />
      </ViolationContent>
    );
  }

  if (violation.checkName === "GoomWave Clamping") {
    return (
      <ViolationContent>
        <Reason>Found no coordinates within 0.1 not on cardinals. See Control Stick Visualization.</Reason>
      </ViolationContent>
    );
  }

  console.error("Unknown check: ", violation.checkName);
  return (
    <ViolationContent>
      <Reason>Unknown check: {violation.checkName}</Reason>
    </ViolationContent>
  );
}

export const ViolationCard: React.FC<ViolationCardProps> = ({ violation }) => {
  return (
    <CardContainer>
      <ViolationHeader>
        <IconWrapper>
          <ExclamationTriangleIcon />
        </IconWrapper>
        <ViolationTitle>{violation.checkName}</ViolationTitle>
      </ViolationHeader>
      {RenderViolation(violation)}
    </CardContainer>
  );
};
