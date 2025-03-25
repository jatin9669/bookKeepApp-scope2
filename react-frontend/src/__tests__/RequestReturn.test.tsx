import React from "react";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { renderWithProviders } from "../test-utils";
import RequestReturn from "../pages/RequestReturn";
import axios from "axios";

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

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

describe("RequestReturn", () => {
  const mockBorrowedBooks = [
    {
      id: 1,
      book_id: 101,
      book_name: "Test Book 1",
      author_name: "Author 1",
      image_url: "http://example.com/image1.jpg",
      quantity: 2,
      user_id: 1,
      total_quantity: 10,
      name: "John Doe",
      email: "john@example.com"
    },
    {
      id: 2,
      book_id: 102,
      book_name: "Test Book 2",
      author_name: "Author 2",
      image_url: "http://example.com/image2.jpg",
      quantity: 3,
      user_id: 1,
      total_quantity: 10,
      name: "Jane Smith",
      email: "jane@example.com"
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders user's borrowed books for return", () => {
    renderWithProviders(<RequestReturn />, {
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
        userReturnRequest: {
          userReturnRequest: mockBorrowedBooks,
          status: 'succeeded',
          error: null
        }
      }
    });

    // Check page title
    expect(screen.getByText("Books to return")).toBeInTheDocument();
    
    // Check if book titles are rendered
    expect(screen.getByText("Test Book 1")).toBeInTheDocument();
    expect(screen.getByText("Test Book 2")).toBeInTheDocument();
    
    // Check if "Request to Return" buttons are present
    const requestButtons = screen.getAllByText("Request to Return");
    expect(requestButtons.length).toBe(2);
  });

  it("shows 'No books found' message when no borrowed books are available", () => {
    renderWithProviders(<RequestReturn />, {
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
        userReturnRequest: {
          userReturnRequest: [],
          status: 'succeeded',
          error: null
        }
      }
    });

    expect(screen.getByText("No books found")).toBeInTheDocument();
  });

  it("redirects non-signed-in users to home page", () => {
    renderWithProviders(<RequestReturn />, {
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
        userReturnRequest: {
          userReturnRequest: [],
          status: 'succeeded',
          error: null
        }
      }
    });

    // Check that navigate was called with "/"
    expect(navigateMock).toHaveBeenCalledWith("/");
  });

  it("redirects admin users to home page with message", () => {
    renderWithProviders(<RequestReturn />, {
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
        userReturnRequest: {
          userReturnRequest: [],
          status: 'succeeded',
          error: null
        }
      }
    });

    // Check that navigate was called with "/"
    expect(navigateMock).toHaveBeenCalledWith("/");
    expect(dispatchMock).toHaveBeenCalledWith(expect.objectContaining({
      payload: "You are not authorized to return books"
    }));
  });

  it("shows quantity controls when 'Request to Return' is clicked", () => {
    renderWithProviders(<RequestReturn />, {
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
        userReturnRequest: {
          userReturnRequest: mockBorrowedBooks,
          status: 'succeeded',
          error: null
        }
      }
    });

    // Click the "Request to Return" button for the first book
    const requestButtons = screen.getAllByText("Request to Return");
    fireEvent.click(requestButtons[0]);

    // Check if quantity controls and confirm button appear
    expect(screen.getByText("Confirm Return")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument(); // Initial quantity
    expect(screen.getByText("+")).toBeInTheDocument();
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("allows incrementing and decrementing quantity", () => {
    renderWithProviders(<RequestReturn />, {
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
        userReturnRequest: {
          userReturnRequest: mockBorrowedBooks,
          status: 'succeeded',
          error: null
        }
      }
    });

    // Click the "Request to Return" button
    const requestButtons = screen.getAllByText("Request to Return");
    fireEvent.click(requestButtons[0]);

    // Initial quantity should be 1
    expect(screen.getByText("1")).toBeInTheDocument();

    // Increment quantity
    const incrementButton = screen.getByText("+");
    fireEvent.click(incrementButton);
    expect(screen.getByText("2")).toBeInTheDocument();

    // Try to increment beyond max (should stay at max)
    fireEvent.click(incrementButton);
    expect(screen.getByText("2")).toBeInTheDocument(); // Max quantity for first book is 2

    // Decrement quantity
    const decrementButton = screen.getByText("-");
    fireEvent.click(decrementButton);
    expect(screen.getByText("1")).toBeInTheDocument();

    // Try to decrement below 1 (should stay at 1)
    fireEvent.click(decrementButton);
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("handles confirm return functionality", async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { success: true } });

    renderWithProviders(<RequestReturn />, {
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
        userReturnRequest: {
          userReturnRequest: mockBorrowedBooks,
          status: 'succeeded',
          error: null
        }
      }
    });

    // Click the "Request to Return" button
    const requestButtons = screen.getAllByText("Request to Return");
    fireEvent.click(requestButtons[0]);

    // Click the "Confirm Return" button
    const confirmButton = screen.getByText("Confirm Return");
    fireEvent.click(confirmButton);

    // Check if API call was made with correct parameters
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        "http://localhost:3000/api/v1/returned_books",
        {
          borrowed_book_id: 1,
          quantity: 1
        },
        { withCredentials: true }
      );
    });
  });
}); 