class AddForeignKeyToBook < ActiveRecord::Migration[8.0]
  def change
    add_foreign_key :books, :users, on_delete: :nullify, null: true
  end
end
