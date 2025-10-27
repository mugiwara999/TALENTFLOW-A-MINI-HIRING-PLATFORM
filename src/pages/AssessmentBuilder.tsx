import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import AssessmentBuilderComponent from '../components/AssessmentBuilder';
import AssessmentPreview from '../components/AssessmentPreview';
import type { Assessment, Job } from '../types/index';
import { getJobs, getAssessmentById } from '../utils/storage';
import { assessmentsApi } from '../services/api';
import { v4 as uuidv4 } from 'uuid';

export default function AssessmentBuilder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState<string>('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const jobsData = await getJobs();
        setJobs(jobsData);
        
        if (id) {
          const existingAssessment = await getAssessmentById(id);
          if (existingAssessment) {
            setAssessment(existingAssessment);
            setSelectedJobId(existingAssessment.jobId);
          } else {
            navigate('/assessments');
          }
        } else {
          const newAssessment: Assessment = {
            id: uuidv4(),
            jobId: '',
            title: '',
            sections: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setAssessment(newAssessment);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, navigate]);

  const handleSave = async (updatedAssessment: Assessment) => {
    if (!updatedAssessment.jobId || !updatedAssessment.title.trim()) {
      return;
    }

    try {
      if (id) {
        await assessmentsApi.updateAssessment(updatedAssessment.jobId, updatedAssessment);
      } else {
        await assessmentsApi.updateAssessment(updatedAssessment.jobId, updatedAssessment);
      }
    } catch (error) {
      alert('Failed to save assessment. Please try again.');
    }
  };

  const handleBack = () => {
    navigate('/assessments');
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

  if (!assessment) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Assessment Not Found</h1>
            <button
              onClick={() => navigate('/assessments')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Assessments
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Assessments
            </button>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-100 rounded-lg p-3">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {id ? 'Edit Assessment' : 'Create New Assessment'}
                </h1>
                <p className="text-gray-600 mt-1">Build your assessment form with live preview</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Select Job Position
              </label>
              <select
                value={selectedJobId}
                onChange={(e) => {
                  setSelectedJobId(e.target.value);
                  handleSave({ ...assessment, jobId: e.target.value });
                }}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Select a job position...</option>
                {jobs.map(job => (
                  <option key={job.id} value={job.id}>{job.title}</option>
                ))}
              </select>
              {!selectedJobId && (
                <p className="text-sm text-amber-600 mt-2 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Please select a job to save your assessment
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Assessment Builder
                </h2>
              </div>
              <div className="p-6 max-h-[calc(100vh-300px)] overflow-y-auto">
                <AssessmentBuilderComponent
                  assessment={{ ...assessment, jobId: selectedJobId }}
                  onSave={(updated) => {
                    setAssessment(updated);
                    handleSave(updated);
                  }}
                />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Live Preview
                </h2>
              </div>
              <div className="p-6 max-h-[calc(100vh-300px)] overflow-y-auto">
                <AssessmentPreview assessment={{ ...assessment, jobId: selectedJobId }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

