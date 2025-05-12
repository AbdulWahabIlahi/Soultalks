import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaUser, FaCamera, FaCheck, FaTimes } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/apiService';

const ProfileContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background-color: var(--bg-secondary);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const ProfileHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  
  h1 {
    color: var(--text-primary);
    margin-bottom: 1rem;
  }
  
  p {
    color: var(--text-secondary);
  }
`;

const ProfileSection = styled.div`
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--border-color);
  
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
  
  h2 {
    color: var(--text-primary);
    margin-bottom: 1.5rem;
    font-size: 1.5rem;
  }
`;

const ProfileInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  
  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

const ProfilePictureSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
`;

const AvatarContainer = styled.div`
  position: relative;
  width: 150px;
  height: 150px;
  margin-bottom: 1rem;
`;

const Avatar = styled.div`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background-color: var(--bg-elevated);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  font-size: 4rem;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const AvatarUpload = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: var(--accent-primary);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-on-accent);
  
  &:hover {
    background-color: var(--accent-primary-dark);
  }
  
  input {
    display: none;
  }
`;

const InfoForm = styled.form`
  flex: 2;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    color: var(--text-secondary);
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  
  &:focus {
    border-color: var(--accent-primary);
    outline: none;
  }
  
  &:disabled {
    background-color: var(--bg-elevated);
    cursor: not-allowed;
  }
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: var(--accent-primary);
  color: var(--text-on-accent);
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background-color: var(--accent-primary-dark);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  &.cancel {
    background-color: transparent;
    color: var(--text-secondary);
    border: 1px solid var(--border-color);
    
    &:hover {
      background-color: var(--bg-elevated);
      border-color: var(--text-secondary);
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
`;

const StatusMessage = styled.div`
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  
  &.success {
    background-color: rgba(46, 204, 113, 0.1);
    color: #2ecc71;
  }
  
  &.error {
    background-color: rgba(231, 76, 60, 0.1);
    color: #e74c3c;
  }
`;

const Profile = () => {
  const { user, setUser } = useAuth();
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setEmail(user.email || '');
      
      // Set profile image if user has one
      if (user.profileImage) {
        setImagePreview(user.profileImage);
      }
    }
  }, [user]);
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });
    
    try {
      // Create form data for the API call
      const formData = new FormData();
      formData.append('username', username);
      
      if (profileImage) {
        formData.append('profileImage', profileImage);
      }
      
      // Update user profile via API
      const response = await authApi.updateProfile(formData);
      
      if (response.data) {
        // Update local user context with new data
        setUser({
          ...user,
          username: response.data.data.user.username,
          profileImage: response.data.data.user.profileImage || user.profileImage
        });
        
        setStatus({
          type: 'success',
          message: 'Profile updated successfully!'
        });
        
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setStatus({
        type: 'error',
        message: error.response?.data?.error || 'Failed to update profile. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const cancelEdit = () => {
    setIsEditing(false);
    setUsername(user?.username || '');
    setImagePreview(user?.profileImage || null);
    setProfileImage(null);
  };
  
  if (!user) {
    return (
      <ProfileContainer>
        <ProfileHeader>
          <h1>Profile</h1>
          <p>Loading user information...</p>
        </ProfileHeader>
      </ProfileContainer>
    );
  }
  
  return (
    <ProfileContainer>
      <ProfileHeader>
        <h1>Profile Settings</h1>
        <p>Manage your account information and profile picture</p>
      </ProfileHeader>
      
      {status.message && (
        <StatusMessage className={status.type}>
          {status.message}
        </StatusMessage>
      )}
      
      <ProfileSection>
        <h2>Personal Information</h2>
        <ProfileInfo>
          <ProfilePictureSection>
            <AvatarContainer>
              <Avatar>
                {imagePreview ? (
                  <img src={imagePreview} alt="Profile" />
                ) : (
                  <FaUser />
                )}
              </Avatar>
              {isEditing && (
                <AvatarUpload onClick={() => document.getElementById('profile-image').click()}>
                  <FaCamera />
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange} 
                    id="profile-image" 
                  />
                </AvatarUpload>
              )}
            </AvatarContainer>
            {isEditing ? (
              <p>Click the <strong>camera icon</strong> on the profile picture to upload a new image</p>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            )}
          </ProfilePictureSection>
          
          <InfoForm onSubmit={handleSubmit}>
            <FormGroup>
              <label htmlFor="username">Username</label>
              <Input 
                type="text" 
                id="username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={!isEditing}
                required
              />
            </FormGroup>
            
            <FormGroup>
              <label htmlFor="email">Email</label>
              <Input 
                type="email" 
                id="email" 
                value={email}
                disabled={true} // Email can't be changed
              />
            </FormGroup>
            
            {isEditing && (
              <ButtonGroup>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : (
                    <>
                      <FaCheck /> Save Changes
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  className="cancel" 
                  onClick={cancelEdit}
                  disabled={loading}
                >
                  <FaTimes /> Cancel
                </Button>
              </ButtonGroup>
            )}
          </InfoForm>
        </ProfileInfo>
      </ProfileSection>
    </ProfileContainer>
  );
};

export default Profile; 