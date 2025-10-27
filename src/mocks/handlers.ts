import { http, HttpResponse } from 'msw';
import { faker } from '@faker-js/faker';
import { db } from '../utils/database';
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

const delay = (min = 200, max = 1200) => 
  new Promise(resolve => setTimeout(resolve, Math.random() * (max - min) + min));

const shouldError = (errorRate = 0.1) => Math.random() < errorRate;

const createErrorResponse = (message: string, status = 500) => 
  HttpResponse.json({ error: message }, { status });

export const jobsHandlers = [
  http.get('/api/jobs', async ({ request }) => {
    await delay();
    
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    const sort = url.searchParams.get('sort') || 'order';

    try {
      let jobs = await db.jobs.toArray();
      
      if (search) {
        jobs = jobs.filter(job => 
          job.title.toLowerCase().includes(search.toLowerCase()) ||
          job.company.toLowerCase().includes(search.toLowerCase()) ||
          job.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
        );
      }
      
      if (status) {
        jobs = jobs.filter(job => job.status === status);
      }
      
      if (sort === 'order') {
        jobs.sort((a, b) => a.order - b.order);
      } else if (sort === 'title') {
        jobs.sort((a, b) => a.title.localeCompare(b.title));
      } else if (sort === 'createdAt') {
        jobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
      
      const total = jobs.length;
      const startIndex = (page - 1) * pageSize;
      const paginatedJobs = jobs.slice(startIndex, startIndex + pageSize);
      
      const response: JobsResponse = {
        jobs: paginatedJobs,
        total,
        page,
        pageSize
      };
      
      return HttpResponse.json(response);
    } catch (error) {
      return createErrorResponse('Failed to fetch jobs');
    }
  }),

  http.post('/api/jobs', async ({ request }) => {
    await delay();
    
    if (shouldError(0.08)) {
      return createErrorResponse('Failed to create job');
    }
    
    try {
      const jobData = await request.json() as Partial<Job>;
      const newJob: Job = {
        id: faker.string.uuid(),
        title: jobData.title || faker.person.jobTitle(),
        company: jobData.company || faker.company.name(),
        description: jobData.description || faker.lorem.paragraphs(3),
        status: jobData.status || 'active',
        tags: jobData.tags || faker.helpers.arrayElements(['React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker'], 3),
        slug: jobData.slug || faker.helpers.slugify(jobData.title || faker.person.jobTitle()),
        order: jobData.order || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await db.jobs.add(newJob);
      return HttpResponse.json(newJob, { status: 201 });
    } catch (error) {
      return createErrorResponse('Failed to create job');
    }
  }),

  http.patch('/api/jobs/:id', async ({ request, params }) => {
    await delay();
    
    if (shouldError(0.08)) {
      return createErrorResponse('Failed to update job');
    }
    
    try {
      const { id } = params;
      const updates = await request.json() as Partial<Job>;
      
      const existingJob = await db.jobs.get(id as string);
      if (!existingJob) {
        return createErrorResponse('Job not found', 404);
      }
      
      const updatedJob = {
        ...existingJob,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      
      await db.jobs.update(id as string, updatedJob);
      return HttpResponse.json(updatedJob);
    } catch (error) {
      return createErrorResponse('Failed to update job');
    }
  }),

  http.patch('/api/jobs/:id/reorder', async ({ request, params }) => {
    await delay();
    
    if (shouldError(0.15)) {
      return createErrorResponse('Failed to reorder jobs', 500);
    }
    
    try {
      const { id } = params;
      const { fromOrder, toOrder } = await request.json() as ReorderRequest;
      
      const jobs = await db.jobs.orderBy('order').toArray();
      const jobIndex = jobs.findIndex(job => job.id === id);
      
      if (jobIndex === -1) {
        return createErrorResponse('Job not found', 404);
      }
      
      const [movedJob] = jobs.splice(fromOrder, 1);
      jobs.splice(toOrder, 0, movedJob);
      
      const updates = jobs.map((job, index) => ({
        ...job,
        order: index,
        updatedAt: new Date().toISOString(),
      }));
      
      await db.jobs.bulkPut(updates);
      return HttpResponse.json({ success: true });
    } catch (error) {
      return createErrorResponse('Failed to reorder jobs');
    }
  }),
];

export const candidatesHandlers = [
  http.get('/api/candidates', async ({ request }) => {
    await delay();
    
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const stage = url.searchParams.get('stage') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20');

    try {
      let candidates = await db.candidates.toArray();
      
      if (search) {
        candidates = candidates.filter(candidate => 
          candidate.name.toLowerCase().includes(search.toLowerCase()) ||
          candidate.email.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      if (stage) {
        candidates = candidates.filter(candidate => candidate.stage === stage);
      }
      
      const total = candidates.length;
      const startIndex = (page - 1) * pageSize;
      const paginatedCandidates = candidates.slice(startIndex, startIndex + pageSize);
      
      const response: CandidatesResponse = {
        candidates: paginatedCandidates,
        total,
        page,
        pageSize
      };
      
      return HttpResponse.json(response);
    } catch (error) {
      return createErrorResponse('Failed to fetch candidates');
    }
  }),

  http.post('/api/candidates', async ({ request }) => {
    await delay();
    
    if (shouldError(0.08)) {
      return createErrorResponse('Failed to create candidate');
    }
    
    try {
      const candidateData = await request.json() as Partial<Candidate>;
      const newCandidate: Candidate = {
        id: faker.string.uuid(),
        name: candidateData.name || faker.person.fullName(),
        email: candidateData.email || faker.internet.email(),
        phone: candidateData.phone || faker.phone.number(),
        stage: candidateData.stage || 'applied',
        jobId: candidateData.jobId || '',
        appliedAt: new Date().toISOString(),
        notes: [],
        statusHistory: [{
          stage: 'applied',
          changedAt: new Date().toISOString(),
          changedBy: 'System',
        }],
      };
      
      await db.candidates.add(newCandidate);
      return HttpResponse.json(newCandidate, { status: 201 });
    } catch (error) {
      return createErrorResponse('Failed to create candidate');
    }
  }),

  http.patch('/api/candidates/:id', async ({ request, params }) => {
    await delay();
    
    if (shouldError(0.08)) {
      return createErrorResponse('Failed to update candidate');
    }
    
    try {
      const { id } = params;
      const updates = await request.json() as Partial<Candidate>;
      
      const existingCandidate = await db.candidates.get(id as string);
      if (!existingCandidate) {
        return createErrorResponse('Candidate not found', 404);
      }
      
      const updatedCandidate = {
        ...existingCandidate,
        ...updates,
      };
      
      if (updates.stage && updates.stage !== existingCandidate.stage) {
        updatedCandidate.statusHistory = [
          ...updatedCandidate.statusHistory,
          {
            stage: updates.stage,
            changedAt: new Date().toISOString(),
            changedBy: 'Current User',
          },
        ];
      }
      
      await db.candidates.update(id as string, updatedCandidate);
      return HttpResponse.json(updatedCandidate);
    } catch (error) {
      return createErrorResponse('Failed to update candidate');
    }
  }),

  http.get('/api/candidates/:id/timeline', async ({ params }) => {
    await delay();
    
    try {
      const { id } = params;
      const candidate = await db.candidates.get(id as string);
      
      if (!candidate) {
        return createErrorResponse('Candidate not found', 404);
      }
      
      const response: CandidateTimelineResponse = {
        candidateId: id as string,
        timeline: candidate.statusHistory,
      };
      
      return HttpResponse.json(response);
    } catch (error) {
      return createErrorResponse('Failed to fetch candidate timeline');
    }
  }),
];

export const assessmentsHandlers = [
  http.get('/api/assessments/:jobId', async ({ params }) => {
    await delay();
    
    try {
      const { jobId } = params;
      const assessment = await db.assessments.where('jobId').equals(jobId as string).first();
      
      if (!assessment) {
        return createErrorResponse('Assessment not found', 404);
      }
      
      return HttpResponse.json(assessment);
    } catch (error) {
      return createErrorResponse('Failed to fetch assessment');
    }
  }),

  http.put('/api/assessments/:jobId', async ({ request, params }) => {
    await delay();
    
    if (shouldError(0.08)) {
      return createErrorResponse('Failed to update assessment');
    }
    
    try {
      const { jobId } = params;
      const assessmentData = await request.json() as Assessment;
      
      const existingAssessment = await db.assessments.where('jobId').equals(jobId as string).first();
      
      if (existingAssessment) {
        const updatedAssessment = {
          ...assessmentData,
          id: existingAssessment.id,
          jobId: jobId as string,
          updatedAt: new Date().toISOString(),
        };
        await db.assessments.update(existingAssessment.id, updatedAssessment);
        return HttpResponse.json(updatedAssessment);
      } else {
        const newAssessment: Assessment = {
          ...assessmentData,
          id: faker.string.uuid(),
          jobId: jobId as string,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await db.assessments.add(newAssessment);
        return HttpResponse.json(newAssessment, { status: 201 });
      }
    } catch (error) {
      return createErrorResponse('Failed to update assessment');
    }
  }),

  http.post('/api/assessments/:jobId/submit', async ({ request }) => {
    await delay();
    
    if (shouldError(0.08)) {
      return createErrorResponse('Failed to submit assessment');
    }
    
    try {
      const responseData = await request.json() as CandidateResponse;
      
      const response: CandidateResponse = {
        ...responseData,
        submittedAt: new Date().toISOString(),
      };
      
      await db.responses.put(response);
      return HttpResponse.json(response);
    } catch (error) {
      return createErrorResponse('Failed to submit assessment');
    }
  }),
];

export const handlers = [
  ...jobsHandlers,
  ...candidatesHandlers,
  ...assessmentsHandlers,
];
