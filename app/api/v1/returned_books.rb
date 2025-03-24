module V1
  class ReturnedBooks < Grape::API
    version 'v1'
    format :json
    prefix :api
    
    resource :returned_books do
      desc 'Get all returned books'
      get do
        authenticate_user!
        error!('Unauthorized. Admin access required.', 401) unless current_user.is_admin?
        
        returned_books = ReturnedBook.all
        
        if params[:query].present?
          book_ids = Book.search(params[:query]).pluck(:id)
          borrowed_books_ids = BorrowedBook.where(book_id: book_ids).pluck(:id)
          returned_books = returned_books.where(borrowed_book_id: borrowed_books_ids)
        end
        
        returned_books.order(created_at: :asc).map do |returned_book|
          {
            id: returned_book.id,
            borrowed_book_id: returned_book.borrowed_book_id,
            book_id: returned_book.borrowed_book.book_id,
            user_id: returned_book.borrowed_book.user_id,
            quantity: returned_book.quantity,
            book_name: returned_book.borrowed_book.book.book_name,
            author_name: returned_book.borrowed_book.book.author_name,
            image_url: returned_book.borrowed_book.book.image_url,
            total_quantity: returned_book.borrowed_book.book.total_quantity,
            name: returned_book.borrowed_book.user.name,
            email: returned_book.borrowed_book.user.email,
            created_at: returned_book.created_at
          }
        end
      end

      desc 'Create a return request'
      params do
        requires :borrowed_book_id, type: Integer
        requires :quantity, type: Integer
      end
      post do
        authenticate_user!
        error!("Unauthorized. Admin can't request book return.", 401) if current_user.is_admin?
        
        existing_record = ReturnedBook.find_by(borrowed_book_id: params[:borrowed_book_id])
        
        if existing_record
          existing_record.quantity += params[:quantity]
          if existing_record.save
            { success: true, message: 'Book return request updated successfully' }
          else
            error!({ success: false, message: 'Unable to request book return' }, 422)
          end
        else
          returned_book = ReturnedBook.new(
            borrowed_book_id: params[:borrowed_book_id],
            quantity: params[:quantity]
          )
          
          if returned_book.save
            { success: true, message: 'Book return request submitted successfully' }
          else
            error!({ success: false, message: 'Unable to request book return' }, 422)
          end
        end
      end

      desc 'Approve a return request'
      post 'approve/:id' do
        authenticate_user!
        error!('Unauthorized. Admin access required.', 401) unless current_user.is_admin?
        
        returned_book = ReturnedBook.find(params[:id])
        borrowed_book = BorrowedBook.find(returned_book.borrowed_book_id)
        book = Book.find(borrowed_book.book_id)
        
        begin
          ActiveRecord::Base.transaction do
            book.total_quantity += returned_book.quantity
            book.save!
            
            borrowed_book.quantity -= returned_book.quantity
            if borrowed_book.quantity == 0
              borrowed_book.destroy!
            else
              borrowed_book.save!
            end
            
            returned_book.destroy!
          end
          
          { success: true, message: 'Book return request approved successfully' }
        rescue => e
          error!({ success: false, message: 'Failed to approve return request', error: e.message }, 422)
        end
      end

      desc 'Delete a return request'
      delete ':id' do
        authenticate_user!
        error!('Unauthorized. Admin access required.', 401) unless current_user.is_admin?
        
        returned_book = ReturnedBook.find(params[:id])
        returned_book.destroy!
        { success: true, message: 'Return request was successfully destroyed' }
      end
    end

    helpers do
      def current_user
        puts "Session ID: #{request.session[:user_id]}"  # Debug line
        @current_user ||= User.find_by(id: request.session[:user_id])
      end

      def authenticate_user!
        puts "Current User: #{current_user.inspect}"  # Debug line
        error!('Unauthorized', 401) unless current_user
      end
    end
  end
end
