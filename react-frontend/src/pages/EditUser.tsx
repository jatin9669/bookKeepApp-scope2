import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../data/store";
import { clearUser, setUser } from "../data/userSlice";
import { resetUserReturnRequest } from "../data/userReturnRequestSlice";
import { resetMyBooks } from "../data/myBooksSlice";
import { resetReturnRequest } from "../data/returnRequestSlice";
import { resetIssueRequest } from "../data/issueRequestSlice";
import { resetBooks } from "../data/booksSlice";
import { setNotice } from "../data/notificationSlice";
import { setAlert } from "../data/notificationSlice";

const EditUser: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  let user = useSelector((state: RootState) => state.user.user);
  const [currentUser, setCurrentUser] = useState({
    email: user.email,
    name: user.name,
    password: "",
    password_confirmation: "",
    current_password: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCurrentUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      await axios.put(
        `http://localhost:3000/api/v1/users/update_profile`,
        currentUser,
        {
          withCredentials: true,
        }
      );
      dispatch(setUser({
        id: user.id,
        email: currentUser.email,
        name: currentUser.name,
        is_admin: user.is_admin
      }));
      navigate(`/`);
      dispatch(setNotice("User updated successfully!"));
    } catch (error) {
      dispatch(setAlert("Error updating user: " + error));
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(
        `http://localhost:3000/api/v1/users/delete_account?current_password=${currentUser.current_password}`,
        {
          withCredentials: true,
        }
      );
      dispatch(clearUser());
      dispatch(resetBooks());
      dispatch(resetMyBooks());
      dispatch(resetUserReturnRequest());
      dispatch(resetReturnRequest());
      dispatch(resetIssueRequest());
      navigate(`/login`);
      dispatch(setNotice("User deleted successfully!"));
    } catch (error) {
      dispatch(setAlert("Error deleting user: " + error));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:w-2/3 w-full">
        <h1 className="font-bold text-4xl mb-6">Edit User</h1>

        <div
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
        >
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="name"
            >
              Name
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="name"
              type="text"
              name="name"
              value={currentUser.name}
              onChange={handleChange}
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="text"
              name="email"
              value={currentUser.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="text"
              name="password"
              onChange={handleChange}
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="password_confirmation"
            >
              Password Confirmation
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="password_confirmation"
              type="text"
              name="password_confirmation"
              onChange={handleChange}
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="current_password"
            >
              Current Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="current_password"
              type="text"
              name="current_password"
              onChange={handleChange}
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={handleSubmit}
            >
              Update
            </button>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={handleDelete}
          >
            Delete User
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditUser;
