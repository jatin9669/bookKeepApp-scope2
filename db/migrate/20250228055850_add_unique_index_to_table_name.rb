class AddUniqueIndexToTableName < ActiveRecord::Migration[8.0]
  def change
    add_index :issued_books, [:user_id, :book_id], unique: true
    add_index :returned_books, [:user_id, :book_id], unique: true
  end
end
