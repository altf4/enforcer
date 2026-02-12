import React, { useCallback, useImperativeHandle, forwardRef } from 'react';
import { useDropzone } from 'react-dropzone';
import styled, { css, keyframes } from 'styled-components';
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
    opacity: 0.7;
  }
  50% {
    opacity: 1;
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
  padding: ${({ theme }) => theme.spacing.xl};
  min-height: 150px;
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
    css`
      animation: ${pulseAnimation} 1.5s ease-in-out infinite;
    `}

  ${({ $isDragReject }) =>
    $isDragReject &&
    css`
      animation: ${shake} 0.5s ease-in-out;
    `}

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent.primary};
    background: ${({ theme }) => theme.colors.background.elevated};
    box-shadow: ${({ theme }) => theme.shadows.medium};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent.primary};
    outline-offset: 2px;
  }
`;

const IconWrapper = styled.div<{ $isDragActive: boolean }>`
  width: 48px;
  height: 48px;
  margin-bottom: ${({ theme }) => theme.spacing.md};
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
  font-size: ${({ theme }) => theme.typography.sizes.body};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.spacing.xs} 0;
  text-align: center;
`;

const SecondaryText = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.caption};
  color: ${({ theme }) => theme.colors.text.tertiary};
  margin: 0;
  text-align: center;
`;

/**
 * Yields to the browser so it can paint before we resume processing.
 * rAF fires before paint; the inner setTimeout resolves after paint.
 */
function yieldToMain(): Promise<void> {
  return new Promise(resolve => {
    requestAnimationFrame(() => setTimeout(resolve, 0));
  });
}

export interface DropZoneHandle {
  openFilePicker: () => void;
}

export const DropZone = forwardRef<DropZoneHandle, any>((props, ref) => {
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) {
        return;
      }

      // Show progress bar immediately
      const totalFiles = acceptedFiles.length;
      if (props.startProcessing) {
        props.startProcessing(totalFiles);
      }

      // Track within-batch duplicates locally (React state updates
      // from registerFilename won't be visible within this callback)
      const batchSeenFilenames = new Set<string>();
      let completedCount = 0;

      // Process files sequentially so the browser can paint between
      // each file. analyzeReplay (WASM) is synchronous on the main
      // thread, so concurrent scheduling provides no speedup.
      for (const file of acceptedFiles) {
        if (batchSeenFilenames.has(file.name) || !props.registerFilename(file.name)) {
          completedCount += 1;
          props.setProgress(completedCount / totalFiles);
          continue;
        }
        batchSeenFilenames.add(file.name);

        const buffer = await file.arrayBuffer();
        const result = await props.processFile(file, buffer);
        completedCount += 1;
        props.setProgress(completedCount / totalFiles);
        props.handleResults(result);

        // Yield to the browser so it can paint updated progress
        // and any new result cards before processing the next file
        await yieldToMain();
      }

      props.setProgress(1.0);
    },
    [props]
  );

  const { getRootProps, getInputProps, isFocused, isDragAccept, isDragReject, isDragActive, open } =
    useDropzone({ onDrop });

  // Expose the open method to parent components via ref
  useImperativeHandle(ref, () => ({
    openFilePicker: () => {
      open();
    }
  }));

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
});