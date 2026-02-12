import { useRef, useEffect, memo } from 'react'
import styled from 'styled-components'
import { Coord } from 'slp-enforcer'

let radius: number = 155
export type CoordMapProps = {
    coords: Coord[]
    showZones: boolean
}

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.md};
    padding: ${({ theme }) => theme.spacing.md};
    background: ${({ theme }) => theme.colors.background.secondary};
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    border: 1px solid ${({ theme }) => theme.colors.border};
`

const Canvas = styled.canvas`
    border: 2px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    background: ${({ theme }) => theme.colors.background.primary};
`

const Legend = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: ${({ theme }) => theme.spacing.md};
    justify-content: center;
    font-size: ${({ theme }) => theme.typography.sizes.small};
    color: ${({ theme }) => theme.colors.text.secondary};
`

const LegendItem = styled.div`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.xs};
`

const LegendColor = styled.div<{ $color: string }>`
    width: 16px;
    height: 16px;
    background: ${({ $color }) => $color};
    border-radius: ${({ theme }) => theme.borderRadius.sm};
    border: 1px solid ${({ theme }) => theme.colors.border};
`

const CoordCount = styled.div`
    font-size: ${({ theme }) => theme.typography.sizes.caption};
    color: ${({ theme }) => theme.colors.text.tertiary};
    font-weight: ${({ theme }) => theme.typography.weights.medium};
`

export const CoordMap = memo(function CoordMap(props: CoordMapProps) {
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
        context.clearRect(0, 0, radius * 2, radius * 2)

        // Draw outer circle with better styling
        context.beginPath()
        context.arc(radius, radius, radius, 0, 2 * Math.PI)
        context.strokeStyle = '#3a3f4b'
        context.lineWidth = 2
        context.stroke()

        // Draw crosshair lines
        context.strokeStyle = '#3a3f4b'
        context.lineWidth = 1
        context.beginPath()
        context.moveTo(0, radius)
        context.lineTo(radius * 2, radius)
        context.moveTo(radius, 0)
        context.lineTo(radius, radius * 2)
        context.stroke()

        if (props.showZones) {
            // Draw blue square representing the uptilt rounding box
            context.beginPath()
            context.lineWidth = 2
            context.fillStyle = "rgba(59, 130, 246, 0.5)" // blue with transparency
            let anchorX =  (-0.2875 * radius) + radius
            let anchorY = (0.275 * -radius) + radius
            let width =  0.2875*2 * radius
            let height = .075 * radius
            context.rect(anchorX, anchorY, width, height)
            context.fill()
            context.strokeStyle = "#3b82f6"
            context.stroke()

            // Draw orange square representing the uptilt area
            context.beginPath()
            context.lineWidth = 2
            context.fillStyle = "rgba(251, 146, 60, 0.4)" // orange with transparency
            anchorX =  (-0.2875 * radius) + radius
            anchorY = (0.45 * -radius) + radius
            width =  0.2875*2 * radius
            height = ((0.45-0.2875) * radius) +1
            context.rect(anchorX, anchorY, width, height)
            context.fill()
            context.strokeStyle = "#f59e0b"
            context.stroke()
        }

        for (let coord of props.coords) {
            // Draw coord dot with better visibility
            let dotSize: number = 2
            context.beginPath()
            context.fillStyle = "#ef4444"
            context.arc((coord.x * radius) + radius, (coord.y * -radius) + radius, dotSize, 0, 2 * Math.PI)
            context.fill()
        }
    }, [props.coords, props.showZones])

    return (
        <Container>
            <Canvas ref={canvasRef} width={radius*2} height={radius*2} />
            <CoordCount>{props.coords.length} coordinate{props.coords.length !== 1 ? 's' : ''} plotted</CoordCount>
            {props.showZones && (
                <Legend>
                    <LegendItem>
                        <LegendColor $color="#3b82f6" />
                        <span>Uptilt Rounding Box</span>
                    </LegendItem>
                    <LegendItem>
                        <LegendColor $color="#f59e0b" />
                        <span>Uptilt Area</span>
                    </LegendItem>
                    <LegendItem>
                        <LegendColor $color="#ef4444" />
                        <span>Detected Coordinates</span>
                    </LegendItem>
                </Legend>
            )}
        </Container>
    )
})
