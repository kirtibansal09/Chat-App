import React, { useEffect, useRef } from 'react';
import Dropzone from 'dropzone';
import { UploadSimple } from '@phosphor-icons/react';
import { useDispatch, useSelector } from 'react-redux';
import { UploadDocument, UploadMedia } from '../redux/slices/app';

// Make sure to include Dropzone CSS in your project
// import 'dropzone/dist/min/dropzone.min.css';

const FileDropZone = ({
    acceptedFiles = "image/*, video/*",
    maxFileSize = 16 * 1024 * 1024,
    onFileUploaded = () => {},
    isDocument = false
}) => {
    const dispatch = useDispatch();
    const { token } = useSelector((state) => state.auth);
    const dropzoneRef = useRef(null);
    const formRef = useRef(null);

    useEffect(() => {
        // Disable Dropzone auto discovery
        Dropzone.autoDiscover = false;
        
        if (!dropzoneRef.current && formRef.current) {
            // Initialize Dropzone
            dropzoneRef.current = new Dropzone(formRef.current, {
                url: "/upload", // This is just a placeholder, actual upload is handled by Redux
                acceptedFiles: isDocument 
                    ? ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip" 
                    : "image/*,video/*",
                maxFileSize: maxFileSize,
                autoProcessQueue: false,
                addRemoveLinks: true,
                dictDefaultMessage: `Drop ${isDocument ? 'documents' : 'media files'} here to upload`,
                dictRemoveFile: "Remove",
                dictCancelUpload: "Cancel",
                dictFileTooBig: `File is too big ({{filesize}}MB). Max filesize: {{maxFilesize}}MB.`,
                dictInvalidFileType: `You can't upload files of this type.`,
            });

            // Handle file upload when files are added
            dropzoneRef.current.on("addedfile", async (file) => {
                try {
                    // Determine which upload action to use
                    const uploadAction = isDocument ? UploadDocument : UploadMedia;
                    
                    console.log('Uploading file:', file.name, 'isDocument:', isDocument);
                    
                    // Dispatch the upload action
                    const result = await dispatch(uploadAction(file, token));
                    
                    if (result) {
                        // Call the callback with the uploaded file data
                        onFileUploaded(result);
                        
                        // Show success in the dropzone UI
                        file.previewElement.classList.add("dz-success");
                    } else {
                        // Show error in the dropzone UI
                        file.previewElement.classList.add("dz-error");
                    }
                } catch (error) {
                    console.error("Upload failed:", error);
                    file.previewElement.classList.add("dz-error");
                }
            });
        }

        // Cleanup on unmount
        return () => {
            if (dropzoneRef.current) {
                dropzoneRef.current.destroy();
                dropzoneRef.current = null;
            }
        };
    }, [token, isDocument, acceptedFiles, maxFileSize, dispatch, onFileUploaded]);
    
    return (
        <div className='rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark'>
            <div className="p-6.5">
                <form 
                    action="#" 
                    ref={formRef} 
                    className='dropzone rounded-md !border-dashed !border-bodydark1 bg-gray hover:!border-primary dark:!border-strokedark dark:bg-graydark dark:hover:!border-primary'
                >
                    <div className="dz-message needsclick">
                        <div className="mb-2.5 flex justify-center flex-col items-center space-y-2">
                            <div className="shadow-10 flex h-15 w-15 items-center justify-center rounded-full bg-white text-black dark:bg-black dark:text-white">
                                <UploadSimple size={24}/>
                            </div>
                            <span className='font-medium text-black dark:text-white'>
                                Drop {isDocument ? 'documents' : 'media files'} here to upload
                            </span>
                            <p className="text-sm text-gray-500">
                                {isDocument 
                                    ? 'Supported formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, ZIP' 
                                    : 'Supported formats: JPG, PNG, GIF, MP4, etc.'}
                            </p>
                            <p className="text-sm text-gray-500">
                                Max file size: {maxFileSize / (1024 * 1024)}MB
                            </p>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FileDropZone;
