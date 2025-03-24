import Books from "../components/Books";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../data/store";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { setAlert } from "../data/notificationSlice";
const MyBooks: React.FC = () => {
  const myBooks = useSelector((state: RootState) => state.myBooks.myBooks);
  const user = useSelector((state: RootState) => state.user.user);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  useEffect(()=> {
    if(!user.is_signed_in || user.is_admin) {
      navigate("/");
      dispatch(setAlert("Admins don't have collections of books"));
    }
  }, [user.is_signed_in, user.is_admin, navigate, dispatch]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-slate-100">
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center mb-8">
        <h1 className="font-bold text-4xl text-gray-900">My Books</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {myBooks.length > 0 ? (
          myBooks.map((book) => (
            <div
              key={book.id}
              className="group bg-white rounded-lg shadow-sm hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 h-[100%] "
            >
              <Books
                book={book}
                id={book.book_id}
                showQuantity={false}
                quantity="quantity"
                isSignedIn={true}
              />
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBooks;
