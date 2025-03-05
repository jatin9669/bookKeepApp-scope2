class ReturnedBooksController < ApplicationController
  before_action :authenticate_user!
  before_action :require_admin, only: %i[ index destroy ]
  before_action :set_returned_book, only: %i[ destroy ]

  # GET /returned_books or /returned_books.json
  def index
    @returned_books = ReturnedBook.all
    
    if params[:query].present?
      book_ids = Book.search(params[:query]).pluck(:id)
      borrowed_books_ids = BorrowedBook.where(book_id: book_ids).pluck(:id)
      @returned_books = @returned_books.where(borrowed_book_id: borrowed_books_ids)
    end
    
    @returned_books = @returned_books.order(created_at: :asc)
  end

  # POST /returned_books or /returned_books.json
  def create
    @returned_book = ReturnedBook.new(returned_book_params)

    if @returned_book.save
      flash[:notice] = 'Book return request submitted successfully.'
    else
      flash[:alert] = 'Unable to request book.'
    end
  end

  def request_return_book
    existing_record = ReturnedBook.find_by(borrowed_book_id: returned_book_params[:borrowed_book_id])
    if existing_record
      existing_record.quantity += returned_book_params[:quantity]
      existing_record.save!
      flash[:notice] = 'Book return request submitted successfully.'
      render json: { success: true }
    else
      @returned_book = ReturnedBook.new(returned_book_params)
      if @returned_book.save
        flash[:notice] = 'Book return request submitted successfully.'
        render json: { success: true }
      else
        flash[:alert] = 'Unable to request book.'
        render json: { success: false }
      end
    end
  end

  def approve_return_book
    @returned_book = ReturnedBook.find(params.expect(:id))
    @borrowed_book = BorrowedBook.find(@returned_book.borrowed_book_id)
    @book = Book.find(@borrowed_book.book_id)
    @book.total_quantity += @returned_book.quantity
    @book.save!
    @borrowed_book.quantity -= @returned_book.quantity
    if @borrowed_book.quantity == 0
      @borrowed_book.destroy!
    else
      @borrowed_book.save!
    end
    @returned_book.destroy!
    redirect_to "/request_return", notice: 'Book return request approved successfully.'
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
      params.require(:returned_book).permit(:borrowed_book_id, :quantity)
    end

    def require_admin
      unless current_user.is_admin?
        flash[:alert] = "You are not authorized to access this page."
        redirect_to root_path
      end
    end
end
