import { DownloadSimple } from '@phosphor-icons/react'
import React, { useEffect, useState } from 'react'
import axiosInstance from '../utils/axios';

const MediaMsgGrid = ({ images, incoming }) => {
    const [processedImages, setProcessedImages] = useState([]);
    const [imageErrors, setImageErrors] = useState({});
    
    useEffect(() => {
        console.log('MediaMsgGrid received images:', images);
        
        // Process images to ensure they have valid URLs
        if (images && images.length > 0) {
            const processed = images.map((image, index) => {
                // Ensure we have a valid URL
                let imgSrc = image.imgSrc || image.url || '';
                
                // Debug the image source
                console.log('Processing image source:', imgSrc);
                
                return {
                    ...image,
                    key: `media-${index}`,
                    imgSrc: imgSrc
                };
            });
            
            console.log('Processed images:', processed);
            setProcessedImages(processed);
        }
    }, [images]);

    // Function to get the direct media URL for viewing
    const getDirectMediaUrl = (imgSrc) => {
        if (!imgSrc) return '';
        
        try {
            // If the URL is already absolute, return it as is
            if (imgSrc.startsWith('http')) return imgSrc;
            
            // If it's a relative URL, construct the full URL
            const baseUrl = axiosInstance.defaults.baseURL || window.location.origin;
            
            // If the URL already starts with /uploads, just prepend the base URL
            if (imgSrc.startsWith('/uploads/')) {
                return `${baseUrl}${imgSrc}`;
            }
            
            // Otherwise, assume it's just a filename and construct the path
            const filename = imgSrc.split('/').pop();
            return `${baseUrl}/uploads/media/${filename}`;
        } catch (error) {
            console.error('Error creating direct media URL:', error);
            return imgSrc;
        }
    };

    // Function to get the download URL
    const getDownloadUrl = (imgSrc) => {
        if (!imgSrc) return '';
        
        try {
            // If the URL is already absolute, extract the filename
            let filename;
            if (imgSrc.startsWith('http')) {
                filename = imgSrc.split('/').pop();
            } else {
                // If it's a relative URL, extract the filename
                filename = imgSrc.split('/').pop();
            }
            
            if (!filename) return imgSrc;
            
            // Create download URL
            const baseUrl = axiosInstance.defaults.baseURL || window.location.origin;
            return `${baseUrl}/api/download/media/${filename}`;
        } catch (error) {
            console.error('Error creating download URL:', error);
            return imgSrc;
        }
    };

    // Handle image click to open in new tab
    const handleImageClick = (imgSrc) => {
        if (!imgSrc) {
            console.error('No image URL provided');
            alert('Image URL is missing or invalid');
            return;
        }
        
        try {
            const directUrl = getDirectMediaUrl(imgSrc);
            console.log('Opening media URL:', directUrl);
            window.open(directUrl, '_blank');
        } catch (error) {
            console.error('Error opening media:', error);
            alert('Failed to open media. Please try again.');
        }
    };

    // Function to download the image
    const handleDownload = (imgSrc, e) => {
        e.stopPropagation(); // Prevent the image click event
        
        if (!imgSrc) {
            console.error('No image URL provided for download');
            alert('Image URL is missing or invalid');
            return;
        }
        
        try {
            const downloadUrl = getDownloadUrl(imgSrc);
            console.log('Downloading from URL:', downloadUrl);
            
            // Create a temporary anchor element
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = imgSrc.split('/').pop() || 'download';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error downloading media:', error);
            alert('Failed to download media. Please try again.');
        }
    };

    // Handle image load error
    const handleImageError = (key) => {
        console.error(`Failed to load image with key: ${key}`);
        setImageErrors(prev => ({...prev, [key]: true}));
    };

    const renderImages = () => {
        if (!processedImages || processedImages.length === 0) {
            return <div className="col-span-2 row-span-2 flex items-center justify-center">No images available</div>;
        }
        
        console.log('Rendering processed images:', processedImages);
        
        if (processedImages.length === 1) {
            const image = processedImages[0];
            const directUrl = getDirectMediaUrl(image.imgSrc);
            const hasError = imageErrors[image.key];
            
            return <div className='relative col-span-2 row-span-2 rounded-2xl'>
                {hasError ? (
                    <div className="h-full w-full rounded-lg bg-gray-200 dark:bg-boxdark-2 flex items-center justify-center">
                        <span>Image not available</span>
                    </div>
                ) : (
                    <img 
                        src={directUrl} 
                        alt="Media" 
                        className='h-full w-full rounded-lg object-cover object-center cursor-pointer' 
                        onClick={() => handleImageClick(image.imgSrc)}
                        onError={() => handleImageError(image.key)}
                    />
                )}

                <button 
                    className='absolute top-3 right-4 bg-gray/80 dark:bg-boxdark p-2 rounded-md hover:bg-opacity-70 hover:text-black dark:hover:text-white'
                    onClick={(e) => handleDownload(image.imgSrc, e)}
                >
                    <DownloadSimple size={20} />
                </button>
            </div>
        }
        else if (processedImages.length === 2) {
            return processedImages.map((image) => {
                const directUrl = getDirectMediaUrl(image.imgSrc);
                const hasError = imageErrors[image.key];
                
                return <div key={image.key} className='relative col-span-1 row-span-2 rounded-2xl'>
                    {hasError ? (
                        <div className="h-full w-full rounded-lg bg-gray-200 dark:bg-boxdark-2 flex items-center justify-center">
                            <span>Image not available</span>
                        </div>
                    ) : (
                        <img 
                            src={directUrl} 
                            alt="Media" 
                            className='h-full w-full rounded-lg object-cover object-center cursor-pointer' 
                            onClick={() => handleImageClick(image.imgSrc)}
                            onError={() => handleImageError(image.key)}
                        />
                    )}

                    <button 
                        className='absolute top-3 right-4 bg-gray/80 dark:bg-boxdark p-2 rounded-md hover:bg-opacity-70 hover:text-black dark:hover:text-white'
                        onClick={(e) => handleDownload(image.imgSrc, e)}
                    >
                        <DownloadSimple size={20} />
                    </button>
                </div>
            })
        }
        else if (processedImages.length === 3) {
            return (
              <>
                {processedImages.slice(0, 3).map((image) => {
                  const directUrl = getDirectMediaUrl(image.imgSrc);
                  const hasError = imageErrors[image.key];
                  
                  return (
                    <div
                      key={image.key}
                      className="col-span-1 row-span-1 relative rounded-2xl"
                    >
                      {hasError ? (
                        <div className="h-full w-full rounded-lg bg-gray-200 dark:bg-boxdark-2 flex items-center justify-center">
                            <span>Image not available</span>
                        </div>
                      ) : (
                        <img
                          src={directUrl}
                          alt="Media"
                          className="h-full w-full rounded-lg object-cover object-center cursor-pointer"
                          onClick={() => handleImageClick(image.imgSrc)}
                          onError={() => handleImageError(image.key)}
                        />
                      )}
                      <button 
                          className="absolute top-3 right-4 bg-gray/80 dark:bg-boxdark p-2 rounded-md hover:bg-opacity-80 hover:cursor-pointer hover:text-black dark:hover:text-white"
                          onClick={(e) => handleDownload(image.imgSrc, e)}
                      >
                        <DownloadSimple size={20} />
                      </button>
                    </div>
                  );
                })}
              </>
            );
          } 
          else {
            return (
              <>
                {processedImages.slice(0, 3).map((image) => {
                  const directUrl = getDirectMediaUrl(image.imgSrc);
                  const hasError = imageErrors[image.key];
                  
                  return (
                    <div
                      key={image.key}
                      className="col-span-1 row-span-1 relative rounded-2xl"
                    >
                      {hasError ? (
                        <div className="h-full w-full rounded-lg bg-gray-200 dark:bg-boxdark-2 flex items-center justify-center">
                            <span>Image not available</span>
                        </div>
                      ) : (
                        <img
                          src={directUrl}
                          alt="Media"
                          className="h-full w-full rounded-lg object-cover object-center cursor-pointer"
                          onClick={() => handleImageClick(image.imgSrc)}
                          onError={() => handleImageError(image.key)}
                        />
                      )}
                      <button 
                          className="absolute top-3 right-4 bg-gray/80 dark:bg-boxdark p-2 rounded-md hover:bg-opacity-80 hover:cursor-pointer hover:text-black dark:hover:text-white"
                          onClick={(e) => handleDownload(image.imgSrc, e)}
                      >
                        <DownloadSimple size={20} />
                      </button>
                    </div>
                  );
                })}
                <div 
                    className="relative rounded-2xl bg-body/50 flex flex-row items-center justify-center text-xl text-white font-semibold cursor-pointer col-span-1 row-span-1"
                    onClick={() => handleImageClick(processedImages[3].imgSrc)}
                >
                  <div>+{processedImages.length - 3}</div>
                </div>
              </>
            );
        }
    }
    
    return (
        <div className={`grid grid-cols-2 grid-rows-2 pt-4 pb-2 gap-3 h-60 rounded-2xl ${incoming ? "bg-gray dark:bg-boxdark-2 rounded-tl-none" : "bg-transparent"}`}>
            {renderImages()}
        </div>
    )
}

export default MediaMsgGrid

