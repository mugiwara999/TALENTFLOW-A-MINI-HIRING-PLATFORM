import Dexie, { type Table } from 'dexie';
import type { Job, Candidate, Assessment, CandidateResponse, Note, StatusChange } from '../types';

export interface DatabaseJob extends Job {
  id: string;
  title: string;
  company: string;
  description: string;
  status: 'active' | 'archived';
  tags: string[];
  slug: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseCandidate extends Candidate {
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

export interface DatabaseAssessment extends Assessment {
  id: string;
  jobId: string;
  title: string;
  sections: any[];
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseResponse extends CandidateResponse {
  candidateId: string;
  assessmentId: string;
  responses: any[];
  submittedAt?: string;
}

export class TalentFlowDatabase extends Dexie {
  jobs!: Table<DatabaseJob>;
  candidates!: Table<DatabaseCandidate>;
  assessments!: Table<DatabaseAssessment>;
  responses!: Table<DatabaseResponse>;

  constructor() {
    super('TalentFlowDatabase');
    
    this.version(1).stores({
      jobs: 'id, title, status, order, createdAt, updatedAt',
      candidates: 'id, name, email, stage, jobId, appliedAt',
      assessments: 'id, jobId, title, createdAt, updatedAt',
      responses: 'candidateId, assessmentId, submittedAt'
    });
  }
}

export const db = new TalentFlowDatabase();
