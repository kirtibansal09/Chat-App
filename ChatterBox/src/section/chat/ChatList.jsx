import { MagnifyingGlass, Users, UserPlus, Funnel, CaretDown } from "@phosphor-icons/react";

import User01 from "../../assets/images/user/user-01.png";
import User02 from "../../assets/images/user/user-02.png";
import User03 from "../../assets/images/user/user-03.png";
import User04 from "../../assets/images/user/user-04.png";
import User05 from "../../assets/images/user/user-05.png";
import User06 from "../../assets/images/user/user-06.png";
import User07 from "../../assets/images/user/user-07.png";
import User08 from "../../assets/images/user/user-08.png";
import { useEffect, useState, useRef } from "react";
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
  const [activeTab, setActiveTab] = useState("friends"); // "all", "friends", "requests"
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  // Handle dropdown clicks outside
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!dropdownRef.current) return;

      if (
        !dropdownRef.current.contains(target) &&
        !triggerRef.current.contains(target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  // Handle escape key
  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!showDropdown || keyCode !== 27) return;
      setShowDropdown(false);
    };

    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

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
            {activeTab === "all" ? "Explore" :
             activeTab === "friends" ? "Friends" :
             "Requests"}
          </h3>

          {activeTab !== "requests" && (
            <span className="rounded-md border-[.5px] border-stroke dark:border-strokedark bg-gray px-2 py-0.5 text-base font-medium text-black dark:bg-boxdark-2 dark:text-white xl:ml-4 2xl:ml-4">
              {userCount}
            </span>
          )}
        </div>

        <div className="relative">
          <button
            ref={triggerRef}
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 p-2 rounded-md text-body hover:bg-gray-2 dark:hover:bg-boxdark-2"
            title="Choose Category"
          >
            <span className="text-sm font-medium">
              {activeTab === "all" ? "Explore" :
               activeTab === "friends" ? "Friends" :
               "Requests"}
            </span>
            <CaretDown size={16} />
          </button>

          {/* Dropdown Menu - High z-index to show on top of everything */}
          <div
            ref={dropdownRef}
            className={`absolute right-0 top-full z-999999 w-40 space-y-1 rounded-sm border border-stroke bg-white p-1.5 shadow-default dark:border-strokedark dark:bg-boxdark ${
              showDropdown ? "block" : "hidden"
            }`}
          >
            <button
              onClick={() => {
                setActiveTab("all");
                setShowDropdown(false);
              }}
              className={`flex w-full items-center gap-2 rounded-sm px-4 py-1.5 text-left text-sm ${
                activeTab === "all"
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "text-black dark:text-white hover:bg-gray-2 dark:hover:bg-boxdark-2"
              }`}
            >
              <Users size={16} />
              Explore
            </button>

            <button
              onClick={() => {
                setActiveTab("friends");
                setShowDropdown(false);
              }}
              className={`flex w-full items-center gap-2 rounded-sm px-4 py-1.5 text-left text-sm ${
                activeTab === "friends"
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "text-black dark:text-white hover:bg-gray-2 dark:hover:bg-boxdark-2"
              }`}
            >
              <Users size={16} />
              Friends
            </button>

            <button
              onClick={() => {
                setActiveTab("requests");
                setShowDropdown(false);
              }}
              className={`flex w-full items-center gap-2 rounded-sm px-4 py-1.5 text-left text-sm ${
                activeTab === "requests"
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "text-black dark:text-white hover:bg-gray-2 dark:hover:bg-boxdark-2"
              }`}
            >
              <UserPlus size={16} />
              Requests
            </button>
          </div>
        </div>
      </div>

      <div className="flex max-h-full flex-col overflow-auto p-5">
        {activeTab !== "requests" && (
          <form className="mb-7" onSubmit={(e) => e.preventDefault()}>
            <div className="flex items-center rounded border border-stroke bg-gray-2 dark:border-strokedark dark:bg-boxdark-2 focus-within:border-slate-500">
              <input
                placeholder="Search..."
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                 className="flex-1 bg-transparent py-2.5 pl-5 pr-3 text-sm outline-none"
              />
              <button
                type="button"
                className="px-3 py-2.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <MagnifyingGlass size={20} />
              </button>
            </div>
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
