import React from "react";
import extractLinks from "../../utils/extractLinks";
import Microlink from "@microlink/react";
import { Check, Checks, Phone } from "@phosphor-icons/react";
import { useSelector } from "react-redux";

function Text({ incoming, author, timestamp, messageId, content, isSystem }) {
  const { links, originalString } = extractLinks(content);
  const appState = useSelector((state) => state.app);
  const messageStatus = appState?.messageStatus?.[messageId] || "sent";
  const currentUser = useSelector((state) => state.auth.user);

  const isOwnMessage = author._id === currentUser._id;

  const getStatusIcon = () => {
    if (!isOwnMessage) return null;

    switch (messageStatus) {
      case 'sent':
        return <Check size={16} className="text-gray-400" />;
      case 'delivered':
        return <Checks size={16} className="text-gray-400" />;
      case 'read':
        return <Checks size={16} className="text-blue-500" />;
      default:
        return <Check size={16} className="text-gray-400" />;
    }
  };

  if (isSystem) {
    // Special style for missed call/system messages
    return (
      <div className={`max-w-125 ${incoming ? '' : 'ml-auto'}`}>
        <div className={`mb-2.5 rounded-2xl px-5 py-3 flex items-center gap-2 border-2 border-danger bg-meta-1/10`}>
          <Phone size={20} className="text-danger" />
          <div>
            <p className="font-semibold text-danger">{content}</p>
            <span className="block text-xs text-gray-500 mt-1">{new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>
    );
  }

  return incoming ? (
    <div className="max-w-125">
      <p className="mb-2.5 text-sm font-medium">{author}</p>
      <div className="mb-2.5 rounded-2xl rounded-tl-none bg-gray px-5 py-3 dark:bg-boxdark-2 space-y-2">
        <p dangerouslySetInnerHTML={{ __html: originalString }}></p>
        {links.length > 0 && (
          <Microlink style={{ width: "100%" }} url={links[0]} />
        )}
      </div>
      <div className="flex items-center gap-1 mt-1">
        <span className="text-xs text-gray-500">
          {new Date(timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
        {getStatusIcon()}
      </div>
    </div>
  ) : (
    <div className="max-w-125 ml-auto">
      <div className="mb-2.5 rounded-2xl rounded-br-none bg-primary px-5 py-3 space-y-2">
        <p
          className="text-white "
          dangerouslySetInnerHTML={{ __html: originalString }}
        ></p>
        {links.length > 0 && (
          <Microlink style={{ width: "100%" }} url={links[0]} />
        )}
      </div>

      <div className="flex flex-row items-center justify-end space-x-2">
        <div className={`${messageStatus !== 'read' ? "text-body dark:text-white" : "text-primary"}`}>
          {messageStatus !== 'sent' ? (
            <Checks weight="bold" size={18} />
          ) : (
            <Check weight="bold" size={18} />
          )}
        </div>
        <p className="text-xs">{new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
      </div>
    </div>
  );
}

export default Text;



// Single Tick - Sent
// Two Tick - gray - Delivered but not read
// Two Tick - blue - Read