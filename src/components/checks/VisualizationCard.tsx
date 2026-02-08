import styled from 'styled-components';
import { ViolationsDataRow } from '../../ResultsTable';
import { CoordMap } from '../../CoordMap';
import { ChartBarIcon } from '@heroicons/react/24/outline';

interface VisualizationCardProps {
  visualization: ViolationsDataRow;
}

const CardContainer = styled.div`
  background: ${({ theme }) => theme.colors.background.elevated};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-left: 4px solid ${({ theme }) => theme.colors.accent.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const VisualizationHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const IconWrapper = styled.div`
  width: 24px;
  height: 24px;
  color: ${({ theme }) => theme.colors.accent.primary};
  flex-shrink: 0;
`;

const VisualizationTitle = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.small};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const VisualizationContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Description = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.small};
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: ${({ theme }) => theme.typography.lineHeights.small};
`;

function RenderVisualization(visualization: ViolationsDataRow): JSX.Element {
  if (visualization.checkName === "Control Stick Visualization") {
    return (
      <VisualizationContent>
        <Description>Control stick coordinate visualization</Description>
        <CoordMap coords={visualization.evidence} showZones={false} />
      </VisualizationContent>
    );
  }

  return (
    <VisualizationContent>
      <Description>{visualization.reason}</Description>
    </VisualizationContent>
  );
}

export const VisualizationCard: React.FC<VisualizationCardProps> = ({ visualization }) => {
  return (
    <CardContainer>
      <VisualizationHeader>
        <IconWrapper>
          <ChartBarIcon />
        </IconWrapper>
        <VisualizationTitle>{visualization.checkName}</VisualizationTitle>
      </VisualizationHeader>
      {RenderVisualization(visualization)}
    </CardContainer>
  );
};
