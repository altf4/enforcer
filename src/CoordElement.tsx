import { useRef, useEffect } from 'react'

export type CoordProps = {
    x: number
    y: number
    frameNumber: number
}

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
        // Draw outter circle
        let radius: number = 30
        context.beginPath()
        context.arc(radius, radius, radius, 0, 2 * Math.PI)
        context.stroke()

        // Draw coord dot
        let dotSize: number = 4
        context.beginPath()
        context.fillStyle = "red"
        context.arc((props.x * radius) + radius, (props.y * -radius) + radius, dotSize, 0, 2 * Math.PI)
        context.fill()
    })

    return <div><div>Frame: {props.frameNumber}</div><canvas ref={canvasRef} width={60} height={60} /><div>({props.x}, {props.y})</div></div>
}