class RemoveQuantityFromBooks < ActiveRecord::Migration[8.0]
  def change
    remove_column :books, :quantity, :integer
  end
end 