require 'rails_helper'

RSpec.describe V1::Users, type: :request do
  let(:user) { create(:user) }
  let(:admin) { create(:admin) }

  describe 'POST /api/v1/users/register' do
    it 'registers a new user' do
      post '/api/v1/users/register', params: {
        email: 'test@example.com',
        password: 'password',
        password_confirmation: 'password',
        name: 'Test User'
      }

      expect(response).to have_http_status(201)
      expect(JSON.parse(response.body)['message']).to eq('Registration successful')
    end

    it 'returns an error when passwords do not match' do
      post '/api/v1/users/register', params: {
        email: 'test@example.com',
        password: 'password',
        password_confirmation: 'wrong_password',
        name: 'Test User'
      }

      expect(response).to have_http_status(422)
      expect(JSON.parse(response.body)['message']).to eq('Password confirmation does not match')
    end
  end

  describe 'POST /api/v1/users/login' do
    it 'logs in an existing user' do
      post '/api/v1/users/login', params: { email: user.email, password: 'password' }

      expect(response).to have_http_status(201)
      expect(JSON.parse(response.body)['message']).to eq('Login successful')
    end

    it 'returns an error for incorrect credentials' do
      post '/api/v1/users/login', params: { email: user.email, password: 'wrong_password' }

      expect(response).to have_http_status(401)
      expect(JSON.parse(response.body)['message']).to eq('Invalid email or password')
    end
  end

  describe 'DELETE /api/v1/users/logout' do
    it 'logs out a user' do
      post '/api/v1/users/login', params: { email: user.email, password: 'password' }
      delete '/api/v1/users/logout'

      expect(response).to have_http_status(200)
      expect(JSON.parse(response.body)['message']).to eq('Logout successful')
    end
  end

  describe 'PUT /api/v1/users/update_profile' do
    it 'updates the user profile' do
      post '/api/v1/users/login', params: { email: user.email, password: 'password' }
      put '/api/v1/users/update_profile', params: {
        current_password: 'password',
        name: 'Updated Name'
      }

      expect(response).to have_http_status(200)
      expect(JSON.parse(response.body)['user']['name']).to eq('Updated Name')
    end

    it 'fails if current password is incorrect' do
      post '/api/v1/users/login', params: { email: user.email, password: 'password' }
      put '/api/v1/users/update_profile', params: {
        current_password: 'wrong_password',
        name: 'Updated Name'
      }

      expect(response).to have_http_status(422)
      expect(JSON.parse(response.body)['message']).to eq('Current password is incorrect')
    end
  end

  describe 'DELETE /api/v1/users/delete_account' do
    it 'deletes the user account' do
      post '/api/v1/users/login', params: { email: user.email, password: 'password' }
      delete '/api/v1/users/delete_account', params: { current_password: 'password' }

      expect(response).to have_http_status(200)
      expect(JSON.parse(response.body)['message']).to eq('Account successfully deleted')
    end

    context 'when password is incorrect' do
      it 'returns an error' do
        post '/api/v1/users/login', params: { email: user.email, password: 'password' }
        delete '/api/v1/users/delete_account', params: { current_password: 'wrong_password' }

        expect(response).to have_http_status(422)
        expect(JSON.parse(response.body)['message']).to eq('Current password is incorrect')
      end
    end
  end
end
