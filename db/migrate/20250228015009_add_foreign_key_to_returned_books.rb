class AddForeignKeyToReturnedBooks < ActiveRecord::Migration[8.0]
  def change
    add_foreign_key :returned_books, :users, on_delete: :nullify
    add_foreign_key :returned_books, :books, on_delete: :nullify
  end
end
