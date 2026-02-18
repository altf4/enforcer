import { useRef, useEffect, memo, useMemo } from 'react'
import styled from 'styled-components'
import { Coord } from 'slp-enforcer'

const QUANTIZE = 80    // cells per unit of coordinate range
const PADDING = 40     // space for axis labels
const TARGET_GRID = 400 // max grid dimension in px

export type FuzzCoordMapProps = {
    evidence: Coord[]
    allCoords: Coord[]
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
    max-width: 100%;
    height: auto;
`

const Legend = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: ${({ theme }) => theme.spacing.md};
    justify-content: center;
    font-size: ${({ theme }) => theme.typography.sizes.caption};
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

type Viewport = { xMin: number; xMax: number; yMin: number; yMax: number }

const AXIS_THRESHOLD = 0.1

function getViewport(evidence: Coord[]): Viewport {
    if (evidence.length === 0) {
        return { xMin: 0, xMax: 1, yMin: 0, yMax: 1 }
    }
    let sumX = 0, sumY = 0
    for (const c of evidence) {
        sumX += c.x
        sumY += c.y
    }
    const cx = sumX / evidence.length
    const cy = sumY / evidence.length
    const nearX = Math.abs(cx) < AXIS_THRESHOLD
    const nearY = Math.abs(cy) < AXIS_THRESHOLD

    if (nearX && nearY) {
        // Near origin: zoom to ±0.25
        return { xMin: -0.25, xMax: 0.25, yMin: -0.25, yMax: 0.25 }
    }
    if (nearX) {
        // Near Y axis: strip along Y axis
        return {
            xMin: -0.25,
            xMax: 0.25,
            yMin: cy >= 0 ? 0 : -1,
            yMax: cy >= 0 ? 1 : 0,
        }
    }
    if (nearY) {
        // Near X axis: strip along X axis
        return {
            xMin: cx >= 0 ? 0 : -1,
            xMax: cx >= 0 ? 1 : 0,
            yMin: -0.25,
            yMax: 0.25,
        }
    }
    // Normal quadrant
    if (cx >= 0 && cy >= 0) return { xMin: 0, xMax: 1, yMin: 0, yMax: 1 }
    if (cx < 0 && cy >= 0) return { xMin: -1, xMax: 0, yMin: 0, yMax: 1 }
    if (cx >= 0 && cy < 0) return { xMin: 0, xMax: 1, yMin: -1, yMax: 0 }
    return { xMin: -1, xMax: 0, yMin: -1, yMax: 0 }
}

function isInViewport(coord: Coord, vp: Viewport): boolean {
    return coord.x >= vp.xMin && coord.x <= vp.xMax &&
           coord.y >= vp.yMin && coord.y <= vp.yMax
}

export const FuzzCoordMap = memo(function FuzzCoordMap(props: FuzzCoordMapProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const vp = useMemo(() => getViewport(props.evidence), [props.evidence])

    const dims = useMemo(() => {
        const xRange = vp.xMax - vp.xMin
        const yRange = vp.yMax - vp.yMin
        const xCells = Math.round(xRange * QUANTIZE)
        const yCells = Math.round(yRange * QUANTIZE)
        const cellSize = TARGET_GRID / Math.max(xCells, yCells)
        const gridW = xCells * cellSize
        const gridH = yCells * cellSize
        return { xCells, yCells, cellSize, gridW, gridH, canvasW: gridW + PADDING, canvasH: gridH + PADDING }
    }, [vp])

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const { xCells, yCells, gridW, gridH, canvasW, canvasH } = dims
        const step = 1 / QUANTIZE

        ctx.clearRect(0, 0, canvasW, canvasH)

        const toPixelX = (val: number) => PADDING + ((val - vp.xMin) / (vp.xMax - vp.xMin)) * gridW
        const toPixelY = (val: number) => PADDING + ((vp.yMax - val) / (vp.yMax - vp.yMin)) * gridH

        // --- Minor grid lines (every quantized step) ---
        ctx.strokeStyle = '#252830'
        ctx.lineWidth = 0.5
        for (let i = 0; i <= xCells; i++) {
            const px = PADDING + i * dims.cellSize
            ctx.beginPath()
            ctx.moveTo(px, PADDING)
            ctx.lineTo(px, PADDING + gridH)
            ctx.stroke()
        }
        for (let i = 0; i <= yCells; i++) {
            const py = PADDING + i * dims.cellSize
            ctx.beginPath()
            ctx.moveTo(PADDING, py)
            ctx.lineTo(PADDING + gridW, py)
            ctx.stroke()
        }

        // --- Major grid lines (every 10 cells = 0.125) ---
        ctx.strokeStyle = '#3a3f4b'
        ctx.lineWidth = 1
        for (let i = 0; i <= xCells; i += 10) {
            const px = PADDING + i * dims.cellSize
            ctx.beginPath()
            ctx.moveTo(px, PADDING)
            ctx.lineTo(px, PADDING + gridH)
            ctx.stroke()
        }
        for (let i = 0; i <= yCells; i += 10) {
            const py = PADDING + i * dims.cellSize
            ctx.beginPath()
            ctx.moveTo(PADDING, py)
            ctx.lineTo(PADDING + gridW, py)
            ctx.stroke()
        }

        // --- Origin axes (thicker) ---
        ctx.strokeStyle = '#5a5f6b'
        ctx.lineWidth = 2
        if (vp.yMin <= 0 && vp.yMax >= 0) {
            const py = toPixelY(0)
            ctx.beginPath()
            ctx.moveTo(PADDING, py)
            ctx.lineTo(PADDING + gridW, py)
            ctx.stroke()
        }
        if (vp.xMin <= 0 && vp.xMax >= 0) {
            const px = toPixelX(0)
            ctx.beginPath()
            ctx.moveTo(px, PADDING)
            ctx.lineTo(px, PADDING + gridH)
            ctx.stroke()
        }

        // --- Unit circle arc ---
        ctx.strokeStyle = '#5a5f6b'
        ctx.lineWidth = 2
        ctx.beginPath()
        const arcSteps = 200
        let prevInside = false
        for (let i = 0; i <= arcSteps; i++) {
            const t = (i / arcSteps) * 2 * Math.PI
            const ax = Math.cos(t)
            const ay = Math.sin(t)
            const inside = ax >= vp.xMin && ax <= vp.xMax && ay >= vp.yMin && ay <= vp.yMax
            if (inside) {
                const px = toPixelX(ax)
                const py = toPixelY(ay)
                if (!prevInside) {
                    ctx.moveTo(px, py)
                } else {
                    ctx.lineTo(px, py)
                }
            }
            prevInside = inside
        }
        ctx.stroke()

        // --- Axis labels ---
        ctx.fillStyle = '#9ca3af'
        ctx.font = '10px monospace'
        // X axis labels (bottom)
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        for (let i = 0; i <= xCells; i += 20) {
            const val = vp.xMin + i * step
            const px = PADDING + i * dims.cellSize
            ctx.fillText(val.toFixed(2), px, PADDING + gridH + 4)
        }
        // Y axis labels (left)
        ctx.textAlign = 'right'
        ctx.textBaseline = 'middle'
        for (let i = 0; i <= yCells; i += 20) {
            const val = vp.yMax - i * step
            const py = PADDING + i * dims.cellSize
            ctx.fillText(val.toFixed(2), PADDING - 4, py)
        }

        // --- All observed coords in light grey (background) ---
        ctx.fillStyle = '#555555'
        for (const coord of props.allCoords) {
            if (!isInViewport(coord, vp)) continue
            ctx.beginPath()
            ctx.arc(toPixelX(coord.x), toPixelY(coord.y), 2, 0, 2 * Math.PI)
            ctx.fill()
        }

        // --- Evidence coords in red (foreground) ---
        ctx.fillStyle = '#ef4444'
        for (const coord of props.evidence) {
            if (!isInViewport(coord, vp)) continue
            ctx.beginPath()
            ctx.arc(toPixelX(coord.x), toPixelY(coord.y), 3, 0, 2 * Math.PI)
            ctx.fill()
        }
    }, [props.evidence, props.allCoords, vp, dims])

    return (
        <Container>
            <Canvas ref={canvasRef} width={dims.canvasW} height={dims.canvasH} />
            <Legend>
                <LegendItem>
                    <LegendColor $color="#ef4444" />
                    <span>Flagged coordinates</span>
                </LegendItem>
                <LegendItem>
                    <LegendColor $color="#555555" />
                    <span>All observed coordinates</span>
                </LegendItem>
            </Legend>
        </Container>
    )
})
