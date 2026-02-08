import styled from 'styled-components';

interface ButtonProps {
  $variant?: 'primary' | 'secondary' | 'outline';
  $size?: 'small' | 'medium' | 'large';
}

export const Button = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};

  font-family: ${({ theme }) => theme.typography.fonts.body};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  font-size: ${({ theme, $size }) => {
    switch ($size) {
      case 'small': return theme.typography.sizes.small;
      case 'large': return theme.typography.sizes.body;
      default: return theme.typography.sizes.body;
    }
  }};

  padding: ${({ theme, $size }) => {
    switch ($size) {
      case 'small': return `${theme.spacing.sm} ${theme.spacing.md}`;
      case 'large': return `${theme.spacing.md} ${theme.spacing.xl}`;
      default: return `${theme.spacing.sm} ${theme.spacing.lg}`;
    }
  }};

  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 2px solid transparent;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  ${({ theme, $variant }) => {
    switch ($variant) {
      case 'primary':
        return `
          background: ${theme.colors.accent.primary};
          color: ${theme.colors.text.primary};

          &:hover {
            background: ${theme.colors.accent.secondary};
            transform: translateY(-2px);
            box-shadow: ${theme.shadows.medium};
          }

          &:active {
            transform: translateY(0);
          }
        `;
      case 'secondary':
        return `
          background: ${theme.colors.background.elevated};
          color: ${theme.colors.text.primary};

          &:hover {
            background: ${theme.colors.border};
            transform: translateY(-2px);
            box-shadow: ${theme.shadows.low};
          }

          &:active {
            transform: translateY(0);
          }
        `;
      case 'outline':
        return `
          background: transparent;
          color: ${theme.colors.text.primary};
          border-color: ${theme.colors.border};

          &:hover {
            background: ${theme.colors.background.elevated};
            border-color: ${theme.colors.accent.primary};
          }
        `;
      default:
        return `
          background: ${theme.colors.accent.primary};
          color: ${theme.colors.text.primary};

          &:hover {
            background: ${theme.colors.accent.secondary};
            transform: translateY(-2px);
            box-shadow: ${theme.shadows.medium};
          }

          &:active {
            transform: translateY(0);
          }
        `;
    }
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;

    &:hover {
      transform: none;
      box-shadow: none;
    }
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent.primary};
    outline-offset: 2px;
  }
`;
