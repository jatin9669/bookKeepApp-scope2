require 'rails_helper'

RSpec.describe V1::Books, type: :request do
  let(:admin) { create(:admin) }
  let(:user) { create(:user) }
  let!(:book1) { create(:book1) }
  let!(:book2) { create(:book2) }
  let!(:book3) { create(:book3) }

  describe 'GET /api/v1/books' do
    it 'returns a list of books' do
      get '/api/v1/books'
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body).size).to eq(3)
    end

    context 'when search query is provided' do
      it 'returns a list of books that match the search query' do
        get '/api/v1/books', params: { query: 'Ruby' }
        allow(Book).to receive(:search).with('Ruby').and_return([book1])
        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body).size).to eq(1)
      end
    end

    context 'when a regular user is signed in' do
      before do
        post '/api/v1/users/login', params: { email: user.email, password: user.password }
        @issued_book = IssuedBook.create!(user: user, book: book1, quantity: 1)
      end
      
      it 'returns a list of books with adjusted quantities' do
        get '/api/v1/books'
        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body).size).to eq(3)
        expect(JSON.parse(response.body).find { |book| book['id'] == book1.id }['total_quantity']).to eq(4)
      end
      
    end
  end

  describe 'GET /api/v1/books/:id' do
    it 'returns a specific book' do
      get "/api/v1/books/#{book1.id}"
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)['book_name']).to eq(book1.book_name)
    end
  end

  describe 'POST /api/v1/books' do
    let(:valid_params) { { book_name: 'New Book', author_name: 'New Author', total_quantity: 10 } }
    
    it 'creates a new book as admin' do
      post '/api/v1/users/login', params: { email: admin.email, password: admin.password }
      post '/api/v1/books', params: valid_params
      expect(response).to have_http_status(:created)
      expect(Book.count).to eq(4)
    end

    it 'fails for non-admin users' do
      post '/api/v1/users/login', params: { email: user.email, password: user.password }
      post '/api/v1/books', params: valid_params
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'PUT /api/v1/books/:id' do
    let(:update_params) { { book_name: 'Updated Book' } }
    
    it 'updates a book as admin' do
      post '/api/v1/users/login', params: { email: admin.email, password: admin.password }
      put "/api/v1/books/#{book1.id}", params: update_params
      expect(response).to have_http_status(:ok)
      expect(book1.reload.book_name).to eq('Updated Book')
    end

    it 'fails for non-admin users' do
      post '/api/v1/users/login', params: { email: user.email, password: user.password }
      put "/api/v1/books/#{book1.id}", params: update_params
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'DELETE /api/v1/books/:id' do
    it 'deletes a book as admin' do
      post '/api/v1/users/login', params: { email: admin.email, password: admin.password }
      delete "/api/v1/books/#{book1.id}"
      expect(response).to have_http_status(:ok)
      expect(Book.exists?(book1.id)).to be_falsey
    end

    it 'fails for non-admin users' do
      post '/api/v1/users/login', params: { email: user.email, password: user.password }
      delete "/api/v1/books/#{book1.id}"
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
