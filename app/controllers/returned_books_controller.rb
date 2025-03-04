class ReturnedBooksController < ApplicationController
  before_action :authenticate_user!
  before_action :require_admin, only: %i[ index destroy ]
  before_action :set_returned_book, only: %i[ destroy ]

  # GET /returned_books or /returned_books.json
  def index
    @returned_books = ReturnedBook.includes(:book, :user)
    
    if params[:query].present?
      book_ids = Book.search(params[:query]).pluck(:id)
      @returned_books = @returned_books.where(book_id: book_ids)
    end
    
    @returned_books = @returned_books.order(created_at: :asc)
  end

  # POST /returned_books or /returned_books.json
  def create
    existing_record = ReturnedBook.find_by(user_id: returned_book_params[:user_id], book_id: returned_book_params[:book_id])
  
    if existing_record
      redirect_to my_books_path, alert: 'You have already requested a return for this book.'
    else
      @returned_book = ReturnedBook.new(returned_book_params)
  
      if @returned_book.save
        redirect_to my_books_path, notice: 'Book return request submitted successfully.'
      else
        redirect_to my_books_path, alert: 'Unable to request book.'
      end
    end
  end
  
  def return_book
    @returned_book = ReturnedBook.find(params.expect(:id))
    @returned_book.destroy!
    @book = Book.find(@returned_book.book_id)
    @book.user_id = nil
    @book.save!
    notice = "Book return request sent successfully."
    redirect_to returned_books_path, notice: notice
  end

  # DELETE /returned_books/1 or /returned_books/1.json
  def destroy
    @returned_book.destroy!

    respond_to do |format|
      format.html { redirect_to returned_books_path, status: :see_other, alert: "Returned book was successfully destroyed." }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_returned_book
      @returned_book = ReturnedBook.find(params.expect(:id))
    end

    # Only allow a list of trusted parameters through.
    def returned_book_params
      params.expect(returned_book: [ :user_id, :book_id ])
    end

    def require_admin
      unless current_user.is_admin?
        flash[:alert] = "You are not authorized to access this page."
        redirect_to root_path
      end
    end
end
