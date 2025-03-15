//edit delete buy
import React, { useState } from "react";
import Books from "../components/Books";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../data/store";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface MyBooks {
  id: number;
  book_id: number;
  user_id: number;
  quantity: number;
}

interface Book {
  id: number;
  book_name: string;
  author_name?: string;
  total_quantity: number;
  image_url?: string;
}

const RequestReturn: React.FC = () => {
  const navigate = useNavigate();
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});
  const [showControls, setShowControls] = useState<{ [key: number]: boolean }>(
    {}
  );
  const currentUserId = useSelector((state: RootState) => state.user.user.id);
  const userReturnRequest = useSelector(
    (state: RootState) => state.userReturnRequest.userReturnRequest
  );

  const handleRequestToBorrow = (bookId: number) => {
    setQuantities((prev) => ({ ...prev, [bookId]: quantities[bookId] }));
    setShowControls((prev) => ({ ...prev, [bookId]: true }));
  };

  const incrementQuantity = (bookId: number, totalQuantity: number) => {
    setQuantities((prev) => ({
      ...prev,
      [bookId]: Math.min((prev[bookId] || 1) + 1, totalQuantity),
    }));
  };

  const decrementQuantity = (bookId: number) => {
    setQuantities((prev) => ({
      ...prev,
      [bookId]: Math.max((prev[bookId] || 1) - 1, 1),
    }));
  };

  const handleConfirmPurchase = async (bookId: number, userId: number) => {
    //     // Implement your purchase logic here
    console.log(`Confirming purchase for book ${bookId} by user ${userId}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center mb-8">
        <h1 className="font-bold text-4xl text-gray-900">Books to return</h1>
        <button
          onClick={() => navigate("/my-books")}
          className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition duration-200"
        >
          My Books
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {userReturnRequest.length > 0 ? (
          userReturnRequest.map((book) => (
            <div
              key={book.id}
              className="group bg-white rounded-lg shadow-sm hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 h-[100%] "
            >
              <Books
                book={book}
                showQuantity={true}
                quantity="quantity"
                isAdmin={false}
              />  
                <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-lg">
                  {   book.total_quantity === 0 ? (
                    <button
                      disabled
                      className="w-full px-4 py-2.5 bg-gray-400 text-white font-medium rounded-md cursor-not-allowed"
                    >
                      Not Available
                    </button>
                  ) : (
                    <>
                      {showControls[book.id] ? (
                        <>
                          <div className="flex items-center justify-center">
                            <button
                              onClick={() => decrementQuantity(book.id)}
                              className="px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-md transition duration-200 hover:bg-gray-200"
                            >
                              -
                            </button>
                            <span className="px-4 py-2.5 bg-gray-100 text-black font-medium rounded-md transition duration-200">
                              {quantities[book.id] || 1}
                            </span>
                            <button
                              onClick={() =>
                                incrementQuantity(book.id, book.total_quantity)
                              }
                              className="px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-md transition duration-200 hover:bg-gray-200"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() =>
                              currentUserId &&
                              handleConfirmPurchase(book.id, currentUserId)
                            }
                            className="mt-2 w-full px-4 py-2.5 bg-green-600 hover:bg-green-500 text-white font-medium rounded-md transition duration-200 flex items-center justify-center"
                          >
                            <svg
                              className="w-4 h-4 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 12l5 5L20 7"
                              />
                            </svg>
                            Confirm Purchase
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleRequestToBorrow(book.id)}
                          className="w-full px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium rounded-md transition duration-200"
                        >
                          Request to borrow
                        </button>
                      )}
                    </>
                  )}
                </div>
  
            </div>
          ))
        ) : (
          <div className="col-span-full">
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                No books found
              </h3>
              <p className="mt-1 text-gray-500">
                Get started by creating a new book.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestReturn;
