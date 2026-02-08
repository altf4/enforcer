import { useRef, useEffect } from 'react'
import styled from 'styled-components'

export type CoordProps = {
    x: number
    y: number
    frameNumber: number
}

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.xs};
    padding: ${({ theme }) => theme.spacing.sm};
    background: ${({ theme }) => theme.colors.background.secondary};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    border: 1px solid ${({ theme }) => theme.colors.border};
`

const Label = styled.div`
    font-size: ${({ theme }) => theme.typography.sizes.caption};
    color: ${({ theme }) => theme.colors.text.secondary};
    font-weight: ${({ theme }) => theme.typography.weights.medium};
`

const Canvas = styled.canvas`
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.borderRadius.sm};
    background: ${({ theme }) => theme.colors.background.primary};
`

const Coordinates = styled.div`
    font-size: ${({ theme }) => theme.typography.sizes.caption};
    color: ${({ theme }) => theme.colors.text.tertiary};
    font-family: ${({ theme }) => theme.typography.fonts.mono};
`

export function CoordElement(props: CoordProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (canvas === null) {
            return
        }
        const context = canvas.getContext('2d')
        if (context === null) {
            return
        }

        // Clear canvas
        context.clearRect(0, 0, 120, 120)

        // Draw outer circle with better styling
        let radius: number = 55
        let centerX = 60
        let centerY = 60

        context.beginPath()
        context.arc(centerX, centerY, radius, 0, 2 * Math.PI)
        context.strokeStyle = '#3a3f4b'
        context.lineWidth = 2
        context.stroke()

        // Draw crosshair lines
        context.strokeStyle = '#3a3f4b'
        context.lineWidth = 1
        context.beginPath()
        context.moveTo(centerX - radius, centerY)
        context.lineTo(centerX + radius, centerY)
        context.moveTo(centerX, centerY - radius)
        context.lineTo(centerX, centerY + radius)
        context.stroke()

        // Draw coord dot with glow effect
        let dotSize: number = 5
        context.beginPath()
        context.fillStyle = "#ef4444"
        context.arc((props.x * radius) + centerX, (props.y * -radius) + centerY, dotSize, 0, 2 * Math.PI)
        context.fill()

        // Add glow
        context.shadowBlur = 10
        context.shadowColor = "#ef4444"
        context.fill()
        context.shadowBlur = 0
    })

    return (
        <Container>
            <Label>Frame: {props.frameNumber}</Label>
            <Canvas ref={canvasRef} width={120} height={120} />
            <Coordinates>({props.x.toFixed(3)}, {props.y.toFixed(3)})</Coordinates>
        </Container>
    )
}