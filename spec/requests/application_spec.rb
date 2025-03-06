require 'rails_helper'

RSpec.describe "Devise Parameter Sanitization", type: :request do
  include Devise::Test::IntegrationHelpers
  let(:user) { create(:user) }
  describe "POST /users" do
    it "allows name and is_admin in sign-up" do
      post user_registration_path, params: { user: { email: "newuser@example.com", password: "password", password_confirmation: "password", name: "user", is_admin: true } }
      expect(User.last.name).to eq("user")
      expect(User.last.is_admin).to be_truthy
    end
  end

  describe "PUT /users" do
    before { sign_in user }

    it "allows updating name and is_admin" do
      put user_registration_path, params: { 
        user: { 
          name: "Updated User", 
          is_admin: true, 
          current_password: user.password
        } 
      }
      user.reload
      expect(user.name).to eq("Updated User")
      expect(user.is_admin).to be_truthy
    end
  end
end
