import { MagnifyingGlass, Users, UserPlus } from "@phosphor-icons/react";

import User01 from "../../assets/images/user/user-01.png";
import User02 from "../../assets/images/user/user-02.png";
import User03 from "../../assets/images/user/user-03.png";
import User04 from "../../assets/images/user/user-04.png";
import User05 from "../../assets/images/user/user-05.png";
import User06 from "../../assets/images/user/user-06.png";
import User07 from "../../assets/images/user/user-07.png";
import User08 from "../../assets/images/user/user-08.png";
import { useEffect, useState } from "react";
import ChatTab from "../../components/Chat/ChatTab";
import { useDispatch, useSelector } from "react-redux";
import { GetAllUsers } from "../../redux/slices/conversation";
import { GetFriends, GetFriendRequests } from "../../redux/slices/app";
import FriendRequests from "../../components/FriendRequests";

const ChatList = () => {
  const dispatch = useDispatch();
  const authToken = useSelector((store) => store?.auth?.token) || null;
  
  // Get data from Redux store
  const conversations = useSelector(
    (store) => store?.conversation?.direct_chat?.conversations
  );
  const friends = useSelector((store) => store?.app?.friends) || [];
  
  // Ensure we always have arrays
  const allUsers = Array.isArray(conversations) ? conversations : [];
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all"); // "all", "friends", "requests"

  useEffect(() => {
    const fetchData = async () => {
      if (!authToken) {
        console.log("No auth token available");
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        console.log("Fetching data...");
        await Promise.all([
          dispatch(GetAllUsers(authToken)),
          dispatch(GetFriends(authToken)),
          dispatch(GetFriendRequests(authToken))
        ]);
        console.log("Data fetched successfully");
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please check your network connection.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [authToken, dispatch]);

  // Filter users based on search term and active tab
  const getFilteredUsers = () => {
    let usersToFilter = [];
    
    if (activeTab === "all") {
      usersToFilter = allUsers;
    } else if (activeTab === "friends") {
      usersToFilter = friends;
    }
    
    if (!Array.isArray(usersToFilter)) return [];
    
    if (!searchTerm || searchTerm.trim() === "") return usersToFilter;
    
    return usersToFilter.filter(user => 
      user && 
      typeof user === 'object' && 
      user.name && 
      typeof user.name === 'string' && 
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };
  
  const filteredUsers = getFilteredUsers();
  const userCount = Array.isArray(filteredUsers) ? filteredUsers.length : 0;

  return (
    <div className="hidden h-full flex-col xl:flex xl:w-1/4">
      <div className="sticky border-b border-stroke dark:border-strokedark px-6 py-7.5 flex flex-row justify-between items-center">
        <div className="flex items-center">
          <h3 className="text-lg font-medium text-black dark:text-white 2xl:text-xl">
            {activeTab === "all" ? "All Users" : 
             activeTab === "friends" ? "Friends" : 
             "Friend Requests"}
          </h3>

          {activeTab !== "requests" && (
            <span className="rounded-md border-[.5px] border-stroke dark:border-strokedark bg-gray px-2 py-0.5 text-base font-medium text-black dark:bg-boxdark-2 dark:text-white xl:ml-4 2xl:ml-4">
              {userCount}
            </span>
          )}
        </div>
        
        <div className="flex space-x-2">
          <button 
            onClick={() => setActiveTab("all")}
            className={`p-2 rounded-md ${activeTab === "all" ? "bg-primary text-white" : "text-body hover:bg-gray-2"}`}
            title="All Users"
          >
            <Users size={20} />
          </button>
          <button 
            onClick={() => setActiveTab("friends")}
            className={`p-2 rounded-md ${activeTab === "friends" ? "bg-primary text-white" : "text-body hover:bg-gray-2"}`}
            title="Friends"
          >
            <Users size={20} />
          </button>
          <button 
            onClick={() => setActiveTab("requests")}
            className={`p-2 rounded-md ${activeTab === "requests" ? "bg-primary text-white" : "text-body hover:bg-gray-2"}`}
            title="Friend Requests"
          >
            <UserPlus size={20} />
          </button>
        </div>
      </div>

      <div className="flex max-h-full flex-col overflow-auto p-5">
        {activeTab !== "requests" && (
          <form className="sticky mb-7" onSubmit={(e) => e.preventDefault()}>
            <input
              placeholder="Search..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded border border-stroke bg-gray-2 py-2.5 pl-5 pr-10 text-sm outline-none focus:border-slate-500 dark:border-strokedark dark:bg-boxdark-2"
            />

            <button 
              type="button" 
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              <MagnifyingGlass size={20} />
            </button>
          </form>
        )}

        <div className="no-scrollbar overflow-auto max-h-full space-y-2.5">
          {isLoading ? (
            <div className="text-center py-4">Loading...</div>
          ) : error ? (
            <div className="text-center py-4 text-red-500">{error}</div>
          ) : activeTab === "requests" ? (
            <FriendRequests />
          ) : userCount > 0 ? (
            filteredUsers.map((user) => (
              <ChatTab 
                key={user?.id || user?._id || Math.random().toString()} 
                user={user}
                isFriend={activeTab === "friends"}
              />
            ))
          ) : (
            <div className="text-center py-4">
              {searchTerm ? "No matching users found." : 
               activeTab === "friends" ? "You don't have any friends yet." : 
               "No users available."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatList;
