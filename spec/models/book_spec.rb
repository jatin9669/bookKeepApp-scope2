require 'rails_helper'
RSpec.describe Book, type: :model do
  let(:book1) { Book.create(book_name: 'Ruby Programming', author_name: 'John Doe', total_quantity: 10) }
  let(:book2) { Book.create(book_name: 'JavaScript Basics', author_name: 'Jane Smith', total_quantity: 5) }
  let(:book3) { Book.create(book_name: 'Python Guide', author_name: 'Alice Brown', total_quantity: 0) }

  describe 'associations' do
    it { should have_many(:issued_books).dependent(:destroy) }
    it { should have_many(:borrowed_books).dependent(:destroy) }
    it { should have_many(:users).through(:issued_books) }
  end

  describe 'validations' do
    it { should validate_presence_of(:book_name) }
    it { should validate_presence_of(:total_quantity) }
  end

  describe '.search' do
    context 'when query is present' do
      it 'returns books matching the book_name' do
        expect(Book.search('ruby')).to include(book1)
        expect(Book.search('ruby')).not_to include(book2, book3)
      end

      it 'returns books matching the author_name' do
        expect(Book.search('jane')).to include(book2)
        expect(Book.search('jane')).not_to include(book1, book3)
      end
    end

    context 'when query is blank' do
      it 'returns all books' do
        expect(Book.search(nil)).to match_array([book1, book2, book3])
        expect(Book.search('')).to match_array([book1, book2, book3])
      end
    end
  end
end