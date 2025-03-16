import { useEffect } from "react";

interface Book {
  id: number;
  book_name: string;
  author_name?: string;
  image_url?: string;
  total_quantity: number;
  quantity?: number;
}

interface BooksProps {
  book: Book;
  showQuantity: boolean;
  quantity: string;
  isAdmin: boolean;
}

const Books: React.FC<BooksProps> = ({
  book,
  showQuantity,
  quantity,
  isAdmin,
}) => {
  return (
    <a
      href={`/books/${book.id}`}
      className="flex flex-col rounded-lg overflow-hidden group"
    >
      <div
        className="bg-gray-50 flex items-center justify-center p-4"
        style={{ minHeight: "260px" }}
      >
        {book.image_url ? (
          <img
            src={book.image_url}
            alt={book.book_name}
            className="max-w-full max-h-[220px] w-auto h-auto object-contain"
            loading="lazy"
          />
        ) : (
          <div className="flex items-center justify-center">
            <svg
              className="w-16 h-16 text-gray-400"
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
          </div>
        )}
      </div>

      <div className="p-6 flex-1">
        <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:line-clamp-none transition-all duration-200">
          {book.book_name}
        </h2>
        <p className={`text-gray-600 text-sm mb-2 italic`}>
          by {book.author_name}
        </p>

        <div className="inline-flex items-center text-blue-600 group-hover:text-blue-800 font-medium transition-all duration-200">
          View Details
          <svg
            className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>

        {!isAdmin &&
          (quantity !== "total_quantity" ? (
            book.quantity && (
              <h2
                className={`${
                  showQuantity === true ? "text-red-600" : "text-green-600"
                } text-xl font-bold my-2 line-clamp-1 group-hover:line-clamp-none transition-all duration-200`}
              >
                {book.quantity === 0 ? "" : "Only"}{" "}
                {book.quantity < 0 ? "0" : book.quantity} book
                {book.quantity <= 1 ? "" : "s"} left!!
              </h2>
            )
          ) : (
            <h2
              className={`${
                showQuantity === true ? "text-red-600" : "text-green-600"
              } text-xl font-bold my-2 line-clamp-1 group-hover:line-clamp-none transition-all duration-200`}
            >
              {book.total_quantity === 0 ? "" : "Only"}{" "}
              {book.total_quantity < 0 ? "0" : book.total_quantity} book
              {book.total_quantity <= 1 ? "" : "s"} left!!
            </h2>
          ))}
      </div>
    </a>
  );
};

export default Books;
