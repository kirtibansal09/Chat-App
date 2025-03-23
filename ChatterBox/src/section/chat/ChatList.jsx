import { MagnifyingGlass } from "@phosphor-icons/react";

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
import { UpdateFriends } from "../../redux/slices/app";
import {
  FetchDirectConversations,
  GetAllUsers,
} from "../../redux/slices/conversation";

// const List = [
//   {
//     id: 1,
//     imgSrc: User01,
//     name: "Henry Dholi",
//     message: "I cam across your profile and...",
//   },
//   {
//     id: 2,
//     imgSrc: User02,
//     name: "Mariya Desoja",
//     message: "I like your confidence 💪",
//   },
//   {
//     id: 3,
//     imgSrc: User03,
//     name: "Robert Jhon",
//     message: "Can you share your offer?",
//   },
//   {
//     id: 4,
//     imgSrc: User04,
//     name: "Cody Fisher",
//     message: `I'm waiting for you response!`,
//   },
//   {
//     id: 5,
//     imgSrc: User05,
//     name: "Jenny Wilson",
//     message: "I cam across your profile and...",
//   },
//   {
//     id: 6,
//     imgSrc: User06,
//     name: "Robert Jhon",
//     message: "Can you share your offer?",
//   },
//   {
//     id: 7,
//     imgSrc: User07,
//     name: "Cody Fisher",
//     message: `I'm waiting for you response!`,
//   },
//   {
//     id: 8,
//     imgSrc: User08,
//     name: "Jenny Wilson",
//     message: "I cam across your profile and...",
//   },
// ];

const ChatList = () => {
  const authToken = useSelector((store) => store.auth.token);

  const dispatch = useDispatch();
  const allUsers = useSelector(
    (store) => store.conversation.direct_chat.conversations
  );

  useEffect(() => {
    // get all the users
    dispatch(GetAllUsers(authToken));
    console.log("ALL USERS _>", allUsers);
  }, []);

  console.log(allUsers);

  return (
    <div className="hidden h-full flex-col xl:flex xl:w-1/4">
      <div className="sticky border-b border-stroke dark:border-strokedark px-6 py-7.5 flex flex-row">
        <h3 className="text-lg font-medium text-black dark:text-white 2xl:text-xl">
          Active Conversations
        </h3>

        <span className="rounded-md border-[.5px] border-stroke dark:border-strokedark bg-gray px-2 py-0.5  text-base font-medium text-black dark:bg-boxdark-2 dark:text-white xl:ml-4 2xl:ml-4">
          8
        </span>
      </div>

      <div className="flex max-h-full flex-col overflow-auto p-5">
        <form className="sticky mb-7">
          <input
            placeholder="Search..."
            type="text"
            className="w-full rounded border border-stroke bg-gray-2 py-2.5 pl-5 pr-10 text-sm outline-none focus:border-slate-500 dark:border-strokedark dark:bg-boxdark-2"
          />

          <button className="absolute right-4 top-1/2 -translate-y-1/2">
            <MagnifyingGlass size={20} />
          </button>
        </form>

        <div className="no-scrollbar overflow-auto max-h-full space-y-2.5">
          {/* Chat List Item */}
          {allUsers.length > 0 &&
            allUsers.map((user) => {
              return <ChatTab key={user.id} user={user} />;
            })}
        </div>
      </div>
    </div>
  );
};

export default ChatList;
