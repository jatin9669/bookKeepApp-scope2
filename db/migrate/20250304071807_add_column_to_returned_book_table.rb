class AddColumnToReturnedBookTable < ActiveRecord::Migration[8.0]
  def change
    add_column :returned_books, :borrowed_book_id, :integer
  end
end
