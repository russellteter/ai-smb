'use client';

import { useState } from 'react';

interface SearchJob {
  job_id: string;
  dsl: any;
  status: string;
}

interface Lead {
  rank: number;
  score: number;
  name: string;
  city: string;
  state: string;
  website: string | null;
  phone: string;
  signals: Record<string, boolean>;
  owner: string;
  review_count: number;
}

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [searchJob, setSearchJob] = useState<SearchJob | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    setError('');
    setLeads([]);
    
    try {
      // First, parse the prompt
      const parseResponse = await fetch('/api/parse_prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      
      if (!parseResponse.ok) {
        throw new Error('Failed to parse prompt');
      }
      
      const parseResult = await parseResponse.json();
      
      // Then start a search job
      const searchResponse = await fetch('/api/search_jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dsl: parseResult.dsl })
      });
      
      if (!searchResponse.ok) {
        throw new Error('Failed to start search job');
      }
      
      const searchResult: SearchJob = await searchResponse.json();
      setSearchJob(searchResult);
      
      // Start listening to the stream
      const eventSource = new EventSource(`/api/search_jobs/${searchResult.job_id}/stream`);
      
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('Stream event:', data);
        
        if (data.type === 'lead:add' && data.business) {
          // Add lead to the list
          const newLead: Lead = {
            rank: leads.length + 1,
            score: Math.floor(Math.random() * 100), // Mock score for now
            name: data.business.name,
            city: data.business.formatted_address?.split(',')[1]?.trim() || 'Unknown',
            state: data.business.formatted_address?.split(',')[2]?.trim().split(' ')[0] || 'Unknown',
            website: data.business.website || null,
            phone: data.business.formatted_phone_number || '',
            signals: {
              no_website: !data.business.website,
              has_chatbot: false, // Mock for now
              has_online_booking: false, // Mock for now
              owner_identified: false // Mock for now
            },
            owner: 'Unknown',
            review_count: 0
          };
          
          setLeads(prev => [...prev, newLead]);
        }
        
        if (data.type === 'job:complete') {
          eventSource.close();
          setLoading(false);
        }
      };
      
      eventSource.onerror = () => {
        eventSource.close();
        setLoading(false);
        setError('Stream connection failed');
      };
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  const testHealth = async () => {
    try {
      const response = await fetch('/health');
      const result = await response.json();
      alert(`Health check: ${JSON.stringify(result, null, 2)}`);
    } catch (err) {
      alert(`Health check failed: ${err}`);
    }
  };

  return (
    <div className="container">
      <h1 style={{ marginBottom: '2rem', textAlign: 'center' }}>
        Mothership Leads - SMB Lead Finder
      </h1>
      
      <div className="card">
        <h2>Test API Connection</h2>
        <button className="button" onClick={testHealth}>
          Test Health Endpoint
        </button>
      </div>
      
      <div className="card">
        <h2>Search for Leads</h2>
        <textarea 
          className="input"
          placeholder="Enter your search prompt (e.g., 'dentists in Columbia, SC with no chat widget')"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          style={{ height: 'auto', minHeight: '80px' }}
        />
        <button 
          className="button" 
          onClick={handleSearch}
          disabled={loading || !prompt.trim()}
        >
          {loading ? 'Searching...' : 'Search Leads'}
        </button>
        
        {error && (
          <div style={{ color: 'red', marginTop: '1rem' }}>
            Error: {error}
          </div>
        )}
        
        {searchJob && (
          <div style={{ marginTop: '1rem', padding: '1rem', background: '#f0f0f0', borderRadius: '4px' }}>
            <h3>Search Job Created</h3>
            <p><strong>Job ID:</strong> {searchJob.job_id}</p>
            <p><strong>Status:</strong> {searchJob.status}</p>
            <p><strong>DSL:</strong> {JSON.stringify(searchJob.dsl, null, 2)}</p>
          </div>
        )}
      </div>
      
      {leads.length > 0 && (
        <div className="card">
          <h2>Leads Found ({leads.length})</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ccc' }}>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Rank</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Score</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Name</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Location</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Website</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Phone</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '0.5rem' }}>{lead.rank}</td>
                    <td style={{ padding: '0.5rem' }}>{lead.score}</td>
                    <td style={{ padding: '0.5rem' }}>{lead.name}</td>
                    <td style={{ padding: '0.5rem' }}>{lead.city}, {lead.state}</td>
                    <td style={{ padding: '0.5rem' }}>
                      {lead.website ? (
                        <a href={lead.website} target="_blank" rel="noopener noreferrer">
                          {lead.website}
                        </a>
                      ) : 'No website'}
                    </td>
                    <td style={{ padding: '0.5rem' }}>{lead.phone || 'No phone'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}