require 'rails_helper'
RSpec.describe BorrowedBook, type: :model do

  describe 'associations' do
    it { should belong_to(:book) }
    it { should belong_to(:user) }
    it { should have_one(:returned_book).dependent(:destroy) }
  end

  describe 'validations' do
    it { should validate_presence_of(:book_id) }
    it { should validate_presence_of(:user_id) }
    it { should validate_presence_of(:quantity) }
  end
end