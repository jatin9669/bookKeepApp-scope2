json.extract! book, :id, :user_id, :author_name, :book_name, :image_url, :created_at, :updated_at
json.url book_url(book, format: :json)
