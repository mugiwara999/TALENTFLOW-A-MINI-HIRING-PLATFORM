export interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  status: 'active' | 'archived';
  candidates?: Candidate[];
  tags: string[];
  slug: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  stage: 'applied' | 'screen' | 'tech' | 'offer' | 'hired' | 'rejected';
  jobId: string;
  appliedAt: string;
  notes: Note[];
  statusHistory: StatusChange[];
}

export interface Note {
  id: string;
  content: string;
  author: string;
  createdAt: string;
  mentions: string[];
}

export interface StatusChange {
  stage: string;
  changedAt: string;
  changedBy: string;
}

export interface Assessment {
  id: string;
  jobId: string;
  title: string;
  sections: Section[];
  createdAt: string;
  updatedAt: string;
}

export interface Section {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  order: number;
}

export interface Question {
  id: string;
  type: 'single-choice' | 'multi-choice' | 'short-text' | 'long-text' | 'numeric' | 'file-upload';
  title: string;
  description?: string;
  required: boolean;
  order: number;
  options?: string[];
  min?: number;
  max?: number;
  maxLength?: number;
  conditional?: ConditionalLogic;
}

export interface ConditionalLogic {
  dependsOn: string;
  operator: 'equals' | 'not-equals' | 'contains' | 'greater-than' | 'less-than';
  value: string | number;
}

export interface CandidateResponse {
  candidateId: string;
  assessmentId: string;
  responses: {
    questionId: string;
    answer: string | string[] | number | File;
  }[];
  submittedAt?: string;
}

export const STAGES = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];

export interface JobsResponse {
  jobs: Job[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CandidatesResponse {
  candidates: Candidate[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CandidateTimelineResponse {
  candidateId: string;
  timeline: StatusChange[];
}

export interface ReorderRequest {
  fromOrder: number;
  toOrder: number;
}

