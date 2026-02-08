import styled from 'styled-components';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Button } from '../shared/Button';

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin: ${({ theme }) => theme.spacing.xl} 0;
`;

const StyledButton = styled(Button)`
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.typography.sizes.body};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
`;

const IconWrapper = styled.div`
  width: 20px;
  height: 20px;

  svg {
    width: 100%;
    height: 100%;
  }
`;

interface UploadMoreButtonProps {
  onClick: () => void;
}

export const UploadMoreButton: React.FC<UploadMoreButtonProps> = ({ onClick }) => {
  return (
    <ButtonWrapper>
      <StyledButton onClick={onClick} $variant="primary" $size="large">
        <IconWrapper>
          <PlusIcon />
        </IconWrapper>
        Upload More Files
      </StyledButton>
    </ButtonWrapper>
  );
};
