import './index.css'

export function ProgressBar({ progress }: { progress: number }) {

  if (progress >= 1.0) {
    return
  }
  return (
    <div >
        <div>Crunching the numbers...</div>
        <progress value={progress} />
    </div>
  )
}

