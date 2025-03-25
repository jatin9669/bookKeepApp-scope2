import React from "react";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { renderWithProviders } from "../test-utils";
import Signup from "../pages/Signup";
import axios from "axios";
import { setUser } from "../data/userSlice";
import { setNotice, setAlert } from "../data/notificationSlice";

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

describe("Signup", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders signup form correctly", () => {
    renderWithProviders(<Signup />);

    // Check for form elements
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password confirmation/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign up/i })).toBeInTheDocument();
    
    // Check for link to login
    expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
  });

  it("handles form input changes", () => {
    renderWithProviders(<Signup />);

    // Get form elements
    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const passwordConfirmationInput = screen.getByLabelText(/password confirmation/i);

    // Test inputs
    fireEvent.change(nameInput, { target: { value: "Test User" } });
    expect(nameInput).toHaveValue("Test User");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    expect(emailInput).toHaveValue("test@example.com");

    fireEvent.change(passwordInput, { target: { value: "password123" } });
    expect(passwordInput).toHaveValue("password123");

    fireEvent.change(passwordConfirmationInput, { target: { value: "password123" } });
    expect(passwordConfirmationInput).toHaveValue("password123");
  });

  it("handles successful signup for regular user", async () => {
    // Mock successful response for regular user
    const mockUser = {
      id: 1,
      email: "newuser@example.com",
      name: "New User",
      is_admin: false
    };
    
    mockedAxios.post.mockResolvedValueOnce({
      data: { user: mockUser }
    });

    renderWithProviders(<Signup />);

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/name/i), { 
      target: { value: "New User" } 
    });
    fireEvent.change(screen.getByLabelText(/email/i), { 
      target: { value: "newuser@example.com" } 
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), { 
      target: { value: "password123" } 
    });
    fireEvent.change(screen.getByLabelText(/password confirmation/i), { 
      target: { value: "password123" } 
    });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    // Check API call
    expect(mockedAxios.post).toHaveBeenCalledWith(
      "http://localhost:3000/api/v1/users/register",
      {
        name: "New User",
        email: "newuser@example.com",
        password: "password123",
        password_confirmation: "password123"
      },
      { withCredentials: true }
    );

    // Check dispatch and navigation
    await waitFor(() => {
      // Check if setUser was called with the correct user data plus is_signed_in flag
      expect(dispatchMock).toHaveBeenCalledWith(setUser({
        ...mockUser,
        is_signed_in: true
      }));
      
      // Check for success notice
      expect(dispatchMock).toHaveBeenCalledWith(setNotice("You are signed up!"));
      
      // Check navigation to home page
      expect(navigateMock).toHaveBeenCalledWith("/");
    });
  });

  it("handles successful signup for admin user", async () => {
    // Mock successful response for admin user
    const mockUser = {
      id: 1,
      email: "newadmin@example.com",
      name: "New Admin",
      is_admin: true
    };
    
    mockedAxios.post.mockResolvedValueOnce({
      data: { user: mockUser }
    });

    renderWithProviders(<Signup />);

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/name/i), { 
      target: { value: "New Admin" } 
    });
    fireEvent.change(screen.getByLabelText(/email/i), { 
      target: { value: "newadmin@example.com" } 
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), { 
      target: { value: "password123" } 
    });
    fireEvent.change(screen.getByLabelText(/password confirmation/i), { 
      target: { value: "password123" } 
    });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    // Check dispatch and navigation
    await waitFor(() => {
      // Check if setUser was called with the correct user data plus is_signed_in flag
      expect(dispatchMock).toHaveBeenCalledWith(setUser({
        ...mockUser,
        is_signed_in: true
      }));
      
      // Check navigation to home page
      expect(navigateMock).toHaveBeenCalledWith("/");
    });
  });

  it("handles signup failure", async () => {
    // Mock error response
    mockedAxios.post.mockRejectedValueOnce({
      response: {
        data: {
          message: "Email has already been taken"
        }
      }
    });

    renderWithProviders(<Signup />);

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/name/i), { 
      target: { value: "Existing User" } 
    });
    fireEvent.change(screen.getByLabelText(/email/i), { 
      target: { value: "existing@example.com" } 
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), { 
      target: { value: "password123" } 
    });
    fireEvent.change(screen.getByLabelText(/password confirmation/i), { 
      target: { value: "password123" } 
    });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    // Check error alert
    await waitFor(() => {
      expect(dispatchMock).toHaveBeenCalledWith(setAlert("Error: Email has already been taken"));
    });
    
    // Check that navigation wasn't called
    expect(navigateMock).not.toHaveBeenCalled();
  });
}); 