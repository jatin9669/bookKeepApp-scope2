class BorrowedBooksController < ApplicationController
  before_action :set_borrowed_book, only: %i[ show edit destroy ]

  # GET /borrowed_books or /borrowed_books.json
  def index
    @borrowed_books = BorrowedBook.all
  end

  # GET /borrowed_books/new
  def new
    @borrowed_book = BorrowedBook.new
  end

  # POST /borrowed_books or /borrowed_books.json
  def create
    existing_record = BorrowedBook.find_by(user_id: borrowed_book_params[:user_id], book_id: borrowed_book_params[:book_id])
    
    if existing_record
      existing_record.quantity += Integer(borrowed_book_params[:quantity])
      existing_record.save!
      flash[:notice] = 'Book request updated successfully.'
    else
      @borrowed_book = BorrowedBook.new(borrowed_book_params)
      @borrowed_book.save!
      flash[:notice] = 'Book request submitted successfully.'
    end
    
    redirect_to books_path
  end

  # DELETE /borrowed_books/1 or /borrowed_books/1.json
  def destroy
    @borrowed_book.destroy!

    respond_to do |format|
      format.html { redirect_to borrowed_books_path, status: :see_other, notice: "Borrowed book was successfully destroyed." }
      format.json { head :no_content }
    end
  end

  def my_books
    @borrowed_books = BorrowedBook.where(user_id: current_user.id)
  
    if params[:query].present?
      book_ids = Book.search(params[:query]).pluck(:id)
      @borrowed_books = @borrowed_books.where(book_id: book_ids)
    end
  
    @borrowed_books = @borrowed_books.order(created_at: :asc)
  end
  
  def request_return
    @borrowed_books = BorrowedBook.where(user_id: current_user.id)
    @return_book = ReturnedBook.all
    if params[:query].present?
      book_ids = Book.search(params[:query]).pluck(:id)
      @borrowed_books = @borrowed_books.where(book_id: book_ids)
    end
    @borrowed_books = @borrowed_books.map do |book|
      book.quantity = book.quantity - @return_book.where(borrowed_book_id: book.id).sum(:quantity)
      book
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_borrowed_book
      @borrowed_book = BorrowedBook.find(params.expect(:id))
    end

    # Only allow a list of trusted parameters through.
    def borrowed_book_params
      params.expect(borrowed_book: [ :user_id, :book_id, :quantity ])
    end
end
