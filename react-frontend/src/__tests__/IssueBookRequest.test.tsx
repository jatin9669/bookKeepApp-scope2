import React from "react";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { renderWithProviders } from "../test-utils";
import IssueBookRequest from "../pages/IssueBookRequest";
import axios from "axios";

interface IssueRequest {
    id: number;
    book_id: number;
    user_id: number;
    quantity: number;
    created_at: string;
    book_name: string;
    author_name?: string;
    image_url?: string;
    total_quantity: number;
    name: string;
    email: string;
}

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock React Router hooks
const navigateMock = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => navigateMock
}));

describe("IssueBookRequest", () => {
  // Mock issue request data
  const mockIssueRequests = [
    {
      id: 1,
      book_id: 101,
      user_id: 201,
      book_name: "Test Book 1",
      author_name: "Author 1",
      name: "John Doe",
      email: "john@example.com",
      quantity: 1,
      image_url: "http://example.com/image1.jpg",
      created_at: "2023-05-15T12:00:00Z",
      total_quantity: 10
    },
    {
      id: 2,
      book_id: 102,
      user_id: 202,
      book_name: "Test Book 2",
      author_name: "Author 2",
      name: "Jane Smith",
      email: "jane@example.com",
      quantity: 2,
      image_url: "http://example.com/image2.jpg",
      created_at: "2023-05-16T14:30:00Z",
      total_quantity: 10
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders issue requests for admin users", async () => {
    renderWithProviders(<IssueBookRequest />, {
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
        issueRequested: {
          issueRequest: mockIssueRequests,
          status: 'succeeded',
          error: null
        }
      }
    });

    // Check if book titles are rendered
    expect(screen.getByText("Test Book 1")).toBeInTheDocument();
    expect(screen.getByText("Test Book 2")).toBeInTheDocument();
    
    // Check if user information is rendered
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
    
    // Check if quantity information is rendered
    expect(screen.getByText("Quantity: 1")).toBeInTheDocument();
    expect(screen.getByText("Quantity: 2")).toBeInTheDocument();
    
    // Check if action buttons are rendered
    expect(screen.getAllByText("Accept").length).toBe(2);
    expect(screen.getAllByText("Reject").length).toBe(2);
  });

  it("redirects non-admin users", async () => {
    renderWithProviders(<IssueBookRequest />, {
      preloadedState: {
        user: { 
          user: {
            id: 1,
            email: "regular@example.com",
            name: "Regular User",
            is_admin: false,
            is_signed_in: true
          }
        },
        issueRequested: {
          issueRequest: mockIssueRequests,
          status: 'succeeded',
          error: null
        }
      }
    });

    // Check that navigate was called with "/"
    expect(navigateMock).toHaveBeenCalledWith("/");
  });

  it("redirects non-signed-in users", async () => {
    renderWithProviders(<IssueBookRequest />, {
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
        issueRequested: {
          issueRequest: mockIssueRequests,
          status: 'succeeded',
          error: null
        }
      }
    });

    // Check that navigate was called with "/"
    expect(navigateMock).toHaveBeenCalledWith("/");
  });

  it("shows message when no issue requests are found", async () => {
    renderWithProviders(<IssueBookRequest />, {
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
        issueRequested: {
          issueRequest: [],
          status: 'succeeded',
          error: null
        }
      }
    });

    expect(screen.getByText("No issue Request found.")).toBeInTheDocument();
  });

  it("handles approve functionality", async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { success: true } });

    renderWithProviders(<IssueBookRequest />, {
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
        issueRequested: {
          issueRequest: mockIssueRequests,
          status: 'succeeded',
          error: null
        }
      }
    });

    // Click the Accept button for the first issue request
    const acceptButtons = screen.getAllByText("Accept");
    fireEvent.click(acceptButtons[0]);

    // Check if the API was called with correct parameters
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        "http://localhost:3000/api/v1/issued_books/approve/1",
        {},
        { withCredentials: true }
      );
    });
  });

  it("handles reject functionality", async () => {
    mockedAxios.delete.mockResolvedValueOnce({ data: { success: true } });

    renderWithProviders(<IssueBookRequest />, {
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
        issueRequested: {
          issueRequest: mockIssueRequests,
          status: 'succeeded',
          error: null
        }
      }
    });

    // Click the Reject button for the first issue request
    const rejectButtons = screen.getAllByText("Reject");
    fireEvent.click(rejectButtons[0]);

    // Check if the API was called with correct parameters
    await waitFor(() => {
      expect(mockedAxios.delete).toHaveBeenCalledWith(
        "http://localhost:3000/api/v1/issued_books/1",
        { withCredentials: true }
      );
    });
  });
});
