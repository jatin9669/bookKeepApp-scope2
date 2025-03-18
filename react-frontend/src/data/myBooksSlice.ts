import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

interface MyBooks {
    id: number;
    user_id: number;
    book_id: number;
    quantity: number;
    name: string;
    email: string;
    book_name: string;
    author_name?: string;
    total_quantity: number;
    image_url?: string;
}

export const fetchMyBooks = createAsyncThunk("myBooks/fetchMyBooks", async (query: string) => {
    const response = await axios.get(`http://localhost:3000/api/v1/borrowed_books/my_books?query=${query}`, {
        withCredentials: true,
    });
    console.log("fetchMyBooks");
    console.log(response.data);
    return response.data;
});

const myBooksSlice = createSlice({
    name: "myBooks",
    initialState: {
        myBooks: [] as MyBooks[],
        status: "idle",
        error: null as string | null,
    },
    reducers: {
        resetMyBooks: (state) => {
            state.myBooks = [];
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchMyBooks.pending, (state) => {
            state.status = "loading";
        })
        .addCase(fetchMyBooks.fulfilled, (state, action) => {
            state.status = "succeeded";
            state.myBooks = action.payload;
        })
        .addCase(fetchMyBooks.rejected, (state, action) => {
            state.status = "failed";
            state.error = action.error.message ?? "Something went wrong";
        });
    },
});

export const { resetMyBooks } = myBooksSlice.actions;
export default myBooksSlice.reducer;