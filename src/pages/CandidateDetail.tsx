import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import type { DropResult } from 'react-beautiful-dnd';
import Navbar from '../components/Navbar';
import type { Candidate } from '../types/index';
import { STAGES } from '../types/index';
import { getCandidateById } from '../utils/storage';
import { candidatesApi } from '../services/api';

export default function CandidateDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteContent, setNoteContent] = useState('');

  useEffect(() => {
    const loadCandidate = async () => {
      if (id) {
        try {
          const foundCandidate = await getCandidateById(id);
          if (foundCandidate) {
            setCandidate(foundCandidate);
          }
        } catch (error) {
        } finally {
          setLoading(false);
        }
      }
    };
    loadCandidate();
  }, [id]);

  const handleStageChange = async (candidateId: string, newStage: string) => {
    try {
      await candidatesApi.updateCandidate(candidateId, { stage: newStage as any });
      const updated = await getCandidateById(candidateId);
      if (updated) {
        setCandidate(updated);
      }
    } catch (error) {
      alert('Failed to update candidate stage. Please try again.');
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !candidate) return;

    const { draggableId, destination } = result;
    const newStage = destination.droppableId;

    if (draggableId === candidate.id) {
      handleStageChange(candidate.id, newStage);
    }
  };

  const handleAddNote = async () => {
    if (!candidate || !noteContent.trim()) return;

    try {
      const mentions = (noteContent.match(/@(\w+)/g) || []).map(m => m.substring(1));

      const newNote = {
        id: `note-${Date.now()}`,
        content: noteContent,
        author: 'Current User',
        createdAt: new Date().toISOString(),
        mentions,
      };

      const updatedCandidate = {
        ...candidate,
        notes: [...candidate.notes, newNote],
      };

      setCandidate(updatedCandidate);
      setNoteContent('');
      setShowNoteModal(false);
    } catch (error) {
      alert('Failed to add note. Please try again.');
    }
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
        <div className="container mx-auto px-4 py-8 flex justify-center">
          <div className="text-xl">Loading...</div>
        </div>
      </>
    );
  }

  if (!candidate) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Candidate Not Found</h1>
            <button
              onClick={() => navigate('/candidates')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Candidates
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
          onClick={() => navigate('/candidates')}
          className="mb-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
        >
          ← Back to Candidates
        </button>

        <div className="grid grid-cols-1 lg:col-span-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Candidate Profile</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="text-lg font-semibold text-gray-900">{candidate.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-lg text-gray-900">{candidate.email}</p>
                </div>
                {candidate.phone && (
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="text-lg text-gray-900">{candidate.phone}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Current Stage</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    candidate.stage === 'hired' ? 'bg-green-100 text-green-800' :
                    candidate.stage === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {candidate.stage.charAt(0).toUpperCase() + candidate.stage.slice(1)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Applied</p>
                  <p className="text-lg text-gray-900">
                    {new Date(candidate.appliedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Status Timeline</h2>
              <div className="space-y-4">
                {candidate.statusHistory.map((change, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{change.stage}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(change.changedAt).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">by {change.changedBy}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Move Candidate</h2>
                <button
                  onClick={() => setShowNoteModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  + Add Note
                </button>
              </div>

              <DragDropContext onDragEnd={handleDragEnd}>
                <div className="grid grid-cols-3 gap-4">
                  {STAGES.map((stage) => (
                    <Droppable key={stage} droppableId={stage}>
                      {(provided: any, snapshot: any) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`p-4 rounded-lg min-h-[200px] ${
                            snapshot.isDraggingOver ? 'bg-blue-50' : 'bg-gray-50'
                          } ${candidate.stage === stage ? 'ring-2 ring-blue-500' : ''}`}
                        >
                          <h3 className="font-semibold text-gray-800 mb-3">{stage}</h3>
                          {candidate.stage === stage && (
                            <Draggable draggableId={candidate.id} index={0}>
                              {(provided: any, snapshot: any) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`bg-white p-3 rounded-lg shadow-sm mb-2 ${
                                    snapshot.isDragging ? 'shadow-lg' : ''
                                  }`}
                                >
                                  <p className="font-semibold text-sm">{candidate.name}</p>
                                  <p className="text-xs text-gray-600">{candidate.email}</p>
                                </div>
                              )}
                            </Draggable>
                          )}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  ))}
                </div>
              </DragDropContext>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Notes</h2>
              {candidate.notes.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No notes yet. Add one above!</p>
              ) : (
                <div className="space-y-4">
                  {candidate.notes.map((note) => (
                    <div key={note.id} className="border-l-4 border-blue-500 pl-4 py-2">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-gray-900">{note.author}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(note.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{formatNotesWithMentions(note.content)}</p>
                      {note.mentions.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {note.mentions.map((mention, idx) => (
                            <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                              @{mention}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {showNoteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Add Note</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Use @mention to tag team members (e.g., @john @sarah)
                </p>
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  rows={6}
                  placeholder="Write your note here..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                />
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowNoteModal(false);
                      setNoteContent('');
                    }}
                    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddNote}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add Note
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

