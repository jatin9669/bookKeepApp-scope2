module V1
  class IssuedBooks < Grape::API
    version 'v1'
    format :json
    prefix :api
    
    resource :issued_books do
      desc 'Get all issued books'
      get do
        authenticate_user!
        error!('Unauthorized. Admin access required.', 401) unless current_user.is_admin?
        
        issued_books = IssuedBook.includes(:book, :user).all
        
        if params[:query].present?
          book_ids = Book.search(params[:query]).pluck(:id)
          issued_books = issued_books.where(book_id: book_ids)
        end
        
        issued_books.order(created_at: :asc).map do |issued_book|
          {
            id: issued_book.id,
            book_id: issued_book.book_id,
            user_id: issued_book.user_id,
            quantity: issued_book.quantity,
            book_name: issued_book.book.book_name,
            author_name: issued_book.book.author_name,
            image_url: issued_book.book.image_url,
            total_quantity: issued_book.book.total_quantity,
            name: issued_book.user.name,
            email: issued_book.user.email,
            created_at: issued_book.created_at
          }
        end
      end

      desc 'Create a new issued book request'
      params do
        requires :book_id, type: Integer
        requires :user_id, type: Integer
        requires :quantity, type: Integer
      end
      post do
        authenticate_user!
        
        issued_book = IssuedBook.new(
          book_id: params[:book_id],
          user_id: params[:user_id],
          quantity: params[:quantity]
        )
        
        if issued_book.save
          { success: true, message: 'Book issued successfully', issued_book: issued_book }
        else
          error!({ success: false, message: 'Failed to issue book', errors: issued_book.errors.full_messages }, 422)
        end
      end

      desc 'Delete an issued book'
      delete ':id' do
        authenticate_user!
        error!('Unauthorized. Admin access required.', 401) unless current_user.is_admin?
        
        issued_book = IssuedBook.find(params[:id])
        issued_book.destroy
        { message: 'Issued book was successfully destroyed' }
      end

      desc 'Approve an issued book request'
      post 'approve/:id' do
        authenticate_user!
        error!('Unauthorized. Admin access required.', 401) unless current_user.is_admin?
        
        issued_book = IssuedBook.find(params[:id])
        book = Book.find(issued_book.book_id)
        
        if book.total_quantity < issued_book.quantity
          issued_book.destroy!
          error!({ message: 'Not enough books in stock.' }, 422)
        else
          book.total_quantity -= issued_book.quantity
          book.save!
          
          existing_record = BorrowedBook.find_by(
            user_id: issued_book.user_id, 
            book_id: issued_book.book_id
          )
          
          if existing_record
            existing_record.quantity += issued_book.quantity
            existing_record.save!
          else
            BorrowedBook.create!(
              book_id: issued_book.book_id,
              user_id: issued_book.user_id,
              quantity: issued_book.quantity
            )
          end
          
          issued_book.destroy!
          { message: 'Book issued successfully' }
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
