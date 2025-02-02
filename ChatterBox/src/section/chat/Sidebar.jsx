import { Chat, SignOut } from "@phosphor-icons/react";

const Sidebar = () => {
  return (
    <div className="flex flex-col border-r border-stroke p-2 dark:border-strokedark">
      <div className="mx-auto border border-stroke p-2 dark:border-strokedark rounded-md">
        <Chat size={24}/>
      </div>
      <div className="flex-grow"></div>

      <div>
        <div className="mx-auto border rounded-md border-stroke p-2 dark:border-strokedark hover:cursor-pointer hover:bg-stone-100">
          <SignOut size={24} />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
