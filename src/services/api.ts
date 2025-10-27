import type { 
  Job, 
  Candidate, 
  Assessment, 
  CandidateResponse,
  JobsResponse,
  CandidatesResponse,
  CandidateTimelineResponse,
  ReorderRequest
} from '../types';

const API_BASE_URL = '/api';

class ApiError extends Error {
  public status: number;
  
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(response.status, errorData.error || 'An error occurred');
  }
  return response.json();
};

export const jobsApi = {
  async getJobs(params: {
    search?: string;
    status?: string;
    page?: number;
    pageSize?: number;
    sort?: string;
  } = {}): Promise<JobsResponse> {
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.set('search', params.search);
    if (params.status) searchParams.set('status', params.status);
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.pageSize) searchParams.set('pageSize', params.pageSize.toString());
    if (params.sort) searchParams.set('sort', params.sort);

    const response = await fetch(`${API_BASE_URL}/jobs?${searchParams}`);
    return handleResponse(response);
  },

  async createJob(job: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>): Promise<Job> {
    const response = await fetch(`${API_BASE_URL}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(job),
    });
    return handleResponse(response);
  },

  async updateJob(id: string, updates: Partial<Job>): Promise<Job> {
    const response = await fetch(`${API_BASE_URL}/jobs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return handleResponse(response);
  },

  async reorderJob(id: string, reorderData: ReorderRequest): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/jobs/${id}/reorder`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reorderData),
    });
    await handleResponse(response);
  },
};

export const candidatesApi = {
  async getCandidates(params: {
    search?: string;
    stage?: string;
    page?: number;
    pageSize?: number;
  } = {}): Promise<CandidatesResponse> {
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.set('search', params.search);
    if (params.stage) searchParams.set('stage', params.stage);
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.pageSize) searchParams.set('pageSize', params.pageSize.toString());

    const response = await fetch(`${API_BASE_URL}/candidates?${searchParams}`);
    return handleResponse(response);
  },

  async createCandidate(candidate: Omit<Candidate, 'id' | 'appliedAt' | 'notes' | 'statusHistory'>): Promise<Candidate> {
    const response = await fetch(`${API_BASE_URL}/candidates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(candidate),
    });
    return handleResponse(response);
  },

  async updateCandidate(id: string, updates: Partial<Candidate>): Promise<Candidate> {
    const response = await fetch(`${API_BASE_URL}/candidates/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return handleResponse(response);
  },

  async getCandidateTimeline(id: string): Promise<CandidateTimelineResponse> {
    const response = await fetch(`${API_BASE_URL}/candidates/${id}/timeline`);
    return handleResponse(response);
  },
};

export const assessmentsApi = {
  async getAssessment(jobId: string): Promise<Assessment> {
    const response = await fetch(`${API_BASE_URL}/assessments/${jobId}`);
    return handleResponse(response);
  },

  async updateAssessment(jobId: string, assessment: Assessment): Promise<Assessment> {
    const response = await fetch(`${API_BASE_URL}/assessments/${jobId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assessment),
    });
    return handleResponse(response);
  },

  async submitAssessment(jobId: string, response: CandidateResponse): Promise<CandidateResponse> {
    const apiResponse = await fetch(`${API_BASE_URL}/assessments/${jobId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(response),
    });
    return handleResponse(apiResponse);
  },
};

export { ApiError };
