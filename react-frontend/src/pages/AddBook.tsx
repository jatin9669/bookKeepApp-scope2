import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../data/store";
import { fetchAllBooks } from "../data/booksSlice";
import { setAlert, setNotice } from "../data/notificationSlice";

const Edit: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.user.user);
  const [books, setBooks] = useState({
    book_name: "",
    author_name: "",
    image_url: "",
    total_quantity: 0,
  });

  useEffect(()=> {
    if(!user.is_signed_in || !user.is_admin) {
      navigate("/");
      dispatch(setAlert("You are not authorized to add books"));
    }
  }, [user.is_signed_in, user.is_admin, navigate, dispatch]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setBooks((prev) => ({
      ...prev,
      [name]: name === "total_quantity" ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async () => {
    try {
      await axios.post(`http://localhost:3000/api/v1/books`, books, {
        withCredentials: true,
      });
      void dispatch(fetchAllBooks(""));
      dispatch(setNotice("Book added successfully!"));
      navigate(`/`);
    } catch (error: any) {
      dispatch(setAlert("Error adding book: " + (error.response?.data?.message || "Unknown error")));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:w-2/3 w-full">
        <h1 className="font-bold text-4xl mb-6">Create New Book</h1>

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
              Add Book
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Edit;
