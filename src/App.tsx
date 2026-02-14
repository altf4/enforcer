import * as React from 'react'
import { ThemeProvider } from 'styled-components';
import styled from 'styled-components';
import { theme } from './styles/theme';
import { GlobalStyles } from './styles/GlobalStyles';
import './App.css';
import { DropZone, DropZoneHandle } from './DropZone'
import { GameDataRow } from './ResultsTable'
import { ProgressBar } from './ProgressBar'
import { Footer } from './Footer';
import { Header } from './components/layout/Header';
import { WelcomeScreen } from './components/welcome/WelcomeScreen';
import { ResultsView } from './components/results/ResultsView';
import { StickyProgressBar } from './components/shared/StickyProgressBar';
import { WorkerPool, TaskResult } from './WorkerPool'
import packageJson from '../package.json'
const LIBRARY_VERSION = packageJson.dependencies['slp-enforcer']

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

function App() {
  const [results, updateResults] = React.useState<GameDataRow[]>([])
  const [progress, setProgress] = React.useState<number>(1)
  const [totalFileCount, setTotalFileCount] = React.useState<number>(0)
  const [processedFileCount, setProcessedFileCount] = React.useState<number>(0)
  const dropZoneRef = React.useRef<DropZoneHandle>(null)

  // Ref for synchronous duplicate checking (avoids stale closure issues)
  const uploadedFilenamesRef = React.useRef<Set<string>>(new Set())

  // Accumulate results and flush them in batches to reduce re-renders
  const pendingResults = React.useRef<GameDataRow[]>([])
  const flushTimerRef = React.useRef<number | null>(null)

  const flushPendingResults = React.useCallback(() => {
    if (pendingResults.current.length === 0) return
    const batch = pendingResults.current
    pendingResults.current = []
    flushTimerRef.current = null

    updateResults(oldList => [...oldList, ...batch])
    setProcessedFileCount(prev => prev + batch.length)
  }, [])

  // Flush any remaining results when processing completes
  React.useEffect(() => {
    if (progress >= 1.0 && pendingResults.current.length > 0) {
      if (flushTimerRef.current !== null) {
        cancelAnimationFrame(flushTimerRef.current)
      }
      flushPendingResults()
    }
  }, [progress, flushPendingResults])

  const handleSingleResult = React.useCallback((newResult: GameDataRow) => {
    pendingResults.current.push(newResult)

    // Schedule a flush on the next animation frame if one isn't already pending.
    // This batches results that arrive within the same frame.
    if (flushTimerRef.current === null) {
      flushTimerRef.current = requestAnimationFrame(() => {
        flushPendingResults()
      })
    }
  }, [flushPendingResults])

  const startProcessing = React.useCallback((fileCount: number) => {
    setTotalFileCount(fileCount)
    setProcessedFileCount(0)
    setProgress(0)
  }, [])

  const registerFilename = React.useCallback((filename: string): boolean => {
    if (uploadedFilenamesRef.current.has(filename)) {
      return false
    }
    uploadedFilenamesRef.current.add(filename)
    return true
  }, [])

  // Worker pool for parallel WASM analysis
  const poolRef = React.useRef<WorkerPool | null>(null)
  const taskIdCounter = React.useRef(0)

  React.useEffect(() => {
    const pool = new WorkerPool()
    poolRef.current = pool
    pool.initialize().catch(err => {
      console.error('Failed to initialize worker pool:', err)
    })
    return () => {
      pool.destroy()
      poolRef.current = null
    }
  }, [])

  const processFile = React.useCallback((file: File, buffer: ArrayBuffer): Promise<GameDataRow> => {
    return new Promise((resolve) => {
      const pool = poolRef.current
      if (!pool) {
        resolve({
          filename: file.name, stage: -1, overallResult: "💀 Could Not Parse",
          results: ["⦻", "⦻", "⦻", "⦻"], controllerTypes: ["?", "?", "?", "?"],
          characterIds: [-1, -1, -1, -1], costumes: [-1, -1, -1, -1], details: [],
          errorReason: "Worker pool not initialized"
        })
        return
      }

      const taskId = taskIdCounter.current++
      pool.submitTask(
        { taskId, filename: file.name, buffer },
        (taskResult: TaskResult) => {
          if (taskResult.error || !taskResult.result) {
            resolve({
              filename: file.name, stage: -1, overallResult: "💀 Could Not Parse",
              results: ["⦻", "⦻", "⦻", "⦻"], controllerTypes: ["?", "?", "?", "?"],
              characterIds: [-1, -1, -1, -1], costumes: [-1, -1, -1, -1], details: [],
              errorReason: taskResult.error || "Unknown worker error"
            })
          } else {
            resolve(taskResult.result)
          }
        }
      )
    })
  }, [])

  const showWelcome = results.length === 0 && progress >= 1.0;
  const showResults = results.length > 0;
  const isProcessing = progress < 1.0 && results.length > 0;

  const triggerFileUpload = () => {
    dropZoneRef.current?.openFilePicker();
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <div className="App">
        <Header
          version={LIBRARY_VERSION}
          showUploadButton={showResults}
          onUploadMore={triggerFileUpload}
        />
        <header className="App-header">
          <MainContent>
            {/* Sticky Progress Bar - shown while processing with results */}
            {isProcessing && (
              <StickyProgressBar
                progress={progress}
                currentFile={processedFileCount}
                totalFiles={totalFileCount}
              />
            )}

            {showWelcome && (
              <WelcomeScreen>
                <DropZone
                  processFile={processFile}
                  isActive={true}
                  setProgress={setProgress}
                  handleResults={handleSingleResult}
                  startProcessing={startProcessing}
                  registerFilename={registerFilename}
                />
              </WelcomeScreen>
            )}

            {showResults && (
              <ResultsView results={results} />
            )}

            {/* Initial Progress Bar - shown before any results */}
            {!showResults && progress < 1.0 && <ProgressBar progress={progress} />}

            {/* DropZone at bottom when showing results */}
            {showResults && (
              <DropZone
                ref={dropZoneRef}
                processFile={processFile}
                isActive={true}
                setProgress={setProgress}
                handleResults={handleSingleResult}
                startProcessing={startProcessing}
                registerFilename={registerFilename}
              />
            )}
          </MainContent>

          <Footer isActive={showWelcome || showResults} version={LIBRARY_VERSION} commitHash={process.env.REACT_APP_GIT_HASH || 'unknown'}/>
        </header>
      </div>
    </ThemeProvider>
  );
}

export default App;
