'use client';

import { useState } from 'react';
import { FileText, Upload, CheckCircle, AlertCircle, Settings } from 'lucide-react';

export default function Home() {
  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [templateDocId, setTemplateDocId] = useState('');
  const [folderId, setFolderId] = useState('');
  const [credentials, setCredentials] = useState<File | null>(null);
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const handleCredentialsUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCredentials(e.target.files[0]);
    }
  };

  const handleGenerate = async () => {
    if (!spreadsheetId || !templateDocId || !folderId || !credentials) {
      setStatus('Please fill in all fields and upload credentials');
      return;
    }

    setLoading(true);
    setStatus('Processing...');
    setResults([]);

    try {
      const formData = new FormData();
      formData.append('spreadsheetId', spreadsheetId);
      formData.append('templateDocId', templateDocId);
      formData.append('folderId', folderId);
      formData.append('credentials', credentials);

      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate documents');
      }

      setResults(data.results);
      setStatus(`Successfully generated ${data.results.length} documents!`);
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-center mb-8">
            <FileText className="w-12 h-12 text-indigo-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Student Result Generator</h1>
          </div>

          <p className="text-center text-gray-600 mb-8">
            Automatically generate personalized result documents from Google Sheets data
          </p>

          <div className="space-y-6">
            {/* Configuration Section */}
            <div className="bg-indigo-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <Settings className="w-5 h-5 text-indigo-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Configuration</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Google Sheets Spreadsheet ID
                  </label>
                  <input
                    type="text"
                    value={spreadsheetId}
                    onChange={(e) => setSpreadsheetId(e.target.value)}
                    placeholder="e.g., 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Found in the URL: docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Google Docs Template ID
                  </label>
                  <input
                    type="text"
                    value={templateDocId}
                    onChange={(e) => setTemplateDocId(e.target.value)}
                    placeholder="e.g., 1234567890abcdefghijklmnop"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Use placeholders like {`{{Name}}`}, {`{{RollNumber}}`}, {`{{Marks}}`}, etc. in your template
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Google Drive Folder ID
                  </label>
                  <input
                    type="text"
                    value={folderId}
                    onChange={(e) => setFolderId(e.target.value)}
                    placeholder="e.g., 1dyGEebXQh_randomFolderId"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Found in the URL: drive.google.com/drive/folders/[FOLDER_ID]
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Account Credentials (JSON)
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-gray-50">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-10 h-10 mb-3 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          {credentials ? credentials.name : 'JSON file from Google Cloud Console'}
                        </p>
                      </div>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleCredentialsUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Generating Documents...
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5 mr-2" />
                  Generate Result Documents
                </>
              )}
            </button>

            {/* Status Message */}
            {status && (
              <div
                className={`p-4 rounded-lg flex items-center ${
                  status.includes('Error') || status.includes('fill in')
                    ? 'bg-red-50 text-red-800'
                    : 'bg-green-50 text-green-800'
                }`}
              >
                {status.includes('Error') || status.includes('fill in') ? (
                  <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                ) : (
                  <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                )}
                <span>{status}</span>
              </div>
            )}

            {/* Results */}
            {results.length > 0 && (
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Generated Documents</h3>
                <div className="space-y-2">
                  {results.map((result, index) => (
                    <div
                      key={index}
                      className="bg-white p-3 rounded border border-gray-200 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{result.studentName}</p>
                        <p className="text-sm text-gray-500">Roll: {result.rollNumber}</p>
                      </div>
                      <a
                        href={result.docLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      >
                        View Document →
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Setup Instructions</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
              <li>Create a Google Cloud project and enable Google Sheets, Docs, and Drive APIs</li>
              <li>Create a Service Account and download the JSON credentials file</li>
              <li>Share your Google Sheet, Template Doc, and Drive folder with the service account email</li>
              <li>Your Sheet should have columns: Name, RollNumber, Marks, Grade, Remarks (and optional Result Link)</li>
              <li>Create a template Doc with placeholders like {`{{Name}}`}, {`{{RollNumber}}`}, etc.</li>
              <li>Upload the credentials JSON and fill in the IDs above</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
