require 'rails_helper'
RSpec.describe IssuedBook, type: :model do

  describe 'associations' do
    it { should belong_to(:book) }
    it { should belong_to(:user) }
  end

  describe 'validations' do
    it { should validate_presence_of(:book_id) }
    it { should validate_presence_of(:user_id) }
    it { should validate_presence_of(:quantity) }
  end
end