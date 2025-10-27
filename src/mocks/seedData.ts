import { faker } from '@faker-js/faker';
import { db } from '../utils/database';
import type { Job, Candidate, Assessment, Question, Section } from '../types';

export const generateSeedData = async () => {
  const existingJobs = await db.jobs.count();
  if (existingJobs > 0) {
    return;
  }

  const jobs: Job[] = Array.from({ length: 25 }, (_, i) => ({
    id: faker.string.uuid(),
    title: faker.person.jobTitle(),
    company: faker.company.name(),
    description: faker.lorem.paragraphs(3),
    status: faker.helpers.arrayElement(['active', 'archived']),
    tags: faker.helpers.arrayElements([
      'React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker', 'Kubernetes',
      'PostgreSQL', 'MongoDB', 'Redis', 'GraphQL', 'REST', 'Microservices',
      'Frontend', 'Backend', 'Full Stack', 'DevOps', 'Machine Learning', 'AI'
    ], faker.number.int({ min: 2, max: 5 })),
    slug: faker.helpers.slugify(faker.person.jobTitle()),
    order: i,
    createdAt: faker.date.past({ years: 2 }).toISOString(),
    updatedAt: faker.date.recent({ days: 30 }).toISOString(),
  }));

  await db.jobs.bulkAdd(jobs);

  const candidates: Candidate[] = Array.from({ length: 1000 }, () => {
    const stage = faker.helpers.arrayElement(['applied', 'screen', 'tech', 'offer', 'hired', 'rejected']);
    const appliedAt = faker.date.past({ years: 1 }).toISOString();
    
    return {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      stage,
      jobId: faker.helpers.arrayElement(jobs).id,
      appliedAt,
      notes: Array.from({ length: faker.number.int({ min: 0, max: 3 }) }, () => ({
        id: faker.string.uuid(),
        content: faker.lorem.sentence(),
        author: faker.person.fullName(),
        createdAt: faker.date.between({ from: appliedAt, to: new Date() }).toISOString(),
        mentions: faker.helpers.arrayElements(['@hr', '@tech', '@manager'], faker.number.int({ min: 0, max: 2 })),
      })),
      statusHistory: generateStatusHistory(stage, appliedAt),
    };
  });

  await db.candidates.bulkAdd(candidates);

  const assessments: Assessment[] = Array.from({ length: 3 }, () => {
    const jobId = faker.helpers.arrayElement(jobs).id;
    return {
      id: faker.string.uuid(),
      jobId,
      title: `Technical Assessment for ${jobs.find(j => j.id === jobId)?.title}`,
      sections: generateAssessmentSections(),
      createdAt: faker.date.past({ years: 0.5 }).toISOString(),
      updatedAt: faker.date.recent({ days: 7 }).toISOString(),
    };
  });

  await db.assessments.bulkAdd(assessments);
};

const generateStatusHistory = (currentStage: string, appliedAt: string) => {
  const stages = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];
  const currentIndex = stages.indexOf(currentStage);
  const history = [];
  
  history.push({
    stage: 'applied',
    changedAt: appliedAt,
    changedBy: 'System',
  });
  
  for (let i = 1; i <= currentIndex; i++) {
    history.push({
      stage: stages[i],
      changedAt: faker.date.between({ 
        from: appliedAt, 
        to: new Date() 
      }).toISOString(),
      changedBy: faker.helpers.arrayElement(['HR Team', 'Tech Lead', 'Hiring Manager']),
    });
  }
  
  return history;
};

const generateAssessmentSections = (): Section[] => {
  const sectionTitles = [
    'Technical Knowledge',
    'Problem Solving',
    'System Design',
    'Coding Challenge',
    'Behavioral Questions'
  ];
  
  return sectionTitles.map((title, sectionIndex) => ({
    id: faker.string.uuid(),
    title,
    description: faker.lorem.sentence(),
    order: sectionIndex,
    questions: generateQuestions(2),
  }));
};

const generateQuestions = (count: number): Question[] => {
  const questionTypes = ['single-choice', 'multi-choice', 'short-text', 'long-text', 'numeric'];
  
  return Array.from({ length: count }, (_, i) => {
    const type = faker.helpers.arrayElement(questionTypes);
    const question: Question = {
      id: faker.string.uuid(),
      type: type as any,
      title: faker.lorem.sentence().replace('.', '?'),
      description: faker.lorem.sentence(),
      required: faker.datatype.boolean({ probability: 0.8 }),
      order: i,
    };
    
    if (type === 'single-choice' || type === 'multi-choice') {
      question.options = faker.helpers.arrayElements([
        'Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree',
        'Excellent', 'Good', 'Average', 'Poor', 'Very Poor',
        'Always', 'Often', 'Sometimes', 'Rarely', 'Never'
      ], faker.number.int({ min: 3, max: 5 }));
    }
    
    if (type === 'numeric') {
      question.min = faker.number.int({ min: 0, max: 5 });
      question.max = faker.number.int({ min: 10, max: 100 });
    }
    
    if (type === 'long-text') {
      question.maxLength = faker.number.int({ min: 500, max: 2000 });
    }
    
    return question;
  });
};
