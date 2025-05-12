import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaCalendarAlt, FaArrowLeft, FaPlay, FaPause, FaSpinner } from 'react-icons/fa';
import { journalApi } from '../services/apiService';

const JournalDetailContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  text-decoration: none;
  margin-bottom: 1rem;
  
  &:hover {
    color: var(--accent-primary);
  }
`;

const JournalHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 2rem;
  
  h1 {
    font-size: 2rem;
    color: var(--text-primary);
  }
`;

const JournalDate = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
`;

const JournalMood = styled.div`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 50px;
  background-color: var(--accent-muted);
  color: var(--text-primary);
  font-size: 0.9rem;
  margin-right: 0.5rem;
  margin-top: 0.5rem;
`;

const JournalContent = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const JournalText = styled.div`
  background-color: var(--bg-secondary);
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  
  p {
    color: var(--text-primary);
    line-height: 1.6;
    white-space: pre-wrap;
  }
`;

const JournalMedia = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const JournalImage = styled.div`
  background-color: var(--bg-secondary);
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  
  h3 {
    margin-bottom: 1rem;
    color: var(--text-primary);
  }
  
  img {
    width: 100%;
    max-height: 400px;
    object-fit: contain;
    border-radius: 8px;
  }
`;

const JournalAudio = styled.div`
  background-color: var(--bg-secondary);
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  
  h3 {
    margin-bottom: 1rem;
    color: var(--text-primary);
  }
`;

const AudioPlayer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const AudioControls = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const PlayButton = styled.button`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--accent-primary);
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: var(--accent-primary-dark);
  }
  
  &:disabled {
    background-color: var(--bg-elevated);
    cursor: not-allowed;
  }
`;

const ProgressBar = styled.div`
  flex-grow: 1;
  height: 8px;
  background-color: var(--bg-elevated);
  border-radius: 4px;
  position: relative;
  cursor: pointer;
  
  .progress {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background-color: var(--accent-primary);
    border-radius: 4px;
  }
`;

const AudioTime = styled.div`
  display: flex;
  justify-content: space-between;
  color: var(--text-secondary);
  font-size: 0.8rem;
`;

const Loader = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: var(--text-secondary);
`;

const ErrorMessage = styled.div`
  padding: 1rem;
  background-color: var(--error-bg);
  color: var(--error);
  border-radius: 8px;
  margin: 1rem 0;
`;

const JournalDetail = () => {
  const { id } = useParams();
  const [journal, setJournal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);
  
  const audioRef = React.useRef(null);
  const animationRef = React.useRef(null);

  useEffect(() => {
    fetchJournal();
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      // Clean up blob URLs
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      
      imageUrls.forEach(url => {
        URL.revokeObjectURL(url);
      });
    };
  }, [id]);

  const fetchJournal = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await journalApi.getJournalById(id);
      setJournal(response.data);
      
      // Load audio file if it exists
      if (response.data.audioMetadata) {
        try {
          const audioResponse = await journalApi.getJournalMedia(id, 'audio');
          if (audioResponse && audioResponse.data) {
            try {
              const mimetype = response.data.audioMetadata.mimetype || 'audio/mpeg';
              const blob = new Blob([audioResponse.data], { type: mimetype });
              const url = URL.createObjectURL(blob);
              setAudioUrl(url);
            } catch (blobError) {
              console.error('Error creating audio blob:', blobError);
            }
          }
        } catch (error) {
          console.error('Error loading audio:', error);
        }
      }
      
      // Load image files if they exist
      if (response.data.imageMetadata && response.data.imageMetadata.length > 0) {
        const urls = [];
        for (let i = 0; i < response.data.imageMetadata.length; i++) {
          try {
            const imageResponse = await journalApi.getJournalMedia(id, 'image', i);
            const blob = new Blob([imageResponse.data], { type: response.data.imageMetadata[i].mimetype || 'image/jpeg' });
            const url = URL.createObjectURL(blob);
            urls.push(url);
          } catch (error) {
            console.error(`Error loading image ${i}:`, error);
          }
        }
        setImageUrls(urls);
      }
    } catch (error) {
      console.error('Error fetching journal:', error);
      setError('Failed to load journal entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
  };
  
  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
      cancelAnimationFrame(animationRef.current);
    } else {
      audioRef.current.play();
      animationRef.current = requestAnimationFrame(updateProgress);
    }
    
    setIsPlaying(!isPlaying);
  };
  
  const updateProgress = () => {
    setCurrentTime(audioRef.current.currentTime);
    setAudioProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
    animationRef.current = requestAnimationFrame(updateProgress);
  };
  
  const handleProgressClick = (e) => {
    const progressBar = e.currentTarget;
    const clickPosition = (e.clientX - progressBar.getBoundingClientRect().left) / progressBar.offsetWidth;
    const newTime = clickPosition * audioRef.current.duration;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    setAudioProgress(clickPosition * 100);
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleAudioEnded = () => {
    setIsPlaying(false);
    setAudioProgress(0);
    setCurrentTime(0);
    cancelAnimationFrame(animationRef.current);
  };

  if (loading) {
    return <Loader>Loading journal...</Loader>;
  }

  if (error) {
    return (
      <ErrorMessage>
        {error}
        <button onClick={fetchJournal}>Try Again</button>
      </ErrorMessage>
    );
  }

  if (!journal) {
    return <ErrorMessage>Journal not found</ErrorMessage>;
  }

  return (
    <JournalDetailContainer>
      <BackLink to="/journals">
        <FaArrowLeft /> Back to All Journals
      </BackLink>
      
      <JournalHeader>
        <JournalDate>
          <FaCalendarAlt />
          {formatDate(journal.date)}
        </JournalDate>
        
        <h1>Journal Entry</h1>
        
        {journal?.textAnalysis?.mood && (
          <JournalMood>{journal.textAnalysis.mood}</JournalMood>
        )}
      </JournalHeader>
      
      <JournalContent>
        <JournalText>
          <p>{journal.textEntry}</p>
        </JournalText>
        
        <JournalMedia>
          {imageUrls.length > 0 && (
            <JournalImage>
              <h3>Image</h3>
              {imageUrls.map((url, index) => (
                <img key={index} src={url} alt={`Journal image ${index + 1}`} />
              ))}
            </JournalImage>
          )}
          
          {audioUrl && (
            <JournalAudio>
              <h3>Audio Recording</h3>
              <AudioPlayer>
                <audio 
                  ref={audioRef}
                  src={audioUrl}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={handleAudioEnded}
                />
                
                <AudioControls>
                  <PlayButton onClick={togglePlayPause}>
                    {isPlaying ? <FaPause /> : <FaPlay />}
                  </PlayButton>
                  
                  <ProgressBar onClick={handleProgressClick}>
                    <div className="progress" style={{ width: `${audioProgress}%` }} />
                  </ProgressBar>
                </AudioControls>
                
                <AudioTime>
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </AudioTime>
                
                {journal?.audioAnalysis?.transcription && (
                  <div className="transcription">
                    <h4>Transcription:</h4>
                    <p>{journal.audioAnalysis.transcription}</p>
                  </div>
                )}
              </AudioPlayer>
            </JournalAudio>
          )}
          
          {(journal?.textAnalysis || journal?.visionAnalysis) && (
            <div className="journal-analysis">
              <h3>AI Analysis</h3>
              
              {journal?.textAnalysis && (
                <div>
                  <h4>Text Analysis:</h4>
                  <p>Mood: {journal.textAnalysis.mood}</p>
                  <p>Anxiety Level: {journal.textAnalysis.anxietyScore}/10</p>
                </div>
              )}
              
              {journal?.visionAnalysis?.emotionalImpact && (
                <div>
                  <h4>Image Analysis:</h4>
                  <p>Emotional Impact: {journal.visionAnalysis.emotionalImpact}</p>
                  {journal.visionAnalysis.detectedObjects && journal.visionAnalysis.detectedObjects.length > 0 && (
                    <p>Detected Objects: {journal.visionAnalysis.detectedObjects.join(', ')}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </JournalMedia>
      </JournalContent>
    </JournalDetailContainer>
  );
};

export default JournalDetail; 