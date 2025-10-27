import { BriefcaseIcon, UserGroupIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

export default function Hero() {
  return (
    <section className="relative flex items-center min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_40%,rgba(79,70,229,0.15),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_60%,rgba(14,165,233,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(99,102,241,0.15),transparent_60%)]"></div>

      <div className="relative z-10 w-full px-4 text-center container mx-auto">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-indigo-300 via-blue-200 to-cyan-200 bg-clip-text text-transparent drop-shadow-lg">
          Streamline Your Hiring Process
        </h1>

        <p className="text-lg md:text-2xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
          Find top talent, manage candidates efficiently, and build smarter assessments — all in one unified platform.
        </p>

        <div className="flex justify-center items-center space-x-8 mt-12">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-3">
              <BriefcaseIcon className="w-8 h-8 text-blue-300" />
            </div>
            <span className="text-sm text-slate-300">Job Management</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mb-3">
              <UserGroupIcon className="w-8 h-8 text-purple-300" />
            </div>
            <span className="text-sm text-slate-300">Candidate Pipeline</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-3">
              <AcademicCapIcon className="w-8 h-8 text-green-300" />
            </div>
            <span className="text-sm text-slate-300">Smart Assessments</span>
          </div>
        </div>

      </div>
    </section>
  );
}
