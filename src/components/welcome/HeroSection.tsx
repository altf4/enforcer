import styled from 'styled-components';

const HeroContainer = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xxl} ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Tagline = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.h3};
  line-height: ${({ theme }) => theme.typography.lineHeights.h3};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: ${({ theme }) => theme.spacing.md} 0 0;
  font-weight: ${({ theme }) => theme.typography.weights.normal};
`;

export const HeroSection: React.FC = () => {
  return (
    <HeroContainer>
      <Tagline>Validate Slippi replays for competitive integrity</Tagline>
    </HeroContainer>
  );
};
