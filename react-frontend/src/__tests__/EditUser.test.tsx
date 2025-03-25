import React from "react";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { renderWithProviders } from "../test-utils";
import EditUser from "../pages/EditUser";
import axios from "axios";
import { clearUser, setUser } from "../data/userSlice";
import { resetBooks } from "../data/booksSlice";
import { resetMyBooks } from "../data/myBooksSlice";
import { resetUserReturnRequest } from "../data/userReturnRequestSlice";
import { resetReturnRequest } from "../data/returnRequestSlice";
import { resetIssueRequest } from "../data/issueRequestSlice";
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

describe("EditUser", () => {
  // Mock user data
  const mockUser = {
    id: 1,
    email: "user@example.com",
    name: "Test User",
    is_admin: false,
    is_signed_in: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders edit user form correctly", () => {
    renderWithProviders(<EditUser />, {
      preloadedState: {
        user: { user: mockUser }
      }
    });

    // Check for form elements
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password confirmation/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /update/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /delete user/i })).toBeInTheDocument();
  });

  it("initializes form with current user data", () => {
    renderWithProviders(<EditUser />, {
      preloadedState: {
        user: { user: mockUser }
      }
    });

    // Check if form is filled with user data
    expect(screen.getByLabelText(/name/i)).toHaveValue(mockUser.name);
    expect(screen.getByLabelText(/email/i)).toHaveValue(mockUser.email);
  });

  it("handles form input changes", () => {
    renderWithProviders(<EditUser />, {
      preloadedState: {
        user: { user: mockUser }
      }
    });

    // Change form inputs
    const nameInput = screen.getByLabelText(/name/i);
    fireEvent.change(nameInput, { target: { value: "Updated Name" } });
    expect(nameInput).toHaveValue("Updated Name");

    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: "updated@example.com" } });
    expect(emailInput).toHaveValue("updated@example.com");

    const passwordInput = screen.getByLabelText(/^password$/i);
    fireEvent.change(passwordInput, { target: { value: "newpassword" } });
    expect(passwordInput).toHaveValue("newpassword");

    const passwordConfirmationInput = screen.getByLabelText(/password confirmation/i);
    fireEvent.change(passwordConfirmationInput, { target: { value: "newpassword" } });
    expect(passwordConfirmationInput).toHaveValue("newpassword");

    const currentPasswordInput = screen.getByLabelText(/current password/i);
    fireEvent.change(currentPasswordInput, { target: { value: "currentpassword" } });
    expect(currentPasswordInput).toHaveValue("currentpassword");
  });

  it("handles successful user update", async () => {
    mockedAxios.put.mockResolvedValueOnce({ data: { success: true } });

    renderWithProviders(<EditUser />, {
      preloadedState: {
        user: { user: mockUser }
      }
    });

    // Update form fields
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: "Updated Name" } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "updated@example.com" } });
    fireEvent.change(screen.getByLabelText(/current password/i), { target: { value: "currentpassword" } });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /update/i }));

    // Check API call
    await waitFor(() => {
      expect(mockedAxios.put).toHaveBeenCalledWith(
        "http://localhost:3000/api/v1/users/update_profile",
        {
          name: "Updated Name",
          email: "updated@example.com",
          password: "",
          password_confirmation: "",
          current_password: "currentpassword"
        },
        { withCredentials: true }
      );
    });

    // Check if user state was updated
    expect(dispatchMock).toHaveBeenCalledWith(setUser({
      id: mockUser.id,
      email: "updated@example.com",
      name: "Updated Name",
      is_admin: mockUser.is_admin
    }));

    // Check navigation
    expect(navigateMock).toHaveBeenCalledWith("/");

    // Check success notice
    expect(dispatchMock).toHaveBeenCalledWith(setNotice("User updated successfully!"));
  });

  it("handles user update error", async () => {
    mockedAxios.put.mockRejectedValueOnce({
      response: {
        data: {
          message: "Current password is invalid"
        }
      }
    });

    renderWithProviders(<EditUser />, {
      preloadedState: {
        user: { user: mockUser }
      }
    });

    // Update form fields
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: "Updated Name" } });
    fireEvent.change(screen.getByLabelText(/current password/i), { target: { value: "wrongpassword" } });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /update/i }));

    // Check API call was made
    await waitFor(() => {
      expect(mockedAxios.put).toHaveBeenCalled();
    });

    // Check error alert
    expect(dispatchMock).toHaveBeenCalledWith(setAlert("Error updating user: Current password is invalid"));

    // Check navigation was not called
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it("handles successful user deletion", async () => {
    mockedAxios.delete.mockResolvedValueOnce({ data: { success: true } });

    renderWithProviders(<EditUser />, {
      preloadedState: {
        user: { user: mockUser }
      }
    });

    // Enter current password
    fireEvent.change(screen.getByLabelText(/current password/i), { target: { value: "currentpassword" } });

    // Click delete button
    fireEvent.click(screen.getByRole("button", { name: /delete user/i }));

    // Check API call
    await waitFor(() => {
      expect(mockedAxios.delete).toHaveBeenCalledWith(
        "http://localhost:3000/api/v1/users/delete_account?current_password=currentpassword",
        { withCredentials: true }
      );
    });

    // Check if all states were reset
    expect(dispatchMock).toHaveBeenCalledWith(clearUser());
    expect(dispatchMock).toHaveBeenCalledWith(resetBooks());
    expect(dispatchMock).toHaveBeenCalledWith(resetMyBooks());
    expect(dispatchMock).toHaveBeenCalledWith(resetUserReturnRequest());
    expect(dispatchMock).toHaveBeenCalledWith(resetReturnRequest());
    expect(dispatchMock).toHaveBeenCalledWith(resetIssueRequest());

    // Check navigation to login
    expect(navigateMock).toHaveBeenCalledWith("/login");

    // Check success notice
    expect(dispatchMock).toHaveBeenCalledWith(setNotice("User deleted successfully!"));
  });

  it("handles user deletion error", async () => {
    mockedAxios.delete.mockRejectedValueOnce({
      response: {
        data: {
          message: "Current password is invalid"
        }
      }
    });

    renderWithProviders(<EditUser />, {
      preloadedState: {
        user: { user: mockUser }
      }
    });

    // Enter wrong password
    fireEvent.change(screen.getByLabelText(/current password/i), { target: { value: "wrongpassword" } });

    // Click delete button
    fireEvent.click(screen.getByRole("button", { name: /delete user/i }));

    // Check API call was made
    await waitFor(() => {
      expect(mockedAxios.delete).toHaveBeenCalled();
    });

    // Check error alert
    expect(dispatchMock).toHaveBeenCalledWith(setAlert("Error deleting user: Current password is invalid"));

    // Check navigation was not called
    expect(navigateMock).not.toHaveBeenCalled();
  });
}); 