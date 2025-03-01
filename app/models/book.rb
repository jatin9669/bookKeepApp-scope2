class Book < ApplicationRecord
  scope :search, ->(query) {
    where("book_name LIKE :query OR 
           author_name LIKE :query", 
           query: "%#{query}%")
  }

  # Alternative method if you prefer instance methods
  def self.search(query)
    return all unless query.present?

    where("LOWER(book_name) LIKE :query OR 
           LOWER(author_name) LIKE :query ", 
           query: "%#{query.downcase}%")
  end
end
