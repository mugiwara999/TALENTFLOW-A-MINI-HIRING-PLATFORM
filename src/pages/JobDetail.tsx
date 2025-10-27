import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Bars3Icon, EyeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import Navbar from '../components/Navbar';
import type { Job, Candidate } from '../types/index';
import { STAGES } from '../types/index';
import { getJobById, getCandidatesByJob } from '../utils/storage';
import { candidatesApi } from '../services/api';

interface KanbanColumnProps {
  stage: string;
  candidates: Candidate[];
  onMoveCandidate: (candidateId: string, newStage: string) => void;
}

const KanbanColumn = ({ stage, candidates, onMoveCandidate }: KanbanColumnProps) => {
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
        {candidates.map((candidate) => (
          <CandidateCard
            key={candidate.id}
            candidate={candidate}
          />
        ))}
      </div>
    </div>
  );
};

interface CandidateCardProps {
  candidate: Candidate;
}

const CandidateCard = ({ candidate }: CandidateCardProps) => {
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
      className={`bg-white rounded-lg shadow-sm p-3 cursor-move hover:shadow-md transition-shadow ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="font-medium text-gray-900 text-sm">{candidate.name}</div>
          <div className="text-xs text-gray-500 mt-1">{candidate.email}</div>
          <div className="text-xs text-gray-400 mt-1">
            Applied: {new Date(candidate.appliedAt).toLocaleDateString()}
          </div>
        </div>
        <Bars3Icon className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
      </div>
    </div>
  );
};

export default function JobDetail() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  useEffect(() => {
    const loadData = async () => {
      if (jobId) {
        try {
          const [foundJob, jobCandidates] = await Promise.all([
            getJobById(jobId),
            getCandidatesByJob(jobId)
          ]);
          setJob(foundJob || null);
          setCandidates(jobCandidates);
        } catch (error) {
        } finally {
          setLoading(false);
        }
      }
    };
    loadData();
  }, [jobId]);

  const candidatesByStage = useMemo(() => {
    const grouped: { [key: string]: Candidate[] } = {};
    STAGES.forEach((stage: string) => {
      grouped[stage] = candidates.filter(candidate => candidate.stage === stage);
    });
    return grouped;
  }, [candidates]);

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

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex justify-center">
          <div className="text-xl">Loading...</div>
        </div>
      </>
    );
  }

  if (!job) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Job Not Found</h1>
            <button
              onClick={() => navigate('/jobs')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Jobs
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/jobs')}
          className="inline-flex items-center mb-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Jobs
        </button>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{job.title}</h1>
              <h2 className="text-2xl text-gray-600">{job.company}</h2>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
              job.status === 'active' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {job.status === 'active' ? 'Active' : 'Archived'}
            </span>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {job.tags.map((tag: string, idx: number) => (
                <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-semibold">Created:</span> {new Date(job.createdAt).toLocaleDateString()}
              </div>
              <div>
                <span className="font-semibold">Last Updated:</span> {new Date(job.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Candidates ({candidates.length})
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                List View
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewMode === 'kanban'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Kanban View
              </button>
            </div>
          </div>

          {viewMode === 'list' ? (
            <div className="bg-white rounded-lg shadow-lg">
              {candidates.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p className="text-lg">No candidates have applied for this job yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {candidates.map((candidate) => (
                    <div key={candidate.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{candidate.name}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              candidate.stage === 'applied' ? 'bg-blue-100 text-blue-800' :
                              candidate.stage === 'screen' ? 'bg-yellow-100 text-yellow-800' :
                              candidate.stage === 'tech' ? 'bg-purple-100 text-purple-800' :
                              candidate.stage === 'offer' ? 'bg-green-100 text-green-800' :
                              candidate.stage === 'hired' ? 'bg-emerald-100 text-emerald-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {candidate.stage.charAt(0).toUpperCase() + candidate.stage.slice(1)}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-1">{candidate.email}</p>
                          {candidate.phone && (
                            <p className="text-gray-500 text-sm mb-2">{candidate.phone}</p>
                          )}
                          <p className="text-sm text-gray-400">
                            Applied: {new Date(candidate.appliedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => navigate(`/candidates/${candidate.id}`)}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <EyeIcon className="w-4 h-4 mr-2" />
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <DndProvider backend={HTML5Backend}>
              <div className="flex gap-4 overflow-x-auto pb-4">
                {STAGES.map((stage: string) => (
                  <KanbanColumn
                    key={stage}
                    stage={stage}
                    candidates={candidatesByStage[stage] || []}
                    onMoveCandidate={handleMoveCandidate}
                  />
                ))}
              </div>
            </DndProvider>
          )}
        </div>
      </div>
    </>
  );
}

