import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  :root {
    --bg-primary: #1e1e2e;
    --bg-secondary: #181825;
    --bg-elevated: #313244;
    --text-primary: #cdd6f4;
    --text-secondary: #a6adc8;
    --accent-primary: #cba6f7;
    --accent-secondary: #f5c2e7;
    --accent-muted: #9399b2;
    --border-color: #45475a;
    --error: #f38ba8;
    --success: #a6e3a1;
    --warning: #f9e2af;
    --info: #89b4fa;
    --peach: #fab387;
    --lavender: #b4befe;
    --teal: #94e2d5;
    --rosewater: #f5e0dc;
    --sky: #89dceb;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    background-color: var(--bg-primary);
    color: var(--text-primary);
    font-family: 'Inter', 'Roboto', 'Helvetica Neue', sans-serif;
    line-height: 1.6;
    transition: all 0.3s ease;
  }

  h1, h2, h3, h4, h5, h6 {
    color: var(--text-primary);
    margin-bottom: 1rem;
    font-weight: 600;
  }

  p {
    color: var(--text-secondary);
    margin-bottom: 1rem;
  }

  a {
    color: var(--lavender);
    text-decoration: none;
    transition: color 0.3s ease;
    
    &:hover {
      color: var(--accent-secondary);
    }
  }

  button {
    background-color: var(--accent-primary);
    color: var(--bg-primary);
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    font-weight: 500;
    
    &:hover {
      background-color: var(--accent-secondary);
    }
    
    &:disabled {
      background-color: var(--accent-muted);
      cursor: not-allowed;
    }
  }

  input, textarea, select {
    background-color: var(--bg-elevated);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    padding: 0.75rem;
    color: var(--text-primary);
    transition: all 0.3s ease;
    outline: none;
    width: 100%;
    
    &:focus {
      border-color: var(--accent-primary);
      box-shadow: 0 0 0 2px var(--accent-primary);
    }
    
    &::placeholder {
      color: var(--text-secondary);
    }
  }

  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: var(--bg-primary);
  }

  ::-webkit-scrollbar-thumb {
    background: var(--accent-muted);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: var(--accent-secondary);
  }
`;

export default GlobalStyle; 