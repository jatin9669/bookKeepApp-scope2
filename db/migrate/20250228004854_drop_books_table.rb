class DropBooksTable < ActiveRecord::Migration[8.0]
  def up
    if table_exists?(:books)
      remove_foreign_key :books, :users if foreign_key_exists?(:books, :users)
      drop_table :books
    end
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end