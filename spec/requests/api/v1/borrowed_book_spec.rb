require 'rails_helper'

RSpec.describe V1::BorrowedBooks, type: :request do
  let!(:user) { create(:user) }
  let!(:book1) { create(:book1) }
  let!(:book2) { create(:book2) }
  let(:admin) { create(:admin) }
  let!(:borrowed_book) { create(:borrowed_book, user: user, book: book1, quantity: 1) }

  describe 'GET api/v1/borrowed_books' do
    context 'when admin is signed in' do
      it 'returns an unsuccessful response' do
        post '/api/v1/users/login', params: { email: admin.email, password: admin.password }
        get '/api/v1/borrowed_books'
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when user is signed in' do
      it 'returns a successful response' do
        post '/api/v1/users/login', params: { email: user.email, password: user.password }
        get '/api/v1/borrowed_books'
        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body).size).to eq(1)
        expect(JSON.parse(response.body)[0]['id']).to eq(borrowed_book.id)
      end
    end
  end

  describe 'POST borrow_book' do
    context 'when admin is signed in' do
      it 'returns an unsuccessful response' do
        post '/api/v1/users/login', params: { email: admin.email, password: admin.password }
        post '/api/v1/borrowed_books/', params: { user_id: user.id, book_id: book1.id, quantity: 1 }
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when user is signed in and book is not already purchased' do
      before do
        @book2 = create(:book2)
      end
      it 'returns a successful response' do
        post '/api/v1/users/login', params: { email: user.email, password: user.password }
        post '/api/v1/borrowed_books/', params: { user_id: user.id, book_id: @book2.id, quantity: 1 }
        expect(response).to have_http_status(:created)
        expect(JSON.parse(response.body)['message']).to eq('Book request submitted successfully')
        expect(JSON.parse(response.body).size).to eq(2)
      end
    end

    context 'when user is signed in and book is already purchased' do
      it 'returns a successful response' do
        post '/api/v1/users/login', params: { email: user.email, password: user.password }
        post '/api/v1/borrowed_books/', params: { user_id: user.id, book_id: book1.id, quantity: 1 }
        expect(response).to have_http_status(:created)
        expect(JSON.parse(response.body)['message']).to eq('Book request updated successfully')
        expect(JSON.parse(response.body).size).to eq(2)
      end
    end
  end

  describe 'GET request return of book' do
    context 'when admin is signed in' do
      it 'returns an unsuccessful response' do
        post '/api/v1/users/login', params: { email: admin.email, password: admin.password }
        get "/api/v1/borrowed_books/user/#{admin.id}"
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when user is signed in' do
      before do
        create(:returned_book, borrowed_book: borrowed_book, quantity: 1)
        @borrowed_book2 = create(:borrowed_book, user: user, book: book2, quantity: 1)
      end
      it 'returns a successful response' do
        post '/api/v1/users/login', params: { email: user.email, password: user.password }
        get "/api/v1/borrowed_books/user/#{user.id}"
        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body).size).to eq(1)
        expect(JSON.parse(response.body)[0]['id']).to eq(@borrowed_book2.id)
      end
    end

    context 'when search query is provided' do
      before do
        @borrowed_book2 = create(:borrowed_book, user: user, book: book2, quantity: 1)
      end
      it 'returns a list of borrowed books that match the search query' do
        post '/api/v1/users/login', params: { email: user.email, password: user.password }
        get "/api/v1/borrowed_books/user/#{user.id}", params: { query: 'Jane' }
        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body).size).to eq(1)
      end
    end
  end

  describe 'GET my-books' do
    context 'when admin is signed in' do
      it 'returns an unsuccessful response' do
        post '/api/v1/users/login', params: { email: admin.email, password: admin.password }
        get "/api/v1/borrowed_books/my_books"
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when user is signed in' do
      it 'returns a successful response' do
        post '/api/v1/users/login', params: { email: user.email, password: user.password }
        get "/api/v1/borrowed_books/my_books"
        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body).size).to eq(1)
        expect(JSON.parse(response.body)[0]['id']).to eq(borrowed_book.id)
      end
    end

    context 'when search query is provided' do
      it 'returns a list of borrowed books that match the search query' do
        post '/api/v1/users/login', params: { email: user.email, password: user.password }
        get "/api/v1/borrowed_books/my_books", params: { query: 'Jane' }
        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body).size).to eq(0)
      end
    end
  end
end