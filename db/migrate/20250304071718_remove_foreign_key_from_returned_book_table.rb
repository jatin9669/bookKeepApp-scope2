class RemoveForeignKeyFromReturnedBookTable < ActiveRecord::Migration[8.0]
  def change
    remove_foreign_key :returned_books, :books
    remove_foreign_key :returned_books, :users
  end
end
