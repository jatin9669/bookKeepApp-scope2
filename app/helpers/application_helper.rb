module ApplicationHelper
  def current_page_books_text
    case request.path
    when my_books_path
      "my books"
    when books_path
      "all books"
    when returned_books_path
      "returned books"
    when issued_books_path
      "issued books"
    else
      "books"
    end
  end
end
