import React, { useEffect, useState } from 'react';
import { Check, Checks } from '@phosphor-icons/react';
import MediaMsgGrid from '../MediaMsgGrid';
import { useSelector } from 'react-redux';

const Media = ({ author, media, content, messageId, incoming, timestamp, giphyUrl }) => {
  const [formattedMedia, setFormattedMedia] = useState([]);
  const appState = useSelector((state) => state.app);
  const messageStatus = appState?.messageStatus?.[messageId] || "sent";
  
  useEffect(() => {
    // If there's a GIF URL, we don't need to process media array
    if (giphyUrl) {
      return;
    }
    
    // Format media data for MediaMsgGrid
    if (media && Array.isArray(media)) {
      const formatted = media.map((item, index) => {
        // Extract URL from the item
        const url = item.url || '';
        
        return {
          key: `media-${index}`,
          imgSrc: url,
          url: url,
          type: item.type || 'image'
        };
      });
      
      setFormattedMedia(formatted);
    } else {
      setFormattedMedia([]);
    }
  }, [media, giphyUrl]);

  // Render GIF content
  const renderGifContent = () => {
    return (
      <div className="w-full">
        <img 
          src={giphyUrl} 
          alt="GIF" 
          className="rounded-lg max-h-60 w-full object-contain"
          onError={() => console.error("Failed to load GIF")}
        />
      </div>
    );
  };

  // If this is a GIF message
  if (giphyUrl) {
    return (
      incoming ? (
        <div className='max-w-125 w-fit'>
          <p className='mb-2.5 text-sm font-medium capitalize'>{author}</p>
          <div className="mb-2.5 rounded-2xl rounded-tl-none bg-gray dark:bg-boxdark-2 px-5 py-3">
            {renderGifContent()}
            {content && content !== 'Sent a GIF' && <p className="mt-2">{content}</p>}
          </div>
          <p className='text-xs'>{timestamp}</p>
        </div>
      ) : (
        <div className="max-w-125 w-fit ml-auto">
          <div className="mb-2.5 rounded-2xl rounded-br-none bg-primary px-5 py-3 text-white">
            {renderGifContent()}
            {content && content !== 'Sent a GIF' && <p className="mt-2">{content}</p>}
          </div>
          <div className="flex justify-end">
            <p className='text-xs'>{timestamp}</p>
            {messageStatus !== 'read' && <Check className='text-xs ml-1' />}
            {messageStatus === 'delivered' && <Checks className='text-xs ml-1' />}
            {messageStatus === 'read' && <Checks className='text-xs ml-1 text-primary' />}
          </div>
        </div>
      )
    );
  }

  // For regular media messages
  // Check if media exists and is valid
  if (!media || !Array.isArray(media) || media.length === 0) {
    return (
      <div className={`max-w-125 w-fit ${!incoming && 'ml-auto'}`}>
        <p className='mb-2.5 text-sm font-medium capitalize'>{incoming ? author : ''}</p>
        <div className={`mb-2.5 rounded-2xl ${incoming ? 'rounded-tl-none bg-gray dark:bg-boxdark-2' : 'rounded-br-none bg-primary text-white'} px-5 py-3`}>
          <p>No media available</p>
          {content && <p>{content}</p>}
        </div>
        <p className='text-xs'>{timestamp}</p>
      </div>
    );
  }

  return (
    incoming ? (
      <div className='max-w-125 w-fit'>
        <p className='mb-2.5 text-sm font-medium capitalize'>{author}</p>
        <div className="mb-2.5">
          <MediaMsgGrid images={formattedMedia} incoming={incoming} />
          {content && <p className="px-5 py-2 bg-gray dark:bg-boxdark-2 rounded-b-2xl">{content}</p>}
        </div>
        <p className='text-xs'>{timestamp}</p>
      </div>
    ) : (
      <div className="max-w-125 w-fit ml-auto">
        <div className="mb-2.5">
          <MediaMsgGrid images={formattedMedia} incoming={incoming} />
          {content && <p className="px-5 py-2 bg-primary text-white rounded-b-2xl rounded-br-none">{content}</p>}
        </div>
        <div className="flex justify-end">
          <p className='text-xs'>{timestamp}</p>
          <div className={`${messageStatus !== 'read' ? "text-body dark:text-white" : "text-primary"}`}>
            {messageStatus !== 'sent' ? (
              <Checks weight="bold" size={18} />
            ) : (
              <Check weight="bold" size={18} />
            )}
          </div>
        </div>
      </div>
    )
  );
};

export default Media;
