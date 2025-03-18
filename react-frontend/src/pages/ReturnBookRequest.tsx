import React, { useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../data/store";
import { fetchAllReturnRequests } from "../data/returnRequestSlice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../data/store";
import { setNotice } from "../data/notificationSlice";
import { setAlert } from "../data/notificationSlice"; 
import { useNavigate } from "react-router-dom";

const ReturnBookRequest: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const returnRequest = useSelector(
    (state: RootState) => state.returnRequest.returnRequest
  );
  const user = useSelector((state: RootState) => state.user.user);
  const navigate = useNavigate();

  useEffect(()=> {
    if(!user.is_signed_in || !user.is_admin) {
      navigate("/");
      console.log("You are not authorized to return books");
      dispatch(setAlert("You are not authorized to return books"));
    }
  }, [user.is_signed_in, user.is_admin, navigate, dispatch]);

  const handleApprove = async (id: number) => {
    try {
      await axios.post(
        `http://localhost:3000/api/v1/returned_books/approve/${id}`,
        {},
        { withCredentials: true }
      );
      void dispatch(fetchAllReturnRequests(""));
      dispatch(setNotice("Book return request approved successfully!"));
    } catch (error) {
      dispatch(setAlert("Error approving book return request: " + error));
    }
  };

  const handleReject = async (id: number) => {
    try {
      await axios.delete(
        `http://localhost:3000/api/v1/returned_books/${id}`,
        { withCredentials: true }
      );
      void dispatch(fetchAllReturnRequests(""));
      dispatch(setNotice("Book rejected successfully!"));
    } catch (error) {
      dispatch(setAlert("Error rejecting book: " + error));
    }
  };

  return (
    <div className="w-full bg-slate-100">
      <div className="flex justify-between items-center mb-6 max-w-6xl mx-auto">
        <h1 className="font-bold my-10 text-4xl">Return books Request</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {returnRequest.length > 0 ? (
          returnRequest.map((returnBook) => (
            <div
              key={returnBook.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition duration-300 ease-in-out max-w-sm mx-auto w-full transform hover:scale-105 hover:border-blue-300 border-2 border-transparent"
            >
              {returnBook.image_url && (
                <img
                  src={returnBook.image_url}
                  alt={returnBook.book_name || "Book cover"}
                  className="w-full h-48 mt-5 object-contain"
                />
              )}

              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {returnBook.book_name || "Unknown Book"}
                </h2>
                <p className="text-gray-600 text-sm mb-4">
                  by {returnBook.author_name || "N/A"}
                </p>

                <div className="border-t pt-4 mt-4">
                  <h3 className="font-semibold text-gray-800">
                    Return Request:
                  </h3>
                  <p className="text-gray-600">
                    {returnBook.user_id || "Unknown User"}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {returnBook.user_id || "N/A"}
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    Quantity: {returnBook.quantity}
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    Return Request Date:{" "}
                    {new Date(returnBook.created_at).toLocaleDateString(
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
                    onClick={() => handleApprove(returnBook.id)}
                    className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleReject(returnBook.id)}
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
            No return Request found.
          </p>
        )}
      </div>
    </div>
  );
};

export default ReturnBookRequest;
