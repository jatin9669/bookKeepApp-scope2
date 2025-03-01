json.extract! returned_book, :id, :user_id, :book_id, :created_at, :updated_at
json.url returned_book_url(returned_book, format: :json)
