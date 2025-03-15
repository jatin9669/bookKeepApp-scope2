import {createSlice} from "@reduxjs/toolkit"

interface User {
    id: number;
    email: string;
    name: string;
    is_admin: boolean;
    is_signed_in: boolean;
}

const userSlice = createSlice({
    name: "user",
    initialState: {
        user: {} as User,
    },
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
            state.user.is_signed_in = true;
        },
        clearUser: (state) => {
            state.user = {} as User;
            state.user.is_signed_in = false;
        },
    },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;