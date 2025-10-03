import React, { useState } from 'react';
import { GooglePlacesService } from '@/lib/services/googlePlacesService';

const GooglePlacesTest: React.FC = () => {
  const [testResults, setTestResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testBusiness, setTestBusiness] = useState({
    name: 'Perth Mosque',
    address: 'Perth, Western Australia',
    city: 'Perth'
  });

  const runTest = async () => {
    setIsLoading(true);
    try {
      console.log('🧪 [GooglePlacesTest] Testing Google Places API...');
      
      const result = await GooglePlacesService.getBusinessRating(
        testBusiness.name,
        testBusiness.address,
        testBusiness.city
      );
      
      setTestResults(result);
      console.log('🧪 [GooglePlacesTest] Test result:', result);
    } catch (error) {
      console.error('🧪 [GooglePlacesTest] Test failed:', error);
      setTestResults({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Google Places API Test</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Business Name:</label>
        <input
          type="text"
          value={testBusiness.name}
          onChange={(e) => setTestBusiness({...testBusiness, name: e.target.value})}
          className="w-full p-2 border rounded"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Address:</label>
        <input
          type="text"
          value={testBusiness.address}
          onChange={(e) => setTestBusiness({...testBusiness, address: e.target.value})}
          className="w-full p-2 border rounded"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">City:</label>
        <input
          type="text"
          value={testBusiness.city}
          onChange={(e) => setTestBusiness({...testBusiness, city: e.target.value})}
          className="w-full p-2 border rounded"
        />
      </div>
      
      <button
        onClick={runTest}
        disabled={isLoading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {isLoading ? 'Testing...' : 'Test Google Places API'}
      </button>
      
      {testResults && (
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <h3 className="font-bold mb-2">Test Results:</h3>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(testResults, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Note:</strong> Make sure to set your Google Places API key in the environment variables:</p>
        <code className="block mt-2 p-2 bg-gray-200 rounded">
          VITE_GOOGLE_PLACES_API_KEY=your_api_key_here
        </code>
      </div>
    </div>
  );
};

export default GooglePlacesTest;
