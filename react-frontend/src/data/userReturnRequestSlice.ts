import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

interface UserReturnRequested {
    id: number;
    quantity: number;
    book_name: string;
    author_name: string;
    image_url: string;
    total_quantity: number;
    name: string;
    email: string;
    book_id: number;
    user_id: number;
}

export const fetchAllUserReturnRequest = createAsyncThunk("returnRequested/fetchAllUserReturnRequested", async (userId: number) => {
    const response = await axios.get(`http://localhost:3000/api/v1/borrowed_books/user/${userId}`, { 
        withCredentials: true 
    });
    console.log("fetchAllUserReturnRequested");
    console.log(response.data);
    return response.data
});

const userReturnRequestedSlice = createSlice({
    name: "userReturnRequested",
    initialState: {
        userReturnRequest: [] as UserReturnRequested[],
        status: "idle",
        error: null as string | null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchAllUserReturnRequest.pending, (state) => {
            state.status = "loading";
        });
        builder.addCase(fetchAllUserReturnRequest.fulfilled, (state, action) => {
            state.status = "succeeded";
            state.userReturnRequest = action.payload;
        });
        builder.addCase(fetchAllUserReturnRequest.rejected, (state, action) => {
            state.status = "failed";
            state.error = action.error.message || null;
        });
    },
});

export default userReturnRequestedSlice.reducer;

