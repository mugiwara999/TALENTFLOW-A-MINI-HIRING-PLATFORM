import { useNavigate } from "react-router-dom"
import { BriefcaseIcon, UserGroupIcon, AcademicCapIcon } from '@heroicons/react/24/outline'

export default function Navbar() {

  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white p-4 shadow-xl border-b border-gray-700">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-2xl font-bold cursor-pointer hover:text-gray-300 transition-colors" onClick={() => navigate("/")}>
          Talent Flow
        </div>
        <div className="space-x-3">
          <button onClick={() => navigate("/jobs")} className="inline-flex items-center px-5 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105">
            <BriefcaseIcon className="w-4 h-4 mr-2" />
            Jobs
          </button>
          <button onClick={() => navigate("/candidates")} className="inline-flex items-center px-5 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105">
            <UserGroupIcon className="w-4 h-4 mr-2" />
            Candidates
          </button>
          <button onClick={() => navigate("/assessments")} className="inline-flex items-center px-5 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105">
            <AcademicCapIcon className="w-4 h-4 mr-2" />
            Assessments
          </button>
        </div>
      </div>
    </nav>
  )

}
