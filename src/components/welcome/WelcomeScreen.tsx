import styled from 'styled-components';
import { HeroSection } from './HeroSection';
import { FeatureCards } from './FeatureCards';
import { Container } from '../layout/Container';

const WelcomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: ${({ theme }) => theme.spacing.xl} 0;
`;

interface WelcomeScreenProps {
  children: React.ReactNode; // For DropZone
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ children }) => {
  return (
    <WelcomeContainer>
      <Container $maxWidth="900px" $centered>
        <HeroSection />
        {children}
        <FeatureCards />
      </Container>
    </WelcomeContainer>
  );
};
