import styled from 'styled-components';

interface CardProps {
  $elevated?: boolean;
}

export const Card = styled.div<CardProps>`
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  box-shadow: ${({ theme, $elevated }) =>
    $elevated ? theme.shadows.medium : theme.shadows.low};
  transition: all ${({ theme }) => theme.transitions.normal};
`;

export const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

export const CardTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.sizes.h3};
  line-height: ${({ theme }) => theme.typography.lineHeights.h3};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const CardBody = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
`;
