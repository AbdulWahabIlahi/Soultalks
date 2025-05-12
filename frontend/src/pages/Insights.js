import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, RadialLinearScale } from 'chart.js';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { journalApi } from '../services/apiService';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, RadialLinearScale, Title, Tooltip, Legend);

const InsightsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background-color: var(--bg-secondary);
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  
  h3 {
    margin-bottom: 1.5rem;
    color: white;
    font-size: 1.25rem;
  }
`;

const TimeRangeSelector = styled.div`
  display: flex;
  margin-bottom: 2rem;
  background-color: var(--bg-elevated);
  border-radius: 8px;
  padding: 0.5rem;
  width: fit-content;
`;

const TimeRangeButton = styled.button`
  background-color: ${props => props.active ? 'var(--accent-primary)' : 'transparent'};
  color: ${props => props.active ? 'white' : 'white'};
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.active ? 'var(--accent-primary)' : 'var(--accent-muted)'};
    color: white;
  }
`;

const PatternCard = styled.div`
  background-color: var(--bg-secondary);
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  grid-column: span 2;
  
  @media (max-width: 1200px) {
    grid-column: span 1;
  }
  
  h3 {
    margin-bottom: 1rem;
    color: white;
    font-size: 1.25rem;
  }
`;

const PatternsList = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const PatternItem = styled.li`
  padding: 1rem;
  border-radius: 8px;
  background-color: var(--bg-elevated);
  margin-bottom: 1rem;
  color: white;
  border-left: 4px solid var(--accent-primary);
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background-color: var(--bg-elevated);
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  
  h4 {
    color: var(--text-secondary);
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }
  
  .value {
    color: white;
    font-size: 1.5rem;
    font-weight: bold;
  }
  
  .trend {
    color: ${props => props.trend > 0 ? 'var(--success)' : 'var(--error)'};
    font-size: 0.9rem;
    margin-top: 0.5rem;
  }
`;

const Insights = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [moodData, setMoodData] = useState({});
  const [anxietyData, setAnxietyData] = useState({});
  const [emotionsData, setEmotionsData] = useState({});
  const [sleepData, setSleepData] = useState({});
  const [activityData, setActivityData] = useState({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [journals, setJournals] = useState([]);
  
  // Fetch journals on component mount
  useEffect(() => {
    const fetchUserJournals = async () => {
      try {
        console.log('Fetching journals for Insights...');
        const response = await journalApi.getAllJournals();
        console.log(`Fetched ${response.data.length} journals:`, response.data);
        setJournals(response.data);
      } catch (error) {
        console.error('Error fetching journals:', error);
      }
    };
    
    fetchUserJournals();
  }, []);
  
  useEffect(() => {
    // In a real app, this would fetch data from the backend
    // and format it for the charts
    console.log('User in Insights:', user);
    console.log(`Journals in Insights: ${journals.length}`);
    fetchInsightData();
  }, [timeRange, journals]);
  
  const fetchInsightData = async () => {
    setLoading(true);
    
    try {
      // For the test user, we'll use real journal data for insights
      // For other users, we'll use mock data
      const isTestUser = user && (user.email === 'test@test.com');
      
      // Generate appropriate date labels based on time range
      const labels = timeRange === 'week' 
        ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        : timeRange === 'month'
          ? Array.from({length: 30}, (_, i) => i + 1)
          : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      if (isTestUser && journals.length > 0) {
        // Use real journal data for test user
        const filteredJournals = filterJournalsByTimeRange(journals, timeRange);
        console.log(`Processing ${filteredJournals.length} filtered journals for ${timeRange} view`);
        
        // Process journal data for charts
        const moodScores = processMoodData(filteredJournals, timeRange);
        console.log('Mood data processed:', moodScores);
        
        const anxietyScores = processAnxietyData(filteredJournals, timeRange);
        console.log('Anxiety data processed:', anxietyScores);
        
        const emotionCounts = processEmotionCounts(filteredJournals);
        console.log('Emotion counts processed:', emotionCounts);
        
        setMoodData({
          labels: moodScores.labels,
          datasets: [
            {
              label: 'Mood Score',
              data: moodScores.data,
              borderColor: '#9c72e0',
              backgroundColor: 'rgba(156, 114, 224, 0.2)',
              tension: 0.4
            }
          ]
        });
        
        setAnxietyData({
          labels: anxietyScores.labels,
          datasets: [
            {
              label: 'Anxiety Level',
              data: anxietyScores.data,
              backgroundColor: '#7e57c2',
              borderRadius: 6
            }
          ]
        });
        
        setEmotionsData({
          labels: Object.keys(emotionCounts),
          datasets: [
            {
              data: Object.values(emotionCounts),
              backgroundColor: [
                '#81c784', // green - happy, calm
                '#64b5f6', // blue - neutral
                '#ffb74d', // orange - excited
                '#e57373', // red - stressed, anxious
                '#9575cd'  // purple - sad
              ],
              borderWidth: 0
            }
          ]
        });

      } else {
        // Use mock data for non-test users or if no journals
        setMoodData({
          labels,
          datasets: [
            {
              label: 'Mood Score',
              data: generateRandomData(labels.length, 5, 10),
              borderColor: '#9c72e0',
              backgroundColor: 'rgba(156, 114, 224, 0.2)',
              tension: 0.4
            }
          ]
        });
        
        setAnxietyData({
          labels,
          datasets: [
            {
              label: 'Anxiety Level',
              data: generateRandomData(labels.length, 0, 8),
              backgroundColor: '#7e57c2',
              borderRadius: 6
            }
          ]
        });
        
        setEmotionsData({
          labels: ['Happy', 'Calm', 'Anxious', 'Stressed', 'Excited'],
          datasets: [
            {
              data: generateRandomData(5, 1, 15),
              backgroundColor: [
                '#81c784', // green
                '#64b5f6', // blue
                '#ffb74d', // orange
                '#e57373', // red
                '#9575cd'  // purple
              ],
              borderWidth: 0
            }
          ]
        });
      }

      // These are still mock data for all users
      setSleepData({
        labels,
        datasets: [
          {
            label: 'Sleep Hours',
            data: generateRandomData(labels.length, 5, 9),
            borderColor: '#64b5f6',
            backgroundColor: 'rgba(100, 181, 246, 0.2)',
            tension: 0.4
          }
        ]
      });

      setActivityData({
        labels: ['Exercise', 'Meditation', 'Social', 'Work', 'Hobbies'],
        datasets: [
          {
            label: 'Activity Balance',
            data: generateRandomData(5, 1, 10),
            backgroundColor: 'rgba(156, 114, 224, 0.6)',
            borderColor: '#9c72e0',
            pointBackgroundColor: '#9c72e0',
          }
        ]
      });
      
    } catch (error) {
      console.error('Error processing insights data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to filter journals by time range
  const filterJournalsByTimeRange = (journals, range) => {
    const today = new Date();
    const startDate = new Date(today);
    
    if (range === 'week') {
      startDate.setDate(today.getDate() - 7);
    } else if (range === 'month') {
      startDate.setMonth(today.getMonth() - 1);
    } else {
      startDate.setFullYear(today.getFullYear() - 1);
    }
    
    return journals.filter(journal => new Date(journal.date) >= startDate);
  };
  
  // Process real mood data from journals
  const processMoodData = (journals, range) => {
    const moodMap = {
      'happy': 9,
      'excited': 8,
      'calm': 7,
      'neutral': 6,
      'stressed': 4,
      'anxious': 3,
      'sad': 2
    };
    
    let labels = [];
    let groupedData = {};
    
    if (range === 'week') {
      // Group by day of week
      labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
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
    } else if (range === 'month') {
      // Group by day of month
      labels = Array.from({length: 30}, (_, i) => i + 1);
      journals.forEach(journal => {
        const date = new Date(journal.date);
        const dayIndex = date.getDate() - 1; // Convert to 0-29
        
        if (!groupedData[dayIndex]) {
          groupedData[dayIndex] = { sum: 0, count: 0 };
        }
        
        const mood = journal.textAnalysis?.mood || 'neutral';
        groupedData[dayIndex].sum += moodMap[mood] || 6;
        groupedData[dayIndex].count++;
      });
    } else {
      // Group by month
      labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      journals.forEach(journal => {
        const date = new Date(journal.date);
        const monthIndex = date.getMonth(); // 0-11
        
        if (!groupedData[monthIndex]) {
          groupedData[monthIndex] = { sum: 0, count: 0 };
        }
        
        const mood = journal.textAnalysis?.mood || 'neutral';
        groupedData[monthIndex].sum += moodMap[mood] || 6;
        groupedData[monthIndex].count++;
      });
    }
    
    // Calculate averages and fill in missing data
    const data = labels.map((_, index) => {
      if (groupedData[index] && groupedData[index].count > 0) {
        return groupedData[index].sum / groupedData[index].count;
      }
      return null; // No data for this period
    });
    
    return { labels, data };
  };
  
  // Process real anxiety data from journals
  const processAnxietyData = (journals, range) => {
    let labels = [];
    let groupedData = {};
    
    if (range === 'week') {
      labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
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
    } else if (range === 'month') {
      labels = Array.from({length: 30}, (_, i) => i + 1);
      journals.forEach(journal => {
        const date = new Date(journal.date);
        const dayIndex = date.getDate() - 1;
        
        if (!groupedData[dayIndex]) {
          groupedData[dayIndex] = { sum: 0, count: 0 };
        }
        
        const anxietyScore = journal.textAnalysis?.anxietyScore || 0;
        groupedData[dayIndex].sum += anxietyScore;
        groupedData[dayIndex].count++;
      });
    } else {
      labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      journals.forEach(journal => {
        const date = new Date(journal.date);
        const monthIndex = date.getMonth();
        
        if (!groupedData[monthIndex]) {
          groupedData[monthIndex] = { sum: 0, count: 0 };
        }
        
        const anxietyScore = journal.textAnalysis?.anxietyScore || 0;
        groupedData[monthIndex].sum += anxietyScore;
        groupedData[monthIndex].count++;
      });
    }
    
    const data = labels.map((_, index) => {
      if (groupedData[index] && groupedData[index].count > 0) {
        return groupedData[index].sum / groupedData[index].count;
      }
      return null;
    });
    
    return { labels, data };
  };
  
  // Count occurrences of each emotion/mood type
  const processEmotionCounts = (journals) => {
    const counts = {
      'Happy': 0,
      'Calm': 0,
      'Neutral': 0,
      'Anxious': 0, 
      'Stressed': 0,
      'Sad': 0,
      'Excited': 0
    };
    
    journals.forEach(journal => {
      const mood = journal.textAnalysis?.mood;
      if (mood) {
        // Capitalize first letter for display
        const formattedMood = mood.charAt(0).toUpperCase() + mood.slice(1);
        if (counts[formattedMood] !== undefined) {
          counts[formattedMood]++;
        }
      }
    });
    
    // Remove moods with 0 count
    return Object.fromEntries(
      Object.entries(counts).filter(([_, count]) => count > 0)
    );
  };
  
  const generateRandomData = (length, min, max) => {
    return Array.from({length}, () => Math.floor(Math.random() * (max - min + 1)) + min);
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'white',
          font: {
            size: 12
          }
        }
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'white',
          font: {
            size: 12
          }
        }
      }
    },
    plugins: {
      legend: {
        labels: {
          color: 'white',
          font: {
            size: 12
          }
        }
      },
      title: {
        color: 'white',
        font: {
          size: 14
        }
      }
    }
  };
  
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: 'white',
          font: {
            size: 12
          }
        }
      }
    }
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        pointLabels: {
          color: 'white',
          font: {
            size: 12
          }
        },
        ticks: {
          color: 'white',
          backdropColor: 'transparent'
        }
      }
    },
    plugins: {
      legend: {
        labels: {
          color: 'white',
          font: {
            size: 12
          }
        }
      }
    }
  };
  
  return (
    <div>
      <TimeRangeSelector>
        <TimeRangeButton 
          active={timeRange === 'week'} 
          onClick={() => setTimeRange('week')}
        >
          Week
        </TimeRangeButton>
        <TimeRangeButton 
          active={timeRange === 'month'} 
          onClick={() => setTimeRange('month')}
        >
          Month
        </TimeRangeButton>
        <TimeRangeButton 
          active={timeRange === 'year'} 
          onClick={() => setTimeRange('year')}
        >
          Year
        </TimeRangeButton>
      </TimeRangeSelector>

      <StatsGrid>
        <StatCard trend={1.2}>
          <h4>Average Mood</h4>
          <div className="value">7.5</div>
          <div className="trend">↑ 1.2 from last week</div>
        </StatCard>
        <StatCard trend={-0.8}>
          <h4>Average Anxiety</h4>
          <div className="value">3.2</div>
          <div className="trend">↓ 0.8 from last week</div>
        </StatCard>
        <StatCard trend={0.5}>
          <h4>Sleep Quality</h4>
          <div className="value">8.1</div>
          <div className="trend">↑ 0.5 from last week</div>
        </StatCard>
      </StatsGrid>
      
      <InsightsContainer>
        <ChartCard>
          <h3>Mood Trends</h3>
          <div style={{ height: '300px' }}>
            {!loading && moodData.labels && (
              <Line data={moodData} options={chartOptions} />
            )}
          </div>
        </ChartCard>
        
        <ChartCard>
          <h3>Anxiety Levels</h3>
          <div style={{ height: '300px' }}>
            {!loading && anxietyData.labels && (
              <Bar data={anxietyData} options={chartOptions} />
            )}
          </div>
        </ChartCard>

        <ChartCard>
          <h3>Sleep Patterns</h3>
          <div style={{ height: '300px' }}>
            {!loading && sleepData.labels && (
              <Line data={sleepData} options={chartOptions} />
            )}
          </div>
        </ChartCard>

        <ChartCard>
          <h3>Activity Balance</h3>
          <div style={{ height: '300px' }}>
            {!loading && activityData.labels && (
              <Radar data={activityData} options={radarOptions} />
            )}
          </div>
        </ChartCard>
        
        <ChartCard>
          <h3>Emotion Distribution</h3>
          <div style={{ height: '300px' }}>
            {!loading && emotionsData.labels && (
              <Doughnut data={emotionsData} options={doughnutOptions} />
            )}
          </div>
        </ChartCard>

        <PatternCard>
          <h3>Insights & Patterns</h3>
          <PatternsList>
            <PatternItem>Your mood tends to improve on weekends, with peaks on Saturdays</PatternItem>
            <PatternItem>Lower anxiety levels correlate with better sleep quality</PatternItem>
            <PatternItem>Exercise and meditation show positive impact on overall mood</PatternItem>
            <PatternItem>Social activities appear to boost your emotional well-being</PatternItem>
          </PatternsList>
        </PatternCard>
      </InsightsContainer>
    </div>
  );
};

export default Insights; 