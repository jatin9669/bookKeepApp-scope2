import React from "react";
import { screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { renderWithProviders } from "../test-utils";
import MyBooks from "../pages/MyBooks";
import { setAlert } from "../data/notificationSlice";

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

// Mock React Router hooks and redux dispatch
const navigateMock = jest.fn();
const dispatchMock = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => navigateMock
}));

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: () => dispatchMock
}));

describe("MyBooks", () => {
  const mockBooks = [
    {
      id: 1,
      book_id: 101,
      book_name: "My Test Book 1",
      author_name: "Author 1",
      image_url: "http://example.com/image1.jpg",
      quantity: 1,
      user_id: 1,
      name: "John Doe",
      email: "john@example.com",
      total_quantity: 10
    },
    {
      id: 2,
      book_id: 102,
      book_name: "My Test Book 2",
      author_name: "Author 2",
      image_url: "http://example.com/image2.jpg",
      quantity: 2,
      user_id: 1,
      name: "Jane Smith",
      email: "jane@example.com",
      total_quantity: 10
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders user's books when available", () => {
    renderWithProviders(<MyBooks />, {
      preloadedState: {
        user: { 
          user: {
            id: 1,
            email: "user@example.com",
            name: "Regular User",
            is_admin: false,
            is_signed_in: true
          }
        },
        myBooks: {
          myBooks: mockBooks,
          status: 'succeeded',
          error: null
        }
      }
    });

    // Check page title
    expect(screen.getByText("My Books")).toBeInTheDocument();
    
    // Check if book titles are rendered
    expect(screen.getByText("My Test Book 1")).toBeInTheDocument();
    expect(screen.getByText("My Test Book 2")).toBeInTheDocument();
  });

  it("shows 'No books found' message when no books are available", () => {
    renderWithProviders(<MyBooks />, {
      preloadedState: {
        user: { 
          user: {
            id: 1,
            email: "user@example.com",
            name: "Regular User",
            is_admin: false,
            is_signed_in: true
          }
        },
        myBooks: {
          myBooks: [],
          status: 'succeeded',
          error: null
        }
      }
    });

    // Check for No books found message
    expect(screen.getByText("No books found")).toBeInTheDocument();
  });

  it("redirects non-signed-in users to home page", () => {
    renderWithProviders(<MyBooks />, {
      preloadedState: {
        user: { 
          user: {
            id: 0,
            email: "",
            name: "",
            is_admin: false,
            is_signed_in: false
          }
        },
        myBooks: {
          myBooks: [],
          status: 'succeeded',
          error: null
        }
      }
    });

    // Check that navigate was called with "/"
    expect(navigateMock).toHaveBeenCalledWith("/");
  });

  it("redirects admin users to home page with message", () => {
    renderWithProviders(<MyBooks />, {
      preloadedState: {
        user: { 
          user: {
            id: 1,
            email: "admin@example.com",
            name: "Admin User",
            is_admin: true,
            is_signed_in: true
          }
        },
        myBooks: {
          myBooks: [],
          status: 'succeeded',
          error: null
        }
      }
    });

    // Check that navigate was called with "/"
    expect(navigateMock).toHaveBeenCalledWith("/");
    expect(dispatchMock).toHaveBeenCalledWith(setAlert("Admins don't have collections of books"));
  });
}); 