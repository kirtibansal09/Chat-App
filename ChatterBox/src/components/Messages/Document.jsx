import React, { useState } from 'react';
import { Check, Checks, DownloadSimple, File } from '@phosphor-icons/react';

const Document = ({ author, document, content, read_receipt, incoming, timestamp }) => {
  console.log('Rendering document message:', { author, document, content, read_receipt, incoming, timestamp });
  const [viewError, setViewError] = useState(null);

  // Handle document download/view
  const handleDownload = () => {
    if (document && document.url) {
      try {
        // Use the URL as provided, or construct it if it's a relative path
        let documentUrl = document.url;
        
        // If the URL is relative (starts with /), prepend the server URL
        if (documentUrl.startsWith('/')) {
          // Get the backend server URL from environment or use a default
          const serverUrl = process.env.REACT_APP_API_URL || window.location.origin;
          documentUrl = `${serverUrl}${documentUrl}`;
        }
        
        console.log('Document view URL:', documentUrl);
        
        // Open in a new tab
        window.open(documentUrl, '_blank');
      } catch (error) {
        console.error('Error viewing document:', error);
        setViewError('Failed to view document. Please try again.');
      }
    } else {
      console.error('Document URL is missing:', document);
      setViewError('Document URL is missing or invalid.');
    }
  };

  // Get document name (handle both originalname and name properties)
  const documentName = document?.originalname || document?.name || 'Document';
  
  // Check if document object exists
  if (!document) {
    console.error('Document object is missing in message');
    return (
      <div className={`max-w-125 w-fit ${!incoming && 'ml-auto'}`}>
        <p className='mb-2.5 text-sm font-medium capitalize'>{incoming ? author : ''}</p>
        <div className={`mb-2.5 rounded-2xl ${incoming ? 'rounded-tl-none bg-gray dark:bg-boxdark-2' : 'rounded-br-none bg-primary text-white'} px-5 py-3`}>
          <p>Error: Document not available</p>
        </div>
        <p className='text-xs'>{timestamp}</p>
      </div>
    );
  }
  
  return (
    incoming ? (
      <div className='max-w-125 w-fit'>
        <p className='mb-2.5 text-sm font-medium capitalize'>{author}</p>
        <div className="mb-2.5 rounded-2xl rounded-tl-none bg-gray px-5 py-3 dark:bg-boxdark-2 space-y-2">
          <div className='flex flex-row items-center justify-between p-2 bg-gray-3 rounded-md dark:bg-boxdark'>
            <div className="flex flex-row items-center space-x-3">
              <div className="p-2 rounded-md bg-primary/80 text-white">
                <File size={20} />
              </div>
              <div className='flex flex-col'>
                <div>{documentName}</div>
                <div className='text-sm font-medium'>{document?.size ? `${Math.round(document.size / 1024)} KB` : ''}</div>
              </div>
            </div>

            <div className="flex space-x-2">
              <button className='p-2' onClick={handleDownload}>
                <DownloadSimple size={20} />
              </button>
            </div>
          </div>

          {viewError && <p className="text-red-500 text-sm">{viewError}</p>}
          {content && <p>{content}</p>}
        </div>
        <p className='text-xs'>{timestamp}</p>
      </div>
    ) : (
      <div className="max-w-125 w-fit ml-auto">
        <div className="mb-2.5 rounded-2xl rounded-br-none bg-primary px-5 py-3 text-white space-y-2">
          <div className='flex flex-row items-center justify-between p-2 bg-white rounded-md text-primary'>
            <div className="flex flex-row items-center space-x-3">
              <div className="p-2 rounded-md bg-primary/20 text-primary">
                <File size={20} />
              </div>
              <div className='flex flex-col'>
                <div>{documentName}</div>
                <div className='text-sm font-medium'>{document?.size ? `${Math.round(document.size / 1024)} KB` : ''}</div>
              </div>
            </div>

            <div className="flex space-x-2">
              <button className='p-2' onClick={handleDownload}>
                <DownloadSimple size={20} />
              </button>
            </div>
          </div>

          {viewError && <p className="text-red-500 text-sm">{viewError}</p>}
          {content && <p>{content}</p>}
        </div>
        <div className="flex justify-end">
          <p className='text-xs'>{timestamp}</p>
          {read_receipt === "sent" && <Check className='text-xs ml-1' />}
          {read_receipt === "delivered" && <Checks className='text-xs ml-1' />}
          {read_receipt === "read" && <Checks className='text-xs ml-1 text-primary' />}
        </div>
      </div>
    )
  );
};

export default Document
