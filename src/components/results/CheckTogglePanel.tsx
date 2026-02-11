import styled from 'styled-components';
import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { CHECK_NAMES } from '../../constants/checks';
import { fadeInDown } from '../../styles/animations';

interface CheckTogglePanelProps {
  enabledChecks: Record<string, boolean>;
  onToggleCheck: (checkName: string) => void;
  onEnableAll: () => void;
  onDisableAll: () => void;
}

const PanelContainer = styled.div`
  width: 100%;
  max-width: 900px;
  margin: 0 auto ${({ theme }) => theme.spacing.lg};
  padding: 0;
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  animation: ${fadeInDown} 0.4s ease-out;
  overflow: hidden;

  @media (min-width: ${({ theme }) => theme.breakpoints.tablet}) {
    max-width: 1000px;
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.desktop}) {
    max-width: 1200px;
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.wide}) {
    max-width: 1400px;
  }
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  cursor: pointer;
  user-select: none;
  transition: background ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.background.elevated};
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const PanelTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.sizes.small};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
`;

const ChevronWrapper = styled.div`
  width: 16px;
  height: 16px;
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

const PanelBody = styled.div<{ $isExpanded: boolean }>`
  max-height: ${({ $isExpanded }) => ($isExpanded ? '300px' : '0')};
  overflow: hidden;
  transition: max-height ${({ theme }) => theme.transitions.normal};
`;

const PanelBodyInner = styled.div`
  padding: 0 ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.lg};
`;

const ButtonRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const ToggleButton = styled.button`
  background: ${({ theme }) => theme.colors.background.elevated};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.typography.sizes.caption};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.accent.primary};
    color: ${({ theme }) => theme.colors.text.primary};
    border-color: ${({ theme }) => theme.colors.accent.primary};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent.primary};
    outline-offset: 2px;
  }
`;

const CheckGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing.sm};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`;

const CheckItem = styled.label`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  transition: background ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.background.elevated};
  }
`;

const HiddenCheckbox = styled.input`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  pointer-events: none;
`;

const CustomCheckbox = styled.div<{ $checked: boolean }>`
  width: 18px;
  height: 18px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: 2px solid ${({ theme, $checked }) =>
    $checked ? theme.colors.accent.primary : theme.colors.border};
  background: ${({ theme, $checked }) =>
    $checked ? theme.colors.accent.primary : 'transparent'};
  transition: all ${({ theme }) => theme.transitions.fast};
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  &::after {
    content: '';
    display: ${({ $checked }) => ($checked ? 'block' : 'none')};
    width: 5px;
    height: 9px;
    border: solid ${({ theme }) => theme.colors.text.primary};
    border-width: 0 2px 2px 0;
    transform: rotate(45deg) translate(-1px, -1px);
  }
`;

const CheckLabel = styled.span<{ $checked: boolean }>`
  font-size: ${({ theme }) => theme.typography.sizes.small};
  color: ${({ theme, $checked }) =>
    $checked ? theme.colors.text.primary : theme.colors.text.tertiary};
  transition: color ${({ theme }) => theme.transitions.fast};
  user-select: none;
`;

export const CheckTogglePanel: React.FC<CheckTogglePanelProps> = ({
  enabledChecks,
  onToggleCheck,
  onEnableAll,
  onDisableAll,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <PanelContainer>
      <PanelHeader onClick={() => setIsExpanded(!isExpanded)}>
        <HeaderLeft>
          <ChevronWrapper>
            {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </ChevronWrapper>
          <PanelTitle>Check Filters</PanelTitle>
        </HeaderLeft>
      </PanelHeader>
      <PanelBody $isExpanded={isExpanded}>
        <PanelBodyInner>
          <ButtonRow>
            <ToggleButton onClick={onEnableAll}>All</ToggleButton>
            <ToggleButton onClick={onDisableAll}>None</ToggleButton>
          </ButtonRow>
          <CheckGrid>
            {CHECK_NAMES.map((name) => (
              <CheckItem key={name}>
                <HiddenCheckbox
                  type="checkbox"
                  checked={enabledChecks[name] ?? true}
                  onChange={() => onToggleCheck(name)}
                />
                <CustomCheckbox $checked={enabledChecks[name] ?? true} />
                <CheckLabel $checked={enabledChecks[name] ?? true}>{name}</CheckLabel>
              </CheckItem>
            ))}
          </CheckGrid>
        </PanelBodyInner>
      </PanelBody>
    </PanelContainer>
  );
};
