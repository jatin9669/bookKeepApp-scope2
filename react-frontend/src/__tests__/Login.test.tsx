import React from "react";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { renderWithProviders } from "../test-utils";
import Login from "../pages/Login";
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

describe("Login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders login form correctly", () => {
    renderWithProviders(<Login />);

    // Check for form elements
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/remember me/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
    
    // Check for links
    expect(screen.getByText(/forgot your password/i)).toBeInTheDocument();
    expect(screen.getByText(/sign up/i)).toBeInTheDocument();
  });

  it("handles form input changes", () => {
    renderWithProviders(<Login />);

    // Get form elements
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const rememberMeCheckbox = screen.getByLabelText(/remember me/i);

    // Test email input
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    expect(emailInput).toHaveValue("test@example.com");

    // Test password input
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    expect(passwordInput).toHaveValue("password123");

    // Test checkbox
    fireEvent.click(rememberMeCheckbox);
    expect(rememberMeCheckbox).toBeChecked();
  });

  it("handles successful login for regular user", async () => {
    // Mock successful response for regular user
    const mockUser = {
      id: 1,
      email: "user@example.com",
      name: "Regular User",
      is_admin: false
    };
    
    mockedAxios.post.mockResolvedValueOnce({
      data: { user: mockUser }
    });

    renderWithProviders(<Login />);

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/email/i), { 
      target: { value: "user@example.com" } 
    });
    fireEvent.change(screen.getByLabelText(/password/i), { 
      target: { value: "password123" } 
    });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    // Check API call
    expect(mockedAxios.post).toHaveBeenCalledWith(
      "http://localhost:3000/api/v1/users/login",
      {
        email: "user@example.com",
        password: "password123",
        rememberMe: false
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
      expect(dispatchMock).toHaveBeenCalledWith(setNotice("You are logged in!"));
      
      // Check navigation to home page
      expect(navigateMock).toHaveBeenCalledWith("/");
    });
  });

  it("handles successful login for admin user", async () => {
    // Mock successful response for admin user
    const mockUser = {
      id: 1,
      email: "admin@example.com",
      name: "Admin User",
      is_admin: true
    };
    
    mockedAxios.post.mockResolvedValueOnce({
      data: { user: mockUser }
    });

    renderWithProviders(<Login />);

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/email/i), { 
      target: { value: "admin@example.com" } 
    });
    fireEvent.change(screen.getByLabelText(/password/i), { 
      target: { value: "adminpass" } 
    });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    // Check API call
    expect(mockedAxios.post).toHaveBeenCalledWith(
      "http://localhost:3000/api/v1/users/login",
      {
        email: "admin@example.com",
        password: "adminpass",
        rememberMe: false
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
      
      // Check navigation to home page
      expect(navigateMock).toHaveBeenCalledWith("/");
    });
  });

  it("handles login failure", async () => {
    // Mock error response
    mockedAxios.post.mockRejectedValueOnce(new Error("Invalid credentials"));

    renderWithProviders(<Login />);

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/email/i), { 
      target: { value: "wrong@example.com" } 
    });
    fireEvent.change(screen.getByLabelText(/password/i), { 
      target: { value: "wrongpass" } 
    });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    // Check API call
    expect(mockedAxios.post).toHaveBeenCalledWith(
      "http://localhost:3000/api/v1/users/login",
      {
        email: "wrong@example.com",
        password: "wrongpass",
        rememberMe: false
      },
      { withCredentials: true }
    );

    // Check error alert
    await waitFor(() => {
      expect(dispatchMock).toHaveBeenCalledWith(setAlert("Invalid email or password"));
    });
    
    // Check that navigation wasn't called
    expect(navigateMock).not.toHaveBeenCalled();
  });
}); 