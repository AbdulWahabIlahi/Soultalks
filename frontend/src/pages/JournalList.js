import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaCalendarAlt, FaImage, FaMicrophone, FaArrowRight, FaPlus, FaChartLine, FaSearch } from 'react-icons/fa';
import { journalApi } from '../services/apiService';

const JournalListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  
  h1 {
    font-size: 2rem;
    color: var(--text-primary);
    margin: 0;
  }
`;

const FilterBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  background-color: var(--bg-secondary);
  border-radius: 10px;
  padding: 1rem 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  background-color: var(--bg-elevated);
  border-radius: 30px;
  padding: 0.5rem 1rem;
  width: 300px;
  
  svg {
    margin-right: 0.5rem;
    color: var(--text-secondary);
  }
  
  input {
    background: transparent;
    border: none;
    outline: none;
    color: var(--text-primary);
    width: 100%;
    
    &::placeholder {
      color: var(--text-secondary);
    }
  }
`;

const MoodFilter = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  select {
    background-color: var(--bg-elevated);
    border: none;
    border-radius: 30px;
    padding: 0.5rem 1rem;
    color: var(--text-primary);
    outline: none;
    cursor: pointer;
  }
`;

const NewJournalButton = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: var(--accent-primary);
  color: white;
  padding: 0.75rem 1.25rem;
  border-radius: 30px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: var(--accent-primary-dark);
    transform: translateY(-2px);
  }
  
  svg {
    font-size: 1rem;
  }
`;

const MonthDivider = styled.div`
  margin: 2rem 0 1rem;
  display: flex;
  align-items: center;
  
  h2 {
    font-size: 1.2rem;
    color: var(--text-secondary);
    margin: 0;
    margin-right: 1rem;
    white-space: nowrap;
  }
  
  .line {
    flex-grow: 1;
    height: 1px;
    background-color: var(--border-color);
  }
`;

const JournalGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1.5rem;
`;

const JournalCard = styled(Link)`
  background-color: var(--bg-secondary);
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  text-decoration: none;
  color: var(--text-primary);
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 5px;
    background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
  }
`;

const JournalDate = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
  
  svg {
    color: var(--accent-primary);
  }
`;

const JournalPreview = styled.div`
  flex-grow: 1;
  margin-bottom: 1rem;
  
  p {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--text-primary);
    line-height: 1.6;
    font-size: 0.95rem;
    margin: 0;
  }
`;

const JournalMood = styled.div`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 50px;
  background-color: var(--accent-muted);
  color: var(--text-primary);
  font-size: 0.8rem;
  font-weight: 500;
  margin-right: 0.5rem;
  margin-bottom: 1rem;
  
  &.happy, &.joyful, &.excited {
    background-color: rgba(129, 199, 132, 0.2);
    color: #2e7d32;
  }
  
  &.calm, &.relaxed, &.peaceful {
    background-color: rgba(100, 181, 246, 0.2);
    color: #1565c0;
  }
  
  &.anxious, &.stressed, &.nervous {
    background-color: rgba(255, 183, 77, 0.2);
    color: #ef6c00;
  }
  
  &.sad, &.depressed, &.down {
    background-color: rgba(149, 117, 205, 0.2);
    color: #512da8;
  }
  
  &.angry, &.frustrated, &.irritated {
    background-color: rgba(229, 115, 115, 0.2);
    color: #c62828;
  }
`;

const JournalFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
`;

const JournalMedia = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const MediaIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
  background-color: var(--bg-elevated);
  padding: 0.25rem 0.5rem;
  border-radius: 20px;
  
  svg {
    color: var(--accent-primary);
    font-size: 0.8rem;
  }
`;

const AnalysisIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
  
  svg {
    color: var(--accent-primary);
  }
`;

const ViewMore = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--accent-primary);
  font-weight: 500;
  font-size: 0.85rem;
  
  svg {
    transition: transform 0.3s ease;
  }
  
  ${JournalCard}:hover & svg {
    transform: translateX(3px);
  }
`;

const Loader = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: var(--text-secondary);
`;

const ErrorMessage = styled.div`
  padding: 1.5rem;
  background-color: var(--error-bg);
  color: var(--error);
  border-radius: 10px;
  margin: 1rem 0;
  text-align: center;
  
  button {
    margin-top: 1rem;
    background-color: var(--accent-primary);
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 5px;
    cursor: pointer;
    
    &:hover {
      background-color: var(--accent-primary-dark);
    }
  }
`;

const NoJournals = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  gap: 1.5rem;
  color: var(--text-secondary);
  text-align: center;
  background-color: var(--bg-secondary);
  border-radius: 15px;
  padding: 2rem;
  
  svg {
    font-size: 4rem;
    color: var(--text-muted);
    opacity: 0.5;
  }
  
  h2 {
    margin: 0;
    color: var(--text-primary);
  }
  
  p {
    margin: 0;
    max-width: 400px;
    line-height: 1.6;
  }
  
  a {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 1rem;
    padding: 0.75rem 1.5rem;
    background-color: var(--accent-primary);
    color: white;
    text-decoration: none;
    border-radius: 30px;
    transition: all 0.3s ease;
    font-weight: 500;
    
    &:hover {
      background-color: var(--accent-primary-dark);
      transform: translateY(-2px);
    }
  }
`;

const JournalList = () => {
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [moodFilter, setMoodFilter] = useState('all');
  
  useEffect(() => {
    fetchJournals();
  }, []);

  const fetchJournals = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await journalApi.getAllJournals();
      setJournals(response.data);
    } catch (error) {
      console.error('Error fetching journals:', error);
      setError('Failed to load journal entries. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const formatMonthYear = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };
  
  const getMonthYear = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${date.getMonth()}`;
  };

  // Filter journals based on search term and mood
  const filteredJournals = journals.filter(journal => {
    const matchesSearch = searchTerm === '' || 
      journal.textEntry.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesMood = moodFilter === 'all' || 
      (journal.textAnalysis && 
       journal.textAnalysis.mood && 
       journal.textAnalysis.mood.toLowerCase() === moodFilter.toLowerCase());
       
    return matchesSearch && matchesMood;
  });
  
  // Group journals by month
  const groupedJournals = filteredJournals.reduce((groups, journal) => {
    const monthYearKey = getMonthYear(journal.date);
    if (!groups[monthYearKey]) {
      groups[monthYearKey] = {
        monthYear: formatMonthYear(journal.date),
        journals: []
      };
    }
    groups[monthYearKey].journals.push(journal);
    return groups;
  }, {});
  
  // Sort months chronologically (newest first)
  const sortedMonths = Object.keys(groupedJournals)
    .sort((a, b) => b.localeCompare(a));

  if (loading) {
    return <Loader>Loading journals...</Loader>;
  }

  if (error) {
    return (
      <ErrorMessage>
        {error}
        <button onClick={fetchJournals}>Try Again</button>
      </ErrorMessage>
    );
  }

  if (journals.length === 0) {
    return (
      <NoJournals>
        <FaCalendarAlt />
        <h2>No Journal Entries Yet</h2>
        <p>Start journaling to track your thoughts and feelings.</p>
        <Link to="/journal"><FaPlus /> Create Your First Journal</Link>
      </NoJournals>
    );
  }

  return (
    <JournalListContainer>
      <Header>
        <h1>Journal History</h1>
        <NewJournalButton to="/journal">
          <FaPlus /> New Entry
        </NewJournalButton>
      </Header>
      
      <FilterBar>
        <SearchBox>
          <FaSearch />
          <input 
            type="text" 
            placeholder="Search journals..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchBox>
        
        <MoodFilter>
          <select 
            value={moodFilter} 
            onChange={(e) => setMoodFilter(e.target.value)}
          >
            <option value="all">All Moods</option>
            <option value="happy">Happy</option>
            <option value="calm">Calm</option>
            <option value="anxious">Anxious</option>
            <option value="sad">Sad</option>
            <option value="angry">Angry</option>
          </select>
        </MoodFilter>
      </FilterBar>
      
      {filteredJournals.length === 0 ? (
        <ErrorMessage>
          No journals match your search/filter criteria.
          <button onClick={() => {
            setSearchTerm('');
            setMoodFilter('all');
          }}>Clear Filters</button>
        </ErrorMessage>
      ) : (
        sortedMonths.map(monthKey => (
          <div key={monthKey}>
            <MonthDivider>
              <h2>{groupedJournals[monthKey].monthYear}</h2>
              <div className="line"></div>
            </MonthDivider>
            
            <JournalGrid>
              {groupedJournals[monthKey].journals.map((journal) => (
                <JournalCard key={journal._id} to={`/journal/${journal._id}`}>
                  <JournalDate>
                    <FaCalendarAlt />
                    {formatDate(journal.date)}
                  </JournalDate>
                  
                  <JournalPreview>
                    <p>{journal.textEntry}</p>
                  </JournalPreview>
                  
                  {journal.textAnalysis && journal.textAnalysis.mood && (
                    <JournalMood className={journal.textAnalysis.mood.toLowerCase()}>
                      {journal.textAnalysis.mood}
                    </JournalMood>
                  )}
                  
                  <JournalFooter>
                    <JournalMedia>
                      {journal.imageMetadata && journal.imageMetadata.length > 0 && (
                        <MediaIndicator>
                          <FaImage />
                          {journal.imageMetadata.length > 1 ? `${journal.imageMetadata.length}` : '1'}
                        </MediaIndicator>
                      )}
                      
                      {journal.audioMetadata && (
                        <MediaIndicator>
                          <FaMicrophone />
                          Audio
                        </MediaIndicator>
                      )}
                      
                      {(journal.textAnalysis || journal.visionAnalysis) && (
                        <AnalysisIndicator>
                          <FaChartLine />
                        </AnalysisIndicator>
                      )}
                    </JournalMedia>
                    
                    <ViewMore>
                      View <FaArrowRight />
                    </ViewMore>
                  </JournalFooter>
                </JournalCard>
              ))}
            </JournalGrid>
          </div>
        ))
      )}
    </JournalListContainer>
  );
};

export default JournalList; 