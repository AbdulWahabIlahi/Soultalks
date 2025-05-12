import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaBook, FaChartLine, FaComments, FaHome, FaSignOutAlt, FaList, FaMicrophone } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const SidebarContainer = styled.aside`
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: 250px;
  background-color: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  padding: 2rem 1rem;
  transition: all 0.3s ease;
  z-index: 100;

  @media (max-width: 768px) {
    transform: translateX(-100%);
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 3rem;
  flex-direction: column;
  
  h1 {
    color: var(--accent-primary);
    font-size: 1.5rem;
    margin-bottom: 0;
    margin-top: 0.5rem;
  }
  
  svg {
    width: 60px;
    height: 60px;
  }
`;

const Nav = styled.nav`
  margin-top: 2rem;
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
  border-radius: 6px;
  transition: all 0.3s ease;

  &:hover {
    background-color: var(--bg-elevated);
    color: var(--text-primary);
  }

  &.active {
    background-color: var(--accent-primary);
    color: var(--bg-primary);
  }

  svg {
    margin-right: 0.75rem;
    font-size: 1.2rem;
  }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.75rem 1rem;
  margin-top: 2rem;
  background-color: transparent;
  color: var(--text-secondary);
  border-radius: 6px;
  
  &:hover {
    background-color: var(--error);
    color: var(--bg-primary);
  }
  
  svg {
    margin-right: 0.75rem;
    font-size: 1.2rem;
  }
`;

const UserInfo = styled.div`
  margin-top: auto;
  padding: 1rem;
  background-color: var(--bg-elevated);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 0.9rem;
  margin-top: 2rem;
  
  .username {
    font-weight: bold;
    color: var(--accent-primary);
  }
`;

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <SidebarContainer>
      <Logo>
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
        <h1>MindfulMe</h1>
      </Logo>
      
      <Nav>
        <NavItem to="/" end>
          <FaHome /> Dashboard
        </NavItem>
        <NavItem to="/journal">
          <FaBook /> New Journal
        </NavItem>
        <NavItem to="/journals">
          <FaList /> Journal History
        </NavItem>
        <NavItem to="/insights">
          <FaChartLine /> Insights
        </NavItem>
        <NavItem to="/chat">
          <FaComments /> Positivity Chat
        </NavItem>
        <NavItem to="/voice-chat">
          <FaMicrophone /> Voice Chat
        </NavItem>
      </Nav>
      
      {user && (
        <>
          <UserInfo>
            Signed in as <span className="username">{user.username}</span>
          </UserInfo>
          <LogoutButton onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </LogoutButton>
        </>
      )}
    </SidebarContainer>
  );
};

export default Sidebar; 