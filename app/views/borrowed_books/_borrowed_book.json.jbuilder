json.extract! borrowed_book, :id, :user_id, :book_id, :quantity, :created_at, :updated_at
json.url borrowed_book_url(borrowed_book, format: :json)
