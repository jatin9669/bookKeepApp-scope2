import { createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
    name: "notification",
    initialState: {
        message: "",
        notice: false,
        alert: false,
    },
    reducers: {
        setNotice: (state, action) => {
            state.message = action.payload;
            state.notice = true;
        },
        setAlert: (state, action) => {
            state.message = action.payload;
            state.alert = true;
        },
        clearNotice: (state) => {
            state.notice = false;
            state.message = "";
        },
        clearAlert: (state) => {
            state.alert = false;
            state.message = "";
        },
    },
});

export const { setNotice, setAlert, clearNotice, clearAlert } = notificationSlice.actions;
export default notificationSlice.reducer;
