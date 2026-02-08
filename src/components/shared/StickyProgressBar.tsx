import styled from 'styled-components';
import { shimmer } from '../../styles/animations';

interface StickyProgressBarProps {
  progress: number;
  currentFile: number;
  totalFiles: number;
}

const StickyContainer = styled.div`
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: ${({ theme }) => theme.colors.background.elevated};
  border-bottom: 2px solid ${({ theme }) => theme.colors.accent.primary};
  box-shadow: ${({ theme }) => theme.shadows.medium};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
`;

const ProgressContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ProgressText = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: ${({ theme }) => theme.typography.sizes.small};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};

  @media (max-width: 768px) {
    font-size: ${({ theme }) => theme.typography.sizes.caption};
  }
`;

const ProgressBarTrack = styled.div`
  width: 100%;
  height: 8px;
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  overflow: hidden;
  position: relative;
`;

const ProgressBarFill = styled.div<{ $progress: number }>`
  height: 100%;
  width: ${({ $progress }) => $progress}%;
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.accent.primary} 0%,
    ${({ theme }) => theme.colors.accent.secondary} 100%
  );
  border-radius: ${({ theme }) => theme.borderRadius.full};
  transition: width ${({ theme }) => theme.transitions.normal};
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.3) 50%,
      transparent 100%
    );
    background-size: 200% 100%;
    animation: ${shimmer} 2s linear infinite;
  }
`;

const Percentage = styled.span`
  color: ${({ theme }) => theme.colors.accent.secondary};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
`;

export const StickyProgressBar: React.FC<StickyProgressBarProps> = ({
  progress,
  currentFile,
  totalFiles,
}) => {
  const percentage = Math.round(progress * 100);

  return (
    <StickyContainer>
      <ProgressContent>
        <ProgressText>
          <span>⚡ Processing {currentFile} of {totalFiles} files...</span>
          <Percentage>{percentage}%</Percentage>
        </ProgressText>
        <ProgressBarTrack>
          <ProgressBarFill $progress={percentage} />
        </ProgressBarTrack>
      </ProgressContent>
    </StickyContainer>
  );
};
