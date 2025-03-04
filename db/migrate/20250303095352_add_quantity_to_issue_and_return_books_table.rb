class AddQuantityToIssueAndReturnBooksTable < ActiveRecord::Migration[8.0]
  def change
    add_column :issued_books, :quantity, :integer, default: 1
    add_column :returned_books, :quantity, :integer, default: 1
  end
end
