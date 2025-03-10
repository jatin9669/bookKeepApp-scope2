require 'rails_helper'

RSpec.describe IssuedBooksController, type: :request do
  include Devise::Test::IntegrationHelpers

  let(:admin) { create(:admin) }
  let(:user) { create(:user) }
  let(:book1) { create(:book1, total_quantity: 10) }
  let(:issued_book) { create(:issued_book, user:user, book:book1) }

  before { sign_in admin }

  describe "GET /index" do
    it "returns a successful response" do
      get issued_books_path
      expect(response).to have_http_status(:ok)
    end

    context "when search query is present" do
      it "filters issued books by search query" do
        # Create an issued book for the test
        issued_book = IssuedBook.create(user: user, book: book1, quantity: 1)
        
        allow(Book).to receive(:search).with('Ruby').and_return([book1])
        
        get issued_books_path, params: { query: 'Ruby' }
        
        expect(response.body).to include(book1.book_name)
      end
    end

    context "when user is not an admin" do
      before do
        sign_in user
      end

      it "redirects to root path" do
        get issued_books_path
        expect(response).to redirect_to(root_path)
        expect(flash[:alert]).to eq("You are not authorized to access this page.")
      end
    end
  end

  describe "POST /create" do
    let(:valid_attributes) { { issued_book: { user_id: user.id, book_id: book1.id, quantity: 1 } } }

    it "creates a new issued book" do
      expect {
        post issued_books_path, params: valid_attributes
      }.to change(IssuedBook, :count).by(1)
      expect(flash[:alert]).to eq("Book issued successfully!")
      expect(response).to redirect_to(books_path)
    end
  end

  describe "POST /issue_book" do
    let(:valid_attributes) { { issued_book: { user_id: user.id, book_id: book1.id, quantity: 1 } } }

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
    let(:issued_book) { IssuedBook.create(user: user, book: book1, quantity: 1) }

    context "when there are enough books in stock" do
      it "moves the book to borrowed books and updates stock" do
        post approve_issue_path(issued_book)

        expect(book1.reload.total_quantity).to eq(9)
        expect(BorrowedBook.find_by(user_id: user.id, book_id: book1.id).quantity).to eq(1)
        expect(IssuedBook.exists?(issued_book.id)).to be_falsey
      end
    end

    context "when there are not enough books in stock" do
      before { book1.update(total_quantity: 0) }

      it "does not approve the issue and deletes the request" do
        post approve_issue_path(issued_book)

        expect(IssuedBook.exists?(issued_book.id)).to be_falsey
        expect(flash[:alert]).to eq("Not enough books in stock.")
      end
    end

    context "when book is already borrowed" do
      before { create(:borrowed_book, user: user, book: book1) }

      it "adds the book to the borrowed books and deletes the request" do
        expect {
          post approve_issue_path(issued_book)
        }.to change { BorrowedBook.find_by(user_id: user.id, book_id: book1.id).quantity }.by(1)
        expect(IssuedBook.exists?(issued_book.id)).to be_falsey
      end
    end
  end
end
