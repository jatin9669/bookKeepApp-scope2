module V1
  class BorrowedBooks < Grape::API
    version 'v1'
    format :json
    prefix :api
    
    resource :borrowed_books do
      desc 'Get all borrowed books'
      get do
        authenticate_user!
        error!('Unauthorized. Admins dont have collections.', 401) if current_user.is_admin?
        
        BorrowedBook.all
      end

      desc 'Create a new borrowed book record'
      params do
        requires :user_id, type: Integer
        requires :book_id, type: Integer
        requires :quantity, type: Integer
      end
      post do
        authenticate_user!
        error!('Unauthorized. Admins dont have collections.', 401) if current_user.is_admin?

        existing_record = BorrowedBook.find_by(
          user_id: params[:user_id], 
          book_id: params[:book_id]
        )
        
        if existing_record
          existing_record.quantity += params[:quantity]
          existing_record.save!
          { message: 'Book request updated successfully', borrowed_book: existing_record }
        else
          borrowed_book = BorrowedBook.create!(
            user_id: params[:user_id],
            book_id: params[:book_id],
            quantity: params[:quantity]
          )
          { message: 'Book request submitted successfully', borrowed_book: borrowed_book }
        end
      end

      desc 'Get all books left to raise return request'
      params do
        requires :user_id, type: Integer, desc: 'ID of the user'
      end
      get 'user/:user_id' do
        authenticate_user!
        
        # Check if the current user is the requested user or an admin
        if current_user.id != params[:user_id].to_i || current_user.is_admin?
          error!('Unauthorized. You can only view your own returned books.', 401)
        end
        
        borrowed_books = BorrowedBook.where(user_id: params[:user_id]).includes(:book, :user)
        returned_books = ReturnedBook.where(borrowed_book_id: borrowed_books.pluck(:id))

        if params[:query].present?
          book_ids = Book.search(params[:query]).pluck(:id)
          borrowed_books = borrowed_books.where(book_id: book_ids)
        end

        borrowed_books = borrowed_books.order(created_at: :asc)

        borrowed_books.map do |borrowed_book|
          return_book = returned_books.find_by(borrowed_book_id: borrowed_book.id)
          if return_book && (borrowed_book.quantity - return_book.quantity) > 0
            {
              id: borrowed_book.id,
              book_id: borrowed_book.book_id,
              user_id: borrowed_book.user_id,
              book_name: borrowed_book.book.book_name,
              author_name: borrowed_book.book.author_name,
              image_url: borrowed_book.book.image_url,
              total_quantity: borrowed_book.book.total_quantity,
              quantity: borrowed_book.quantity - return_book.quantity,
              name: borrowed_book.user.name,
              email: borrowed_book.user.email,
            }
          elsif return_book.nil?
            {
              id: borrowed_book.id,
              book_id: borrowed_book.book_id,
              user_id: borrowed_book.user_id,
              book_name: borrowed_book.book.book_name,
              author_name: borrowed_book.book.author_name,
              image_url: borrowed_book.book.image_url,
              total_quantity: borrowed_book.book.total_quantity,
              quantity: borrowed_book.quantity,
              name: borrowed_book.user.name,
              email: borrowed_book.user.email,
            }
          end
        end.compact
      end

      desc 'Get my borrowed books'
        get :my_books do
          authenticate_user!
          error!('Unauthorized. Admins dont have collections.', 401) if current_user.is_admin?

          # Eager load the associated `book` and `user` records
          borrowed_books = BorrowedBook.where(user_id: current_user.id).includes(:book, :user)

          if params[:query].present?
            book_ids = Book.search(params[:query]).pluck(:id)
            borrowed_books = borrowed_books.where(book_id: book_ids)
          end

          # Return the borrowed books with their associated `book` and `user` records
          borrowed_books.order(created_at: :asc).map do |borrowed_book|
            {
              id: borrowed_book.id,
              user_id: borrowed_book.user_id,
              name: borrowed_book.user.name,
              email: borrowed_book.user.email,
              book_id: borrowed_book.book_id,
              book_name: borrowed_book.book.book_name,
              author_name: borrowed_book.book.author_name,
              image_url: borrowed_book.book.image_url,
              total_quantity: borrowed_book.book.total_quantity,
              quantity: borrowed_book.quantity,
            }
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