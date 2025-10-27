import { useState } from 'react';
import type { Assessment } from '../types';

interface AssessmentPreviewProps {
  assessment: Assessment;
  onSubmit?: (response: Record<string, any>) => void;
}

const AssessmentPreview = ({ assessment, onSubmit }: AssessmentPreviewProps) => {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    if (errors[questionId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    assessment.sections.forEach(section => {
      section.questions.forEach(question => {
        if (question.conditional) {
          const dependsOnValue = answers[question.conditional.dependsOn];
          if (question.conditional.operator === 'equals' && dependsOnValue !== question.conditional.value) {
            return; 
          }
        }

        if (question.required) {
          const answer = answers[question.id];
          if (!answer || (Array.isArray(answer) && answer.length === 0) || answer === '') {
            newErrors[question.id] = 'This field is required';
          }
        }
        if (question.type === 'numeric' && answers[question.id] !== undefined && answers[question.id] !== '') {
          const numValue = parseFloat(answers[question.id]);
          if (question.min !== undefined && numValue < question.min) {
            newErrors[question.id] = `Value must be at least ${question.min}`;
          }
          if (question.max !== undefined && numValue > question.max) {
            newErrors[question.id] = `Value must be at most ${question.max}`;
          }
        }
        if ((question.type === 'short-text' || question.type === 'long-text') && answers[question.id]) {
          const textValue = String(answers[question.id]);
          if (question.maxLength && textValue.length > question.maxLength) {
            newErrors[question.id] = `Maximum ${question.maxLength} characters`;
          }
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm() && onSubmit) {
      onSubmit(answers);
    }
  };

  const shouldShowQuestion = (question: any): boolean => {
    if (!question.conditional) return true;
    
    const dependsOnValue = answers[question.conditional.dependsOn];
    if (question.conditional.operator === 'equals') {
      return dependsOnValue === question.conditional.value;
    }
    if (question.conditional.operator === 'not-equals') {
      return dependsOnValue !== question.conditional.value;
    }
    return true;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">{assessment.title}</h2>

      <form onSubmit={handleSubmit} className="space-y-8">
        {assessment.sections.map((section) => (
          <div key={section.id} className="border-b border-gray-200 pb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{section.title}</h3>
            {section.description && (
              <p className="text-gray-600 mb-4">{section.description}</p>
            )}

            <div className="space-y-6">
              {section.questions.filter(shouldShowQuestion).map((question) => (
                <div key={question.id} className="space-y-2">
                  <label className="block">
                    <span className="font-medium text-gray-800">
                      {question.title}
                      {question.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </span>
                    {question.description && (
                      <span className="block text-sm text-gray-500 mt-1">{question.description}</span>
                    )}
                  </label>
                  {question.type === 'short-text' && (
                    <input
                      type="text"
                      value={answers[question.id] || ''}
                      onChange={(e) => handleChange(question.id, e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent ${
                        errors[question.id] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your answer..."
                    />
                  )}
                  {question.type === 'long-text' && (
                    <textarea
                      value={answers[question.id] || ''}
                      onChange={(e) => handleChange(question.id, e.target.value)}
                      rows={4}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent ${
                        errors[question.id] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your answer..."
                    />
                  )}
                  {question.type === 'numeric' && (
                    <input
                      type="number"
                      value={answers[question.id] || ''}
                      onChange={(e) => handleChange(question.id, e.target.value)}
                      min={question.min}
                      max={question.max}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent ${
                        errors[question.id] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter a number..."
                    />
                  )}
                  {question.type === 'single-choice' && (
                    <div className="space-y-2">
                      {question.options?.map((option, idx) => (
                        <label key={idx} className="flex items-center">
                          <input
                            type="radio"
                            name={question.id}
                            value={option}
                            checked={answers[question.id] === option}
                            onChange={(e) => handleChange(question.id, e.target.value)}
                            className="mr-2"
                          />
                          <span className="text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  {question.type === 'multi-choice' && (
                    <div className="space-y-2">
                      {question.options?.map((option, idx) => (
                        <label key={idx} className="flex items-center">
                          <input
                            type="checkbox"
                            value={option}
                            checked={(answers[question.id] || []).includes(option)}
                            onChange={(e) => {
                              const current = answers[question.id] || [];
                              const newValue = e.target.checked
                                ? [...current, option]
                                : current.filter((v: string) => v !== option);
                              handleChange(question.id, newValue);
                            }}
                            className="mr-2"
                          />
                          <span className="text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  {question.type === 'file-upload' && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <input
                        type="file"
                        onChange={(e) => handleChange(question.id, e.target.files?.[0]?.name || '')}
                        className="hidden"
                        id={`file-${question.id}`}
                      />
                      <label
                        htmlFor={`file-${question.id}`}
                        className="cursor-pointer text-gray-600 hover:text-black"
                      >
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="mt-2">Click to upload a file</p>
                        {answers[question.id] && (
                          <p className="text-sm text-gray-600 mt-2">Selected: {answers[question.id]}</p>
                        )}
                      </label>
                    </div>
                  )}

                  {errors[question.id] && (
                    <p className="text-red-500 text-sm">{errors[question.id]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {onSubmit && (
          <button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Submit Assessment
          </button>
        )}
      </form>
    </div>
  );
};

export default AssessmentPreview;

