import React, { useState, useEffect, useRef } from 'react'
import { X, Camera, Mic, MapPin, Loader2, Play, Pause, Trash2, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function ReportDefectModal({ isOpen, onClose }) {
  const { addPoints } = useAuth()
  const fileInputRef = useRef(null)

  // Form states
  const [photo, setPhoto] = useState(null)
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [severity, setSeverity] = useState('medium') // 'low' | 'medium' | 'high'
  
  // Audio state
  const [isRecording, setIsRecording] = useState(false)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [voiceMemo, setVoiceMemo] = useState(null) // { duration: number }
  const [isPlayingVoice, setIsPlayingVoice] = useState(false)
  const [playbackSeconds, setPlaybackSeconds] = useState(0)

  // Action states
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const recordingIntervalRef = useRef(null)
  const playbackIntervalRef = useRef(null)

  // Clean intervals on unmount
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current)
      if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current)
    }
  }, [])

  if (!isOpen) return null

  // Reset form
  const resetForm = () => {
    setPhoto(null)
    setLocation('')
    setDescription('')
    setSeverity('medium')
    setVoiceMemo(null)
    setIsRecording(false)
    setRecordingSeconds(0)
    setIsPlayingVoice(false)
    setPlaybackSeconds(0)
    setShowSuccess(false)
    setIsSubmitting(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  // Get location mock
  const handleGetLocation = () => {
    setIsGettingLocation(true)
    setTimeout(() => {
      setIsGettingLocation(false)
      setLocation('ul. Mickiewicza 24, Tymbark')
    }, 900)
  }

  // Voice recording mock handlers
  const startRecording = () => {
    if (isPlayingVoice) {
      stopPlayback()
    }
    setVoiceMemo(null)
    setIsRecording(true)
    setRecordingSeconds(0)
    recordingIntervalRef.current = setInterval(() => {
      setRecordingSeconds(prev => prev + 1)
    }, 1000)
  }

  const stopRecording = () => {
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current)
      recordingIntervalRef.current = null
    }
    setIsRecording(false)
    if (recordingSeconds > 0) {
      setVoiceMemo({ duration: recordingSeconds })
    }
  }

  const deleteVoiceMemo = () => {
    stopPlayback()
    setVoiceMemo(null)
  }

  // Playback mock handlers
  const startPlayback = () => {
    if (!voiceMemo) return
    setIsPlayingVoice(true)
    setPlaybackSeconds(0)
    playbackIntervalRef.current = setInterval(() => {
      setPlaybackSeconds(prev => {
        if (prev >= voiceMemo.duration - 1) {
          stopPlayback()
          return voiceMemo.duration
        }
        return prev + 1
      })
    }, 1000)
  }

  const stopPlayback = () => {
    if (playbackIntervalRef.current) {
      clearInterval(playbackIntervalRef.current)
      playbackIntervalRef.current = null
    }
    setIsPlayingVoice(false)
    setPlaybackSeconds(0)
  }

  // Handle native file input change
  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhoto(reader.result)
        // Automatically mock location/description if not filled
        if (!location) setLocation('ul. Leśna, Tymbark')
        if (!description) setDescription('Zgłoszenie usterki lokalnej.')
      }
      reader.readAsDataURL(file)
    }
  }

  // Submit report
  const handleSubmit = async () => {
    setIsSubmitting(true)
    setTimeout(async () => {
      setIsSubmitting(false)
      setShowSuccess(true)
      // Reward user with 10 pts
      try {
        await addPoints(10, 'report')
      } catch (e) {
        console.error('Error adding points', e)
      }
    }, 1200)
  }

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      {/* CSS Animations style block */}
      <style>{`
        @keyframes customPulse {
          0%, 100% { transform: scaleY(0.4); opacity: 0.5; }
          50% { transform: scaleY(1.2); opacity: 1; }
        }
        .pulse-bar-1 { animation: customPulse 1.2s infinite ease-in-out; }
        .pulse-bar-2 { animation: customPulse 0.9s infinite ease-in-out 0.2s; }
        .pulse-bar-3 { animation: customPulse 1.4s infinite ease-in-out 0.4s; }
        .pulse-bar-4 { animation: customPulse 1.0s infinite ease-in-out 0.1s; }
        .pulse-bar-5 { animation: customPulse 1.3s infinite ease-in-out 0.3s; }
      `}</style>

      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal Sheet container */}
      <div className="relative w-full max-w-md bg-white rounded-t-4xl shadow-2xl animate-slide-up h-[68%] flex flex-col overflow-hidden border-t border-card-border">
        
        {/* SUCCESS STATE SCREEN */}
        {showSuccess ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 bg-mint-light/20 rounded-full flex items-center justify-center mb-4 animate-bounce">
              <CheckCircle2 size={40} className="text-forest" />
            </div>
            <h3 className="text-base font-bold text-graphite mb-2">Dziękujemy za zgłoszenie!</h3>
            <p className="text-xs text-graphite-light max-w-[280px] leading-relaxed mb-6">
              Twoje zgłoszenie usterki zostało zapisane w systemie. Wspólnie dbamy o naszą okolicę!
            </p>

            {/* Points notification pill */}
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-mint-light/20 to-forest/10 border border-mint/20 rounded-full mb-8 shadow-sm">
              <Sparkles size={14} className="text-forest animate-pulse" />
              <span className="text-xs font-bold text-forest">+10 punktów lojalnościowych</span>
            </div>

            <button
              onClick={handleClose}
              className="w-full max-w-[200px] py-3 gradient-primary text-white rounded-xl text-xs font-semibold shadow-md active:scale-95 transition-transform"
            >
              Zamknij
            </button>
          </div>
        ) : (
          /* STANDARD FORM SHEET */
          <>
            {/* Header */}
            <div className="px-5 pt-5 pb-3 border-b border-gray-100 flex-shrink-0 flex items-center justify-between">
              <h3 className="text-sm font-bold text-graphite flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-500 animate-pulse" />
                Zgłoś usterkę lokalną
              </h3>
              <button
                onClick={handleClose}
                className="w-7 h-7 bg-soft-bg rounded-full flex items-center justify-center active:scale-95"
                aria-label="Zamknij"
              >
                <X size={12} className="text-graphite" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-hide">
              
              {/* Photo Box */}
              <div>
                <label className="text-[10px] font-semibold text-graphite-light uppercase tracking-wider block mb-1.5">Zdjęcie usterki</label>
                {photo ? (
                  <div className="relative h-32 rounded-2xl overflow-hidden border border-card-border group">
                    <img src={photo} alt="Reported defect" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => fileInputRef.current.click()}
                        className="p-2 bg-white/95 rounded-full text-slate-800 shadow-md active:scale-90 transition-transform"
                      >
                        <Camera size={14} />
                      </button>
                      <button
                        onClick={() => setPhoto(null)}
                        className="p-2 bg-red-500 rounded-full text-white shadow-md active:scale-90 transition-transform"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current.click()}
                    className="w-full h-24 border-2 border-dashed border-gray-200 hover:border-forest/40 rounded-2xl flex flex-col items-center justify-center gap-1 bg-gray-50 hover:bg-forest/[0.02] transition-colors"
                  >
                    <Camera size={20} className="text-gray-400" />
                    <span className="text-[10px] font-semibold text-gray-500">Dodaj zdjęcie z urządzenia</span>
                  </button>
                )}
                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Location Input with Mock GPS */}
              <div>
                <label className="text-[10px] font-semibold text-graphite-light uppercase tracking-wider block mb-1.5">Lokalizacja</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Wpisz adres lub lokalizację..."
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-card-border rounded-xl focus:outline-none focus:border-forest text-graphite font-medium placeholder-gray-400"
                    />
                  </div>
                  <button
                    onClick={handleGetLocation}
                    disabled={isGettingLocation}
                    className="px-3 bg-soft-bg hover:bg-gray-100 border border-card-border rounded-xl text-forest flex items-center justify-center gap-1 active:scale-95 transition-transform disabled:opacity-50"
                  >
                    {isGettingLocation ? (
                      <Loader2 size={13} className="animate-spin text-forest" />
                    ) : (
                      <>
                        <MapPin size={13} />
                        <span className="text-[9px] font-bold">GPS</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Severity Selection */}
              <div>
                <label className="text-[10px] font-semibold text-graphite-light uppercase tracking-wider block mb-1.5">Ważność usterki</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'low', name: 'Niska', color: 'bg-green-500', text: 'text-green-700 bg-green-50 border-green-200' },
                    { id: 'medium', name: 'Średnia', color: 'bg-amber-500', text: 'text-amber-700 bg-amber-50 border-amber-200' },
                    { id: 'high', name: 'Wysoka / Krytyczna', color: 'bg-red-500', text: 'text-red-700 bg-red-50 border-red-200' }
                  ].map((level) => {
                    const isActive = severity === level.id
                    return (
                      <button
                        key={level.id}
                        onClick={() => setSeverity(level.id)}
                        className={`py-2 px-1 rounded-xl text-[10px] font-bold border transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
                          isActive
                            ? `${level.text} border-2 font-black shadow-sm`
                            : 'border-card-border text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${level.color}`} />
                        {level.name}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Voice Memo Recording Box */}
              <div>
                <label className="text-[10px] font-semibold text-graphite-light uppercase tracking-wider block mb-1.5">Opis głosowy (opcjonalnie)</label>
                {isRecording ? (
                  /* Recording active UI */
                  <div className="border border-red-100 bg-red-50/50 p-3 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                      <span className="text-xs font-semibold text-red-600">Nagrywanie: {formatTime(recordingSeconds)}</span>
                    </div>
                    {/* Animated waveform mockup */}
                    <div className="flex items-end gap-[3px] h-6 px-4">
                      <span className="w-[3px] h-3 bg-red-400 rounded-full pulse-bar-1" />
                      <span className="w-[3px] h-5 bg-red-400 rounded-full pulse-bar-2" />
                      <span className="w-[3px] h-2 bg-red-400 rounded-full pulse-bar-3" />
                      <span className="w-[3px] h-6 bg-red-400 rounded-full pulse-bar-4" />
                      <span className="w-[3px] h-4 bg-red-400 rounded-full pulse-bar-5" />
                    </div>
                    <button
                      onClick={stopRecording}
                      className="px-3 py-1 bg-red-500 text-white rounded-lg text-[9px] font-bold active:scale-90 transition-transform"
                    >
                      Zatrzymaj
                    </button>
                  </div>
                ) : voiceMemo ? (
                  /* Recording saved UI */
                  <div className="border border-card-border bg-gray-50/50 p-3 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={isPlayingVoice ? stopPlayback : startPlayback}
                        className="w-7 h-7 bg-forest text-white rounded-full flex items-center justify-center shadow-sm active:scale-90 transition-transform"
                      >
                        {isPlayingVoice ? <Pause size={12} fill="white" /> : <Play size={12} className="ml-0.5" fill="white" />}
                      </button>
                      <span className="text-[10px] font-bold text-graphite">
                        {isPlayingVoice ? formatTime(playbackSeconds) : formatTime(voiceMemo.duration)}
                      </span>
                      {/* Fake Audio Seekbar */}
                      <div className="w-28 h-1.5 bg-gray-200 rounded-full overflow-hidden relative">
                        <div
                          className="absolute left-0 top-0 h-full bg-forest transition-all duration-300"
                          style={{
                            width: isPlayingVoice
                              ? `${(playbackSeconds / voiceMemo.duration) * 100}%`
                              : '0%'
                          }}
                        />
                      </div>
                    </div>
                    <button
                      onClick={deleteVoiceMemo}
                      className="w-7 h-7 bg-white hover:bg-red-50 border border-card-border rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 active:scale-90 transition-transform"
                      aria-label="Usuń nagranie"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ) : (
                  /* Record Trigger button */
                  <button
                    onClick={startRecording}
                    className="w-full p-2.5 border border-card-border hover:border-gray-300 rounded-2xl flex items-center justify-center gap-2 bg-white text-graphite-light hover:text-red-500 hover:bg-red-50/10 transition-colors"
                  >
                    <Mic size={14} className="text-gray-400" />
                    <span className="text-[10px] font-semibold">Nagraj notatkę głosową</span>
                  </button>
                )}
              </div>

              {/* Text Description Textarea */}
              <div>
                <label className="text-[10px] font-semibold text-graphite-light uppercase tracking-wider block mb-1.5">Opis usterki</label>
                <textarea
                  placeholder="Opisz usterkę (np. co się stało, dlaczego jest niebezpiecznie)..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-xs border border-card-border rounded-xl focus:outline-none focus:border-forest text-graphite font-medium placeholder-gray-400 resize-none"
                />
              </div>

            </div>

            {/* Fixed footer action */}
            <div className="p-5 pt-3 pb-24 border-t border-gray-100 bg-white flex-shrink-0">
              <button
                onClick={handleSubmit}
                disabled={!location || !description || isSubmitting}
                className="w-full py-3.5 gradient-primary text-white rounded-xl text-[12px] font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-40 disabled:pointer-events-none shadow-md"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Zapisywanie zgłoszenia...
                  </>
                ) : (
                  <>
                    Zgłoś usterkę (+10 pkt)
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ReportDefectModal
