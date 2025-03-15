module V1
  class Books < Grape::API
    version 'v1'
    format :json
    prefix :api
    
    resource :books do
      desc 'Return list of books'
      get do
        books = Book.order(created_at: :asc)
        puts "books: #{books}"
        
        if params[:query].present?
          books = books.search(params[:query])
        end

        if current_user && !current_user.is_admin?
          issued_books = IssuedBook.where(user_id: current_user.id)
          books.map do |book|
            book_quantity = book.total_quantity - issued_books.where(book_id: book.id).sum(:quantity)
            {
              id: book.id,
              book_name: book.book_name,
              author_name: book.author_name,
              image_url: book.image_url,
              total_quantity: [book_quantity, 0].max
            }
          end
        else
          books
        end
      end

      desc 'Return a specific book'
      get ':id' do
        Book.find(params[:id])
      end

      desc 'Create a new book'
      params do
        requires :book_name, type: String
        requires :author_name, type: String
        requires :total_quantity, type: Integer
        optional :image_url, type: String
      end
      post do
        authenticate_user!
        error!('Unauthorized', 401) unless current_user.is_admin?
        
        Book.create!(
          book_name: params[:book_name],
          author_name: params[:author_name],
          total_quantity: params[:total_quantity],
          image_url: params[:image_url]
        )
      end

      desc 'Update a book'
      params do
        optional :book_name, type: String
        optional :author_name, type: String
        optional :total_quantity, type: Integer
        optional :image_url, type: String
      end
      put ':id' do
        authenticate_user!
        error!('Unauthorized', 401) unless current_user.is_admin?
        
        book = Book.find(params[:id])
        book.update!(declared(params, include_missing: false))
        book
      end

      desc 'Delete a book'
      delete ':id' do
        authenticate_user!
        error!('Unauthorized', 401) unless current_user.is_admin?
        
        book = Book.find(params[:id])
        book.destroy
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
