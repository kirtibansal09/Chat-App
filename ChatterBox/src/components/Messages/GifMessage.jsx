import React from 'react';
import { Check, Checks } from '@phosphor-icons/react';

const GifMessage = ({ author, content, giphyUrl, read_receipt, incoming, timestamp }) => {
  return (
    incoming ? (
      <div className='max-w-125 w-fit'>
        <p className='mb-2.5 text-sm font-medium capitalize'>{author}</p>
        <div className="mb-2.5 rounded-2xl rounded-tl-none bg-gray px-5 py-3 dark:bg-boxdark-2">
          {giphyUrl && (
            <div className="relative mb-2">
              <img 
                src={giphyUrl} 
                alt="GIF" 
                className="rounded-lg max-h-60 w-full object-contain"
                onError={() => console.error("Failed to load GIF")}
              />
            </div>
          )}
          {content && content !== 'Sent a GIF' && <p>{content}</p>}
        </div>
        <p className='text-xs'>{timestamp}</p>
      </div>
    ) : (
      <div className="max-w-125 w-fit ml-auto">
        <div className="mb-2.5 rounded-2xl rounded-br-none bg-primary px-5 py-3 text-white">
          {giphyUrl && (
            <div className="relative mb-2">
              <img 
                src={giphyUrl} 
                alt="GIF" 
                className="rounded-lg max-h-60 w-full object-contain"
                onError={() => console.error("Failed to load GIF")}
              />
            </div>
          )}
          {content && content !== 'Sent a GIF' && <p>{content}</p>}
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

export default GifMessage;