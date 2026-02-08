import styled from 'styled-components';

const HeroContainer = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Tagline = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.body};
  line-height: ${({ theme }) => theme.typography.lineHeights.body};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
  font-weight: ${({ theme }) => theme.typography.weights.normal};
`;

export const HeroSection: React.FC = () => {
  return (
    <HeroContainer>
      <Tagline>Validate Slippi replays for competitive integrity</Tagline>
    </HeroContainer>
  );
};
