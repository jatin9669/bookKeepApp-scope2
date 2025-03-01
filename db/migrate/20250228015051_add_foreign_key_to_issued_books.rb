class AddForeignKeyToIssuedBooks < ActiveRecord::Migration[8.0]
  def change
    add_foreign_key :issued_books, :users, on_delete: :nullify, null: true
    add_foreign_key :issued_books, :books, on_delete: :nullify, null: true
  end
end
