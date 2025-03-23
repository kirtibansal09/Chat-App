import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SelectConversation } from "../../redux/slices/app";
import userImage from "../../assets/images/user/user-02.png";

function ChatTab({ user }) {
  const dispatch = useDispatch();
  const room_id = useSelector((store) => store.app.room_id);

  return (
    <div
      className={`flex cursor-pointer items-center rounded px-4 py-2 dark:hover:bg-strokedark ${
        room_id === user.id
          ? "bg-gray dark:bg-boxdark-2"
          : "hover:bg-gray-2 dark:hover:bg-boxdark-2/90"
      }`}
      onClick={() => {
        dispatch(SelectConversation({ room_id: user.id }));
      }}
    >
      <div className="relative mr-3.5 h-11 w-full max-w-11 rounded-full ">
        <img
          src={user.imgSrc || userImage}
          alt="Profile"
          className="h-full w-full rounded-full object-cover object-center"
        />
        <span
          className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full border-2 border-gray-2 ${
            user.status === "Offline" ? "bg-slate-400" : "bg-success"
          }`}
        ></span>
      </div>

      <div className="w-full">
        <h5 className="text-sm font-medium text-black dark:text-white">
          {user.name}
        </h5>

        <p className="text-sm">{user.message}</p>
      </div>
    </div>
  );
}

export default ChatTab;
