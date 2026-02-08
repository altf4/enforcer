import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import styled, { keyframes } from 'styled-components';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { shake } from './styles/animations';

const getColor = (isDragAccept: boolean, isDragReject: boolean, isFocused: boolean, theme: any) => {
  if (isDragAccept) {
    return theme.colors.status.success;
  }
  if (isDragReject) {
    return theme.colors.status.error;
  }
  if (isFocused) {
    return theme.colors.accent.secondary;
  }
  return theme.colors.border;
};

const getBorderStyle = (isDragActive: boolean) => {
  return isDragActive ? 'solid' : 'dashed';
};

const pulseAnimation = keyframes`
  0%, 100% {
    opacity: 0.4;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.02);
  }
`;

interface ContainerProps {
  $isDragAccept: boolean;
  $isDragReject: boolean;
  $isFocused: boolean;
  $isDragActive: boolean;
}

const Container = styled.div<ContainerProps>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xxxl};
  min-height: 300px;
  border-width: 3px;
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  border-color: ${({ theme, $isDragAccept, $isDragReject, $isFocused }) =>
    getColor($isDragAccept, $isDragReject, $isFocused, theme)};
  border-style: ${({ $isDragActive }) => getBorderStyle($isDragActive)};
  background: ${({ theme, $isDragActive }) =>
    $isDragActive
      ? `linear-gradient(135deg, ${theme.colors.background.elevated} 0%, ${theme.colors.background.secondary} 100%)`
      : theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.secondary};
  outline: none;
  transition: all ${({ theme }) => theme.transitions.normal};
  cursor: pointer;
  position: relative;
  overflow: hidden;

  ${({ $isDragActive }) =>
    $isDragActive &&
    `
    animation: ${pulseAnimation} 1.5s ease-in-out infinite;
  `}

  ${({ $isDragReject }) =>
    $isDragReject &&
    `
    animation: ${shake} 0.5s ease-in-out;
  `}

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent.primary};
    background: ${({ theme }) => theme.colors.background.elevated};
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.medium};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent.primary};
    outline-offset: 2px;
  }
`;

const IconWrapper = styled.div<{ $isDragActive: boolean }>`
  width: 64px;
  height: 64px;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme, $isDragActive }) =>
    $isDragActive ? theme.colors.accent.primary : theme.colors.text.tertiary};
  transition: all ${({ theme }) => theme.transitions.normal};

  ${Container}:hover & {
    color: ${({ theme }) => theme.colors.accent.primary};
    transform: translateY(-4px);
  }

  svg {
    width: 100%;
    height: 100%;
  }
`;

const PrimaryText = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.h3};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
  text-align: center;
`;

const SecondaryText = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.small};
  color: ${({ theme }) => theme.colors.text.tertiary};
  margin: 0;
  text-align: center;
`;

export function DropZone(props: any) {
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      // Notify App that we're starting to process files
      if (props.startProcessing) {
        props.startProcessing(acceptedFiles.length);
      }

      let count = 0;
      const promises: Promise<any>[] = acceptedFiles.map((inputFile) => {
        const process = props.processFile(inputFile);
        process.then((result: any) => {
          count += 1;
          props.setProgress(count / acceptedFiles.length);
          // Stream each result individually as it completes
          props.handleResults(result);
        });
        return process;
      });

      // Wait for all files to complete
      await Promise.all(promises);

      // Reset progress to indicate completion
      props.setProgress(1.0);
    },
    [props]
  );

  const { getRootProps, getInputProps, isFocused, isDragAccept, isDragReject, isDragActive } =
    useDropzone({ onDrop });

  if (!props.isActive) {
    return null;
  }

  return (
    <Container
      {...getRootProps()}
      $isFocused={isFocused}
      $isDragAccept={isDragAccept}
      $isDragReject={isDragReject}
      $isDragActive={isDragActive}
    >
      <input {...getInputProps()} />
      <IconWrapper $isDragActive={isDragActive}>
        <CloudArrowUpIcon />
      </IconWrapper>
      <PrimaryText>
        {isDragActive ? 'Drop files here' : 'Drop SLP files here or click to browse'}
      </PrimaryText>
      <SecondaryText>Batch processing supported - upload multiple files at once</SecondaryText>
    </Container>
  );
}