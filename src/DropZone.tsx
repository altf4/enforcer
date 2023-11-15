import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import styled from 'styled-components';

const getColor = (props: any) => {
  if (props.isDragAccept) {
    return '#00e676';
  }
  if (props.isDragReject) {
    return '#ff1744';
  }
  if (props.isFocused) {
    return '#2196f3';
  }
  return '#eeeeee';
}

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border-width: 2px;
  border-radius: 2px;
  border-color: ${(props: any) => getColor(props)};
  border-style: dashed;
  background-color: #292169;
  color: #bdbdbd;
  outline: none;
  transition: border .24s ease-in-out;
`;

export function DropZone(props: any) {

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    let count = 0
    const promises: Promise<any>[] = acceptedFiles.map(inputFile => {
      const process = props.processFile(inputFile)
      process.then(() => {
        count += 1
        props.setProgress(count / acceptedFiles.length)
      })
      return process
    })
    const results = await Promise.all(promises)
    props.handleResults(results)
  }, [])

  const { getRootProps, getInputProps } = useDropzone({ onDrop })

  const {
    isFocused,
    isDragAccept,
    isDragReject
  } = useDropzone();

  return (
    <div className="container">
      <Container {...getRootProps({ isFocused, isDragAccept, isDragReject })}>
        <input {...getInputProps()} />
        <p>Drag 'n' drop some SLP replay files here, or click to select files</p>
      </Container>
    </div>
  );
}

<DropZone />