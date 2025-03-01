class AddIsAdminToBooks < ActiveRecord::Migration[8.0]
  def change
    add_column :books, :is_admin, :boolean, default: false
  end
end
