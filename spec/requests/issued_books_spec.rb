require 'rails_helper'

RSpec.describe IssuedBooksController, type: :request do
  include Devise::Test::IntegrationHelpers

  let(:admin) { User.create(email: 'admin@example.com', name: 'Admin', password: 'password', is_admin: true) }
  let(:user) { User.create(email: 'user@example.com', name: 'User', password: 'password', is_admin: false) }
  let(:book) { Book.create(book_name: 'Ruby Programming', author_name: 'John Doe', total_quantity: 10) }
  let(:issued_book) { IssuedBook.create(user: user, book: book, quantity: 1) }

  before { sign_in admin }

  describe "GET /index" do
    it "returns a successful response" do
      get issued_books_path
      expect(response).to have_http_status(:ok)
    end

    context "when search query is present" do
      it "filters issued books by search query" do
        # Create an issued book for the test
        issued_book = IssuedBook.create!(user: user, book: book, quantity: 1)
        
        allow(Book).to receive(:search).with('Ruby').and_return([book])
        
        get issued_books_path, params: { query: 'Ruby' }
        
        expect(response.body).to include(book.book_name)
      end
    end
  end

  describe "POST /create" do
    let(:valid_attributes) { { issued_book: { user_id: user.id, book_id: book.id, quantity: 1 } } }

    it "creates a new issued book" do
      expect {
        post issued_books_path, params: valid_attributes
      }.to change(IssuedBook, :count).by(1)
      expect(flash[:alert]).to eq("Book issued successfully!")
      expect(response).to redirect_to(books_path)
    end
  end

  describe "POST /issue_book" do
    let(:valid_attributes) { { issued_book: { user_id: user.id, book_id: book.id, quantity: 1 } } }

    context "when issuing a new book" do
      it "creates a new issued book and returns success" do
        post issue_book_path, params: valid_attributes

        expect(response).to have_http_status(:success)
        expect(IssuedBook.count).to eq(1)
        expect(response.body).to include("success")
      end
    end
  end

  describe "DELETE /destroy" do
    before { issued_book }

    it "deletes the issued book" do
      expect {
        delete issued_book_path(issued_book)
      }.to change(IssuedBook, :count).by(-1)
    end
  end

  describe "POST /approve_issue" do
    let(:issued_book) { IssuedBook.create(user: user, book: book, quantity: 1) }

    context "when there are enough books in stock" do
      it "moves the book to borrowed books and updates stock" do
        post approve_issue_path(issued_book)

        expect(book.reload.total_quantity).to eq(9)
        expect(BorrowedBook.find_by(user_id: user.id, book_id: book.id).quantity).to eq(1)
        expect(IssuedBook.exists?(issued_book.id)).to be_falsey
      end
    end

    context "when there are not enough books in stock" do
      before { book.update(total_quantity: 0) }

      it "does not approve the issue and deletes the request" do
        post approve_issue_path(issued_book)

        expect(IssuedBook.exists?(issued_book.id)).to be_falsey
        expect(flash[:alert]).to eq("Not enough books in stock.")
      end
    end
  end
end
