import styled from 'styled-components';
import awesome from './icon/awesome.png';

const FooterContainer = styled.footer`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.lg};
  text-align: center;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  margin-top: ${({ theme }) => theme.spacing.xxxl};
  background: ${({ theme }) => theme.colors.background.secondary};
`;

const FooterText = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.small};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: ${({ theme }) => theme.spacing.sm} 0;
  line-height: ${({ theme }) => theme.typography.lineHeights.small};
`;

const AwesomeIcon = styled.img`
  width: 20px;
  height: 20px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  margin: 0 ${({ theme }) => theme.spacing.xs};
  vertical-align: middle;
`;

const FooterLink = styled.a`
  color: ${({ theme }) => theme.colors.accent.secondary};
  text-decoration: none;
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  transition: color ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.accent.primary};
    text-decoration: underline;
  }
`;

interface FooterProps {
  isActive: boolean;
  version: string;
  commitHash: string;
}

export function Footer({ isActive, version, commitHash }: FooterProps): JSX.Element | null {
  if (!isActive) {
    return null;
  }

  return (
    <FooterContainer>
      <FooterText>
        SLP Enforcer v{version} (UI v{commitHash}) — Made by AltF4
        <AwesomeIcon src={awesome} alt="awesome" />
      </FooterText>
      <FooterText>
        Found a bug?{' '}
        <FooterLink
          href="https://github.com/altf4/libenforcer/issues"
          target="_blank"
          rel="noopener noreferrer"
        >
          Report it here
        </FooterLink>
        {' • '}
        <FooterLink href="https://slippi.gg/#support" target="_blank" rel="noopener noreferrer">
          Donate to Fizzi
        </FooterLink>
      </FooterText>
    </FooterContainer>
  );
}
