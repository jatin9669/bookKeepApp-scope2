import React from "react";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { renderWithProviders } from "../test-utils";
import EditBook from "../pages/EditBook";
import axios from "axios";

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock React Router hooks
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ id: "1" }),
  useNavigate: () => jest.fn()
}));

describe("EditBook", () => {
  const mockBook = {
    id: 1,
    book_name: "Test Book 1",
    author_name: "Author 1",
    total_quantity: 5,
    image_url: "http://example.com/image1.jpg",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders form with book data for admin users", async () => {
    // Render with pre-authenticated admin user state and preloaded book data
    renderWithProviders(<EditBook />, {
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

    // Verify form fields are populated with book data
    expect(screen.getByLabelText(/Book Name/i)).toHaveValue("Test Book 1");
    expect(screen.getByLabelText(/Author Name/i)).toHaveValue("Author 1");
    expect(screen.getByLabelText(/Image URL/i)).toHaveValue("http://example.com/image1.jpg");
    expect(screen.getByLabelText(/Total Quantity/i)).toHaveValue(5);
    
    // Verify buttons are present
    expect(screen.getByText("Update Book")).toBeInTheDocument();
    expect(screen.getByText("Show this book")).toBeInTheDocument();
    expect(screen.getByText("Back to books")).toBeInTheDocument();
  });

  it("redirects non-admin users", async () => {
    // Create a mock navigate function we can track
    const navigateMock = jest.fn();
    
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockImplementation(() => navigateMock);

    renderWithProviders(<EditBook />, {
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

    // Check that navigate was called with "/"
    expect(navigateMock).toHaveBeenCalledWith("/");
  });

  it("allows changing book information", async () => {
    renderWithProviders(<EditBook />, {
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

    // Change book name
    const bookNameInput = screen.getByLabelText(/Book Name/i);
    fireEvent.change(bookNameInput, { target: { value: "Updated Book Title" } });
    expect(bookNameInput).toHaveValue("Updated Book Title");

    // Change author name
    const authorNameInput = screen.getByLabelText(/Author Name/i);
    fireEvent.change(authorNameInput, { target: { value: "Updated Author" } });
    expect(authorNameInput).toHaveValue("Updated Author");
    
    // Change quantity
    const quantityInput = screen.getByLabelText(/Total Quantity/i);
    fireEvent.change(quantityInput, { target: { value: "10" } });
    expect(quantityInput).toHaveValue(10);
  });

  it("submits updated book information", async () => {
    mockedAxios.put.mockResolvedValueOnce({ data: { ...mockBook, book_name: "Updated Book Title" } });
    
    renderWithProviders(<EditBook />, {
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

    // Change book name
    const bookNameInput = screen.getByLabelText(/Book Name/i);
    fireEvent.change(bookNameInput, { target: { value: "Updated Book Title" } });
    
    // Submit the form
    const updateButton = screen.getByText("Update Book");
    fireEvent.click(updateButton);
    
    // Check if API call was made with correct parameters
    await waitFor(() => {
      expect(mockedAxios.put).toHaveBeenCalledWith(
        "http://localhost:3000/api/v1/books/1",
        expect.objectContaining({
          book_name: "Updated Book Title",
          author_name: "Author 1",
          total_quantity: 5,
          image_url: "http://example.com/image1.jpg",
        }),
        { withCredentials: true }
      );
    });
  });
});
