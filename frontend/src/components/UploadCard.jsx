import React from 'react';

export default function UploadCard({ darkMode, files = [], uploadStatus, onFileChange, onUpload, onRemoveFile }) {
  const containerStyle = darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';
  const uploadAreaClass = darkMode 
    ? 'border-blue-700 bg-blue-900/20 hover:bg-blue-900/30'
    : 'border-blue-300 bg-blue-50/50 hover:bg-blue-50';
  const fileInputStyle = darkMode 
    ? 'text-slate-400 file:bg-blue-900/50 file:text-blue-300 hover:file:bg-blue-900'
    : 'text-slate-500 file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200';
  const hintTextClass = darkMode ? 'text-slate-400' : 'text-slate-600';

  return (
    <main className={`w-full max-w-2xl p-8 rounded-2xl shadow-xl border transition-colors duration-300 ${containerStyle}`}>

      <div className={`border-2 border-dashed transition-colors duration-200 rounded-xl p-10
        flex flex-col items-center justify-center text-center cursor-pointer mb-6 ${uploadAreaClass}`}>
        <input
          id="file-input"
          type="file"
          multiple 
          // CHANGED: Added Word document support
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={onFileChange}
          className={`block w-full text-sm mb-3
    file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0
    file:text-sm file:font-semibold cursor-pointer ${fileInputStyle}`}
        />

        {files.length > 0 ? (
          <div className="flex flex-col gap-2 mt-2 w-full max-w-sm">
            {files.map((f, index) => (
              <div key={index} className={`flex items-center justify-between p-2.5 rounded-lg border ${darkMode ? 'bg-slate-900/50 border-slate-600' : 'bg-white/80 border-slate-200 shadow-sm'}`}>
                <span className="text-green-500 font-semibold text-sm truncate pr-3">✓ {f.name}</span>
                <button
                  onClick={(e) => {
                    e.preventDefault(); 
                    onRemoveFile(index);
                  }}
                  disabled={uploadStatus}
                  className={`text-red-400 hover:text-red-600 text-xs font-bold border border-red-300 hover:border-red-500 px-2 py-1 rounded-lg transition shrink-0 ${uploadStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  ✕ Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className={`text-sm font-medium mt-2 ${hintTextClass}`}>
            {/* CHANGED: Text updated to reflect new formats */}
            Or drag and drop your syllabus PDFs or Word Docs here
          </p>
        )}
      </div>

      <button
        onClick={onUpload}
        disabled={uploadStatus || files.length === 0}
        className={`w-full py-3.5 px-4 rounded-xl text-white font-semibold text-lg transition-all shadow-md
          ${uploadStatus || files.length === 0
            ? 'bg-slate-500 cursor-not-allowed opacity-60'
            : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg active:scale-[0.98]'
          }`}
      >
        {uploadStatus ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Processing {files.length} {files.length === 1 ? 'File' : 'Files'}...
          </span>
        ) : (
          `Extract ${files.length > 1 ? files.length + ' Schedules' : 'Schedule'} →`
        )}
      </button>
    </main>
  );
}