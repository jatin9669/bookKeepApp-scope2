import { useNavigate, useParams } from "react-router-dom";
import { RootState, AppDispatch } from "../data/store";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { fetchAllBooks } from "../data/booksSlice";
import { setNotice } from "../data/notificationSlice";
import { setAlert } from "../data/notificationSlice";

export default function ShowBook() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    
    const book = useSelector((state: RootState) =>
      state.books.books.find((book) => book.id === parseInt(id || "1"))
    );
    
    const user = useSelector((state: RootState) => state.user.user);
    const isAdmin = user?.is_admin || false;

    if(!book) {
        return <div>Book not found</div>;
    }

    const handleDelete = async () => {
        if (window.confirm("Are you sure?")) {
            try {
                await axios.delete(`http://localhost:3000/api/v1/books/${id}`, {
                    withCredentials: true,
                });
                navigate("/");
                dispatch(setNotice("Book deleted successfully!"));
                void dispatch(fetchAllBooks(""));
                dispatch(setNotice("Book deleted successfully!"));
            } catch (error: any) {
                dispatch(setAlert("Error deleting book: " + (error.response?.data?.message || "Unknown error")));
            }
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

            <h1 className="font-bold text-4xl mb-8 text-gray-900">{book.book_name}</h1>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {book.image_url ? (
                    <div className="flex justify-center bg-gray-50 p-8">
                        <img 
                            src={book.image_url}
                            alt={book.book_name}
                            className="max-w-full max-h-[500px] w-auto h-auto object-contain"
                            loading="lazy"
                        />
                    </div>
                ) : (
                    <div className="w-full h-80 bg-gray-100 flex items-center justify-center">
                        <svg className="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                        </svg>
                    </div>
                )}
                
                <div className="p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-3 line-clamp-1 group-hover:line-clamp-none transition-all duration-200">
                        {book.book_name}
                    </h2>
                    <p className={`text-gray-600 text-lg ${user ? "mb-6" : "mb-4"} italic`}>
                        by {book.author_name}
                    </p>
                
                    <div className="flex items-center gap-4">
                        {isAdmin && (
                            <>
                                <button 
                                    onClick={() => navigate(`/edit/${id}`)}
                                    className="rounded-lg px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
                                >
                                    Edit this book
                                </button>
                                <button 
                                    onClick={handleDelete}
                                    className="rounded-lg px-5 py-2.5 text-white bg-red-600 hover:bg-red-700 font-medium transition-colors"
                                >
                                    Destroy this book
                                </button>
                            </>
                        )}
                        <button 
                            onClick={() => navigate("/")}
                            className="rounded-lg px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
                        >
                            Back to books
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
