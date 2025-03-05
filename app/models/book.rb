class Book < ApplicationRecord
  has_many :issued_books, dependent: :destroy
  has_many :returned_books, dependent: :destroy
  has_many :borrowed_books, dependent: :destroy
  has_many :users, through: :issued_books

  def self.search(query)
    return all unless query.present?

    where("LOWER(book_name) LIKE :query OR LOWER(author_name) LIKE :query", 
          query: "%#{query.downcase}%")
  end
end
