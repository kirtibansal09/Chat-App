import { ChatTeardropText } from "@phosphor-icons/react";

function Logo() {
  return (
    <div className="flex flex-row items-center space-x-2">
      <ChatTeardropText size={32} weight="bold" />
      <div className="text-2xl font-medium text-body dark:text-white">ChatterBox</div>
    </div>
  );
}

export default Logo;
