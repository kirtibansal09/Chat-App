import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Trash } from '@phosphor-icons/react';

const ChatTabDropdown = ({
  isOpen,
  onClose,
  triggerRef,
  onRemoveFriend,
  isLoading
}) => {
  const dropdownRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  // Calculate position relative to trigger button
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const dropdownWidth = 192; // w-48 = 12rem = 192px
      const dropdownHeight = 48; // Approximate height for 1 button

      let top = triggerRect.top - dropdownHeight - 8; // Position above with 8px gap
      let left = triggerRect.right - dropdownWidth; // Align right edge

      // Ensure dropdown doesn't go off screen
      if (top < 8) {
        top = triggerRect.bottom + 8; // Position below if no space above
      }

      if (left < 8) {
        left = 8; // Ensure minimum left margin
      }

      if (left + dropdownWidth > window.innerWidth - 8) {
        left = window.innerWidth - dropdownWidth - 8; // Ensure doesn't go off right edge
      }

      setPosition({ top, left });
    }
  }, [isOpen, triggerRef]);

  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose, triggerRef]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={dropdownRef}
      className="fixed z-999999 w-48 space-y-1 rounded-sm border border-stroke bg-white p-1.5 shadow-default dark:border-strokedark dark:bg-boxdark"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <button
        className="flex w-full items-center gap-2 rounded-sm px-4 py-1.5 text-left text-sm hover:bg-gray-2 dark:hover:bg-boxdark-2 text-red-500"
        onClick={onRemoveFriend}
        disabled={isLoading}
      >
        <Trash size={16} />
        {isLoading ? "Removing..." : "Remove Friend"}
      </button>
    </div>,
    document.body
  );
};

export default ChatTabDropdown;
