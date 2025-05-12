import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { FaBell, FaUser, FaSignOutAlt, FaCog } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const HeaderContainer = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
`;

const PageTitle = styled.h1`
  font-size: 1.75rem;
  color: var(--text-primary);
  margin-bottom: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
`;

const IconButton = styled.button`
  background: transparent;
  color: var(--text-secondary);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 1rem;
  font-size: 1.2rem;
  
  &:hover {
    background: var(--bg-elevated);
    color: var(--accent-primary);
  }
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--accent-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 1rem;
  cursor: pointer;
  color: var(--text-primary);
  font-size: 1.2rem;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const UserDropdown = styled.div`
  position: absolute;
  top: 50px;
  right: 0;
  width: 200px;
  background-color: var(--bg-elevated);
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  padding: 0.5rem 0;
  z-index: 100;
  display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};
`;

const UserInfo = styled.div`
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-color);
  
  .name {
    font-weight: bold;
    color: var(--text-primary);
  }
  
  .email {
    font-size: 0.8rem;
    color: var(--text-secondary);
  }
`;

const DropdownItem = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.75rem 1rem;
  background: transparent;
  text-align: left;
  
  &:hover {
    background-color: var(--bg-primary);
  }
  
  svg {
    margin-right: 0.75rem;
    font-size: 1rem;
  }
  
  &.logout {
    color: var(--error);
  }
`;

const AvatarWrapper = styled.div`
  position: relative;
`;

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // This would normally come from React Router
  const currentPath = window.location.pathname;
  
  const getPageTitle = () => {
    switch(true) {
      case currentPath.includes('/journal'):
        return 'Journal';
      case currentPath.includes('/insights'):
        return 'Insights';
      case currentPath.includes('/chat'):
        return 'Positivity Chat';
      default:
        return 'Dashboard';
    }
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsDropdownOpen(false);
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <HeaderContainer>
      <PageTitle>{getPageTitle()}</PageTitle>
      <HeaderActions>
        <IconButton>
          <FaBell />
        </IconButton>
        <AvatarWrapper ref={dropdownRef}>
          <Avatar onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
            {user?.profileImage ? (
              <img src={user.profileImage} alt={user.username} />
            ) : (
              user?.username?.charAt(0) || <FaUser />
            )}
          </Avatar>
          <UserDropdown isOpen={isDropdownOpen}>
            {user && (
              <UserInfo>
                <div className="name">{user.username}</div>
                <div className="email">{user.email}</div>
              </UserInfo>
            )}
            <DropdownItem onClick={() => navigate('/profile')}>
              <FaCog /> Settings
            </DropdownItem>
            <DropdownItem className="logout" onClick={handleLogout}>
              <FaSignOutAlt /> Logout
            </DropdownItem>
          </UserDropdown>
        </AvatarWrapper>
      </HeaderActions>
    </HeaderContainer>
  );
};

export default Header; 