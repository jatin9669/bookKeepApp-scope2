import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

interface IssueRequest {
    id: number;
    book_id: number;
    user_id: number;
    quantity: number;
    created_at: string;
    book_name: string;
    author_name?: string;
    image_url?: string;
    total_quantity: number;
    name: string;
    email: string;
}

export const fetchAllIssueRequests = createAsyncThunk(
    "issueRequest/fetchAllIssueRequests",
    async () => {
        const response = await axios.get("http://localhost:3000/api/v1/issued_books", { withCredentials: true });
        console.log("issueRequestSlice");
        console.log(response.data);
        return response.data
    }
);

const issueRequestSlice = createSlice({
    name: "issueRequest",
    initialState: {
        issueRequest: [] as IssueRequest[],
        status: "idle",
        error: null as string | null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchAllIssueRequests.pending, (state) => {
            state.status = "loading";
        });
        builder.addCase(fetchAllIssueRequests.fulfilled, (state, action) => {
            state.status = "succeeded";
            state.issueRequest = action.payload;
        });
        builder.addCase(fetchAllIssueRequests.rejected, (state, action) => {
            state.status = "failed";
            state.error = action.error.message ?? "Something went wrong";
        });
    },
});

export default issueRequestSlice.reducer;
