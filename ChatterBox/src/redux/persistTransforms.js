import { createTransform } from "redux-persist";

export const conversationTransform = createTransform(
  (inboundState, key) => {
    const { current_messages, ...restDirectChat } = inboundState.direct_chat || {};
    return {
      ...inboundState,
      direct_chat: {
        ...restDirectChat,
        current_messages: [],
      },
    };
  },
  (outboundState, key) => {
    return {
      ...outboundState,
      direct_chat: {
        ...outboundState.direct_chat,
        current_messages: [],
      },
    };
  },
  { whitelist: ["conversation"] }
);

// Similarly, create a transform for app slice if needed
export const appTransform = createTransform(
  (inboundState, key) => {
    // For example, exclude large message arrays or modals that shouldn't persist
    const { current_messages, modals, ...rest } = inboundState || {};
    return {
      ...rest,
      current_messages: [],
      modals: {}, // reset modals on reload
    };
  },
  (outboundState, key) => {
    return {
      ...outboundState,
      current_messages: [],
      modals: {},
    };
  },
  { whitelist: ["app"] }
);
