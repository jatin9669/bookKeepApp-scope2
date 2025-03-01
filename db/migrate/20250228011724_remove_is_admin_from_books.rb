class RemoveIsAdminFromBooks < ActiveRecord::Migration[8.0]
  def change
    remove_column :books, :is_admin
  end
end
