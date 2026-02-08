import styled from 'styled-components';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, FireIcon, NoSymbolIcon } from '@heroicons/react/24/solid';

export type StatusType = 'passed' | 'failed' | 'warning' | 'handwarmer' | 'too-old' | 'info';

interface StatusBadgeProps {
  status: StatusType;
  label: string;
  size?: 'small' | 'medium' | 'large';
}

const BadgeContainer = styled.div<{ $status: StatusType; $size: 'small' | 'medium' | 'large' }>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme, $size }) =>
    $size === 'small' ? theme.spacing.xs : theme.spacing.sm};
  padding: ${({ theme, $size }) => {
    switch ($size) {
      case 'small': return `${theme.spacing.xs} ${theme.spacing.sm}`;
      case 'large': return `${theme.spacing.sm} ${theme.spacing.md}`;
      default: return `${theme.spacing.xs} ${theme.spacing.md}`;
    }
  }};

  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme, $size }) => {
    switch ($size) {
      case 'small': return theme.typography.sizes.caption;
      case 'large': return theme.typography.sizes.body;
      default: return theme.typography.sizes.small;
    }
  }};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};

  background-color: ${({ theme, $status }) => {
    switch ($status) {
      case 'passed': return `${theme.colors.status.success}20`;
      case 'failed': return `${theme.colors.status.error}20`;
      case 'warning': return `${theme.colors.status.warning}20`;
      case 'handwarmer': return `${theme.colors.status.warning}20`;
      case 'too-old': return `${theme.colors.text.tertiary}20`;
      case 'info': return `${theme.colors.status.info}20`;
      default: return theme.colors.background.elevated;
    }
  }};

  color: ${({ theme, $status }) => {
    switch ($status) {
      case 'passed': return theme.colors.status.success;
      case 'failed': return theme.colors.status.error;
      case 'warning': return theme.colors.status.warning;
      case 'handwarmer': return theme.colors.status.warning;
      case 'too-old': return theme.colors.text.tertiary;
      case 'info': return theme.colors.status.info;
      default: return theme.colors.text.primary;
    }
  }};
`;

const IconWrapper = styled.div<{ $size: 'small' | 'medium' | 'large' }>`
  display: flex;
  align-items: center;

  svg {
    width: ${({ $size }) => {
      switch ($size) {
        case 'small': return '14px';
        case 'large': return '24px';
        default: return '18px';
      }
    }};
    height: ${({ $size }) => {
      switch ($size) {
        case 'small': return '14px';
        case 'large': return '24px';
        default: return '18px';
      }
    }};
  }
`;

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, size = 'medium' }) => {
  const getIcon = () => {
    switch (status) {
      case 'passed':
        return <CheckCircleIcon />;
      case 'failed':
        return <XCircleIcon />;
      case 'warning':
        return <ExclamationTriangleIcon />;
      case 'handwarmer':
        return <FireIcon />;
      case 'too-old':
        return <NoSymbolIcon />;
      case 'info':
        return <CheckCircleIcon />;
      default:
        return null;
    }
  };

  return (
    <BadgeContainer $status={status} $size={size}>
      <IconWrapper $size={size}>{getIcon()}</IconWrapper>
      <span>{label}</span>
    </BadgeContainer>
  );
};
