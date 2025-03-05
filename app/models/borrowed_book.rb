class BorrowedBook < ApplicationRecord
  belongs_to :book
  belongs_to :user
  has_one :returned_book, dependent: :destroy
end
