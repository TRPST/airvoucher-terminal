import * as React from 'react';
import { useState } from 'react';

export default function TestDStv() {
  const [accountIndex, setAccountIndex] = useState('0');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const testAccounts = [
    { value: '0', label: '0 - Test Account 1 (135520754)' },
    { value: '1', label: '1 - Test Account 2 (135609708)' },
    { value: '2', label: '2 - Test Account 3 (135609673)' },
  ];

  const runTest = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`/api/glocell/dstv/test?accountIndex=${accountIndex}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Test failed');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">DStv Bill Payment Test Suite</h1>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Select Test Account:</label>
        <select
          value={accountIndex}
          onChange={(e) => setAccountIndex(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          {testAccounts.map((account) => (
            <option key={account.value} value={account.value}>
              {account.label}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={runTest}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Running Test...' : 'Run Test'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          
          <div className="bg-gray-50 p-4 rounded-md mb-4">
            <h3 className="font-medium mb-2">
              Test Account: {result.testAccount.accountNumber} ({result.testAccount.description})
            </h3>
          </div>

          {result.accountValidation && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Step 1: Account Validation</h3>
              <div className="bg-white border rounded-md p-4">
                <h4 className="font-medium mb-2">Request:</h4>
                <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
                  {JSON.stringify(result.accountValidation.request, null, 2)}
                </pre>
                
                <h4 className="font-medium mb-2 mt-4">Response:</h4>
                <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
                  {JSON.stringify(result.accountValidation.response, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {result.paymentProcessing && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Step 2: Payment Processing</h3>
              <div className="bg-white border rounded-md p-4">
                <h4 className="font-medium mb-2">Request:</h4>
                <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
                  {JSON.stringify(result.paymentProcessing.request, null, 2)}
                </pre>
                
                <h4 className="font-medium mb-2 mt-4">Response:</h4>
                <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
                  {JSON.stringify(result.paymentProcessing.response, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {result.error && (
            <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded">
              <strong>Error:</strong> {result.error}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 