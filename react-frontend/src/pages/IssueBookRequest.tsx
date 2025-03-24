import React, { useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../data/store";
import { fetchAllIssueRequests } from "../data/issueRequestSlice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../data/store";
import { setAlert } from "../data/notificationSlice";
import { setNotice } from "../data/notificationSlice";
import { useNavigate } from "react-router-dom";
const IssueBookRequest: React.FC = () => {
  const issueRequested = useSelector(
    (state: RootState) => state.issueRequested.issueRequest
  );
  const user = useSelector((state: RootState) => state.user.user);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleApprove = async (id: number) => {
    try {
      await axios.post(
        `http://localhost:3000/api/v1/issued_books/approve/${id}`,
        {},
        {
          withCredentials: true,
        }
      );
      void dispatch(fetchAllIssueRequests(""));
      dispatch(setNotice("Book issued successfully!"));
    } catch (error) {
      dispatch(setAlert("Error issuing book: " + error));
    }
  };

  const handleReject = async (id: number) => {
    try {
      await axios.delete(
        `http://localhost:3000/api/v1/issued_books/${id}`,
        {
          withCredentials: true,
        }
      );
      void dispatch(fetchAllIssueRequests(""));
      dispatch(setNotice("Book rejected successfully!"));
    } catch (error: any) {
      dispatch(setAlert("Error rejecting book: " + (error.response?.data?.message || "Unknown error")));
    }
  };

  useEffect(()=> {
    if(!user.is_signed_in || !user.is_admin) {
      navigate("/");
      dispatch(setAlert("You are not authorized to issue books"));
    }
  }, [user.is_signed_in, user.is_admin, navigate, dispatch]);

  return (
    <div className="w-full bg-slate-100">
      <div className="flex justify-between items-center mb-6 max-w-6xl mx-auto">
        <h1 className="font-bold my-10 text-4xl">Issued books Request</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {issueRequested.length > 0 ? (
          issueRequested.map((issuedBook) => (
            <div
              key={issuedBook.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition duration-300 ease-in-out max-w-sm mx-auto w-full transform hover:scale-105 hover:border-blue-300 border-2 border-transparent"
            >
              {issuedBook.image_url && (
                <img
                  src={issuedBook.image_url}
                  alt={issuedBook.book_name || "Book cover"}
                  className="w-full h-48 mt-5 object-contain"
                />
              )}

              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {issuedBook.book_name || "Unknown Book"}
                </h2>
                <p className="text-gray-600 text-sm mb-4">
                  by {issuedBook.author_name || "N/A"}
                </p>

                <div className="border-t pt-4 mt-4">
                  <h3 className="font-semibold text-gray-800">
                    Issue Request:
                  </h3>
                  <p className="text-gray-600">
                    {issuedBook.name || "Unknown User"}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {issuedBook.email || "N/A"}
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    Quantity: {issuedBook.quantity}
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    Issue Request Date:{" "}
                    {new Date(issuedBook.created_at).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                </div>

                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                  <button
                    onClick={() => handleApprove(issuedBook.id)}
                    className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleReject(issuedBook.id)}
                    className="text-red-600 hover:text-red-800 font-medium cursor-pointer"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center col-span-full my-10">
            No issue Request found.
          </p>
        )}
      </div>
    </div>
  );
};

export default IssueBookRequest;
