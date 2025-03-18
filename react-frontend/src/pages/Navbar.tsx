import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { RootState } from "../data/store";
import axios from "axios";
import { fetchAllBooks, resetBooks } from "../data/booksSlice";
import { AppDispatch } from "../data/store";
import { fetchMyBooks, resetMyBooks } from "../data/myBooksSlice";
import {
  fetchAllReturnRequests,
  resetReturnRequest,
} from "../data/returnRequestSlice";
import {
  fetchAllUserReturnRequest,
  resetUserReturnRequest,
} from "../data/userReturnRequestSlice";
import {
  fetchAllIssueRequests,
  resetIssueRequest,
} from "../data/issueRequestSlice";
import { clearUser } from "../data/userSlice";
import { clearAlert, clearNotice } from "../data/notificationSlice";

const Navbar: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentUser = useSelector((state: RootState) => state.user.user);
  let lastLocation = useRef<string | null>(null);
  const isSignedIn = currentUser.is_signed_in;
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  let location = useLocation();
  let pathname = location.pathname;
  let timeInterval: ReturnType<typeof setTimeout> | null = null;

  const notification = useSelector((state: RootState) => state.notification);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (notification.notice) {
      timer = setTimeout(() => {
        dispatch(clearNotice());
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [notification.notice, dispatch]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (notification.alert) {
      timer = setTimeout(() => {
        dispatch(clearAlert());
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [notification.alert, dispatch]);

  useEffect(() => {
    if (lastLocation.current === "/") {
      void dispatch(fetchAllBooks(""));
    } else if (lastLocation.current === "/my-books") {
      void dispatch(fetchMyBooks(""));
    } else if (lastLocation.current === "/request-return") {
      void dispatch(
        fetchAllUserReturnRequest({ userId: currentUser.id, query: "" })
      );
    } else if (lastLocation.current === "/return-book-request") {
      void dispatch(fetchAllReturnRequests(""));
    } else if (lastLocation.current === "/issue-book-request") {
      void dispatch(fetchAllIssueRequests(""));
    }
    lastLocation.current = location.pathname;
    const searchInput = document.getElementById("search-input");
    if (searchInput) {
      (searchInput as HTMLInputElement).value = "";
    }
    setSearchText("");
  }, [location.pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        isDropdownOpen
      ) {
        setIsDropdownOpen(false);
      }
    }

    // Add event listener when dropdown is open
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Clean up the event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    if (timeInterval) clearTimeout(timeInterval);
    const value = e.target.value;
    setSearchText(value);
    timeInterval = setTimeout(() => {
      if (pathname === "/") {
        void dispatch(fetchAllBooks(value));
      } else if (pathname === "/my-books") {
        void dispatch(fetchMyBooks(value));
      } else if (pathname === "/request-return") {
        void dispatch(
          fetchAllUserReturnRequest({ userId: currentUser.id, query: value })
        );
      } else if (pathname === "/return-book-request") {
        void dispatch(fetchAllReturnRequests(value));
      } else if (pathname === "/issue-book-request") {
        void dispatch(fetchAllIssueRequests(value));
      }
    }, 1000);
  }

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    try {
      await axios.delete("http://localhost:3000/api/v1/users/logout", {
        withCredentials: true,
      });
      dispatch(resetBooks());
      dispatch(resetMyBooks());
      dispatch(resetUserReturnRequest());
      dispatch(resetReturnRequest());
      dispatch(resetIssueRequest());
      dispatch(clearUser());
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      {notification.notice && (
        <div className="fixed top-4 right-4 left-4 mx-auto max-w-md z-50 bg-green-50 border-l-4 border-green-500 p-4 rounded shadow-md animate-fade-in">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-800">{notification.message}</p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  onClick={() => dispatch(clearNotice())}
                  className="inline-flex rounded-md p-1.5 text-green-500 hover:bg-green-100 focus:outline-none"
                >
                  <span className="sr-only">Dismiss</span>
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {notification.alert && (
        <div className="fixed top-4 right-4 left-4 mx-auto max-w-md z-50 bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-md animate-fade-in">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9v4a1 1 0 102 0V9a1 1 0 10-2 0zm0-4a1 1 0 112 0 1 1 0 01-2 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{notification.message}</p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  onClick={() => dispatch(clearAlert())}
                  className="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none"
                >
                  <span className="sr-only">Dismiss</span>
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              {/* Logo/Home Link */}
              <Link to="/" className="flex items-center">
                <span className="text-xl font-bold text-white">BookKeeper</span>
              </Link>

              {/* Navigation Links */}
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {isSignedIn && currentUser && !currentUser.is_admin && (
                  <Link
                    to="/my-books"
                    className="text-white hover:text-indigo-200 px-3 py-2 rounded-md text-sm font-medium transition duration-150"
                  >
                    My Collection
                  </Link>
                )}
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {isSignedIn && currentUser && !currentUser.is_admin && (
                  <Link
                    to="/request-return"
                    className="text-white hover:text-indigo-200 px-3 py-2 rounded-md text-sm font-medium transition duration-150"
                  >
                    Request Return
                  </Link>
                )}
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-lg flex items-center justify-center px-4">
              <div className="w-full">
                <div className="relative w-full">
                  <input
                    type="text"
                    value={searchText}
                    onChange={handleSearch}
                    className="w-full h-10 rounded-full border-2 border-indigo-200 bg-white/90 backdrop-blur-sm px-4 py-2 pr-10 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
                    placeholder={`Search books...`}
                    id="search-input"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg
                      className="h-5 w-5 text-indigo-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Auth Links */}
            <div className="flex items-center">
              {isSignedIn && currentUser && currentUser.is_admin && (
                <>
                  <Link
                    to="/return-book-request"
                    className="text-white hover:text-indigo-200 px-3 py-2 rounded-md text-sm font-medium transition duration-150"
                  >
                    Return Books Requests
                  </Link>
                  <Link
                    to="/issue-book-request"
                    className="text-white hover:text-indigo-200 px-3 py-2 rounded-md text-sm font-medium transition duration-150"
                  >
                    Issue Books Requests
                  </Link>
                </>
              )}

              {isSignedIn ? (
                <div className="relative ml-3" ref={dropdownRef}>
                  <div>
                    <button
                      type="button"
                      className="flex items-center max-w-xs rounded-full bg-white/10 p-1 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600 transition-all duration-150 cursor-pointer hover:bg-white/20 group"
                      onClick={toggleDropdown}
                      title="Account Menu"
                    >
                      <span className="sr-only">Open user menu</span>
                      {/* User Circle Icon */}
                      <svg
                        className="h-8 w-8 rounded-full text-white group-hover:scale-110 transition-transform duration-150"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>

                      {/* Optional: Add email preview on hover */}
                      <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none">
                        {currentUser.email}
                      </span>
                    </button>
                  </div>

                  {isDropdownOpen && (
                    <div
                      className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-lg bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="user-menu-button"
                    >
                      <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                        Signed in as
                        <br />
                        <span className="font-medium">{currentUser.email}</span>
                      </div>
                      <Link
                        to="/user/edit"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsDropdownOpen(false)}
                        role="menuitem"
                      >
                        Account Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium transition duration-150"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="ml-4 bg-white text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-full text-sm font-medium transition duration-150"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
