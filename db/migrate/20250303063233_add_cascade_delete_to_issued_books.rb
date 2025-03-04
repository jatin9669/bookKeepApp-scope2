class AddCascadeDeleteToIssuedBooks < ActiveRecord::Migration[8.0]
  def change
    remove_foreign_key :issued_books, :users
    add_foreign_key :issued_books, :users, on_delete: :cascade
  end
end
