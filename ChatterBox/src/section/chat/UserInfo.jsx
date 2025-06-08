import { Chat, Clock, DotsThreeVertical, VideoCamera, X } from "@phosphor-icons/react";
import React from "react";
import { useSelector } from "react-redux";

function UserInfo({ handleToggleUserInfo }) {
  const { currentUser } = useSelector((state) => state.user);

  return (
    <div className="border-l flex flex-col h-full border-stroke dark:border-strokedark">
      <div className="sticky border-b border-stroke dark:border-strokedark flex flex-row items-center justify-between w-full px-6 py-7.5">
        <div className="text-black dark:text-white font-semibold text-lg">
          Profile
        </div>
        <button onClick={handleToggleUserInfo}>
          <X size={24} />
        </button>
      </div>

      <div className="mx-auto my-8">
        <img
          className="w-44 h-44 rounded-lg object-cover object-center"
          src={currentUser?.avatar}
        />
      </div>

      <div className="px-6 space-y-1">
        <div className="text-black dark:text-white text-xl font-medium">
          {currentUser?.name}
        </div>
        <span className="text-body">{currentUser?.jobTitle}</span>
      </div>

      <div className="px-6 my-6">
        <div className="flex flex-row items-center space-x-2">
          <Clock size={20} />
          <div>6:50 AM local time</div>
        </div>
      </div>

      <div className="px-6 flex flex-row space-x-2">
        <button className="w-full border border-stroke dark:border-strokedark p-2 rounded-md flex flex-row items-center justify-center">
          <Chat size={20} className="mr-3" />
          Message
        </button>
        <button className="w-full border border-stroke dark:border-strokedark p-2 rounded-md flex flex-row items-center justify-center">
          <VideoCamera size={20} className="mr-3" />
          Huddle
        </button>
        <button className=" border border-stroke dark:border-strokedark p-2 rounded-md flex flex-row items-center justify-center">
          <DotsThreeVertical size={20} />
        </button>
      </div>

      <div className="border-t border-stroke dark:border-strokedark px-6 py-6 space-y-4">
        <div className="text-black dark:text-white font-semibold">About</div>
        <div className="text-sm">{currentUser?.bio}</div>
        <div className="text-sm text-body">{currentUser?.country}</div>
      </div>
    </div>
  );
}

export default UserInfo;
