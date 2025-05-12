import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { FaLock, FaEnvelope, FaSpinner } from 'react-icons/fa';

const PageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--bg-primary);
  padding: 1rem;
`;

const LoginCard = styled.div`
  width: 100%;
  max-width: 400px;
  background-color: var(--bg-secondary);
  border-radius: 10px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const LogoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1.5rem;
  
  svg {
    width: 70px;
    height: 70px;
    margin-bottom: 1rem;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  color: var(--accent-primary);
  text-align: center;
  margin-bottom: 1.5rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InputGroup = styled.div`
  position: relative;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  border-radius: 4px;
  border: 1px solid var(--border-color);
  background-color: var(--bg-elevated);
  color: var(--text-primary);
  transition: all 0.2s ease;
  
  &:focus {
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 2px rgba(203, 166, 247, 0.3);
  }
`;

const LoginButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem;
  background-color: var(--accent-primary);
  color: var(--bg-primary);
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--accent-secondary);
  }
  
  &:disabled {
    background-color: var(--accent-muted);
    cursor: not-allowed;
  }
`;

const RegisterLink = styled.p`
  text-align: center;
  margin-top: 1.5rem;
  color: var(--text-secondary);
  
  a {
    color: var(--lavender);
    font-weight: 500;
    
    &:hover {
      color: var(--accent-primary);
    }
  }
`;

const ErrorMessage = styled.div`
  background-color: rgba(243, 139, 168, 0.1); /* Red with opacity */
  color: var(--error);
  padding: 0.75rem;
  border-radius: 4px;
  border-left: 3px solid var(--error);
  margin-bottom: 1rem;
`;

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});
  
  const { login, isAuthenticated, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  
  // Clear errors on unmount
  useEffect(() => {
    return () => clearError();
  }, [clearError]);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // Clear field error when user starts typing
    if (formErrors[e.target.name]) {
      setFormErrors({
        ...formErrors,
        [e.target.name]: ''
      });
    }
  };
  
  const validate = () => {
    const errors = {};
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validate()) {
      await login(formData);
    }
  };
  
  return (
    <PageContainer>
      <LoginCard>
        <LogoContainer>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 116.68 105.69">
            <defs>
              <style>
                {`.cls-1 {
                  fill: #73b6ff;
                  stroke-width: 0px;
                }`}
              </style>
            </defs>
            <g>
              <path className="cls-1" d="M116.67,31.42s0-.1-.01-.15c0,0,0-.01,0-.02-.01-.05-.03-.1-.05-.14h0s-.06-.09-.09-.13c0,0,0,0,0,0L88.19.23s-.02-.02-.02-.03c0,0-.01-.02-.02-.02,0,0,0,0,0,0-.01-.01-.03-.03-.04-.04,0,0-.02-.01-.03-.02-.02-.01-.04-.02-.06-.03,0,0-.01,0-.02-.01-.06-.03-.12-.04-.18-.05,0,0,0,0-.01,0-.02,0-.05,0-.08,0h-.03s-.04,0-.07,0c0,0-.02,0-.04,0,0,0-.02,0-.04,0,0,0,0,0-.01,0,0,0-.02,0-.04,0-.02,0-.03.02-.05.02,0,0,0,0-.01,0l-29.06,12.41L29.28.05s0,0-.01,0c-.01,0-.03,0-.05-.02-.01,0-.03,0-.04,0,0,0,0,0,0,0-.01,0-.03,0-.04,0,0,0-.02,0-.04,0-.02,0-.04,0-.06,0h-.03s-.06,0-.09,0h0c-.06.01-.12.03-.18.05,0,0-.01,0-.02,0-.02.01-.04.02-.06.04,0,0-.02.01-.03.02-.01.01-.03.03-.05.04,0,0,0,0,0,0,0,0,0,.01-.02.02,0,0-.01.02-.02.03L.19,30.96s0,0,0,0c-.03.04-.07.08-.09.13H.08s-.04.1-.05.15c0,0,0,.01,0,.02,0,.05-.01.1-.02.15v.03s0,.1.02.15H.02s0,.02,0,.03c0,.02,0,.04.02.05l11.54,31.86h0s.01.03.02.04c.01.04.03.07.05.11,0,.02.02.03.03.04.02.03.04.05.07.07,0,0,0,0,0,.01l46.09,41.68s0,0,0,0c0,0,.01,0,.02.01s0,0,.01,0c0,0,.02.02.04.03,0,0,0,0,.02.01,0,0,0,0,0,0,0,0,0,0,.01,0,0,0,0,0,.01,0,0,0,.01,0,.02,0,.01,0,.03.01.05.02,0,0,0,0,.02,0,0,0,0,0,.02,0,0,0,0,0,.01,0,.02,0,.04,0,.06.01,0,0,.01,0,.02,0,0,0,0,0,.02,0h.01s.06,0,.08,0h0s.06,0,.09,0h.01s0,0,.01,0c0,0,.01,0,.02,0,.02,0,.04,0,.06-.01,0,0,0,0,.01,0,0,0,.01,0,.02,0,0,0,.01,0,.02,0,.02,0,.03-.02.05-.02,0,0,.01,0,.02,0,0,0,0,0,.01,0,0,0,0,0,.01,0,0,0,0,0,0,0,0,0,.02,0,.02-.02.01,0,.03-.01.04-.02,0,0,0,0,.01,0s0,0,.02-.01t0,0l46.09-41.68s0,0,0-.01c.02-.02.05-.05.07-.07,0-.01.02-.03.03-.04.02-.03.04-.07.05-.11,0-.01.01-.03.02-.03h0s11.54-31.87,11.54-31.87c0-.02.01-.03.02-.05,0,0,0-.01,0-.02h0c0-.06.01-.11.02-.16,0,0,0-.02,0-.03ZM28.69,2.1l13.2,43.39L1.95,31.14,28.69,2.1ZM13.46,63.45l29.06-15.77,14.52,55.19L13.46,63.45ZM57.63,99.51l-1.9-7.21-12-45.62,13.9-30.22v83.04ZM86.55,1.96l-12.99,42.68-10.41-22.63-3.86-8.4L86.55,1.96ZM104.05,62.29l-28.62-15.53,39.37-14.14-10.75,29.67ZM59.05,16.47v83.04l1.9-7.21,12-45.62-13.9-30.22ZM1.89,32.61l10.75,29.67,28.62-15.53L1.89,32.61ZM87.99,2.1l-13.21,43.39,39.95-14.34L87.99,2.1ZM30.12,1.96l13,42.68,10.41-22.63,3.86-8.4L30.12,1.96ZM74.15,47.68l-14.52,55.19,43.58-39.41-29.07-15.77Z" />
            </g>
          </svg>
          <Title>MindfulMe</Title>
        </LogoContainer>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <InputIcon>
              <FaEnvelope />
            </InputIcon>
            <Input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
            />
            {formErrors.email && <div style={{ color: 'var(--error)', fontSize: '0.8rem', marginTop: '0.25rem' }}>{formErrors.email}</div>}
          </InputGroup>
          
          <InputGroup>
            <InputIcon>
              <FaLock />
            </InputIcon>
            <Input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />
            {formErrors.password && <div style={{ color: 'var(--error)', fontSize: '0.8rem', marginTop: '0.25rem' }}>{formErrors.password}</div>}
          </InputGroup>
          
          <LoginButton type="submit" disabled={loading}>
            {loading ? <FaSpinner className="spinner" /> : 'Login'}
          </LoginButton>
        </Form>
        
        <RegisterLink>
          Don't have an account? <Link to="/register">Register</Link>
        </RegisterLink>
      </LoginCard>
    </PageContainer>
  );
};

export default Login; 