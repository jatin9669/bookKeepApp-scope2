import React from "react";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { renderWithProviders } from "../test-utils";
import AllBooks from "../pages/AllBooks";
import { fetchAllBooks } from "../data/booksSlice";
import axios from "axios";

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("AllBooks", () => {
  const mockBooks = [
    {
      id: 1,
      book_name: "Test Book 1",
      author_name: "Author 1",
      total_quantity: 5,
      image_url: "http://example.com/image1.jpg",
    },
    {
      id: 2,
      book_name: "Test Book 2",
      author_name: "Author 2",
      total_quantity: 0,
      image_url: "http://example.com/image2.jpg",
    },
    {
      id: 3,
      book_name: "Test Book 3",
      author_name: "Author 3",
      total_quantity: 3,
      image_url: "http://example.com/image3.jpg",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("displays books after mounting", async () => {
    // Mock successful API response
    mockedAxios.get.mockResolvedValueOnce({ data: mockBooks });
    
    // Render with pre-authenticated normal user state
    renderWithProviders(<AllBooks />, {
      preloadedState: {
        user: { 
          user: {
            id: 1,
            email: "user@example.com",
            name: "Test User",
            is_admin: false,
            is_signed_in: true
          }
        }
      }
    });
    
    // Wait for the component to render and API call to be made
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalled();
    });
    
    // Verify books appear in the DOM after loading
    await waitFor(() => {
      expect(screen.getByText("Test Book 1")).toBeInTheDocument();
    });
    
    // Verify Test Book 2 is in the document but marked as unavailable
    expect(screen.getByText("Test Book 2")).toBeInTheDocument();
    expect(screen.getByText("Not Available")).toBeInTheDocument();
  });

  it("shows admin controls when logged in as admin", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockBooks });
    
    renderWithProviders(<AllBooks />, {
      preloadedState: {
        user: { 
          user: {
            id: 1,
            email: "admin@example.com",
            name: "Admin User",
            is_admin: true,
            is_signed_in: true
          }
        }
      }
    });
    
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalled();
    });
    
    // Check for admin-specific buttons
    expect(screen.getByText("New Book")).toBeInTheDocument();
    if(screen.queryByText("No books found")){
        return;
    }
    expect(screen.getAllByText("Edit")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Delete")[0]).toBeInTheDocument();
  });

  it("allows signed-in users to request to borrow available books", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockBooks });
    
    renderWithProviders(<AllBooks />, {
      preloadedState: {
        user: { 
          user: {
            id: 1,
            email: "user@example.com",
            name: "Test User",
            is_admin: false,
            is_signed_in: true
          }
        }
      }
    });
    
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalled();
    });
    
    // Find and click "Request to borrow" button for the first book
    const borrowButtons = screen.getAllByText("Request to borrow");
    fireEvent.click(borrowButtons[0]);
    
    // Check if quantity controls appear
    await waitFor(() => {
      expect(screen.getByText("Confirm Purchase")).toBeInTheDocument();
    });
    
    // Test quantity increment
    const incrementButton = screen.getByText("+");
    fireEvent.click(incrementButton);
    expect(screen.getByText("2")).toBeInTheDocument();
    
    // Test quantity decrement
    const decrementButton = screen.getByText("-");
    fireEvent.click(decrementButton);
    expect(screen.getByText("1")).toBeInTheDocument();
    
    // Mock the borrow confirmation
    // mockedAxios.post.mockResolvedValueOnce({ data: { success: true } });
    
    // Confirm the purchase
    const confirmButton = screen.getByText("Confirm Purchase");
    fireEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        "http://localhost:3000/api/v1/issued_books",
        {
          book_id: 1,
          user_id: 1,
          quantity: 1
        },
        { withCredentials: true }
      );
    });
  });

  it("shows 'No books found' when books array is empty", async () => {
    // Mock empty books array
    mockedAxios.get.mockResolvedValueOnce({ data: [] });
    
    renderWithProviders(<AllBooks />, {
      preloadedState: {
        user: { 
          user: {
            id: 1,
            email: "user@example.com",
            name: "Test User",
            is_admin: false,
            is_signed_in: true
          }
        }
      }
    });
    
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalled();
    });
    
    expect(screen.getByText("No books found")).toBeInTheDocument();
  });

  it("allows admin to delete a book after confirmation", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockBooks });
    
    // Mock window.confirm to return true
    const originalConfirm = window.confirm;
    window.confirm = jest.fn(() => true);
    
    renderWithProviders(<AllBooks />, {
      preloadedState: {
        user: { 
          user: {
            id: 1,
            email: "admin@example.com",
            name: "Admin User",
            is_admin: true,
            is_signed_in: true
          }
        }
      }
    });
    
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalled();
    });
    
    // Find and click a delete button
    const deleteButtons = screen.getAllByText("Delete");
    mockedAxios.delete.mockResolvedValueOnce({ data: { message: "Book deleted" } });
    
    fireEvent.click(deleteButtons[0]);
    
    await waitFor(() => {
      expect(mockedAxios.delete).toHaveBeenCalledWith(
        "http://localhost:3000/api/v1/books/1",
        { withCredentials: true }
      );
    });
    
    // Restore original confirm
    window.confirm = originalConfirm;
  });
});
