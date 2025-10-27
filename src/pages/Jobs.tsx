import { useState, useEffect, useMemo, useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import Navbar from '../components/Navbar';
import type { Job, Candidate } from '../types/index';
import { getJobs, getCandidates } from '../utils/storage';
import { jobsApi } from '../services/api';
import { useNavigate } from 'react-router-dom';

const ITEM_TYPE = 'JOB';

interface DragItem {
  id: string;
  index: number;
  type: string;
}

interface DraggableJobCardProps {
  job: Job;
  index: number;
  candidateCount: number;
  onEdit: (job: Job) => void;
  onArchive: (id: string) => void;
  onDelete: (job: Job) => void;
  onMove: (dragIndex: number, hoverIndex: number) => void;
  navigate: (path: string) => void;
}

const DraggableJobCard = ({ job, index, candidateCount, onEdit, onArchive, onDelete, onMove, navigate }: DraggableJobCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const originalIndexRef = useRef<number>(index);
  const hoveredOverRef = useRef<number | null>(null);

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: ITEM_TYPE,
      item: () => {
        originalIndexRef.current = index;
        hoveredOverRef.current = null;
        return { id: job.id, index } as DragItem;
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      end: (_, monitor) => {
        // If drop was successful, monitor.getDropResult() will have the result
        const dropResult = monitor.getDropResult() as { dragIndex: number; hoverIndex: number } | null;
        if (dropResult && dropResult.dragIndex !== dropResult.hoverIndex) {
          onMove(dropResult.dragIndex, dropResult.hoverIndex);
        } else if (hoveredOverRef.current !== null && hoveredOverRef.current !== index) {
          onMove(index, hoveredOverRef.current);
        }
      },
    }),
    [job.id, index, onMove]
  );

  const [, drop] = useDrop(
    () => ({
      accept: ITEM_TYPE,
      hover: (item: DragItem) => {
        // Track which card is being hovered over
        const dragIndex = item.index;
        const hoverIndex = index;
        
        if (dragIndex === hoverIndex) return;
        
        // Store the hovered index so we can use it in the end handler
        hoveredOverRef.current = hoverIndex;
      },
      drop: (item: DragItem) => {
        // Get dragIndex from the item, not from this card's ref
        const dragIndex = item.index;
        const hoverIndex = index;
        
        // Return the result so the end handler can use it
        return { dragIndex, hoverIndex };
      },
    }),
    [index]
  );

  // Attach drag and drop to the same ref
  drag(drop(ref));

  return (
    <div
      ref={ref}
      className={`bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 p-6 border border-gray-200 ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="cursor-grab text-gray-400 hover:text-gray-600 select-none">⋮⋮</div>
            <h3 className="text-2xl font-bold text-gray-900">{job.title}</h3>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                job.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {job.status === 'active' ? 'Active' : 'Archived'}
            </span>
          </div>
          <p className="text-lg text-gray-600 mb-2">{job.company}</p>
          <p className="text-gray-700 mb-3">{job.description}</p>

          {/* Candidates assigned to this job */}
          <div className="mb-3">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <UserGroupIcon className="w-4 h-4" />
              <span className="font-medium">{candidateCount} candidates assigned</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {job.tags.map((tag: string, idx: number) => (
              <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="flex gap-2 ml-4" onMouseDown={(e) => e.stopPropagation()}>
          <button onClick={() => navigate(`/jobs/${job.id}`)} onDragStart={(e) => e.preventDefault()} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            View
          </button>
          <button onClick={() => onEdit(job)} onDragStart={(e) => e.preventDefault()} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
            Edit
          </button>
          <button
            onClick={() => onArchive(job.id)}
            onDragStart={(e) => e.preventDefault()}
            className={`px-4 py-2 rounded-lg transition-colors ${
              job.status === 'archived' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-orange-600 hover:bg-orange-700 text-white'
            }`}
          >
            {job.status === 'archived' ? 'Unarchive' : 'Archive'}
          </button>
          <button
            onClick={() => onDelete(job)}
            onDragStart={(e) => e.preventDefault()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Jobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');

  // Form state
  const [formData, setFormData] = useState<{
    title: string;
    company: string;
    description: string;
    status: 'active' | 'archived';
    tags: string[];
  }>({
    title: '',
    company: '',
    description: '',
    status: 'active',
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const [allJobs, allCandidates] = await Promise.all([
          getJobs(),
          getCandidates()
        ]);
        setJobs(allJobs);
        setCandidates(allCandidates);
      } catch (error) {
        // Handle error silently
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    let filtered = [...jobs];

    // Apply filters
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      filtered = filtered.filter((job) => job.title.toLowerCase().includes(s) || job.company.toLowerCase().includes(s));
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((job) => job.status === statusFilter);
    }

    if (tagFilter !== 'all') {
      filtered = filtered.filter((job) => job.tags.includes(tagFilter));
    }

    setFilteredJobs(filtered);
    setPage(1);
  }, [jobs, searchTerm, statusFilter, tagFilter]);

  // Stable slice for the current page (prevents flicker during DnD)
  const paginatedJobs = useMemo(
    () => filteredJobs.slice((page - 1) * itemsPerPage, page * itemsPerPage),
    [filteredJobs, page]
  );

  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const allTags = useMemo(() => Array.from(new Set(jobs.flatMap((j) => j.tags))), [jobs]);

  // Calculate candidate counts per job
  const candidateCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    candidates.forEach(candidate => {
      counts[candidate.jobId] = (counts[candidate.jobId] || 0) + 1;
    });
    return counts;
  }, [candidates]);

  const handleMoveJob = async (dragIndex: number, hoverIndex: number) => {
    // Map the page-level indices to actual indices in the full jobs array
    const movedJob = paginatedJobs[dragIndex];
    const targetJob = paginatedJobs[hoverIndex];
    if (!movedJob || !targetJob) return;

    const actualSourceIndex = jobs.findIndex((j) => j.id === movedJob.id);
    const actualDestIndex = jobs.findIndex((j) => j.id === targetJob.id);
    if (actualSourceIndex === -1 || actualDestIndex === -1) return;

    // Optimistic update
    const newJobs = [...jobs];
    const [moved] = newJobs.splice(actualSourceIndex, 1);
    
    // Adjust destination index when dragging down (removing an item shifts indices)
    const adjustedDestIndex = dragIndex < hoverIndex ? actualDestIndex - 1 : actualDestIndex;
    newJobs.splice(adjustedDestIndex, 0, moved);
    newJobs.forEach((job, idx) => (job.order = idx));
    setJobs(newJobs);

    // Persist - only one API call per drag operation
    try {
      await jobsApi.reorderJob(movedJob.id, { fromOrder: actualSourceIndex, toOrder: adjustedDestIndex });
    } catch (error) {
      const rollback = await getJobs();
      setJobs(rollback);
      alert('Failed to reorder jobs. Changes rolled back.');
    }
  };

  const handleCreate = () => {
    setEditingJob(null);
    setFormData({ title: '', company: '', description: '', status: 'active', tags: [] });
    setTagInput('');
    setErrors({});
    setShowModal(true);
  };

  const handleEdit = (job: Job) => {
    setEditingJob(job);
    setFormData({ title: job.title, company: job.company, description: job.description, status: job.status, tags: job.tags });
    setTagInput('');
    setErrors({});
    setShowModal(true);
  };

  const handleArchive = async (id: string) => {
    const job = jobs.find((j) => j.id === id);
    if (!job) return;
    const newStatus = job.status === 'archived' ? 'active' : 'archived';
    try {
      await jobsApi.updateJob(id, { status: newStatus });
      const updatedJobs = await getJobs();
      setJobs(updatedJobs);
    } catch (error) {
      alert('Failed to update job. Please try again.');
    }
  };

  const handleDeleteClick = (job: Job) => {
    setJobToDelete(job);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!jobToDelete) return;
    
    try {
      // Note: We don't have a delete endpoint in the API, so we'll archive instead
      await jobsApi.updateJob(jobToDelete.id, { status: 'archived' });
      const updatedJobs = await getJobs();
      setJobs(updatedJobs);
      setShowDeleteModal(false);
      setJobToDelete(null);
    } catch (error) {
      alert('Failed to delete job. Please try again.');
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setJobToDelete(null);
  };

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.company.trim()) newErrors.company = 'Company is required';

    // Unique slug
    const slug = formData.title.toLowerCase().replace(/\s+/g, '-');
    const existingJob = jobs.find((j) => j.slug === slug && j.id !== editingJob?.id);
    if (existingJob) newErrors.title = 'A job with this title already exists';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      if (editingJob) {
        await jobsApi.updateJob(editingJob.id, { ...formData, slug });
      } else {
        await jobsApi.createJob({ ...formData, slug, order: jobs.length });
      }

      const updatedJobs = await getJobs();
      setJobs(updatedJobs);
      setShowModal(false);
      setErrors({});
    } catch (error) {
      alert('Failed to save job. Please try again.');
    }
  };

  const handleAddTag = () => {
    const t = tagInput.trim();
    if (t && !formData.tags.includes(t)) {
      setFormData({ ...formData, tags: [...formData.tags, t] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
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

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800">Jobs</h1>
          <button onClick={handleCreate} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            + Create Job
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title or company..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tag</label>
              <select
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Tags</option>
                {allTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-4 text-gray-600">Showing {paginatedJobs.length} of {filteredJobs.length} jobs</div>

        {/* Jobs List */}
        <DndProvider backend={HTML5Backend}>
          <div className="space-y-4">
            {paginatedJobs.map((job, index) => (
              <DraggableJobCard
                key={job.id}
                job={job}
                index={index}
                candidateCount={candidateCounts[job.id] || 0}
                onEdit={handleEdit}
                onArchive={handleArchive}
                onDelete={handleDeleteClick}
                onMove={handleMoveJob}
                navigate={navigate}
              />
            ))}
          </div>
        </DndProvider>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-4 py-2">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">{editingJob ? 'Edit Job' : 'Create Job'}</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.title ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                    {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.company ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                    {errors.company && <p className="text-red-500 text-sm mt-1">{errors.company}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="active">Active</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                        placeholder="Add a tag..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button onClick={handleAddTag} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, idx) => (
                        <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2">
                          {tag}
                          <button onClick={() => handleRemoveTag(tag)} className="text-blue-800 hover:text-blue-900">
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                    Cancel
                  </button>
                  <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && jobToDelete && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4 text-red-600">Delete Job</h2>
                <p className="text-gray-700 mb-6">
                  Are you sure you want to permanently delete <strong>"{jobToDelete.title}"</strong>? 
                  This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={handleDeleteCancel}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete
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
