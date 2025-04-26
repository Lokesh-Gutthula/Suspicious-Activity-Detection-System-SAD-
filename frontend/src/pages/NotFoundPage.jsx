import React from 'react';
import { Link } from 'react-router-dom';
import { AlertOctagon } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <AlertOctagon className="h-20 w-20 text-red-500 dark:text-red-400 mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Page Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Button
          as={Link}
          to="/dashboard"
          variant="primary"
          fullWidth
        >
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
