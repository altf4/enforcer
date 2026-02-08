import styled from 'styled-components';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Button } from '../shared/Button';

const HeaderContainer = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.xl};
  width: 100%;
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.sizes.hero};
  line-height: ${({ theme }) => theme.typography.lineHeights.hero};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  font-family: ${({ theme }) => theme.typography.fonts.heading};

  background: linear-gradient(135deg, ${({ theme }) => theme.colors.accent.primary} 0%, ${({ theme }) => theme.colors.accent.secondary} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
`;

const VersionBadge = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.caption};
  color: ${({ theme }) => theme.colors.text.tertiary};
  background: ${({ theme }) => theme.colors.background.elevated};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
`;

const CompactUploadButton = styled(Button)`
  gap: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.typography.sizes.small};
`;

const IconWrapper = styled.div`
  width: 16px;
  height: 16px;

  svg {
    width: 100%;
    height: 100%;
  }
`;

interface HeaderProps {
  version?: string;
  showUploadButton?: boolean;
  onUploadMore?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  version,
  showUploadButton = false,
  onUploadMore
}) => {
  return (
    <HeaderContainer>
      <Title>SLP Enforcer</Title>
      {showUploadButton && onUploadMore ? (
        <CompactUploadButton onClick={onUploadMore} $variant="primary" $size="small">
          <IconWrapper>
            <PlusIcon />
          </IconWrapper>
          Upload More
        </CompactUploadButton>
      ) : (
        version && <VersionBadge>v{version}</VersionBadge>
      )}
    </HeaderContainer>
  );
};
