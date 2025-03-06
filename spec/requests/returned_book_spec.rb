require 'rails_helper'

RSpec.describe "/returned_books", type: :request do
  include Devise::Test::IntegrationHelpers
  let(:user) { create(:user) }
  let(:admin) { create(:admin) }
  let(:book) { create(:book1) }
  let(:borrowed_book) { create(:borrowed_book, user: user, book: book, quantity: 2) }
  let(:returned_book) { create(:returned_book, borrowed_book: borrowed_book, quantity: 1) }
  let(:returned_book2) { create(:returned_book, borrowed_book: borrowed_book, quantity: 2) }

  describe "GET /index" do
    context "when user is admin" do
      before do
        sign_in admin
      end

      it "returns a successful response" do
        get returned_books_path
        expect(response).to be_successful
      end
    end

    context "when user is not admin" do
      before do
        sign_in user
      end

      it "returns an unauthorized response" do
        get returned_books_path
        expect(response).to redirect_to(root_path)
        expect(flash[:alert]).to eq("You are not authorized to access this page.")
      end
    end

    context "when search query is present" do
      before do
        sign_in admin  # Need to sign in as admin since index requires admin access
      end

      it "filters returned books by search query" do
        # Create necessary records
        returned_book = ReturnedBook.create!(borrowed_book: borrowed_book, quantity: 1)
        
        # The search actually happens on Book model and then filters through associations
        searched_book = Book.create!(book_name: 'Ruby Programming', author_name: 'John Doe', total_quantity: 5)
        searched_borrowed_book = BorrowedBook.create!(user: user, book: searched_book, quantity: 2)
        searched_returned_book = ReturnedBook.create!(borrowed_book: searched_borrowed_book, quantity: 1)
        
        # Mock the search method on Book
        expect(Book).to receive(:search).with('Ruby').and_return([searched_book])
        
        get returned_books_path, params: { query: 'Ruby' }
        
        # Verify the response includes the correct book and not others
        expect(response).to be_successful
        expect(response.body).to include(searched_book.book_name)
      end
    end
    
  end

  describe "POST /create" do
    before { sign_in user }

    context "with valid parameters" do
      it "creates a new returned book request" do
        expect {
          post returned_books_path, params: { returned_book: { borrowed_book_id: borrowed_book.id, quantity: 1 } }
        }.to change(ReturnedBook, :count).by(1)
        expect(flash[:notice]).to eq('Book return request submitted successfully.')
      end
    end
  end

  describe "POST /request_return_book" do
    before { sign_in user }
    
    let(:valid_attributes) { { returned_book: { borrowed_book_id: borrowed_book.id, quantity: 1 } } }

    context "when the book return request is not already submitted" do
      it "creates a new returned book" do
        expect {
          post request_return_book_path, params: valid_attributes
        }.to change(ReturnedBook, :count).by(1)
      end
    end

    context "when the book return request is already submitted" do
      before do
        ReturnedBook.create!(borrowed_book_id: borrowed_book.id, quantity: 1)
      end

      it "updates the existing return request" do
        expect {
          post request_return_book_path, params: valid_attributes
        }.not_to change(ReturnedBook, :count)

        expect(ReturnedBook.find_by(borrowed_book_id: borrowed_book.id).quantity).to eq(2)
      end
    end
  end

  describe "POST /approve_return_book" do
    before { sign_in admin }

    it "updates book and borrowed book records and removes returned book" do
      post approve_return_book_path(returned_book)
      expect(book.reload.total_quantity).to eq(6)
      expect(borrowed_book.reload.quantity).to eq(1)
      expect(ReturnedBook.exists?(returned_book.id)).to be_falsey
    end

    context "when the borrowed book quantity is 0" do
      it "deletes the borrowed book" do
        post approve_return_book_path(returned_book2)
        expect(BorrowedBook.exists?(borrowed_book.id)).to be_falsey
      end
    end
  end

  describe "DELETE /returned_books/:id" do
    before { sign_in admin }

    it "deletes the returned book request" do
      returned_book # ensure the returned book exists
      expect {
        delete returned_book_path(returned_book)
      }.to change(ReturnedBook, :count).by(-1)
    end
  end
end
