class AddCascadeDeleteToIssuedBooks < ActiveRecord::Migration[7.1]
  def change
    # First remove the existing foreign key if it exists
    remove_foreign_key :issued_books, :books if foreign_key_exists?(:issued_books, :books)
    remove_foreign_key :returned_books, :books if foreign_key_exists?(:returned_books, :books)
    
    # Add the foreign key with cascade delete
    add_foreign_key :issued_books, :books, on_delete: :cascade
    add_foreign_key :returned_books, :books, on_delete: :cascade
  end
end 