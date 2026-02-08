import styled from 'styled-components';

interface ContainerProps {
  $maxWidth?: string;
  $centered?: boolean;
}

export const Container = styled.div<ContainerProps>`
  width: 100%;
  max-width: ${({ $maxWidth }) => $maxWidth || '1200px'};
  margin: ${({ $centered }) => ($centered ? '0 auto' : '0')};
  padding: 0 ${({ theme }) => theme.spacing.lg};

  @media (max-width: 768px) {
    padding: 0 ${({ theme }) => theme.spacing.md};
  }
`;
