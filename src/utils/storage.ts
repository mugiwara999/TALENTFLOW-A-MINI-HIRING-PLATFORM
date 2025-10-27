import { db } from './database';
import { generateSeedData } from '../mocks/seedData';
import type { Job, Candidate, Assessment, CandidateResponse } from '../types';

export const initializeStorage = async () => {
  try {
    await generateSeedData();
  } catch (error) {
  }
};

export const getJobs = async (): Promise<Job[]> => {
  const jobs = await db.jobs.orderBy('order').toArray();
  return jobs;
};

export const getJobById = async (id: string): Promise<Job | undefined> => {
  return await db.jobs.get(id);
};

export const getJobBySlug = async (slug: string): Promise<Job | undefined> => {
  return await db.jobs.where('slug').equals(slug).first();
};

export const getCandidates = async (): Promise<Candidate[]> => {
  return await db.candidates.toArray();
};

export const getCandidateById = async (id: string): Promise<Candidate | undefined> => {
  return await db.candidates.get(id);
};

export const getCandidatesByJob = async (jobId: string): Promise<Candidate[]> => {
  return await db.candidates.where('jobId').equals(jobId).toArray();
};

export const getAssessments = async (): Promise<Assessment[]> => {
  return await db.assessments.toArray();
};

export const getAssessmentById = async (id: string): Promise<Assessment | undefined> => {
  return await db.assessments.get(id);
};

export const getAssessmentByJob = async (jobId: string): Promise<Assessment | undefined> => {
  return await db.assessments.where('jobId').equals(jobId).first();
};

export const getResponses = async (): Promise<CandidateResponse[]> => {
  return await db.responses.toArray();
};

export const getResponseByCandidateAndAssessment = async (candidateId: string, assessmentId: string): Promise<CandidateResponse | undefined> => {
  return await db.responses.where('[candidateId+assessmentId]').equals([candidateId, assessmentId]).first();
};

