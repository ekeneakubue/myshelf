'use client';

import { useCallback, useState } from 'react';

export default function UploadPage() {
  const [isDragging, setIsDragging] = useState(false);
  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files || []);
    // TODO: wire upload action
    console.log('Dropped files', files);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Upload</h1>
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`rounded-lg border border-dashed p-10 text-center ${isDragging ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-500/10' : 'border-black/15 dark:border-white/15'}`}
      >
        <p className="mb-3 text-sm">Drag & drop PDF files here</p>
        <label className="inline-block text-sm px-3 py-2 rounded-md border border-black/10 dark:border-white/10 hover:bg-black/[.04] dark:hover:bg-white/[.06] cursor-pointer">
          Browse files
          <input type="file" accept="application/pdf" multiple className="hidden" onChange={(e) => console.log(e.target.files)} />
        </label>
      </div>
    </div>
  );
}


