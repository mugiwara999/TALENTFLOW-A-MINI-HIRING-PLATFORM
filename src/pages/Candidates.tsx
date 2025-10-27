import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Bars3Icon } from '@heroicons/react/24/outline';
import Navbar from '../components/Navbar';
import type { Candidate, Job } from '../types/index';
import { STAGES } from '../types/index';
import { getCandidates, getJobs } from '../utils/storage';
import { candidatesApi } from '../services/api';
import { useNavigate } from 'react-router-dom';

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-red-800 font-semibold">Something went wrong</h3>
          <p className="text-red-600 text-sm mt-1">
            {this.state.error?.message || 'An unknown error occurred'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="mt-2 px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

interface KanbanColumnProps {
  stage: string;
  candidates: Candidate[];
  jobs: Job[];
  onMoveCandidate: (candidateId: string, newStage: string) => void;
  onSelectCandidate: (candidate: Candidate) => void;
}

const KanbanColumn = ({ stage, candidates, jobs, onMoveCandidate, onSelectCandidate }: KanbanColumnProps) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'CANDIDATE',
    drop: (item: { id: string; currentStage: string }) => {
      if (item.currentStage !== stage) {
        onMoveCandidate(item.id, stage);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  }), [stage, onMoveCandidate]);

  return (
    <div
      ref={drop}
      className={`flex-1 bg-gray-50 rounded-lg p-4 min-h-[400px] ${
        isOver ? 'bg-blue-50 border-2 border-blue-300' : ''
      }`}
    >
      <h3 className="font-semibold text-gray-700 mb-4 text-center">
        {stage} ({candidates.length})
      </h3>
      <div className="space-y-3">
        {candidates.map((candidate) => {
          const job = jobs.find(j => j.id === candidate.jobId);
          return (
            <ErrorBoundary key={candidate.id}>
              <CandidateCard
                candidate={candidate}
                job={job}
                onSelect={onSelectCandidate}
              />
            </ErrorBoundary>
          );
        })}
      </div>
    </div>
  );
};

interface CandidateCardProps {
  candidate: Candidate;
  job: Job | undefined;
  onSelect: (candidate: Candidate) => void;
}

const CandidateCard = ({ candidate, job, onSelect }: CandidateCardProps) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'CANDIDATE',
    item: { id: candidate.id, currentStage: candidate.stage },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }), [candidate.id, candidate.stage]);

  return (
    <div
      ref={drag}
      onClick={() => onSelect(candidate)}
      className={`bg-white rounded-lg shadow-sm p-3 cursor-move hover:shadow-md transition-shadow ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="font-medium text-gray-900 text-sm">{candidate.name}</div>
          <div className="text-xs text-gray-500 mt-1">{candidate.email}</div>
          {job && (
            <div className="text-xs text-blue-600 mt-1 truncate">{job.title}</div>
          )}
          <div className="text-xs text-gray-400 mt-1">
            Applied: {new Date(candidate.appliedAt).toLocaleDateString()}
          </div>
        </div>
        <Bars3Icon className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
      </div>
    </div>
  );
};


export default function Candidates() {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJobId, setSelectedJobId] = useState<string>('all');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [candidatesData, jobsData] = await Promise.all([
          getCandidates(),
          getJobs()
        ]);
        setCandidates(candidatesData);
        setJobs(jobsData);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredCandidates = useMemo(() => {
    let filtered = [...candidates];

    if (searchTerm) {
      filtered = filtered.filter(candidate =>
        candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedJobId !== 'all') {
      filtered = filtered.filter(candidate => candidate.jobId === selectedJobId);
    }

    return filtered;
  }, [candidates, searchTerm, selectedJobId]);

  const candidatesByStage = useMemo(() => {
    const grouped: Record<string, Candidate[]> = {};
    STAGES.forEach((stage: string) => {
      grouped[stage] = [];
    });

    filteredCandidates.forEach(candidate => {
      if (grouped[candidate.stage]) {
        grouped[candidate.stage].push(candidate);
      }
    });

    return grouped;
  }, [filteredCandidates]);

  const handleMoveCandidate = useCallback(async (candidateId: string, newStage: string) => {
    const candidate = candidates.find(c => c.id === candidateId);
    if (!candidate) return;

    try {
      await candidatesApi.updateCandidate(candidateId, { stage: newStage as any });
      
      setCandidates(prev => 
        prev.map(c => c.id === candidateId ? { ...c, stage: newStage as any } : c)
      );
    } catch (error) {
      alert('Failed to update candidate stage. Please try again.');
    }
  }, [candidates]);

  const handleSelectCandidate = (candidate: Candidate) => {
    navigate(`/candidates/${candidate.id}`);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
          <div className="text-xl text-gray-600">Loading candidates...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Candidates</h1>
              <p className="text-gray-600">Manage and track candidate applications</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search by Name or Email
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search candidates..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Job
                </label>
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Jobs</option>
                  {jobs.map(job => (
                    <option key={job.id} value={job.id}>{job.title}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mb-4 text-gray-600">
            Showing {filteredCandidates.length} of {candidates.length} candidates
          </div>

          <DndProvider backend={HTML5Backend}>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {STAGES.map((stage: string) => (
                <KanbanColumn
                  key={stage}
                  stage={stage}
                  candidates={candidatesByStage[stage] || []}
                  jobs={jobs}
                  onMoveCandidate={handleMoveCandidate}
                  onSelectCandidate={handleSelectCandidate}
                />
              ))}
            </div>
          </DndProvider>
        </div>
      </div>
    </>
  );
}