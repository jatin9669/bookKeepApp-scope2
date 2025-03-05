class IssuedBooksController < ApplicationController
  before_action :authenticate_user!
  before_action :require_admin, only: %i[ index destroy ]
  before_action :set_issued_book, only: %i[ destroy ]

  # GET /issued_books or /issued_books.json
  def index
    @issued_books = IssuedBook.includes(:book, :user)
    
    if params[:query].present?
      book_ids = Book.search(params[:query]).pluck(:id)
      @issued_books = @issued_books.where(book_id: book_ids)
    end
    
    @issued_books = @issued_books.order(created_at: :asc)
  end

  # POST /issued_books or /issued_books.json
  def create
    existing_record = IssuedBook.find_by(user_id: issued_book_params[:user_id], book_id: issued_book_params[:book_id])

    if existing_record
      flash[:alert] = 'You have already requested this book.'
      redirect_to books_path
    else
      @issued_book = IssuedBook.new(issued_book_params)
    
    if @issued_book.save
      flash[:alert] = "Book issued successfully!"
      redirect_to books_path
    else
      flash[:alert] = "Failed to issue book."
      redirect_to books_path
    end
    end
  end

  # DELETE /issued_books/1 or /issued_books/1.json
  def destroy
    @issued_book.destroy!

    respond_to do |format|
      format.html { redirect_to issued_books_path, status: :see_other, notice: "Issued book was successfully destroyed." }
      format.json { head :no_content }
    end
  end

  def issue_book
    @issued_book = IssuedBook.new(issued_book_params)
  
    if @issued_book.save
      flash[:notice] = "Book issued successfully."
      render json: { success: true }
    else
      flash[:alert] = "Failed to issue book."
      render json: { success: false }
    end
  end
  

  def approve_issue
    @issued_book = IssuedBook.find(params.expect(:id))
    @book = Book.find(@issued_book.book_id)
    if @book.total_quantity < @issued_book.quantity
      flash[:alert] = 'Not enough books in stock.'
      redirect_to issued_books_path
      @issued_book.destroy!
    else
      @book.total_quantity -= @issued_book.quantity
      @book.save!
      existing_record = BorrowedBook.find_by(user_id: @issued_book.user_id, book_id: @issued_book.book_id)
      if existing_record
        existing_record.quantity += @issued_book.quantity
        existing_record.save!
      else
        @borrowed_book = BorrowedBook.new(book_id: @issued_book.book_id, user_id: @issued_book.user_id, quantity: @issued_book.quantity)
        @borrowed_book.save!
      end
      @issued_book.destroy!
      redirect_to issued_books_path, notice: 'Book issued successfully.'
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_issued_book
      @issued_book = IssuedBook.find(params.expect(:id))
    end

    # Only allow a list of trusted parameters through.
    def issued_book_params
      params.require(:issued_book).permit(:book_id, :user_id, :quantity)
    end

    def require_admin
      unless current_user.is_admin?
        flash[:alert] = "You are not authorized to access this page."
        redirect_to root_path
      end
    end
end
