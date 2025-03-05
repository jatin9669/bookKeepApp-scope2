require 'rails_helper'
RSpec.describe ReturnedBook, type: :model do

  describe 'associations' do
    it { should belong_to(:borrowed_book) }
    it { should have_one(:book).through(:borrowed_book) }
    it { should have_one(:user).through(:borrowed_book) }
  end

  describe 'validations' do
    it { should validate_presence_of(:borrowed_book_id) }
    it { should validate_presence_of(:quantity) }
  end
end