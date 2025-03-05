class ReturnedBook < ApplicationRecord
  belongs_to :borrowed_book
  has_one :book, through: :borrowed_book
  has_one :user, through: :borrowed_book

  validates :borrowed_book_id, presence: true
  validates :quantity, presence: true
end
