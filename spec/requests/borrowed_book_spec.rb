require 'rails_helper'

RSpec.describe "/borrowed_books", type: :request do
  include Devise::Test::IntegrationHelpers
  let(:user) { create(:user) }
  let(:admin) { create(:admin) }
  let(:book) { create(:book1) }
  let(:borrowed_book) { create(:borrowed_book, user: user, book: book) }

  before do
    sign_in user
  end

  describe "GET /index" do
    it "returns a successful response when user is not an admin" do
      get borrowed_books_path
      expect(response).to have_http_status(:ok)
    end

    it "redirects to root path when user is an admin" do
      sign_in admin
      get borrowed_books_path
      expect(response).to redirect_to(root_path)
      expect(flash[:alert]).to eq("Admins dont have collections.")
    end
  end

  describe "POST /create" do
    let(:valid_attributes) { { borrowed_book: { user_id: user.id, book_id: book.id, quantity: 1 } } }

    context "when the borrowed book does not exist" do
      it "creates a new borrowed book" do
        expect {
          post borrowed_books_path, params: valid_attributes
        }.to change(BorrowedBook, :count).by(1)
      end
    end
  
    context "when the borrowed book already exists" do
      before do
        user
        BorrowedBook.create!(user_id: user.id, book_id: book.id, quantity: 2)
      end
  
      it "updates the existing borrowed book instead of creating a new one" do
        expect {
          post borrowed_books_path, params: valid_attributes
        }.not_to change(BorrowedBook, :count)
  
        expect(BorrowedBook.find_by(user_id: user.id, book_id: book.id).quantity).to eq(3)
      end
    end

    it "redirects to books_path" do
      post borrowed_books_path, params: valid_attributes
      expect(response).to redirect_to(books_path)
    end

    it "redirects to root path when user is an admin" do
      sign_in admin
      get borrowed_books_path
      expect(response).to redirect_to(root_path)
      expect(flash[:alert]).to eq("Admins dont have collections.")
    end
  end

  describe "DELETE /destroy" do
    before { borrowed_book }

    it "deletes the borrowed book" do
      expect {
        delete borrowed_book_path(borrowed_book)
      }.to change(BorrowedBook, :count).by(-1)
    end

    it "redirects to borrowed_books_path" do
      delete borrowed_book_path(borrowed_book)
      expect(response).to redirect_to(borrowed_books_path)
    end

    it "redirects to root path when user is an admin" do
      sign_in admin
      delete borrowed_book_path(borrowed_book)
      expect(response).to redirect_to(root_path)
      expect(flash[:alert]).to eq("Admins dont have collections.")
    end
  end

  describe "GET /my_books" do
    it "returns a successful response" do
      get my_books_path
      expect(response).to have_http_status(:ok)
    end

    context "when search query is present" do
      it "filters borrowed books by search query" do
        # Create a borrowed book for the test
        borrowed_book = BorrowedBook.create!(user: user, book: book, quantity: 1)
        
        allow(Book).to receive(:search).with('Ruby').and_return([book])
        
        # Make the request
        get my_books_path, params: { query: 'Ruby' }
        
        # Verify the response includes the book name
        expect(response.body).to include(book.book_name)
      end
    end

    it "redirects to root path when user is an admin" do
      sign_in admin
      get my_books_path
      expect(response).to redirect_to(root_path)
      expect(flash[:alert]).to eq("Admins dont have collections.")
    end
  end

  describe "GET #request_return" do
    it "returns a successful response" do
      get request_return_path
      expect(response).to have_http_status(:success)
    end

    it "shows borrowed books with correct return quantities" do
      # Create a borrowed book with quantity 3
      borrowed_book = BorrowedBook.create!(user: user, book: book, quantity: 73)
      ReturnedBook.create!(borrowed_book: borrowed_book, quantity: 1)
      
      get request_return_path
      
      # Verify the response includes the book and its return quantity (73-1=2)
      expect(response.body).to include(book.book_name)
      expect(response.body).to include("72") # The quantity that can be returned
    end

    context "when search query is present" do
      it "filters borrowed books by search query" do
        # Create a borrowed book for the test
        borrowed_book = BorrowedBook.create!(user: user, book: book, quantity: 1)
        
        allow(Book).to receive(:search).with('Ruby').and_return([book])
        
        # Make the request
        get request_return_path, params: { query: 'Ruby' }
        
        # Verify the response includes the book name
        expect(response.body).to include(book.book_name)
      end
    end

    it "redirects to root path when user is an admin" do
      sign_in admin
      get request_return_path
      expect(response).to redirect_to(root_path)
      expect(flash[:alert]).to eq("Admins dont have collections.")
    end
  end
end
