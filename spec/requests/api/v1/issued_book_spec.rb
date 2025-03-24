require 'rails_helper'

RSpec.describe V1::IssuedBooks, type: :request do
  let(:admin) { create(:admin) }
  let(:user) { create(:user) }
  let(:book1) { create(:book1) }
  let(:book2) { create(:book2) }
  let(:book3) { create(:book3) }
  let!(:issued_book) { create(:issued_book, user: user, book: book1, quantity: 1) }

  describe 'GET /api/v1/issued_books' do

    context 'when admin is signed in' do
      it 'returns a successful response' do
        post '/api/v1/users/login', params: { email: admin.email, password: admin.password }
        get '/api/v1/issued_books'
        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body).size).to eq(1)
      end
    end

    context 'when user is signed in' do
      it 'returns an unsuccessful response' do
        post '/api/v1/users/login', params: { email: user.email, password: user.password }
        get '/api/v1/issued_books'
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when search query is provided' do
      it 'returns a list of issued books that match the search query' do
        post '/api/v1/users/login', params: { email: admin.email, password: admin.password }
        get '/api/v1/issued_books', params: { query: 'Jane' }
        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body).size).to eq(0)
      end
    end
  end

  describe 'POST /api/v1/issued_books' do
    let(:valid_params) { { user_id: user.id, book_id: book1.id, quantity: 1 } }

    context 'when user is signed in' do
      it 'returns a successful response' do
        post '/api/v1/users/login', params: { email: user.email, password: user.password }
        post '/api/v1/issued_books', params: valid_params
        expect(response).to have_http_status(:created)
        expect(IssuedBook.count).to eq(2)
      end
    end
  end

  describe 'DELETE /api/v1/issued_books/:id' do

    context 'when admin is signed in' do
      it 'returns a successful response' do
        post '/api/v1/users/login', params: { email: admin.email, password: admin.password }
        delete "/api/v1/issued_books/#{issued_book.id}"
        expect(response).to have_http_status(:ok)
        expect(IssuedBook.count).to eq(0)
      end
    end

    context 'when user is signed in' do
      it 'returns an unsuccessful response' do
        post '/api/v1/users/login', params: { email: user.email, password: user.password }
        delete "/api/v1/issued_books/#{issued_book.id}"
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'POST api/v1/issued_books/approve_issue' do
    context 'when non-admin is signed in' do
      it 'returns an unsuccessful response' do
        post '/api/v1/users/login', params: { email: user.email, password: user.password }
        post "/api/v1/issued_books/approve/#{issued_book.id}"
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "when admin is signed in and book's total quantity is greater than issued quantity" do
      it 'returns a successful response' do
        post '/api/v1/users/login', params: { email: admin.email, password: admin.password }
        post "/api/v1/issued_books/approve/#{issued_book.id}"
        expect(response).to have_http_status(201)
        expect(IssuedBook.count).to eq(0)
        expect(book1.reload.total_quantity).to eq(4)
      end
    end

    context "when admin is signed in and book's total quantity is less than issued quantity" do
      let!(:book1) { create(:book1, total_quantity: 0) }
      it 'returns an unsuccessful response' do
        post '/api/v1/users/login', params: { email: admin.email, password: admin.password }
        post "/api/v1/issued_books/approve/#{issued_book.id}"
        expect(response).to have_http_status(:unprocessable_entity)
        expect(IssuedBook.count).to eq(0)
      end
    end

    context "when book is already borrowed" do
      let!(:borrowed_book) { create(:borrowed_book, user: user, book: book1, quantity: 1) }
      it 'returns a successful response' do
        post '/api/v1/users/login', params: { email: admin.email, password: admin.password }
        post "/api/v1/issued_books/approve/#{issued_book.id}"
        expect(response).to have_http_status(:created)
        expect(IssuedBook.count).to eq(0)
        expect(book1.reload.total_quantity).to eq(4)
        expect(borrowed_book.reload.quantity).to eq(2)
      end
    end
  end
end