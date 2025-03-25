import React from "react";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { renderWithProviders } from "../test-utils";
import AddBook from "../pages/AddBook";
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

describe("AddBook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders book form correctly for admin users", () => {
    renderWithProviders(<AddBook />, {
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

    // Check for form elements
    expect(screen.getByLabelText(/book name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/author name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/image url/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/total quantity/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add book/i })).toBeInTheDocument();
  });

  it("redirects non-admin users to home page", () => {
    renderWithProviders(<AddBook />, {
      preloadedState: {
        user: { 
          user: {
            id: 1,
            email: "user@example.com",
            name: "Regular User",
            is_admin: false,
            is_signed_in: true
          }
        }
      }
    });

    // Check that navigate was called with "/"
    expect(navigateMock).toHaveBeenCalledWith("/");
    expect(dispatchMock).toHaveBeenCalledWith(expect.objectContaining({
      payload: "You are not authorized to add books"
    }));
  });

  it("redirects non-signed-in users to home page", () => {
    renderWithProviders(<AddBook />, {
      preloadedState: {
        user: { 
          user: {
            id: 0,
            email: "",
            name: "",
            is_admin: false,
            is_signed_in: false
          }
        }
      }
    });

    // Check that navigate was called with "/"
    expect(navigateMock).toHaveBeenCalledWith("/");
  });

  it("handles form input changes", () => {
    renderWithProviders(<AddBook />, {
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

    // Get form elements
    const bookNameInput = screen.getByLabelText(/book name/i);
    const authorNameInput = screen.getByLabelText(/author name/i);
    const imageUrlInput = screen.getByLabelText(/image url/i);
    const totalQuantityInput = screen.getByLabelText(/total quantity/i);

    // Test inputs
    fireEvent.change(bookNameInput, { target: { value: "Test Book" } });
    expect(bookNameInput).toHaveValue("Test Book");

    fireEvent.change(authorNameInput, { target: { value: "Test Author" } });
    expect(authorNameInput).toHaveValue("Test Author");

    fireEvent.change(imageUrlInput, { target: { value: "http://example.com/test.jpg" } });
    expect(imageUrlInput).toHaveValue("http://example.com/test.jpg");

    fireEvent.change(totalQuantityInput, { target: { value: "10" } });
    expect(totalQuantityInput).toHaveValue(10);
  });

  it("handles successful book submission", async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { success: true } });

    renderWithProviders(<AddBook />, {
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

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/book name/i), { target: { value: "New Book" } });
    fireEvent.change(screen.getByLabelText(/author name/i), { target: { value: "New Author" } });
    fireEvent.change(screen.getByLabelText(/image url/i), { target: { value: "http://example.com/new.jpg" } });
    fireEvent.change(screen.getByLabelText(/total quantity/i), { target: { value: "5" } });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /add book/i }));

    // Check API call
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        "http://localhost:3000/api/v1/books",
        {
          book_name: "New Book",
          author_name: "New Author",
          image_url: "http://example.com/new.jpg",
          total_quantity: 5
        },
        { withCredentials: true }
      );
    });

    // Check navigation
    expect(navigateMock).toHaveBeenCalledWith("/");
  });

  it("handles book submission failure", async () => {
    mockedAxios.post.mockRejectedValueOnce({
      response: {
        data: {
          message: "Book name is required"
        }
      }
    });

    renderWithProviders(<AddBook />, {
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

    // Fill out the form partially (missing book name)
    fireEvent.change(screen.getByLabelText(/author name/i), { target: { value: "New Author" } });
    fireEvent.change(screen.getByLabelText(/total quantity/i), { target: { value: "5" } });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /add book/i }));

    // Check API call was made
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalled();
    });

    // Check error alert was dispatched
    expect(dispatchMock).toHaveBeenCalledWith(expect.objectContaining({
      payload: "Error adding book: Book name is required"
    }));
    
    // Check no navigation occurred
    expect(navigateMock).not.toHaveBeenCalledWith("/");
  });
}); 