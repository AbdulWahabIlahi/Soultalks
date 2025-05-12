import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FaPlus, FaMicrophone, FaImage, FaSpinner, FaTimes, FaStop } from 'react-icons/fa';
import { journalApi } from '../services/apiService';

const JournalContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
`;

const JournalFormContainer = styled.div`
  background-color: var(--bg-secondary);
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const JournalEntriesContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const JournalTabs = styled.div`
  display: flex;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-color);
`;

const JournalTab = styled.button`
  padding: 0.75rem 1.5rem;
  background: transparent;
  color: ${props => props.active ? 'var(--accent-primary)' : 'var(--text-secondary)'};
  border: none;
  border-bottom: 2px solid ${props => props.active ? 'var(--accent-primary)' : 'transparent'};
  margin-right: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    color: var(--accent-primary);
    background: transparent;
  }
  
  svg {
    margin-right: 0.5rem;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
  font-weight: 500;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const JournalEntry = styled.div`
  background-color: var(--bg-secondary);
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const EntryDate = styled.div`
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 0.75rem;
`;

const EntryText = styled.p`
  color: var(--text-primary);
  margin-bottom: 1rem;
`;

const EntryMood = styled.div`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 50px;
  background-color: var(--accent-muted);
  color: var(--text-primary);
  font-size: 0.9rem;
  margin-right: 0.5rem;
`;

const FileInput = styled.input`
  display: none;
`;

const FileLabel = styled.label`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: var(--bg-elevated);
  color: var(--text-secondary);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  
  &:hover {
    background-color: var(--accent-muted);
    color: var(--text-primary);
  }
  
  svg {
    font-size: 1.2rem;
  }
`;

const AudioVisualizer = styled.div`
  height: 60px;
  background-color: var(--bg-elevated);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  overflow: hidden;
  position: relative;
`;

const PreviewImage = styled.div`
  position: relative;
  margin-bottom: 1rem;
  
  img {
    width: 100%;
    border-radius: 4px;
    object-fit: cover;
  }
  
  button {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background-color: var(--bg-elevated);
    border: none;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--text-secondary);
    
    &:hover {
      background-color: var(--error);
      color: white;
    }
  }
`;

const Journal = () => {
  const [activeTab, setActiveTab] = useState('text');
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [textEntry, setTextEntry] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
  
  useEffect(() => {
    fetchJournals();
  }, []);
  
  const fetchJournals = async () => {
    try {
      setError(null);
      const response = await journalApi.getAllJournals();
      setJournals(response.data);
    } catch (error) {
      console.error('Error fetching journals:', error);
      setError('Failed to load journal entries. Please try again later.');
    }
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      
      // Create preview URL for images
      if (file.type.startsWith('image/')) {
        const fileReader = new FileReader();
        fileReader.onload = () => {
          setPreviewUrl(fileReader.result);
        };
        fileReader.readAsDataURL(file);
      }
    }
  };
  
  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('textEntry', textEntry);
      
      if (selectedFile) {
        if (activeTab === 'image') {
          formData.append('images', selectedFile);
        } else if (activeTab === 'audio') {
          formData.append('audio', selectedFile);
        }
      }
      
      await journalApi.createJournal(formData);
      
      setTextEntry('');
      setSelectedFile(null);
      setPreviewUrl(null);
      fetchJournals();
    } catch (error) {
      console.error('Error creating journal:', error);
      setError('Failed to save journal entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Add audio recording functionality
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
          setSelectedFile(audioFile);
          
          // Clean up stream tracks
          stream.getTracks().forEach(track => track.stop());
        } catch (err) {
          console.error('Error creating audio blob:', err);
        }
      };

      // Start recording
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error starting audio recording:', err);
      alert('Could not access microphone. Please check your browser permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerIntervalRef.current);
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  const formatRecordingTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <JournalContainer>
      <JournalFormContainer>
        <JournalTabs>
          <JournalTab 
            active={activeTab === 'text'} 
            onClick={() => setActiveTab('text')}
          >
            <FaPlus /> Text
          </JournalTab>
          <JournalTab 
            active={activeTab === 'audio'} 
            onClick={() => setActiveTab('audio')}
          >
            <FaMicrophone /> Audio
          </JournalTab>
          <JournalTab 
            active={activeTab === 'image'} 
            onClick={() => setActiveTab('image')}
          >
            <FaImage /> Image
          </JournalTab>
        </JournalTabs>
        
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label>How are you feeling today?</Label>
            <textarea 
              rows="4" 
              placeholder="Express your thoughts and feelings..." 
              value={textEntry}
              onChange={(e) => setTextEntry(e.target.value)}
              required
            />
          </InputGroup>
          
          {activeTab === 'audio' && (
            <>
              <AudioVisualizer>
                {isRecording ? (
                  <div className="recording">
                    Recording... {formatRecordingTime(recordingTime)}
                  </div>
                ) : selectedFile ? (
                  <div className="recorded">
                    Recording saved ({formatRecordingTime(recordingTime)})
                  </div>
                ) : (
                  <div className="instructions">
                    Click the button below to start recording your thoughts
                  </div>
                )}
              </AudioVisualizer>
              
              <Button 
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                style={{ backgroundColor: isRecording ? 'var(--error)' : 'var(--accent-primary)' }}
              >
                {isRecording ? <><FaStop /> Stop Recording</> : <><FaMicrophone /> Start Recording</>}
              </Button>
              
              {selectedFile && (
                <Button type="button" onClick={removeFile} className="secondary">
                  <FaTimes /> Remove Recording
                </Button>
              )}
            </>
          )}
          
          {activeTab === 'image' && (
            <InputGroup>
              <Label>Add an image</Label>
              <FileLabel>
                <FaImage /> Upload image
                <FileInput 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </FileLabel>
              {previewUrl && (
                <PreviewImage>
                  <img src={previewUrl} alt="Preview" height="200" />
                  <button type="button" onClick={removeFile}>
                    <FaTimes />
                  </button>
                </PreviewImage>
              )}
            </InputGroup>
          )}
          
          <Button type="submit" disabled={loading || !textEntry}>
            {loading ? <FaSpinner /> : <FaPlus />} 
            {loading ? 'Saving...' : 'Save Journal Entry'}
          </Button>
        </Form>
      </JournalFormContainer>
      
      <h2>Recent Entries</h2>
      
      <JournalEntriesContainer>
        {journals.length > 0 ? (
          journals.map((journal) => (
            <JournalEntry key={journal._id}>
              <EntryDate>{formatDate(journal.date)}</EntryDate>
              <EntryText>
                {journal.textEntry.length > 150 
                  ? `${journal.textEntry.substring(0, 150)}...` 
                  : journal.textEntry
                }
              </EntryText>
              {journal.textAnalysis && (
                <>
                  <EntryMood>{journal.textAnalysis.mood || 'Neutral'}</EntryMood>
                  <EntryMood>Anxiety: {journal.textAnalysis.anxietyScore || 0}/10</EntryMood>
                </>
              )}
            </JournalEntry>
          ))
        ) : (
          <p>No journal entries yet. Start by adding one above!</p>
        )}
      </JournalEntriesContainer>
    </JournalContainer>
  );
};

export default Journal; 