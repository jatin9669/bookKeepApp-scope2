class RemoveUniqueIndexFromIssuedBooks < ActiveRecord::Migration[6.0]
  def change
    remove_index :issued_books, [:user_id, :book_id] if index_exists?(:issued_books, [:user_id, :book_id])
  end
end