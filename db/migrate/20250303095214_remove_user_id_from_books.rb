class RemoveUserIdFromBooks < ActiveRecord::Migration[8.0]
  def change
    remove_column :books, :user_id
  end
end
