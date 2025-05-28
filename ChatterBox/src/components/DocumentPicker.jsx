import { PaperPlaneTilt, X } from '@phosphor-icons/react';
import React, { useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ToggleDocumentModal } from '../redux/slices/app';
import FileDropZone from './FileDropZone';
import { useSocket } from '../context/SocketContext';

const DocumentPicker = () => {
    const modalRef = useRef(null);
    const dispatch = useDispatch();
    const { doc } = useSelector(state => state.app.modals);
    const { current_conversation } = useSelector(state => state.app);
    const { socket } = useSocket();
    
    // Get user information from Redux store with more detailed logging
    const auth = useSelector(state => state.auth);
    
    // Try multiple ways to get the user ID
    const userId = auth.user_id || (auth.user && auth.user._id) || (auth.user && auth.user.id);
    
    // Debug logging
    useEffect(() => {
        console.log('DocumentPicker - Auth state:', auth);
        console.log('DocumentPicker - User ID:', userId);
        console.log('DocumentPicker - Current conversation:', current_conversation);
    }, [auth, userId, current_conversation]);
    
    const [message, setMessage] = useState('');
    const [uploadedDoc, setUploadedDoc] = useState(null);
    
    // Handle file upload completion
    const handleFileUploaded = (fileData) => {
        console.log('Document uploaded:', fileData);
        
        // Make sure we have all the necessary data
        if (!fileData || !fileData.url) {
            console.error('Invalid document data received:', fileData);
            return;
        }
        
        // Store the document data with all necessary fields
        setUploadedDoc({
            url: fileData.url,
            originalname: fileData.originalname,
            name: fileData.originalname || 'document',
            size: fileData.size,
            mimetype: fileData.mimetype
        });
    };
    
    // Handle sending document message
    const handleSendDocument = () => {
        if (!uploadedDoc) {
            console.error('No document uploaded');
            return;
        }
        
        if (!current_conversation || !current_conversation._id) {
            console.error('No active conversation');
            return;
        }
        
        if (!userId) {
            console.error('User not authenticated');
            return;
        }
        
        console.log('Sending document in conversation:', current_conversation._id);
        console.log('User ID for document sender:', userId);
        console.log('Document data being sent:', uploadedDoc);
        
        // Prepare document data with consistent property names
        const documentData = {
            url: uploadedDoc.url,
            name: uploadedDoc.originalname || uploadedDoc.name,
            originalname: uploadedDoc.originalname,
            size: uploadedDoc.size,
            mimetype: uploadedDoc.mimetype
        };
        
        // Prepare message data
        const messageData = {
            conversationId: current_conversation._id,
            message: {
                author: userId,
                content: message || '',
                type: 'Document',
                document: documentData
            }
        };
        
        console.log('Sending message data:', messageData);
        
        // Send message via socket with callback to check if it was received
        socket.emit('new-message', messageData, (response) => {
            console.log('Socket message response:', response);
            if (response && response.status === 'success') {
                console.log('Document message sent successfully');
            } else {
                console.error('Failed to send document message:', response);
            }
        });
        
        // Reset and close modal
        setMessage('');
        setUploadedDoc(null);
        dispatch(ToggleDocumentModal(false));
    };
    
    // Handle modal close
    const handleClose = () => {
        setMessage('');
        setUploadedDoc(null);
        dispatch(ToggleDocumentModal(false));
    };

    return (
        <div className={`fixed left-0 top-0 z-999999 flex h-full min-h-screen w-full items-center justify-center bg-black/90 px-4 py-5 ${doc ? "block" : "hidden"}`}>
            <div ref={modalRef} className="md:px-17.5 w-full max-w-142.5 rounded-lg bg-white dark:bg-boxdark md:py-8 px-8 py-12">
                <div className="flex flex-row items-center justify-between mb-8 space-x-2">
                    <div className="text-md font-medium text-black dark:text-white">
                        Choose Document Files to send
                    </div>
                    <button onClick={handleClose}>
                        <X size={24} />
                    </button>
                </div>

                {/* Show uploaded document preview */}
                {uploadedDoc && (
                    <div className="mb-4 p-3 border rounded bg-gray-50 dark:bg-gray-800 flex justify-between items-center">
                        <div>
                            <p className="font-medium">{uploadedDoc.originalname || uploadedDoc.name}</p>
                            <p className="text-sm text-gray-500">{Math.round(uploadedDoc.size / 1024)} KB</p>
                        </div>
                        <button 
                            className="text-red-500"
                            onClick={() => setUploadedDoc(null)}
                        >
                            <X size={20} />
                        </button>
                    </div>
                )}

                <FileDropZone 
                    acceptedFiles='.pdf, .ppt, .doc, .docx, .xls, .xlsx, .txt, .csv, .zip'
                    maxFileSize={64 * 1024 * 1024}
                    onFileUploaded={handleFileUploaded}
                    isDocument={true}
                />

                <div className="flex flex-row items-center space-x-2 justify-between mt-4">
                    <input
                        type="text"
                        className="border rounded-lg hover:border-primary outline-none w-full p-2 border-stroke dark:border-strokedark bg-transparent dark:bg-form-input"
                        placeholder="Type your message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />

                    <button 
                        className="p-2.5 border border-primary flex items-center justify-center rounded-lg bg-primary hover:bg-opacity-90 text-white"
                        onClick={handleSendDocument}
                        disabled={!uploadedDoc}
                    >
                        <PaperPlaneTilt size={20} weight="bold" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DocumentPicker
