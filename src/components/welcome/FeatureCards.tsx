import styled from 'styled-components';
import { ShieldCheckIcon, ChartBarIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { fadeInUp } from '../../styles/animations';

const CardsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin: ${({ theme }) => theme.spacing.xxl} 0;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FeatureCard = styled.div<{ $delay: number }>`
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  text-align: center;
  transition: all ${({ theme }) => theme.transitions.normal};
  animation: ${fadeInUp} 0.6s ease-out forwards;
  animation-delay: ${({ $delay }) => $delay}ms;
  opacity: 0;

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.shadows.medium};
    border-color: ${({ theme }) => theme.colors.accent.primary};
  }
`;

const IconWrapper = styled.div`
  width: 48px;
  height: 48px;
  margin: 0 auto ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.accent.primary};

  svg {
    width: 100%;
    height: 100%;
  }
`;

const CardTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.sizes.h3};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const CardDescription = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.small};
  line-height: ${({ theme }) => theme.typography.lineHeights.small};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
`;

const features = [
  {
    icon: ShieldCheckIcon,
    title: '8 Automated Checks',
    description: 'Comprehensive ruleset validation including SDI, uptilt rounding, and more',
  },
  {
    icon: ChartBarIcon,
    title: 'Detailed Evidence',
    description: 'Visual coordinate maps and frame-by-frame analysis for every violation',
  },
  {
    icon: LockClosedIcon,
    title: 'Privacy First',
    description: 'All processing happens in your browser - your files never leave your device',
  },
];

export const FeatureCards: React.FC = () => {
  return (
    <CardsContainer>
      {features.map((feature, index) => (
        <FeatureCard key={feature.title} $delay={index * 100}>
          <IconWrapper>
            <feature.icon />
          </IconWrapper>
          <CardTitle>{feature.title}</CardTitle>
          <CardDescription>{feature.description}</CardDescription>
        </FeatureCard>
      ))}
    </CardsContainer>
  );
};
