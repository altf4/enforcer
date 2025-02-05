import './index.css'

export function ProgressBar({ progress }: { progress: number }) {

  if (progress >= 1.0) {
    return null
  }
  let roundedProgress = Math.round(progress * 10000) / 100
  return (
    <div >
        <div>Crunching the numbers...</div>
        <progress value={progress} />
        <div>{roundedProgress}%</div>
    </div>
  )
}

