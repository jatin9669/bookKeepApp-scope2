module V1
  class Users < Grape::API
    version 'v1'
    format :json
    prefix :api

    use ActionDispatch::Session::CookieStore

    resource :users do
      desc 'User registration'
      params do
        requires :email, type: String, regexp: /.+@.+/
        requires :password, type: String
        requires :password_confirmation, type: String
        requires :name, type: String
      end
      post :register do
        if params[:password] != params[:password_confirmation]
          error!({ message: 'Password confirmation does not match' }, 422)
        end

        user = User.new(
          email: params[:email],
          password: params[:password],
          password_confirmation: params[:password_confirmation],
          name: params[:name],
          is_admin: false
        )

        if user.save
          request.session[:user_id] = user.id
          {
            message: 'Registration successful',
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              is_admin: user.is_admin
            }
          }
        else
          error!({ message: 'Registration failed', errors: user.errors.full_messages }, 422)
        end
      end

      desc 'User login'
      params do
        requires :email, type: String
        requires :password, type: String
      end
      post :login do
        user = User.find_by(email: params[:email])

        if user&.valid_password?(params[:password])
          request.session[:user_id] = user.id
          {
            message: 'Login successful',
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              is_admin: user.is_admin
            }
          }
        else
          error!({ message: 'Invalid email or password' }, 401)
        end
      end

      desc 'User logout'
      delete :logout do
        authenticate_user!
        request.session[:user_id] = nil
        { message: 'Logout successful' }
      end

      desc 'Delete user account'
      delete :delete_account do
        authenticate_user!
        if current_user.destroy
          request.session[:user_id] = nil
          { message: 'Account successfully deleted' }
        else
          error!({ message: 'Failed to delete account', errors: current_user.errors.full_messages }, 422)
        end
      end

      desc 'Get current user profile'
      get :profile do
        authenticate_user!
        {
          id: current_user.id,
          name: current_user.name,
          email: current_user.email,
          is_admin: current_user.is_admin
        }
      end

      desc 'Update user profile'
      params do
        optional :email, type: String, regexp: /.+@.+/
        optional :name, type: String
        optional :current_password, type: String
        optional :password, type: String
        optional :password_confirmation, type: String
      end
      put :update_profile do
        authenticate_user!

        # Require current password for ANY profile update
        unless params[:current_password].present? && current_user.valid_password?(params[:current_password])
          error!({ message: 'Current password is incorrect' }, 422)
        end

        # Additional password validation only if changing password
        if params[:password].present?
          if params[:password] != params[:password_confirmation]
            error!({ message: 'Password confirmation does not match' }, 422)
          end
        end

        update_params = {}
        update_params[:email] = params[:email] if params[:email].present?
        update_params[:name] = params[:name] if params[:name].present?
        update_params[:password] = params[:password] if params[:password].present?
        update_params[:password_confirmation] = params[:password_confirmation] if params[:password_confirmation].present?

        if current_user.update(update_params)
          {
            message: 'Profile updated successfully',
            user: {
              id: current_user.id,
              name: current_user.name,
              email: current_user.email,
              is_admin: current_user.is_admin
            }
          }
        else
          error!({ message: 'Update failed', errors: current_user.errors.full_messages }, 422)
        end
      end

      # Admin only endpoints
      desc 'Get all users (Admin only)'
      params do
        optional :current_password, type: String
      end
      get do
        authenticate_user!
        error!('Unauthorized. Admin access required.', 401) unless current_user.is_admin?
        unless params[:current_password].present? && current_user.valid_password?(params[:current_password])
          error!({ message: 'Current password is incorrect' }, 422)
        end
        users = User.all.order(created_at: :asc)
        users.map do |user|
          {
            id: user.id,
            name: user.name,
            email: user.email,
            is_admin: user.is_admin,
            created_at: user.created_at
          }
        end
      end

      desc 'Update user admin status (Admin only)'
      params do
        requires :user_id, type: Integer
        requires :is_admin, type: Boolean
      end
      put :update_admin_status do
        authenticate_user!
        error!('Unauthorized. Admin access required.', 401) unless current_user.is_admin?
        
        user = User.find(params[:user_id])
        if user.update(is_admin: params[:is_admin])
          {
            message: 'User admin status updated successfully',
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              is_admin: user.is_admin
            }
          }
        else
          error!({ message: 'Update failed', errors: user.errors.full_messages }, 422)
        end
      end
    end

    helpers do
      def current_user
        @current_user ||= User.find_by(id: request.session[:user_id])
      end

      def authenticate_user!
        error!('Unauthorized', 401) unless current_user
      end
    end
  end
end
