import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

interface ReturnRequest {
    id: number;
    borrowed_book_id: number;
    quantity: number;
    created_at: string;
    book_name: string;
    author_name: string;
    image_url: string;
    total_quantity: number;
    name: string;
    email: string;
    book_id: number;
    user_id: number;
}

export const fetchAllReturnRequests = createAsyncThunk(
    "returnRequest/fetchAllReturnRequests",
    async (query: string) => {
        const response = await axios.get(`http://localhost:3000/api/v1/returned_books?query=${query}`, { withCredentials: true });
        console.log("returnRequestSlice");
        console.log(response.data);
        return response.data
    }
);

const returnRequestSlice = createSlice({
    name: "returnRequest",
    initialState: {
        returnRequest: [] as ReturnRequest[],
        status: "idle",
        error: null as string | null,
    },
    reducers: {
        resetReturnRequest: (state) => {
            state.returnRequest = [];
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchAllReturnRequests.pending, (state) => {
            state.status = "loading";
        });
        builder.addCase(fetchAllReturnRequests.fulfilled, (state, action) => {
            state.status = "succeeded";
            state.returnRequest = action.payload;
        });
        builder.addCase(fetchAllReturnRequests.rejected, (state, action) => {
            state.status = "failed";
            state.error = action.error.message ?? "Something went wrong";
        });
    },
});

export const { resetReturnRequest } = returnRequestSlice.actions;
export default returnRequestSlice.reducer;
