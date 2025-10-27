import { BriefcaseIcon, UserGroupIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

export default function Features() {
  const features = [
    {
      title: "Job Posting",
      description: "Create and manage job postings with ease. Reach the right candidates quickly.",
      icon: BriefcaseIcon
    },
    {
      title: "Candidate Management",
      description: "Track applications, review resumes, and organize your candidate pipeline efficiently.",
      icon: UserGroupIcon
    },
    {
      title: "Assessments",
      description: "Create custom assessments to evaluate candidate skills and fit for your team.",
      icon: AcademicCapIcon
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">Key Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg mr-4">
                    <IconComponent className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{feature.title}</h3>
                </div>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  )
}
