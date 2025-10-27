import { useState } from 'react';
import type { Assessment, Section, Question } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface AssessmentBuilderProps {
  assessment: Assessment;
  onSave: (assessment: Assessment) => void;
}

const questionTypes: { value: Question['type']; label: string }[] = [
  { value: 'short-text', label: 'Short Text' },
  { value: 'long-text', label: 'Long Text' },
  { value: 'single-choice', label: 'Single Choice' },
  { value: 'multi-choice', label: 'Multiple Choice' },
  { value: 'numeric', label: 'Numeric' },
  { value: 'file-upload', label: 'File Upload' }
];

const AssessmentBuilder = ({ assessment, onSave }: AssessmentBuilderProps) => {
  const [localAssessment, setLocalAssessment] = useState<Assessment>(assessment);

  const handleAddSection = () => {
    const newSection: Section = {
      id: uuidv4(),
      title: `Section ${localAssessment.sections.length + 1}`,
      description: '',
      questions: [],
      order: localAssessment.sections.length
    };
    const updated = {
      ...localAssessment,
      sections: [...localAssessment.sections, newSection]
    };
    setLocalAssessment(updated);
    onSave(updated);
  };

  const handleUpdateSection = (sectionId: string, updates: Partial<Section>) => {
    const updated = {
      ...localAssessment,
      sections: localAssessment.sections.map(s =>
        s.id === sectionId ? { ...s, ...updates } : s
      )
    };
    setLocalAssessment(updated);
    onSave(updated);
  };

  const handleDeleteSection = (sectionId: string) => {
    const updated = {
      ...localAssessment,
      sections: localAssessment.sections.filter(s => s.id !== sectionId)
    };
    setLocalAssessment(updated);
    onSave(updated);
  };

  const handleAddQuestion = (sectionId: string) => {
    const newQuestion: Question = {
      id: uuidv4(),
      type: 'short-text',
      title: 'New Question',
      order: 0,
      required: false
    };
    
    const updated = {
      ...localAssessment,
      sections: localAssessment.sections.map(s =>
        s.id === sectionId
          ? { ...s, questions: [...s.questions, { ...newQuestion, order: s.questions.length }] }
          : s
      )
    };
    setLocalAssessment(updated);
    onSave(updated);
  };

  const handleUpdateQuestion = (sectionId: string, questionId: string, updates: Partial<Question>) => {
    const updated = {
      ...localAssessment,
      sections: localAssessment.sections.map(s =>
        s.id === sectionId
          ? {
              ...s,
              questions: s.questions.map(q =>
                q.id === questionId ? { ...q, ...updates } : q
              )
            }
          : s
      )
    };
    setLocalAssessment(updated);
    onSave(updated);
  };

  const handleDeleteQuestion = (sectionId: string, questionId: string) => {
    const updated = {
      ...localAssessment,
      sections: localAssessment.sections.map(s =>
        s.id === sectionId
          ? { ...s, questions: s.questions.filter(q => q.id !== questionId) }
          : s
      )
    };
    setLocalAssessment(updated);
    onSave(updated);
  };

  const handleAddOption = (sectionId: string, questionId: string) => {
    const section = localAssessment.sections.find(s => s.id === sectionId);
    const question = section?.questions.find(q => q.id === questionId);
    
    const newOption = `Option ${(question?.options?.length || 0) + 1}`;

    handleUpdateQuestion(sectionId, questionId, {
      options: [...(question?.options || []), newOption]
    });
  };

  const handleUpdateOption = (sectionId: string, questionId: string, optionIndex: number, value: string) => {
    const section = localAssessment.sections.find(s => s.id === sectionId);
    const question = section?.questions.find(q => q.id === questionId);
    
    const updatedOptions = [...(question?.options || [])];
    updatedOptions[optionIndex] = value;
    
    handleUpdateQuestion(sectionId, questionId, {
      options: updatedOptions
    });
  };

  const handleDeleteOption = (sectionId: string, questionId: string, optionIndex: number) => {
    const section = localAssessment.sections.find(s => s.id === sectionId);
    const question = section?.questions.find(q => q.id === questionId);
    
    const updatedOptions = question?.options?.filter((_, idx) => idx !== optionIndex) || [];
    
    handleUpdateQuestion(sectionId, questionId, {
      options: updatedOptions
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
      <div>
        <input
          type="text"
          value={localAssessment.title}
          onChange={(e) => {
            const updated = { ...localAssessment, title: e.target.value };
            setLocalAssessment(updated);
            onSave(updated);
          }}
          className="text-2xl font-bold w-full border-none focus:outline-none focus:ring-0"
          placeholder="Assessment Title"
        />
      </div>

      {localAssessment.sections.map((section) => (
        <div key={section.id} className="border border-gray-300 rounded-lg p-4 space-y-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <input
                type="text"
                value={section.title}
                onChange={(e) => handleUpdateSection(section.id, { title: e.target.value })}
                className="text-xl font-semibold w-full border-none focus:outline-none focus:ring-0"
                placeholder="Section Title"
              />
              <input
                type="text"
                value={section.description || ''}
                onChange={(e) => handleUpdateSection(section.id, { description: e.target.value })}
                className="text-gray-600 w-full mt-1 border-none focus:outline-none focus:ring-0"
                placeholder="Section description"
              />
            </div>
            <button
              onClick={() => handleDeleteSection(section.id)}
              className="text-red-600 hover:text-red-800 ml-4"
            >
              Delete Section
            </button>
          </div>

          {section.questions.map((question) => (
            <div key={question.id} className="bg-gray-50 p-4 rounded space-y-3">
              <div className="flex justify-between items-start">
                <input
                  type="text"
                  value={question.title}
                  onChange={(e) => handleUpdateQuestion(section.id, question.id, { title: e.target.value })}
                  className="flex-1 font-medium border-none bg-transparent focus:outline-none focus:ring-0"
                  placeholder="Question"
                />
                <button
                  onClick={() => handleDeleteQuestion(section.id, question.id)}
                  className="text-red-600 hover:text-red-800 text-sm ml-4"
                >
                  Delete
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Type</label>
                  <select
                    value={question.type}
                    onChange={(e) => handleUpdateQuestion(section.id, question.id, { type: e.target.value as Question['type'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  >
                    {questionTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="flex items-center text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={question.required || false}
                      onChange={(e) => handleUpdateQuestion(section.id, question.id, { required: e.target.checked })}
                      className="mr-2"
                    />
                    Required
                  </label>
                </div>
              </div>

              {question.description && (
                <input
                  type="text"
                  value={question.description}
                  onChange={(e) => handleUpdateQuestion(section.id, question.id, { description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  placeholder="Help text (optional)"
                />
              )}

              {question.type === 'numeric' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Min</label>
                    <input
                      type="number"
                      value={question.min || ''}
                      onChange={(e) => handleUpdateQuestion(section.id, question.id, { min: parseInt(e.target.value) || undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Max</label>
                    <input
                      type="number"
                      value={question.max || ''}
                      onChange={(e) => handleUpdateQuestion(section.id, question.id, { max: parseInt(e.target.value) || undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    />
                  </div>
                </div>
              )}

              {(question.type === 'single-choice' || question.type === 'multi-choice') && (
                <div className="space-y-2">
                  <label className="block text-sm text-gray-600">Options</label>
                  {question.options?.map((option, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleUpdateOption(section.id, question.id, idx, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                        placeholder="Option label"
                      />
                      <button
                        onClick={() => handleDeleteOption(section.id, question.id, idx)}
                        className="text-red-600 hover:text-red-800 text-sm px-2"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => handleAddOption(section.id, question.id)}
                    className="text-sm text-black hover:underline"
                  >
                    + Add Option
                  </button>
                </div>
              )}
            </div>
          ))}

          <button
            onClick={() => handleAddQuestion(section.id)}
            className="w-full py-2 border-2 border-dashed border-gray-300 rounded text-gray-600 hover:border-black hover:text-black transition-colors"
          >
            + Add Question
          </button>
        </div>
      ))}

      <button
        onClick={handleAddSection}
        className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
      >
        + Add Section
      </button>
    </div>
  );
};

export default AssessmentBuilder;

