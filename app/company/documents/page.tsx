export default function CompanyDocumentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Documents</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your company documents
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
        <div className="text-6xl mb-4">📄</div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Document Management
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Upload and organize your company documents here.
        </p>
      </div>
    </div>
  );
}
