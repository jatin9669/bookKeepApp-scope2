class AddCascadeToReturnedBookTable < ActiveRecord::Migration[8.0]
  def change
    add_foreign_key :returned_books, :borrowed_books, on_delete: :cascade
  end
end
