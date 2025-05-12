import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { FaMicrophone, FaMicrophoneSlash, FaPlay, FaStop, FaSpinner, FaVolumeUp, FaRobot, FaUser } from 'react-icons/fa';
import { voiceApi } from '../services/apiService';
import { useAuth } from '../context/AuthContext';

const PageContainer = styled.div`
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
`;

const PageTitle = styled.h1`
  margin-bottom: 1.5rem;
  color: var(--text-primary);
  font-size: 1.8rem;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 0.75rem;
    color: var(--accent-primary);
  }
`;

const VoiceChatContainer = styled.div`
  background-color: var(--bg-secondary);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  height: calc(100vh - 240px);
  display: flex;
  flex-direction: column;
  position: relative;
`;

const ChatHeader = styled.div`
  padding: 1.5rem;
  background: var(--bg-elevated);
  border-bottom: 1px solid var(--border-color);
  
  h2 {
    color: var(--accent-primary);
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    
    svg {
      margin-right: 0.75rem;
    }
  }
  
  p {
    color: var(--text-secondary);
    font-size: 0.9rem;
    margin: 0;
  }
`;

const TranscriptArea = styled.div`
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  background-color: var(--bg-primary);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  scroll-behavior: smooth;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--bg-secondary);
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--accent-primary);
    border-radius: 10px;
    opacity: 0.7;
  }
`;

const Message = styled.div`
  max-width: 85%;
  padding: 1rem 1.25rem;
  border-radius: 16px;
  line-height: 1.6;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  animation: ${props => props.isUser ? 'slideFromRight' : 'slideFromLeft'} 0.3s ease-out;
  position: relative;
  transition: all 0.2s ease;
  
  ${props => props.isUser ? `
    background-color: var(--accent-primary);
    color: var(--text-on-accent);
    align-self: flex-end;
    border-bottom-right-radius: 4px;
  ` : `
    background-color: var(--bg-elevated);
    color: var(--text-primary);
    align-self: flex-start;
    border-bottom-left-radius: 4px;
  `}
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
  }
  
  @keyframes slideFromRight {
    from { transform: translateX(20px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideFromLeft {
    from { transform: translateX(-20px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
`;

const SenderLabel = styled.div`
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  color: ${props => props.isUser ? 'rgba(255, 255, 255, 0.9)' : 'var(--accent-primary)'};
  
  svg {
    margin-right: 0.5rem;
    font-size: 0.9rem;
  }
`;

const ControlsArea = styled.div`
  padding: 1.5rem;
  background-color: var(--bg-elevated);
  border-top: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
`;

const breathe = keyframes`
  0% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.3); opacity: 0.9; }
  100% { transform: scale(1); opacity: 0.6; }
`;

const wave = keyframes`
  0% { transform: scale(1); opacity: 0.6; }
  25% { transform: scale(1.2); opacity: 0.3; }
  50% { transform: scale(1.3); opacity: 0.15; }
  75% { transform: scale(1.4); opacity: 0.05; }
  100% { transform: scale(1.5); opacity: 0; }
`;

const BreathingCircleContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 1;
`;

const BreathingCircle = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: var(--accent-primary);
  opacity: 0.6;
  animation: ${breathe} 2s infinite ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &::before, &::after {
    content: '';
    position: absolute;
    border-radius: 50%;
    background-color: var(--accent-primary);
    opacity: 0.3;
  }
  
  &::before {
    width: 140px;
    height: 140px;
    animation: ${wave} 2.5s infinite ease-out;
  }
  
  &::after {
    width: 160px;
    height: 160px;
    animation: ${wave} 3s infinite ease-out;
  }
`;

const CircleIcon = styled.div`
  position: relative;
  z-index: 2;
  font-size: 2rem;
  color: var(--text-on-accent);
`;

const RecordButton = styled.button`
  width: 75px;
  height: 75px;
  border-radius: 50%;
  background-color: ${props => props.isRecording ? 'var(--error)' : 'var(--accent-primary)'};
  color: var(--text-on-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
  z-index: 2;
  position: relative;
  
  &:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: 0 7px 20px rgba(0, 0, 0, 0.2);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  svg {
    font-size: 1.75rem;
  }
`;

const StatusText = styled.div`
  margin-top: 1.25rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
  min-height: 20px;
  text-align: center;
  z-index: 2;
  position: relative;
`;

const RecordingIndicator = styled.div`
  display: flex;
  align-items: center;
  margin-top: 0.75rem;
  gap: 0.5rem;
  z-index: 2;
  position: relative;
  
  .dot {
    width: 10px;
    height: 10px;
    background-color: var(--error);
    border-radius: 50%;
    animation: pulse 1.5s infinite;
  }
  
  .time {
    color: var(--text-secondary);
    font-family: monospace;
    font-size: 0.95rem;
    font-weight: 500;
  }
  
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.3; }
    100% { opacity: 1; }
  }
`;

const ErrorMessage = styled.div`
  color: var(--error);
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: rgba(245, 101, 101, 0.1);
  border-radius: 8px;
  font-size: 0.9rem;
  text-align: center;
  z-index: 2;
  position: relative;
  max-width: 80%;
`;

const InfoMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 1.5rem;
  height: 100%;
  text-align: center;
  color: var(--text-secondary);
  
  svg {
    font-size: 3rem;
    opacity: 0.5;
    margin-bottom: 1rem;
    color: var(--accent-primary);
  }
  
  h3 {
    color: var(--text-primary);
    margin-bottom: 0.5rem;
  }
  
  p {
    max-width: 320px;
    line-height: 1.7;
  }
`;

const InstructionList = styled.ul`
  text-align: left;
  margin-top: 0.5rem;
  
  li {
    margin-bottom: 0.5rem;
    display: flex;
    align-items: flex-start;
    
    &::before {
      content: '•';
      color: var(--accent-primary);
      font-weight: bold;
      margin-right: 8px;
    }
  }
`;

const VoiceChat = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [status, setStatus] = useState('Click the microphone to start talking');
  const [transcript, setTranscript] = useState([]);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoStartNextRecording, setAutoStartNextRecording] = useState(false);
  
  const { user } = useAuth();
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const transcriptRef = useRef(null);
  const autoStartTimerRef = useRef(null);
  
  // Scroll to bottom of transcript
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript]);
  
  // Recording timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      setRecordingTime(0);
    }
    
    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  // Auto-start recording after AI finishes speaking (if enabled)
  useEffect(() => {
    if (autoStartNextRecording && !isSpeaking && !isRecording && !isProcessing) {
      clearTimeout(autoStartTimerRef.current);
      autoStartTimerRef.current = setTimeout(() => {
        startRecording();
        setAutoStartNextRecording(false);
      }, 1000); // Short delay before auto-starting
    }
    
    return () => clearTimeout(autoStartTimerRef.current);
  }, [autoStartNextRecording, isSpeaking, isRecording, isProcessing]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      window.speechSynthesis.cancel();
      clearTimeout(autoStartTimerRef.current);
    };
  }, []);
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const startRecording = async () => {
    try {
      setError(null);
      
      // Request audio with optimal settings for speech recognition
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,   // Standard audio quality
          channelCount: 1      // Mono for speech recognition
        } 
      });
      
      // Create audio context to monitor audio levels
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      
      // Monitor audio levels
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      let silenceTimer = null;
      let silenceStart = null;
      let hasSound = false;
      let volumeHistory = [];
      
      const checkAudioLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        
        // Calculate average volume
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        
        // Store the last 20 volume readings
        volumeHistory.push(average);
        if (volumeHistory.length > 20) {
          volumeHistory.shift();
        }
        
        // If we detect sound above threshold (lowered from 10 to 5)
        // or if any peak is detected, mark as having sound
        if (average > 5 || Math.max(...volumeHistory) > 8) {
          hasSound = true;
          silenceStart = null;
          clearTimeout(silenceTimer);
          console.log('Audio detected, level:', average.toFixed(2));
        }
        
        if (audioChunksRef.current.length > 0 && mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          requestAnimationFrame(checkAudioLevel);
        }
      };
      
      requestAnimationFrame(checkAudioLevel);
      
      // Determine best codec
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        // Try fallback formats
        if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else {
          // Use default format if none of the above are supported
          mimeType = '';
        }
      }
      
      // Create media recorder with optimal settings
      const options = mimeType ? { mimeType, audioBitsPerSecond: 256000 } : { audioBitsPerSecond: 256000 };
      console.log('Using audio format:', mimeType || 'browser default');
      
      mediaRecorderRef.current = new MediaRecorder(stream, options);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          console.log(`Received audio chunk: ${event.data.size} bytes`);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const totalSize = audioChunksRef.current.reduce((acc, chunk) => acc + chunk.size, 0);
        console.log(`Recording stopped. Total audio size: ${totalSize} bytes, Chunks: ${audioChunksRef.current.length}`);
        
        // Always process the recording if we have data, regardless of hasSound flag
        // We'll trust the Whisper API to determine if there's actual speech
        if (audioChunksRef.current.length > 0 && totalSize > 100) {
          handleRecordingStop();
          return;
        }
        
        // Only show the error if we have truly no audio data
        setError('No audio captured. Please check your microphone and try again.');
        setIsProcessing(false);
        setStatus('Click the microphone to start talking');
      };
      
      // Get data more frequently for better response
      mediaRecorderRef.current.start(100); // Get data every 100ms
      setIsRecording(true);
      setStatus('Recording... Speak clearly and loudly. Click again to stop.');
      
      // Auto-stop after 30 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          stopRecording();
        }
      }, 30000);
      
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Could not access microphone. Please check permissions and try again.');
    }
  };
  
  const testMicrophone = async () => {
    try {
      // Use the same settings as the actual recording for consistency
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
          channelCount: 1
        } 
      });
      
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      let testTimer = null;
      let testStart = Date.now();
      let maxVolume = 0;
      let volumeReadings = [];
      
      const checkLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        
        // Calculate average volume
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        volumeReadings.push(average);
        maxVolume = Math.max(maxVolume, average);
        
        // Testing should take 2 seconds
        if (Date.now() - testStart < 2000) {
          testTimer = requestAnimationFrame(checkLevel);
        } else {
          // Clean up
          stream.getTracks().forEach(track => track.stop());
          cancelAnimationFrame(testTimer);
          
          // Calculate average reading
          const avgReading = volumeReadings.reduce((a, b) => a + b, 0) / volumeReadings.length;
          
          console.log(`Mic test complete. Max volume: ${maxVolume.toFixed(2)}, Avg: ${avgReading.toFixed(2)}`);
          
          if (maxVolume < 5) {
            // Very low volume
            setError('Very low audio level detected. Please check your microphone settings or speak louder.');
          } else if (maxVolume < 10) {
            // Low but usable
            setStatus(`Microphone connected with low volume (${maxVolume.toFixed(1)}). Try speaking louder.`);
            setTimeout(() => setStatus('Click the microphone to start talking'), 3000);
          } else {
            // Good volume
            setStatus(`Microphone test successful: Audio level ${maxVolume.toFixed(1)}`);
            setTimeout(() => setStatus('Click the microphone to start talking'), 3000);
          }
        }
      };
      
      setStatus('Testing microphone for 2 seconds...');
      testTimer = requestAnimationFrame(checkLevel);
      
    } catch (err) {
      console.error('Error testing microphone:', err);
      setError('Cannot access microphone. Please check permissions and browser settings.');
    }
  };
  
  useEffect(() => {
    // Test microphone on component mount
    testMicrophone();
  }, []);
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setStatus('Processing your audio...');
      setIsProcessing(true);
    }
  };
  
  const handleRecordingStop = async () => {
    try {
      // Only proceed if we actually captured audio chunks
      if (!audioChunksRef.current.length) {
        setError('No audio was captured. Please try again and speak into your microphone.');
        setIsProcessing(false);
        setStatus('Click the microphone to start talking');
        return;
      }
      
      // Create audio blob from recorded chunks
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
      // Close media tracks
      if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      
      console.log('Audio blob created, type:', audioBlob.type, 'size:', audioBlob.size, 'bytes');
      
      // Verify the audio blob
      if (audioBlob.size < 1000) {
        setError('Audio is too short or too quiet. Please speak clearly and try again.');
        setIsProcessing(false);
        setStatus('Click the microphone to start talking');
        return;
      }
      
      // Process audio
      setStatus('Transcribing your speech...');
      
      try {
        // Play a short beep to indicate processing started
        const beep = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU9vT18AAAD//wIA//8AAP//AgD+/wEA//8BAP//AQD//wEA//8BAP//AQD//wEA/v8CAP//AAD//wIA/v8CAP7/AgD+/wIA/v8CAP7/AgD9/wMA/v8CAP7/AQD//wEA//8BAP//AQD//wEA//8BAP//AQD//wEA//8BAP//AQD//wEA//8BAP//AQD+/wIA/v8CAP7/AgD+/wIA/v8CAP7/AgD+/wIA/v8CAP7/AgD+/wIA/v8CAP7/AgD+/wIA/f8DAP3/AwD+/wIA/f8DAP3/AwD9/wMA/f8DAP3/AwD9/wMA/f8DAP3/AwD9/wMA/f8DAP3/AwD9/wMA/f8DAP3/AwD9/wMA/f8DAP3/AwD9/wMA/f8DAP3/AwD9/wMA/f8DAP3/AwD+/wIA/f8DAP3/AwD9/wMA/f8DAP3/AwD9/wMA/f8DAP3/AwD9/wMA/f8DAP3/AwD9/wMA/f8DAP7/AgD+/wIA/v8CAP7/AgD+/wIA/v8CAP7/AgD+/wIA/v8CAP7/AgD+/wIA/v8CAP//AQD//wEA//8BAP//AQD//wEA//8BAP//AQD//wEA//8BAP//AQD//wEA//8BAP//AQD//wEA//8BAP//AQD//wEA//8BAP//AQD//wEA//8BAP//AQD//wEA//8BAP//AQD//wEA//8BAP//AQD//wEA//8BAP//AQD//wEA//8BAP//AQD//wEA//8BAP//AQD//wEA//8BAA==');
        beep.volume = 0.2;
        beep.play();
        
        // For debugging, play back the recording to verify it's capturing correctly
        const debugPlayback = false; // Set to true to hear the recording before sending
        if (debugPlayback) {
          const audioURL = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioURL);
          await new Promise(resolve => {
            audio.onended = resolve;
            audio.play();
          });
        }
        
        const response = await voiceApi.processAudio(audioBlob);
        console.log('Process audio response:', response);
        const { transcription, usingFallback } = response.data;
        
        // Add user message to transcript
        setTranscript(prev => [...prev, { 
          text: transcription, 
          sender: 'You', 
          isUser: true 
        }]);
        
        if (usingFallback) {
          setStatus('Using simulated transcription (Whisper API error)...');
        } else {
          setStatus('Generating AI response...');
        }
        
        // Generate AI response
        const responseData = await voiceApi.generateResponse(transcription);
        console.log('AI response data:', responseData.data);
        const { aiResponse, audioUrl, useBrowserTTS } = responseData.data;
        
        // Add AI response to transcript
        setTranscript(prev => [...prev, { 
          text: aiResponse, 
          sender: 'AI Assistant', 
          isUser: false 
        }]);
        
        // Play audio response
        setStatus('AI is speaking...');
        setIsSpeaking(true);
        // Enable auto-start for next recording after AI response
        setAutoStartNextRecording(true);
        
        if (audioUrl) {
          console.log('Playing Groq TTS audio from URL:', audioUrl);
          // Use server-generated TTS from Groq's PlayAI
          const audio = new Audio(audioUrl);
          
          audio.oncanplaythrough = () => {
            console.log('Audio ready to play');
          };
          
          audio.onended = () => {
            console.log('Audio playback completed');
            setIsSpeaking(false);
            setStatus('Your turn to speak...');
          };
          
          audio.onerror = (error) => {
            console.error('Audio playback error:', error);
            setIsSpeaking(false);
            setStatus('Your turn to speak...');
            // Fall back to browser TTS if server audio fails
            speakResponse(aiResponse);
          };
          
          // Load and play the audio
          await audio.load();
          try {
            const playPromise = audio.play();
            if (playPromise !== undefined) {
              playPromise
                .then(() => console.log('Audio playback started successfully'))
                .catch(error => {
                  console.error('Auto-play prevented:', error);
                  setIsSpeaking(false);
                  setStatus('Audio playback failed. Using browser TTS instead.');
                  // Fall back to browser TTS if autoplay is blocked
                  speakResponse(aiResponse);
                });
            }
          } catch (playError) {
            console.error('Error playing audio:', playError);
            speakResponse(aiResponse);
          }
        } else if (useBrowserTTS) {
          console.log('Using browser speech synthesis');
          // Use browser TTS
          speakResponse(aiResponse);
        }
        
        setIsProcessing(false);
      } catch (err) {
        if (err.response && err.response.status === 400 && err.response.data && err.response.data.error) {
          // Handle specific API errors
          setError(err.response.data.error);
        } else {
          setError('Error processing your audio. Please try again and speak clearly.');
        }
        console.error('Error processing recording:', err);
        setIsProcessing(false);
        setStatus('Click the microphone to start talking');
      }
    } catch (err) {
      console.error('Error handling recording:', err);
      setError('There was an error processing your audio. Please try again.');
      setIsProcessing(false);
      setStatus('Click the microphone to start talking');
    }
  };
  
  // Enhanced text-to-speech using browser's SpeechSynthesis API
  const speakResponse = (text) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const speech = new SpeechSynthesisUtterance(text);
      speech.rate = 1;
      speech.pitch = 1;
      
      // Try to use a female voice if available
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(voice => 
        voice.name.includes('female') || 
        voice.name.includes('Female') || 
        voice.name.includes('woman')
      );
      
      if (femaleVoice) {
        speech.voice = femaleVoice;
      }
      
      speech.onend = () => {
        setIsSpeaking(false);
        setStatus('Your turn to speak...');
      };
      
      window.speechSynthesis.speak(speech);
    } else {
      setIsSpeaking(false);
      setStatus('Your turn to speak...');
    }
  };
  
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };
  
  return (
    <PageContainer>
      <PageTitle>
        <FaMicrophone /> Voice Chat
      </PageTitle>
      
      <VoiceChatContainer>
        <ChatHeader>
          <h2>
            <FaRobot /> Talk with AI Assistant
          </h2>
          <p>Speak naturally and get voice responses in real time</p>
        </ChatHeader>
        
        <TranscriptArea ref={transcriptRef}>
          {transcript.length === 0 ? (
            <InfoMessage>
              <FaVolumeUp />
              <h3>Start a conversation</h3>
              <p>
                The microphone will automatically activate after each AI response for a natural conversation flow.
              </p>
              <InstructionList>
                <li>Click the microphone button below and speak clearly</li>
                <li>Click again when you're finished speaking</li>
                <li>Wait for the AI to respond with voice and text</li>
                <li>The mic will auto-activate for your reply</li>
              </InstructionList>
            </InfoMessage>
          ) : (
            transcript.map((message, index) => (
              <Message key={index} isUser={message.isUser}>
                <SenderLabel isUser={message.isUser}>
                  {message.isUser ? <><FaUser /> {message.sender}</> : <><FaRobot /> {message.sender}</>}
                </SenderLabel>
                {message.text}
              </Message>
            ))
          )}
        </TranscriptArea>
        
        <ControlsArea>
          {isSpeaking && (
            <BreathingCircleContainer>
              <BreathingCircle>
                <CircleIcon>
                  <FaVolumeUp />
                </CircleIcon>
              </BreathingCircle>
            </BreathingCircleContainer>
          )}
          
          <RecordButton 
            onClick={toggleRecording} 
            isRecording={isRecording}
            disabled={isProcessing || isSpeaking}
          >
            {isRecording ? <FaMicrophoneSlash /> : <FaMicrophone />}
          </RecordButton>
          
          {isRecording && (
            <RecordingIndicator>
              <div className="dot"></div>
              <div className="time">{formatTime(recordingTime)}</div>
            </RecordingIndicator>
          )}
          
          <StatusText>
            {isProcessing ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                {status}
                <style jsx>{`
                  @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                  }
                `}</style>
              </span>
            ) : (
              status
            )}
          </StatusText>
          
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </ControlsArea>
      </VoiceChatContainer>
    </PageContainer>
  );
};

export default VoiceChat;
