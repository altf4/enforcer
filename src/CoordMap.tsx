import { useRef, useEffect } from 'react'
import { Coord } from 'slp-enforcer'

let radius: number = 140
export type CoordMapProps = {
    coords: Coord[]
}

export function CoordMap(props: CoordMapProps) {
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
        context.beginPath()
        context.arc(radius, radius, radius, 0, 2 * Math.PI)
        context.stroke()

        // Draw blue square representing the uptilt rounding box
        context.beginPath()
        context.lineWidth = 2
        context.fillStyle = "blue"
        let anchorX =  (-0.2875 * radius) + radius
        let anchorY = (0.275 * -radius) + radius
        let width =  0.2875*2 * radius
        let height = .075 * radius
        context.rect(anchorX, anchorY, width, height)
        context.fill()

        // Draw orange square representing the uptilt area
        context.beginPath()
        context.lineWidth = 2
        context.fillStyle = "orange"
        anchorX =  (-0.2875 * radius) + radius
        anchorY = (0.45 * -radius) + radius
        width =  0.2875*2 * radius
        height = ((0.45-0.2875) * radius) +1
        context.rect(anchorX, anchorY, width, height)
        context.fill()
        
        for (let coord of props.coords) {
            // Draw coord dot
            let dotSize: number = 1
            context.beginPath()
            context.fillStyle = "red"
            context.arc((coord.x * radius) + radius, (coord.y * -radius) + radius, dotSize, 0, 2 * Math.PI)
            context.fill()
        }
    })

    return <div><canvas ref={canvasRef} width={radius*2} height={radius*2} /></div>
}