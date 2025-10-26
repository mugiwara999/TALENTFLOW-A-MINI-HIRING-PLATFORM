import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ExclamationTriangleIcon, 
  ArrowLeftIcon, 
  PhoneIcon, 
  CalendarIcon, 
  PencilIcon, 
  PlusIcon, 
  XMarkIcon 
} from '@heroicons/react/24/outline';
import Navbar from '../components/Navbar';
import type { Candidate } from '../types';
import { getCandidateById, addNoteToCandidate } from '../utils/storage';

export default function CandidateDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteContent, setNoteContent] = useState('');

  useEffect(() => {
    if (id) {
      const foundCandidate = getCandidateById(id);
      if (foundCandidate) {
        setCandidate(foundCandidate);
      }
      setLoading(false);
    }
  }, [id]);


  const handleAddNote = () => {
    if (!candidate || !noteContent.trim()) return;

    // Extract mentions using @pattern
    const mentions = (noteContent.match(/@(\w+)/g) || []).map(m => m.substring(1));

    addNoteToCandidate(candidate.id, {
      content: noteContent,
      author: 'Current User',
      mentions,
    });

    const updated = getCandidateById(candidate.id);
    if (updated) {
      setCandidate(updated);
    }

    setNoteContent('');
    setShowNoteModal(false);
  };

  const formatNotesWithMentions = (content: string) => {
    const parts = content.split(/(@\w+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        return (
          <span key={index} className="bg-blue-100 text-blue-800 px-1 rounded">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">Loading candidate details...</p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!candidate) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <ExclamationTriangleIcon className="w-12 h-12 text-gray-400" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Candidate Not Found</h1>
              <p className="text-gray-600 mb-6">The candidate you're looking for doesn't exist or has been removed.</p>
              <button
                onClick={() => navigate('/candidates')}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Candidates
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate('/candidates')}
              className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Candidates
            </button>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                candidate.currentStage === 'Hired' ? 'bg-green-100 text-green-800' :
                candidate.currentStage === 'Rejected' ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {candidate.currentStage}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Candidate Profile Card */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Profile Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 text-white">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                      {candidate.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold">{candidate.name}</h1>
                      <p className="text-blue-100">{candidate.email}</p>
                    </div>
                  </div>
                </div>

                {/* Profile Details */}
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <PhoneIcon className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium text-gray-900">{candidate.phone || 'Not provided'}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <CalendarIcon className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Applied</p>
                        <p className="font-medium text-gray-900">
                          {new Date(candidate.appliedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Timeline</h3>
                <div className="space-y-4">
                  {candidate.statusHistory.map((change, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className={`w-3 h-3 rounded-full mt-1 ${
                          index === 0 ? 'bg-green-500' : 'bg-gray-300'
                        }`}></div>
                        {index < candidate.statusHistory.length - 1 && (
                          <div className="w-px h-8 bg-gray-200 ml-1.5 mt-1"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">{change.stage}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(change.changedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        <p className="text-xs text-gray-400">by {change.changedBy}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                {/* Notes Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Notes</h2>
                      <p className="text-sm text-gray-500 mt-1">
                        {candidate.notes.length} {candidate.notes.length === 1 ? 'note' : 'notes'}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowNoteModal(true)}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Add Note
                    </button>
                  </div>
                </div>

                {/* Notes Content */}
                <div className="p-6">
                  {candidate.notes.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <PencilIcon className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No notes yet</h3>
                      <p className="text-gray-500 mb-4">Start the conversation by adding your first note.</p>
                      <button
                        onClick={() => setShowNoteModal(true)}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Add First Note
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {candidate.notes.map((note) => (
                        <div key={note.id} className="group">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-blue-600">
                                  {note.author.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="font-medium text-gray-900">{note.author}</span>
                                <span className="text-sm text-gray-500">•</span>
                                <span className="text-sm text-gray-500">
                                  {new Date(note.createdAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                              <div className="prose prose-sm max-w-none">
                                <p className="text-gray-700 leading-relaxed">{formatNotesWithMentions(note.content)}</p>
                              </div>
                              {note.mentions.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {note.mentions.map((mention, idx) => (
                                    <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      @{mention}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Note Modal */}
        {showNoteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Add Note</h2>
                  <button
                    onClick={() => {
                      setShowNoteModal(false);
                      setNoteContent('');
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Use @mention to tag team members (e.g., @john @sarah)
                </p>
              </div>
              
              <div className="p-6">
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  rows={6}
                  placeholder="Write your note here..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-500">
                    {noteContent.length} characters
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowNoteModal(false);
                        setNoteContent('');
                      }}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddNote}
                      disabled={!noteContent.trim()}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Add Note
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

