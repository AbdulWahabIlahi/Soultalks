import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { FaSmile, FaMeh, FaFrown, FaCheck } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { journalApi } from '../services/apiService';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const DashboardContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const StatsCard = styled.div`
  background-color: var(--bg-secondary);
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  
  h3 {
    font-size: 1.25rem;
    margin-bottom: 0;
  }
  
  svg {
    font-size: 1.5rem;
    color: var(--accent-primary);
  }
`;

const ChartContainer = styled.div`
  background-color: var(--bg-secondary);
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  grid-column: span 2;
  
  @media (max-width: 768px) {
    grid-column: span 1;
  }
`;

const StatsValue = styled.div`
  font-size: 2rem;
  font-weight: 600;
  margin: 0.5rem 0;
  color: var(--text-primary);
`;

const StatsLabel = styled.div`
  color: var(--text-secondary);
  font-size: 0.9rem;
`;

const StatsChange = styled.div`
  display: flex;
  align-items: center;
  color: ${props => props.isPositive ? 'var(--success)' : 'var(--error)'};
  font-size: 0.9rem;
  
  svg {
    margin-right: 0.25rem;
  }
`;

const JournalStreak = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const StreakDay = styled.div`
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.isCompleted ? 'var(--accent-primary)' : 'var(--bg-elevated)'};
  color: ${props => props.isCompleted ? 'white' : 'var(--text-secondary)'};
  font-size: 0.8rem;
  font-weight: 600;
`;

const Dashboard = () => {
  const { user } = useAuth();
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moodData, setMoodData] = useState({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Mood Score',
        data: [7, 6, 8, 5, 7, 8, 9],
        borderColor: '#9c72e0',
        backgroundColor: 'rgba(156, 114, 224, 0.2)',
        tension: 0.4
      }
    ]
  });
  
  const [anxietyData, setAnxietyData] = useState({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Anxiety Level',
        data: [4, 5, 3, 6, 4, 2, 1],
        borderColor: '#64b5f6',
        backgroundColor: 'rgba(100, 181, 246, 0.2)',
        tension: 0.4
      }
    ]
  });

  const [moodAvg, setMoodAvg] = useState(7.8);
  const [anxietyAvg, setAnxietyAvg] = useState(3.6);
  const [journalStreak, setJournalStreak] = useState(5);
  const [streakDays, setStreakDays] = useState([true, true, true, true, true, false, false]);
  
  // Fetch journals on component mount
  useEffect(() => {
    const fetchUserJournals = async () => {
      try {
        setLoading(true);
        console.log('Fetching journals for Dashboard...');
        const response = await journalApi.getAllJournals();
        console.log(`Fetched ${response.data.length} journals:`, response.data);
        setJournals(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching journals:', error);
        setLoading(false);
      }
    };
    
    fetchUserJournals();
  }, []);
  
  // Process journal data for test user
  useEffect(() => {
    console.log('User in Dashboard:', user);
    console.log(`Journals in Dashboard: ${journals.length}`);
    if (journals.length > 0 && user && user.email === 'test@test.com') {
      console.log('Processing journal data for test user...');
      // Get last 7 days of journals
      const last7Days = filterLastNDays(journals, 7);
      console.log(`Found ${last7Days.length} journals from last 7 days`);
      
      // Process mood data
      const processedMoodData = processMoodData(last7Days);
      setMoodData(processedMoodData);
      
      // Process anxiety data
      const processedAnxietyData = processAnxietyData(last7Days);
      setAnxietyData(processedAnxietyData);
      
      // Calculate mood average
      const moodScores = calculateMoodScores(last7Days);
      setMoodAvg(Number(moodScores.average.toFixed(1)));
      
      // Calculate anxiety average
      const anxietyScores = calculateAnxietyScores(last7Days);
      setAnxietyAvg(Number(anxietyScores.average.toFixed(1)));
      
      // Calculate journal streak
      const { streak, days } = calculateJournalStreak(journals);
      setJournalStreak(streak);
      setStreakDays(days);
    }
  }, [journals, user]);
  
  // Filter journals for last N days
  const filterLastNDays = (journals, days) => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - days);
    
    return journals.filter(journal => new Date(journal.date) >= startDate);
  };
  
  // Process mood data from journals
  const processMoodData = (journals) => {
    const moodMap = {
      'happy': 9,
      'excited': 8,
      'calm': 7,
      'neutral': 6,
      'stressed': 4,
      'anxious': 3,
      'sad': 2
    };
    
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const groupedData = {};
    
    // Group by day of week
    journals.forEach(journal => {
      const date = new Date(journal.date);
      const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1; // Convert to 0-6 (Mon-Sun)
      
      if (!groupedData[dayIndex]) {
        groupedData[dayIndex] = { sum: 0, count: 0 };
      }
      
      const mood = journal.textAnalysis?.mood || 'neutral';
      groupedData[dayIndex].sum += moodMap[mood] || 6;
      groupedData[dayIndex].count++;
    });
    
    // Calculate averages for each day
    const data = labels.map((_, index) => {
      if (groupedData[index] && groupedData[index].count > 0) {
        return groupedData[index].sum / groupedData[index].count;
      }
      return null;
    });
    
    return {
      labels,
      datasets: [
        {
          label: 'Mood Score',
          data,
          borderColor: '#9c72e0',
          backgroundColor: 'rgba(156, 114, 224, 0.2)',
          tension: 0.4
        }
      ]
    };
  };
  
  // Process anxiety data from journals
  const processAnxietyData = (journals) => {
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const groupedData = {};
    
    journals.forEach(journal => {
      const date = new Date(journal.date);
      const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;
      
      if (!groupedData[dayIndex]) {
        groupedData[dayIndex] = { sum: 0, count: 0 };
      }
      
      const anxietyScore = journal.textAnalysis?.anxietyScore || 0;
      groupedData[dayIndex].sum += anxietyScore;
      groupedData[dayIndex].count++;
    });
    
    const data = labels.map((_, index) => {
      if (groupedData[index] && groupedData[index].count > 0) {
        return groupedData[index].sum / groupedData[index].count;
      }
      return null;
    });
    
    return {
      labels,
      datasets: [
        {
          label: 'Anxiety Level',
          data,
          borderColor: '#64b5f6',
          backgroundColor: 'rgba(100, 181, 246, 0.2)',
          tension: 0.4
        }
      ]
    };
  };
  
  // Calculate mood scores
  const calculateMoodScores = (journals) => {
    const moodMap = {
      'happy': 9,
      'excited': 8,
      'calm': 7,
      'neutral': 6,
      'stressed': 4,
      'anxious': 3,
      'sad': 2
    };
    
    let total = 0;
    let count = 0;
    
    journals.forEach(journal => {
      const mood = journal.textAnalysis?.mood || 'neutral';
      total += moodMap[mood] || 6;
      count++;
    });
    
    const average = count > 0 ? total / count : 0;
    
    return {
      average,
      total,
      count
    };
  };
  
  // Calculate anxiety scores
  const calculateAnxietyScores = (journals) => {
    let total = 0;
    let count = 0;
    
    journals.forEach(journal => {
      const anxietyScore = journal.textAnalysis?.anxietyScore || 0;
      total += anxietyScore;
      count++;
    });
    
    const average = count > 0 ? total / count : 0;
    
    return {
      average,
      total,
      count
    };
  };
  
  // Calculate journal streak and active days
  const calculateJournalStreak = (journals) => {
    // Get journal dates for last 7 days
    const today = new Date();
    const streakDays = [false, false, false, false, false, false, false]; // Mon to Sun
    
    // Count consecutive days with journals
    let streak = 0;
    let currentStreak = 0;
    
    // Sort journals by date descending
    const sortedJournals = [...journals].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    // Mark days in last week that have journals
    sortedJournals.forEach(journal => {
      const journalDate = new Date(journal.date);
      const diffTime = today.getTime() - journalDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 7) {
        const dayOfWeek = journalDate.getDay() === 0 ? 6 : journalDate.getDay() - 1;
        streakDays[dayOfWeek] = true;
      }
    });
    
    // Calculate current streak
    let i = 0;
    const dateMap = {};
    
    // Group journals by date
    sortedJournals.forEach(journal => {
      const dateStr = new Date(journal.date).toDateString();
      dateMap[dateStr] = true;
    });
    
    // Check consecutive days
    for (i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const checkDateStr = checkDate.toDateString();
      
      if (dateMap[checkDateStr]) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    streak = currentStreak;
    
    return { streak, days: streakDays };
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(53, 53, 73, 0.5)'
        },
        ticks: {
          color: 'var(--text-secondary)'
        }
      },
      x: {
        grid: {
          color: 'rgba(53, 53, 73, 0.5)'
        },
        ticks: {
          color: 'var(--text-secondary)'
        }
      }
    },
    plugins: {
      legend: {
        labels: {
          color: 'var(--text-primary)'
        }
      }
    }
  };
  
  return (
    <DashboardContainer>
      <StatsCard>
        <CardHeader>
          <h3>Current Mood</h3>
          <FaSmile />
        </CardHeader>
        <StatsValue>{moodAvg} / 10</StatsValue>
        <StatsLabel>Weekly Average</StatsLabel>
        <StatsChange isPositive={true}>
          <FaSmile /> Based on your recent journals
        </StatsChange>
      </StatsCard>
      
      <StatsCard>
        <CardHeader>
          <h3>Anxiety Level</h3>
          <FaMeh />
        </CardHeader>
        <StatsValue>{anxietyAvg} / 10</StatsValue>
        <StatsLabel>Weekly Average</StatsLabel>
        <StatsChange isPositive={anxietyAvg < 5}>
          <FaSmile /> Based on recent analysis
        </StatsChange>
      </StatsCard>
      
      <StatsCard>
        <CardHeader>
          <h3>Journal Streak</h3>
          <FaCheck />
        </CardHeader>
        <StatsValue>{journalStreak} days</StatsValue>
        <StatsLabel>Keep it going!</StatsLabel>
        <JournalStreak>
          <StreakDay isCompleted={streakDays[0]}>M</StreakDay>
          <StreakDay isCompleted={streakDays[1]}>T</StreakDay>
          <StreakDay isCompleted={streakDays[2]}>W</StreakDay>
          <StreakDay isCompleted={streakDays[3]}>T</StreakDay>
          <StreakDay isCompleted={streakDays[4]}>F</StreakDay>
          <StreakDay isCompleted={streakDays[5]}>S</StreakDay>
          <StreakDay isCompleted={streakDays[6]}>S</StreakDay>
        </JournalStreak>
      </StatsCard>
      
      <ChartContainer>
        <CardHeader>
          <h3>Mood Trends</h3>
        </CardHeader>
        <div style={{ height: '250px' }}>
          <Line data={moodData} options={chartOptions} />
        </div>
      </ChartContainer>
      
      <ChartContainer>
        <CardHeader>
          <h3>Anxiety Trends</h3>
        </CardHeader>
        <div style={{ height: '250px' }}>
          <Line data={anxietyData} options={chartOptions} />
        </div>
      </ChartContainer>
    </DashboardContainer>
  );
};

export default Dashboard; 