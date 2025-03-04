class CreateBorrowedBooks < ActiveRecord::Migration[8.0]
  def change
    create_table :borrowed_books do |t|
      t.integer :user_id
      t.integer :book_id
      t.integer :quantity

      t.timestamps
    end
  end
end
