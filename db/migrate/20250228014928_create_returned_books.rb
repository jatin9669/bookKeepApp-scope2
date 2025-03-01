class CreateReturnedBooks < ActiveRecord::Migration[8.0]
  def change
    create_table :returned_books do |t|
      t.integer :user_id
      t.integer :book_id

      t.timestamps
    end
  end
end
