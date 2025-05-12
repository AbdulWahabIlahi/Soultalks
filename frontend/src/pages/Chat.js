import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FaPaperPlane, FaSpinner, FaRegSmile, FaRegLightbulb, FaRobot, FaThumbsUp, FaRegComment } from 'react-icons/fa';
import { chatApi } from '../services/apiService';

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 200px);
  background-color: var(--bg-secondary);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
`;

const ChatHeader = styled.div`
  padding: 1.5rem;
  background-color: var(--bg-elevated);
  border-bottom: 1px solid var(--border-color);
  color: var(--text-primary);
  
  h2 {
    margin-bottom: 0.5rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    color: var(--accent-primary);
    
    svg {
      margin-right: 0.5rem;
      font-size: 1.25rem;
    }
  }
  
  p {
    font-size: 0.9rem;
    margin-bottom: 0;
    color: var(--text-secondary);
  }
`;

const MessageList = styled.div`
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background-color: var(--bg-primary);
  background-image: radial-gradient(var(--bg-secondary) 0.5px, transparent 0.5px);
  background-size: 15px 15px;
`;

const MessageBubble = styled.div`
  max-width: 80%;
  padding: 1rem 1.25rem;
  border-radius: 18px;
  position: relative;
  line-height: 1.6;
  font-size: 0.95rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  
  ${props => props.isUser ? `
    background-color:rgb(155, 105, 208);
    color: #1e1e2e;
    align-self: flex-end;
    border-bottom-right-radius: 4px;
    text-align: right;
  ` : `
    background-color: var(--bg-elevated);
    color: var(--text-primary);
    align-self: flex-start;
    border-bottom-left-radius: 4px;
  `}
  
  animation: ${props => props.isUser ? 'slideFromRight' : 'slideFromLeft'} 0.3s ease-out;
  
  @keyframes slideFromRight {
    from { transform: translateX(20px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideFromLeft {
    from { transform: translateX(-20px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
`;

const MessageTime = styled.div`
  font-size: 0.75rem;
  color: ${props => props.isUser ? '#1e1e2e' : 'var(--text-secondary)'};
  margin-top: 0.5rem;
`;

const MessageSender = styled.div`
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 0.35rem;
  color: ${props => props.isUser ? '#1e1e2e' : 'var(--accent-primary)'};
`;

const InputArea = styled.div`
  padding: 1rem;
  border-top: 1px solid var(--border-color);
  background-color: var(--bg-elevated);
`;

const SuggestedQuestions = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const SuggestedQuestion = styled.button`
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 50px;
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 0.5rem;
    font-size: 0.85rem;
    color: var(--accent-primary);
  }
  
  &:hover {
    color: #1e1e2e;
    background-color:rgb(209, 100, 131);
    border-color: var(--accent-primary);
  }
`;

const InputForm = styled.form`
  display: flex;
  align-items: center;
  background-color: var(--bg-secondary);
  border-radius: 10px;
  padding: 0.25rem 0.25rem 0.25rem 1.25rem;
  transition: all 0.2s ease;
  border: none;
  box-shadow: none;
  
  &:focus-within {
    box-shadow: none;
    outline: none;
    border: none;
  }
`;

const Input = styled.input`
  flex: 1;
  background-color: transparent;
  border: none;
  border-width: 0;
  border-style: none;
  padding: 0.75rem 0;
  color: var(--text-primary);
  outline: none;
  box-shadow: none;
  -webkit-appearance: none;
  
  &:focus {
    outline: none;
    border: none;
    box-shadow: none;
  }
  
  &::placeholder {
    color: var(--text-secondary);
  }
`;

const SendButton = styled.button`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--accent-primary);
  color: var(--text-on-accent);
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background-color: rgb(209, 100, 131);
    transform: scale(1.05);
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
  
  svg {
    font-size: 2rem;
  }
`;

const WelcomeMessage = styled.div`
  text-align: center;
  color: var(--text-secondary);
  margin: 3rem 0;
  
  h3 {
    font-size: 1.25rem;
    margin-bottom: 1rem;
    color: var(--text-primary);
  }
  
  p {
    font-size: 0.95rem;
    max-width: 500px;
    margin: 0 auto 1.5rem;
    line-height: 1.6;
  }
  
  svg {
    font-size: 2.5rem;
    color: var(--accent-primary);
    margin-bottom: 1rem;
    opacity: 0.8;
  }
`;

const ErrorMessage = styled.div`
  padding: 1rem;
  background-color: var(--error-bg);
  color: var(--error);
  border-radius: 8px;
  margin: 0 1rem 1rem;
  font-size: 0.9rem;
  display: ${props => props.show ? 'block' : 'none'};
  animation: fadeIn 0.3s ease-out;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const TypingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 1rem;
  background-color: var(--bg-elevated);
  border-radius: 18px;
  align-self: flex-start;
  max-width: 100px;
  
  span {
    width: 8px;
    height: 8px;
    background-color: var(--accent-primary);
    border-radius: 50%;
    animation: bounce 1.5s infinite ease-in-out;
    
    &:nth-child(1) {
      animation-delay: 0s;
    }
    
    &:nth-child(2) {
      animation-delay: 0.2s;
    }
    
    &:nth-child(3) {
      animation-delay: 0.4s;
    }
  }
  
  @keyframes bounce {
    0%, 60%, 100% {
      transform: translateY(0);
    }
    30% {
      transform: translateY(-4px);
    }
  }
`;

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  
  // Suggested questions
  const suggestedQuestions = [
    { id: 1, text: "How can I manage stress?", icon: <FaRegLightbulb /> },
    { id: 2, text: "What are some positive affirmations?", icon: <FaThumbsUp /> },
    { id: 3, text: "Tell me something uplifting", icon: <FaRegSmile /> },
    { id: 4, text: "How can I practice mindfulness?", icon: <FaRegComment /> }
  ];
  
  useEffect(() => {
    // Add initial assistant message
    setMessages([
      {
        id: 1,
        text: "Hi there! I'm your friendly AI chat companion. How are you feeling today? Feel free to share anything or ask questions about mental wellness.",
        sender: 'assistant',
        senderName: 'Mindful AI',
        timestamp: new Date()
      }
    ]);
  }, []);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!input.trim() || loading) return;
    
    const userMessage = {
      id: Date.now(),
      text: input,
      sender: 'user',
      senderName: 'You',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);
    
    try {
      // Get conversation history (last 10 messages max)
      const conversationHistory = [...messages, userMessage]
        .slice(-10)
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        }));
      
      // Send to positivity chat endpoint with conversation history
      const response = await chatApi.getChatResponse(conversationHistory);
      
      if (response.data && response.data.message) {
        const assistantMessage = {
          id: Date.now() + 1,
          text: response.data.message,
          sender: 'assistant',
          senderName: 'Mindful AI',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (error) {
      console.error('Error details:', error);
      setError('Unable to connect to the AI assistant. Please try again later.');
      
      // Fallback message
      const errorMessage = {
        id: Date.now() + 1,
        text: "I'm having trouble connecting right now. Let's try again in a moment.",
        sender: 'assistant',
        senderName: 'Mindful AI',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSuggestedQuestion = (question) => {
    setInput(question);
  };
  
  return (
    <ChatContainer>
      <ChatHeader>
        <h2><FaRobot /> Your own friendly AI Chat</h2>
        <p>Your supportive AI companion for mental wellness</p>
      </ChatHeader>
      
      <ErrorMessage show={error !== null}>
        {error}
      </ErrorMessage>
      
      <MessageList>
        {messages.length === 0 ? (
          <WelcomeMessage>
            <FaRegComment />
            <h3>Start a Conversation</h3>
            <p>Chat with your AI friend about your thoughts, feelings, or any questions you have about mental well-being.</p>
          </WelcomeMessage>
        ) : (
          messages.map(message => (
            <MessageBubble 
              key={message.id} 
              isUser={message.sender === 'user'}
            >
              <MessageSender isUser={message.sender === 'user'}>
                {message.senderName}
              </MessageSender>
              {message.text}
              <MessageTime isUser={message.sender === 'user'}>
                {formatTime(message.timestamp)}
              </MessageTime>
            </MessageBubble>
          ))
        )}
        
        {loading && (
          <TypingIndicator>
            <span></span>
            <span></span>
            <span></span>
          </TypingIndicator>
        )}
        
        <div ref={messagesEndRef} />
      </MessageList>
      
      <InputArea>
        <SuggestedQuestions>
          {suggestedQuestions.map(question => (
            <SuggestedQuestion 
              key={question.id}
              onClick={() => handleSuggestedQuestion(question.text)}
            >
              {question.icon} {question.text}
            </SuggestedQuestion>
          ))}
        </SuggestedQuestions>
        
        <InputForm onSubmit={handleSubmit}>
          <Input 
            type="text" 
            placeholder="Type your message..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <SendButton type="submit" disabled={!input.trim() || loading}>
            {loading ? <FaSpinner /> : <FaPaperPlane />}
          </SendButton>
        </InputForm>
      </InputArea>
    </ChatContainer>
  );
};

export default Chat; 