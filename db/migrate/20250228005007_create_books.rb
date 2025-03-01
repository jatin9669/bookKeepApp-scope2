class CreateBooks < ActiveRecord::Migration[8.0]
  def change
    create_table :books do |t|
      t.integer :user_id
      t.string :author_name
      t.string :book_name
      t.string :image_url

      t.timestamps
    end
  end
end
