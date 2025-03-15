import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../data/store";

const IssueBookRequest: React.FC = () => {
  const issueRequested = useSelector(
    (state: RootState) => state.issueRequested.issueRequest
  );

  useEffect(() => {
    console.log(issueRequested);
  }, [issueRequested]);

  const handleApprove = async (id: number) => {};

  const handleReject = async (id: number) => {};

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-bold text-4xl">Issued books Request</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {issueRequested.length > 0 ? (
          issueRequested.map((issuedBook) => (
            <div
              key={issuedBook.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300 ease-in-out"
            >
              {issuedBook.image_url && (
                <img
                  src={issuedBook.image_url}
                  alt={issuedBook.book_name || "Book cover"}
                  className="w-full h-48 object-contain"
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
                    Quantity: {issuedBook.total_quantity}
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
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleReject(issuedBook.id)}
                    className="text-red-600 hover:text-red-800 font-medium"
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
