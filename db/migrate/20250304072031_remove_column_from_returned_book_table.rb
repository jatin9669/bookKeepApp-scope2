class RemoveColumnFromReturnedBookTable < ActiveRecord::Migration[8.0]
  def change
    remove_column :returned_books, :book_id
    remove_column :returned_books, :user_id
  end
end
