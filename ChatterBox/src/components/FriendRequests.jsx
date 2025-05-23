import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AcceptFriendRequest, GetFriendRequests, RejectFriendRequest, GetFriends } from '../redux/slices/app';
import { X, Check } from '@phosphor-icons/react';

const FriendRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const authToken = useSelector((store) => store.auth.token);

  useEffect(() => {
    loadRequests();
  }, [authToken]);

  const loadRequests = async () => {
    if (!authToken) return;
    
    setLoading(true);
    try {
      const data = await dispatch(GetFriendRequests(authToken));
      setRequests(data);
    } catch (error) {
      console.error('Error loading friend requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      await dispatch(AcceptFriendRequest(requestId, authToken));
      
      // Remove from local state to update UI immediately
      setRequests(requests.filter(req => req._id !== requestId));
      
      // Refresh friends list
      dispatch(GetFriends(authToken));
      
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const handleReject = async (requestId) => {
    try {
      await dispatch(RejectFriendRequest(requestId, authToken));
      
      // Remove from local state to update UI immediately
      setRequests(requests.filter(req => req._id !== requestId));
      
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading requests...</div>;
  }

  if (requests.length === 0) {
    return <div className="text-center py-4">No friend requests</div>;
  }

  return (
    <div className="space-y-2">
      {requests.map(request => (
        <div key={request._id} className="flex items-center justify-between p-2 border-b border-stroke dark:border-strokedark">
          <div>
            <p className="font-medium">{request.sender.name}</p>
            <p className="text-xs text-body">Sent you a friend request</p>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => handleAccept(request._id)}
              className="p-1.5 bg-primary text-white rounded-full"
              title="Accept"
            >
              <Check size={16} />
            </button>
            <button 
              onClick={() => handleReject(request._id)}
              className="p-1.5 bg-gray-3 text-body rounded-full"
              title="Reject"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FriendRequests;