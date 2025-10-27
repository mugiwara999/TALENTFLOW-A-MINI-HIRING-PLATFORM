export default function JobCard({name, company, status, tags}: {
    name: string,
    company: string,
    status: string,
    tags: string[]
}) {
    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-200">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{name}</h3>
                    <p className="text-gray-600 text-sm">{company}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    status === 'Active' ? 'bg-green-100 text-green-800' :
                    status === 'Closed' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                }`}>
                    {status}
                </span>
            </div>
            
            <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                        {tag}
                    </span>
                ))}
            </div>
        </div>
    )
}