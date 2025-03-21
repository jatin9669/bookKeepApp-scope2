import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchAllBooks = createAsyncThunk("books/fetchBooks", async (query: string) => {
    const response = await axios.get(`http://localhost:3000/api/v1/books?query=${query}`, {
        withCredentials: true,
    });
    console.log("fetchAllBooks");
    console.log(response.data);
    return response.data.map((item: any) => ({
        id: item.id,
        book_name: item.book_name,
        author_name: item.author_name,
        total_quantity: item.total_quantity,
        image_url: item.image_url,
    }));
});

interface Book {
    id: number;
    book_name: string;
    author_name?: string;
    total_quantity: number;
    image_url?: string;
}

const booksSlice = createSlice({
    name: "books",
    initialState: {
        books: [] as Book[],
        status: "idle",
        error: null as string | null,
    },
    reducers: {
        resetBooks: (state) => {
            state.books = [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllBooks.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchAllBooks.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.books = action.payload;
            })
            .addCase(fetchAllBooks.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.error.message ?? "Something went wrong";
            });
    },
});

export const { resetBooks } = booksSlice.actions;
export default booksSlice.reducer;