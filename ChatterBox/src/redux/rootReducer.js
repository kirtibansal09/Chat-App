import { combineReducers } from "@reduxjs/toolkit";
import localStorage from "redux-persist/lib/storage";

const rootPersistConfig = {
  key: "root",
  localStorage,
  keyPrefix: "redux-",
};

const rootReducer = combineReducers({
  // TODO => Create and map Reducer
});

export { rootPersistConfig, rootReducer };
