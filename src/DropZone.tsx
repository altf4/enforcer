import React, {useCallback} from 'react';
import {useDropzone} from 'react-dropzone';
import styled from 'styled-components';
import {hasDisallowedCStickCoords, Coord} from 'slp-enforcer'
import {SlippiGame, FramesType} from 'slp-enforcer'

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

  const onDrop = useCallback((acceptedFiles: any) => {
    for (var inputFile of acceptedFiles) {
      const reader = new FileReader()

      reader.onabort = () => console.log('file reading was aborted')
      reader.onerror = () => console.log('file reading has failed')
      reader.onload = () => {
        // Do whatever you want with the file contents
        const binaryStr = reader.result
        const game = new SlippiGame(binaryStr as ArrayBuffer);
        var frames: FramesType = game.getFrames()
        var coords: Coord[] = []

        var frame: number = -123
        while (true) {
          try {
            var coord = new Coord()
            var x = frames[frame].players[0]?.pre.cStickX
            if (x !== undefined && x !== null) {
              coord.x = x
              if (Math.abs(.8 - Math.abs(x)) < 0.01) {
                console.log(frame, x)
              }
            }
            var y = frames[frame].players[0]?.pre.cStickY
            if (y !== undefined && y !== null) {
              coord.y = y
            }
            coords.push(coord)

          }
          catch(err) {
            console.log("max frames: ", frame, err)
            break
          } 
          frame += 1
        }

        
        console.log(hasDisallowedCStickCoords(coords))

      }
      reader.readAsArrayBuffer(inputFile)
    }
  }, [])

  const {getRootProps, getInputProps} = useDropzone({onDrop})

  const {
    isFocused,
    isDragAccept,
    isDragReject
  } = useDropzone();
  
  return (
    <div className="container">
      <Container {...getRootProps({isFocused, isDragAccept, isDragReject})}>
        <input {...getInputProps()} />
        <p>Drag 'n' drop some files here, or click to select files</p>
      </Container>
    </div>
  );
}

<DropZone />