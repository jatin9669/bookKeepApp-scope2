import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../data/store";
import { fetchAllIssueRequests } from "../data/issueRequestSlice";
import { fetchAllReturnRequests } from "../data/returnRequestSlice";
import { fetchAllBooks } from "../data/booksSlice";
import { setAlert } from "../data/notificationSlice";
import { setNotice } from "../data/notificationSlice";

interface Book {
  id: number;
  book_name: string;
  author_name: string;
  image_url: string;
  total_quantity: number;
}

const EditBook: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.user.user);
  let book = useSelector((state: RootState) =>
    state.books.books.find((book) => book.id === parseInt(id || "1"))
  );

  // Fallback book object if `book` is not found
  if (!book) {
    book = {
      id: 1,
      book_name: "",
      author_name: "",
      image_url: "",
      total_quantity: 0,
    };
  }

  const [books, setBooks] = useState<Book>({
    id: book.id,
    book_name: book.book_name || "",
    author_name: book.author_name || "",
    image_url: book.image_url || "",
    total_quantity: book.total_quantity || 0,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setBooks((prev) => ({
      ...prev,
      [name]: name === "total_quantity" ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      await axios.put(`http://localhost:3000/api/v1/books/${id}`, books, {
        withCredentials: true,
      });
      void dispatch(fetchAllBooks(""));
      void dispatch(fetchAllIssueRequests(""));
      void dispatch(fetchAllReturnRequests(""));
      navigate(`/`);
      dispatch(setNotice("Book updated successfully!"));
    } catch (error: any) {
      dispatch(setAlert("Error updating book: " + (error.response?.data?.message || "Unknown error")));
    }
  };

  useEffect(()=> {
    if(!user.is_signed_in || !user.is_admin) {
      navigate("/");
      dispatch(setAlert("You are not authorized to edit books"));
    }
  }, [user.is_signed_in, user.is_admin, navigate, dispatch]);

  useEffect(() => {
    if (!book) {
      navigate("/");
    }
  }, [book]);

  if (!book) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-slate-100">
      <div className="md:w-2/3 w-full">
        <h1 className="font-bold text-4xl mb-6">Editing book</h1>

        <div
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
        >
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="book_name"
            >
              Book Name
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="book_name"
              type="text"
              name="book_name"
              value={books.book_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="author_name"
            >
              Author Name
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="author_name"
              type="text"
              name="author_name"
              value={books.author_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="image_url"
            >
              Image URL
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="image_url"
              type="text"
              name="image_url"
              value={books.image_url}
              onChange={handleChange}
            />
          </div>

          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="total_quantity"
            >
              Total Quantity
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="total_quantity"
              type="number"
              name="total_quantity"
              min="0"
              value={books.total_quantity}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={handleSubmit}
            >
              Update Book
            </button>
          </div>
        </div>

        <div className="flex space-x-2">
          <Link
            to={`/book/${id}`}
            className="ml-2 rounded-md px-3.5 py-2.5 bg-gray-100 hover:bg-gray-50 inline-block font-medium"
          >
            Show this book
          </Link>
          <Link
            to={`/`}
            className="ml-2 rounded-md px-3.5 py-2.5 bg-gray-100 hover:bg-gray-50 inline-block font-medium"
          >
            Back to books
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EditBook;
