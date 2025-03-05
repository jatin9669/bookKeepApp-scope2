class BorrowedBook < ApplicationRecord
  belongs_to :book
  belongs_to :user
  has_one :returned_book, dependent: :destroy

  validates :book_id, presence: true
  validates :user_id, presence: true
  validates :quantity, presence: true
end
