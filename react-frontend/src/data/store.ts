import { configureStore } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage"; // Uses localStorage
import { persistReducer, persistStore } from "redux-persist";
import { combineReducers } from "redux";

import bookReducer from "./booksSlice";
import userReducer from "./userSlice";
import myBooksReducer from "./myBooksSlice";
import userReturnRequestedReducer from "./userReturnRequestSlice";
import issueRequestedReducer from "./issueRequestSlice";
import returnRequestReducer from "./returnRequestSlice";
import notificationReducer from "./notificationSlice";
// Combine reducers
const rootReducer = combineReducers({
    books: bookReducer,
    user: userReducer,
    myBooks: myBooksReducer,
    userReturnRequest: userReturnRequestedReducer,
    issueRequested: issueRequestedReducer,
    returnRequest: returnRequestReducer,
    notification: notificationReducer,
});

// Configure persist
const persistConfig = {
    key: "root",
    storage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
