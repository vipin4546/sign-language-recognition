import { useEffect, useRef, useState, useCallback } from 'react'

const WS_URL = 'ws://localhost:8000/ws'
const FRAME_INTERVAL_MS = 100 // capture frame every 100ms

/**
 * useGesture — core hook for sign language recognition.
 *
 * Responsibilities:
 *  1. Access webcam via getUserMedia
 *  2. Capture frames at 100ms intervals and send to WebSocket
 *  3. Receive real-time predictions from backend
 *  4. Build output text from gesture events
 *  5. Trigger Web Speech API TTS when `speak: true` received
 *
 * Returns:
 *  - videoRef: attach to <video> element
 *  - text: accumulated recognized sentence
 *  - currentGesture: currently detected gesture label
 *  - progress: hold confidence 0–1
 *  - isConnected: WebSocket open status
 *  - isStreaming: camera is active
 *  - startCamera: function to request camera access
 *  - stopCamera: function to stop camera
 *  - clearText: function to reset text
 */
export function useGesture() {
  const videoRef = useRef(null)
  const wsRef = useRef(null)
  const streamRef = useRef(null)
  const frameTimerRef = useRef(null)
  const canvasRef = useRef(document.createElement('canvas'))

  const [text, setText] = useState('')
  const [currentGesture, setCurrentGesture] = useState(null)
  const [progress, setProgress] = useState(0)
  const [isConnected, setIsConnected] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)

  // ─── WebSocket connection ─────────────────────────────────────────────────
  const connectWebSocket = useCallback(() => {
    // Close any existing connection
    if (wsRef.current) wsRef.current.close()

    const ws = new WebSocket(WS_URL)
    wsRef.current = ws

    ws.onopen = () => {
      console.log('[WS] Connected to backend')
      setIsConnected(true)
    }

    ws.onclose = () => {
      console.log('[WS] Disconnected')
      setIsConnected(false)
      // Auto-reconnect after 2s if camera is still streaming
      if (streamRef.current) {
        setTimeout(connectWebSocket, 2000)
      }
    }

    ws.onerror = (err) => {
      console.warn('[WS] Error:', err)
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        handlePrediction(data)
      } catch (e) {
        console.error('[WS] Failed to parse message:', e)
      }
    }
  }, [])

  // ─── Handle incoming prediction data ─────────────────────────────────────
  const handlePrediction = useCallback((data) => {
    const { text: newText, current, progress: conf, speak } = data

    setCurrentGesture(current || null)
    setProgress(conf || 0)

    // Update accumulated text if backend sends updated text
    if (newText !== undefined) {
      setText(newText)
    }

    // Text-to-speech when full stop confirmed
    if (speak && newText) {
      speakText(newText)
    }
  }, [])

  // ─── Web Speech API TTS ───────────────────────────────────────────────────
  const speakText = (sentence) => {
    if (!window.speechSynthesis) return
    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(sentence)
    utterance.rate = 0.95
    utterance.pitch = 1
    utterance.lang = 'en-US'
    window.speechSynthesis.speak(utterance)
  }

  // ─── Frame capture loop ───────────────────────────────────────────────────
  const startFrameCapture = useCallback(() => {
    const canvas = canvasRef.current
    const video = videoRef.current

    const captureFrame = () => {
      // Only send if WS is open and video is playing
      if (
        wsRef.current?.readyState === WebSocket.OPEN &&
        video?.readyState === HTMLMediaElement.HAVE_ENOUGH_DATA
      ) {
        const { videoWidth: w, videoHeight: h } = video
        if (w === 0 || h === 0) return

        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')

        // Draw mirrored frame (flip horizontally to match display)
        ctx.save()
        ctx.scale(-1, 1)
        ctx.drawImage(video, -w, 0, w, h)
        ctx.restore()

        // Convert to JPEG blob and send
        canvas.toBlob(
          (blob) => {
            if (blob && wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(blob)
            }
          },
          'image/jpeg',
          0.8 // quality
        )
      }
    }

    frameTimerRef.current = setInterval(captureFrame, FRAME_INTERVAL_MS)
  }, [])

  // ─── Camera management ────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: false,
      })

      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      setIsStreaming(true)
      connectWebSocket()
      startFrameCapture()
    } catch (err) {
      console.error('[Camera] Access denied or unavailable:', err)
      alert('Could not access webcam. Please allow camera permissions and try again.')
    }
  }, [connectWebSocket, startFrameCapture])

  const stopCamera = useCallback(() => {
    // Stop frame capture
    if (frameTimerRef.current) {
      clearInterval(frameTimerRef.current)
      frameTimerRef.current = null
    }

    // Stop all video tracks
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    // Close WebSocket
    wsRef.current?.close()
    wsRef.current = null

    setIsStreaming(false)
    setIsConnected(false)
    setCurrentGesture(null)
    setProgress(0)
  }, [])

  const clearText = useCallback(() => {
    setText('')
  }, [])

  // ─── Cleanup on unmount ───────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  return {
    videoRef,
    text,
    currentGesture,
    progress,
    isConnected,
    isStreaming,
    startCamera,
    stopCamera,
    clearText,
  }
}
