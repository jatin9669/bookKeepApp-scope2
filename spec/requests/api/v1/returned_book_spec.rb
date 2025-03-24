require 'rails_helper'

RSpec.describe V1::ReturnedBooks, type: :request do
  let!(:user) { create(:user) }
  let!(:admin) { create(:admin) }
  let!(:book1) { create(:book1) }
  let!(:book2) { create(:book2) }
  let!(:borrowed_book) { create(:borrowed_book, user: user, book: book1, quantity: 3) }
  let!(:returned_book) { create(:returned_book, borrowed_book: borrowed_book, quantity: 1) }

  describe 'GET all returned books' do
    context 'when user is signed in' do
      it 'returns an unsuccessful response' do
        post '/api/v1/users/login', params: { email: user.email, password: user.password }
        get '/api/v1/returned_books'
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when admin is signed in' do
      it 'returns a successful response' do
        post '/api/v1/users/login', params: { email: admin.email, password: admin.password }
        get '/api/v1/returned_books'
        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body).size).to eq(1)
        expect(JSON.parse(response.body)[0]['id']).to eq(returned_book.id)
      end
    end

    context 'when search query is provided' do
      it 'returns a list of returned books that match the search query' do
        post '/api/v1/users/login', params: { email: admin.email, password: admin.password }
        get '/api/v1/returned_books', params: { query: 'Jane' }
        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body).size).to eq(0)
      end
    end
  end

  describe 'POST return request' do
    context 'when admin is signed in' do
      it 'returns an unsuccessful response' do
        post '/api/v1/users/login', params: { email: admin.email, password: admin.password }
        post '/api/v1/returned_books', params: { borrowed_book_id: borrowed_book.id, quantity: 1 }
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when user is signed in and return request for the same book already exists' do
      it 'returns a successful response' do
        post '/api/v1/users/login', params: { email: user.email, password: user.password }
        post '/api/v1/returned_books', params: { borrowed_book_id: borrowed_book.id, quantity: 1 }
        expect(response).to have_http_status(:created)
        expect(JSON.parse(response.body)['message']).to eq('Book return request updated successfully')
        expect(ReturnedBook.count).to eq(1)
      end
    end

    context 'when user is signed in and return request for the same book does not exist' do
      before do
        @borrowed_book2 = create(:borrowed_book, user: user, book: book2, quantity: 1)
      end
      it 'returns a successful response' do
        post '/api/v1/users/login', params: { email: user.email, password: user.password }
        post '/api/v1/returned_books', params: { borrowed_book_id: @borrowed_book2.id, quantity: 1 }
        expect(response).to have_http_status(:created)
        expect(JSON.parse(response.body)['message']).to eq('Book return request submitted successfully')
        expect(ReturnedBook.count).to eq(2)
      end
    end
  end

  describe 'POST approve return request' do
    context 'when user is signed in' do
      it 'returns an unsuccessful response' do
        post '/api/v1/users/login', params: { email: user.email, password: user.password }
        post "/api/v1/returned_books/approve/#{returned_book.id}"
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when admin is signed in' do
      it 'returns a successful response' do
        post '/api/v1/users/login', params: { email: admin.email, password: admin.password }
        post "/api/v1/returned_books/approve/#{returned_book.id}"
        expect(response).to have_http_status(:created)
        expect(JSON.parse(response.body)['message']).to eq('Book return request approved successfully')
        expect(ReturnedBook.count).to eq(0)
        expect(BorrowedBook.find(borrowed_book.id).quantity).to eq(2)
      end
    end
  end

  describe 'DELETE return request' do
    context 'when user is signed in' do
      it 'returns an unsuccessful response' do
        post '/api/v1/users/login', params: { email: user.email, password: user.password }
        delete "/api/v1/returned_books/#{returned_book.id}"
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when admin is signed in' do
      it 'returns a successful response' do
        post '/api/v1/users/login', params: { email: admin.email, password: admin.password }
        delete "/api/v1/returned_books/#{returned_book.id}"
        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body)['message']).to eq('Return request was successfully destroyed')
        expect(ReturnedBook.count).to eq(0)
      end
    end
  end
end