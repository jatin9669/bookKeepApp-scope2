require 'rails_helper'

RSpec.describe User, type: :model do
  describe 'associations' do
    it { should have_many(:borrowed_books).dependent(:destroy) }
    it { should have_many(:issued_books).dependent(:destroy) }
  end

  describe 'validations' do
    it { should validate_presence_of(:email) }
    it { should validate_presence_of(:password) }
    it { should validate_length_of(:password).is_at_least(6) }
    it { should validate_presence_of(:name) }
    it { should validate_inclusion_of(:is_admin).in_array([true, false]) }
  end

  describe 'devise modules' do
    let(:user) { create(:user) }
    it 'includes the necessary devise modules' do
      expect(User.devise_modules).to include(:database_authenticatable, :registerable, :recoverable, :rememberable, :validatable)
    end
      it { expect(user).to respond_to(:valid_password?) }
      it { expect(user).to respond_to(:remember_me) }
      it { expect(user).to respond_to(:send_reset_password_instructions) }
    end
end