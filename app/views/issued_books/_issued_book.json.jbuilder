json.extract! issued_book, :id, :user_id, :book_id, :created_at, :updated_at
json.url issued_book_url(issued_book, format: :json)
