import type { GameDataRow } from './ResultsTable'

export interface AnalysisTask {
  taskId: number
  filename: string
  buffer: ArrayBuffer
}

export interface TaskResult {
  taskId: number
  result?: GameDataRow
  error?: string
}

type ResultCallback = (result: TaskResult) => void

interface WorkerHandle {
  worker: Worker
  busy: boolean
  index: number
}

interface QueuedTask {
  task: AnalysisTask
  onResult: ResultCallback
}

export class WorkerPool {
  private workers: WorkerHandle[] = []
  private queue: QueuedTask[] = []
  private workerCount: number
  private destroyed = false

  constructor(workerCount?: number) {
    const cores = navigator.hardwareConcurrency || 4
    this.workerCount = workerCount ?? Math.min(Math.max(cores - 1, 1), 8)
  }

  async initialize(): Promise<void> {
    const readyPromises: Promise<void>[] = []

    for (let i = 0; i < this.workerCount; i++) {
      const worker = new Worker(
        new URL('./analysis.worker.ts', import.meta.url)
      )

      const readyPromise = new Promise<void>((resolve, reject) => {
        const onMessage = (e: MessageEvent) => {
          if (e.data.type === 'ready') {
            worker.removeEventListener('message', onMessage)
            resolve()
          } else if (e.data.type === 'error' && e.data.taskId === -1) {
            worker.removeEventListener('message', onMessage)
            reject(new Error(e.data.error))
          }
        }
        worker.addEventListener('message', onMessage)
      })

      worker.postMessage({ type: 'init' })
      this.workers.push({ worker, busy: false, index: i })
      readyPromises.push(readyPromise)
    }

    await Promise.all(readyPromises)
  }

  submitTask(task: AnalysisTask, onResult: ResultCallback): void {
    if (this.destroyed) {
      onResult({ taskId: task.taskId, error: 'Worker pool destroyed' })
      return
    }

    const idle = this.workers.find(w => !w.busy)
    if (idle) {
      this.dispatch(idle, task, onResult)
    } else {
      this.queue.push({ task, onResult })
    }
  }

  private dispatch(handle: WorkerHandle, task: AnalysisTask, onResult: ResultCallback): void {
    handle.busy = true

    const onMessage = (e: MessageEvent) => {
      const msg = e.data
      if (msg.taskId !== task.taskId) return

      handle.worker.removeEventListener('message', onMessage)
      handle.worker.removeEventListener('error', onError)
      handle.busy = false

      onResult(msg)
      this.dequeue()
    }

    const onError = (e: ErrorEvent) => {
      handle.worker.removeEventListener('message', onMessage)
      handle.worker.removeEventListener('error', onError)
      handle.busy = false

      onResult({ taskId: task.taskId, error: `Worker error: ${e.message}` })
      this.replaceWorker(handle.index)
      this.dequeue()
    }

    handle.worker.addEventListener('message', onMessage)
    handle.worker.addEventListener('error', onError)

    handle.worker.postMessage(
      { type: 'analyze', taskId: task.taskId, filename: task.filename, buffer: task.buffer },
      [task.buffer]
    )
  }

  private replaceWorker(index: number): void {
    this.workers[index].worker.terminate()

    const worker = new Worker(
      new URL('./analysis.worker.ts', import.meta.url)
    )
    worker.postMessage({ type: 'init' })

    const handle: WorkerHandle = { worker, busy: true, index }
    this.workers[index] = handle

    worker.addEventListener('message', (e: MessageEvent) => {
      if (e.data.type === 'ready') {
        handle.busy = false
        this.dequeue()
      }
    })
  }

  private dequeue(): void {
    if (this.queue.length === 0) return
    const idle = this.workers.find(w => !w.busy)
    if (!idle) return
    const next = this.queue.shift()!
    this.dispatch(idle, next.task, next.onResult)
  }

  destroy(): void {
    this.destroyed = true
    for (const { worker } of this.workers) {
      worker.terminate()
    }
    for (const { task, onResult } of this.queue) {
      onResult({ taskId: task.taskId, error: 'Worker pool destroyed' })
    }
    this.workers = []
    this.queue = []
  }
}
