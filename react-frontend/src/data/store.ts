import { configureStore } from "@reduxjs/toolkit";
import bookReducer from "./booksSlice";
import userReducer from "./userSlice";
import myBooksReducer from "./myBooksSlice";
import userReturnRequestedReducer from "./userReturnRequestSlice";
import issueRequestedReducer from "./issueRequestSlice";
import returnRequestReducer from "./returnRequestSlice";

export const store = configureStore({
    reducer: {
        books: bookReducer,
        user: userReducer,
        myBooks: myBooksReducer,
        userReturnRequest: userReturnRequestedReducer,
        issueRequested: issueRequestedReducer,
        returnRequest: returnRequestReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

