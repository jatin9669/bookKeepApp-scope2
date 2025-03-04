class AddTotalQuantityToBooks < ActiveRecord::Migration[8.0]
  def change
    add_column :books, :total_quantity, :integer, default: 0
  end
end
