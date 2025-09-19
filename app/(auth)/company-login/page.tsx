import CompanyLoginForm from './CompanyLoginForm';

export default function CompanyLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Company Login
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Access your company dashboard
            </p>
          </div>
          
          <CompanyLoginForm />
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have a company account?{' '}
              <a href="/companies" className="text-blue-600 dark:text-blue-400 hover:underline">
                Contact administrator
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
