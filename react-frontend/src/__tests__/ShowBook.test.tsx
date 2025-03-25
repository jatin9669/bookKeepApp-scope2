import React from "react";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { renderWithProviders } from "../test-utils";
import ShowBook from "../pages/ShowBook";
import axios from "axios";

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock React Router hooks and redux dispatch
const navigateMock = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ id: "1" }),
  useNavigate: () => navigateMock
}));

describe("ShowBook", () => {
  // Mock book data
  const mockBook = {
    id: 1,
    book_name: "Test Book",
    author_name: "Test Author",
    image_url: "http://example.com/test-image.jpg",
    total_quantity: 5,
    quantity: 1
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders book details correctly", () => {
    renderWithProviders(<ShowBook />, {
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
        books: {
          books: [mockBook],
          status: 'succeeded',
          error: null
        }
      }
    });

    // Check if book title and author are rendered
    expect(screen.getAllByText(mockBook.book_name)[0]).toBeInTheDocument();
    expect(screen.getByText(`by ${mockBook.author_name}`)).toBeInTheDocument();
    
    // Check if image is rendered
    const image = screen.getByAltText(mockBook.book_name);
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", mockBook.image_url);
    
    // Check if back button is present
    expect(screen.getByText("Back to books")).toBeInTheDocument();
  });

  it("shows 'Book not found' when book doesn't exist", () => {
    renderWithProviders(<ShowBook />, {
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
        books: {
          books: [], // Empty books array
          status: 'succeeded',
          error: null
        }
      }
    });

    expect(screen.getByText("Book not found")).toBeInTheDocument();
  });

  it("displays admin buttons for admin users", () => {
    renderWithProviders(<ShowBook />, {
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
        books: {
          books: [mockBook],
          status: 'succeeded',
          error: null
        }
      }
    });

    // Check if admin-only buttons are present
    expect(screen.getByText("Edit this book")).toBeInTheDocument();
    expect(screen.getByText("Destroy this book")).toBeInTheDocument();
  });

  it("doesn't display admin buttons for non-admin users", () => {
    renderWithProviders(<ShowBook />, {
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
        books: {
          books: [mockBook],
          status: 'succeeded',
          error: null
        }
      }
    });

    // Check that admin-only buttons are not present
    expect(screen.queryByText("Edit this book")).not.toBeInTheDocument();
    expect(screen.queryByText("Destroy this book")).not.toBeInTheDocument();
  });

  it("navigates to edit page when 'Edit this book' is clicked", () => {
    renderWithProviders(<ShowBook />, {
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
        books: {
          books: [mockBook],
          status: 'succeeded',
          error: null
        }
      }
    });

    // Click the Edit button
    const editButton = screen.getByText("Edit this book");
    fireEvent.click(editButton);

    // Check if navigation was called with correct path
    expect(navigateMock).toHaveBeenCalledWith("/edit/1");
  });

  it("navigates to home when 'Back to books' is clicked", () => {
    renderWithProviders(<ShowBook />, {
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
        books: {
          books: [mockBook],
          status: 'succeeded',
          error: null
        }
      }
    });

    // Click the Back button
    const backButton = screen.getByText("Back to books");
    fireEvent.click(backButton);

    // Check if navigation was called with correct path
    expect(navigateMock).toHaveBeenCalledWith("/");
  });

  it("handles book deletion correctly", async () => {
    // Mock window.confirm to return true
    const originalConfirm = window.confirm;
    window.confirm = jest.fn(() => true);
    
    // Mock successful API response
    mockedAxios.delete.mockResolvedValueOnce({ data: { success: true } });

    renderWithProviders(<ShowBook />, {
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
        books: {
          books: [mockBook],
          status: 'succeeded',
          error: null
        }
      }
    });

    // Click the Delete button
    const deleteButton = screen.getByText("Destroy this book");
    fireEvent.click(deleteButton);

    // Check if confirmation was shown
    expect(window.confirm).toHaveBeenCalledWith("Are you sure?");

    // Check if API was called with correct URL
    await waitFor(() => {
      expect(mockedAxios.delete).toHaveBeenCalledWith(
        "http://localhost:3000/api/v1/books/1",
        { withCredentials: true }
      );
    });

    // Check if navigation was called
    expect(navigateMock).toHaveBeenCalledWith("/");

    // Restore original window.confirm
    window.confirm = originalConfirm;
  });

  it("doesn't delete book when confirmation is cancelled", async () => {
    // Mock window.confirm to return false
    const originalConfirm = window.confirm;
    window.confirm = jest.fn(() => false);

    renderWithProviders(<ShowBook />, {
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
        books: {
          books: [mockBook],
          status: 'succeeded',
          error: null
        }
      }
    });

    // Click the Delete button
    const deleteButton = screen.getByText("Destroy this book");
    fireEvent.click(deleteButton);

    // Check if confirmation was shown
    expect(window.confirm).toHaveBeenCalledWith("Are you sure?");

    // Check that API was not called
    expect(mockedAxios.delete).not.toHaveBeenCalled();
    
    // Check that navigation was not called
    expect(navigateMock).not.toHaveBeenCalled();

    // Restore original window.confirm
    window.confirm = originalConfirm;
  });
}); 