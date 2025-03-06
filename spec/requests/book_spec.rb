require 'rails_helper'
RSpec.describe "Books", type: :request do
  include Devise::Test::IntegrationHelpers
  let(:admin) { create(:admin) }
  let(:user) { create(:user) }
  let!(:book) { create(:book1) }
  let(:issued_book) { create(:issued_book, user: user, book: book, quantity: 2) }

  describe "GET /index" do
    context "when user is signed in and not an admin" do
      before do
        sign_in user
        @book = Book.create!(book_name: 'Test Book', author_name: 'Test Author', total_quantity: 5)
        @issued_book = IssuedBook.create!(
          user_id: user.id,
          book_id: @book.id,
          quantity: 2
        )
        get books_path
      end

      it "adjusts book quantities based on issued books" do
        expect(response.body).to include("3 books left!!")
      end
    end

    context "when an admin is signed in" do
      before do
        sign_in admin
        @book = Book.create!(book_name: 'Test Book', author_name: 'Test Author', total_quantity: 5)
        get books_path
      end

      it "does not adjust book quantities" do
        expect(response.body).to include("5 books left!!")
      end
    end

    context "when a search query is present" do
      before do
        sign_in user
        @ruby_book = Book.create!(book_name: 'Ruby Programming', author_name: 'John Doe', total_quantity: 5)
        @js_book = Book.create!(book_name: 'JavaScript Basics', author_name: 'Jane Smith', total_quantity: 3)
        get books_path, params: { query: 'Ruby' }
      end

      it "filters books by search query" do
        expect(response.body).to include('Ruby Programming')
        expect(response.body).not_to include('JavaScript Basics')
      end
    end
  end

  describe "GET /show" do
    it "returns http success" do
      get book_path(book)
      expect(response).to have_http_status(:success)
    end
  end

  describe "POST /create" do
    context "when user is an admin" do
      before { sign_in admin }

      it "creates a new book" do
        expect {
          post books_path, params: { book: { book_name: book.book_name, author_name: book.author_name, total_quantity: book.total_quantity } }
        }.to change(Book, :count).by(1)
        expect(response).to redirect_to(book_path(Book.last))
      end
    end

    context "when user is not an admin" do
      before { sign_in user }

      it "does not allow book creation" do
        post books_path, params: { book: { book_name: book.book_name, author_name: book.author_name, total_quantity: book.total_quantity } }
        expect(response).to redirect_to(root_path)
        expect(flash[:alert]).to eq("You can not perform this action.")
      end
    end
  end

  describe "PATCH /update" do
    context "when user is an admin" do
      before { sign_in admin }

      it "updates the book" do
        patch book_path(book), params: { book: { book_name: "Updated Name" } }
        expect(book.reload.book_name).to eq("Updated Name")
        expect(response).to redirect_to(book_path(book))
      end
    end
  end

  describe "DELETE /destroy" do
    context "when user is an admin" do
      before { sign_in admin }

      it "deletes the book" do
        expect {
          delete book_path(book)
        }.to change(Book, :count).by(-1)
        expect(response).to redirect_to(books_path)
      end
    end

    context "when user is not an admin" do
      before { sign_in user }

      it "does not allow book deletion" do
        delete book_path(book)
        expect(response).to redirect_to(root_path)
        expect(flash[:alert]).to eq("You can not perform this action.")
      end
    end
  end
end
