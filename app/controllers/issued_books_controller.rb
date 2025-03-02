class IssuedBooksController < ApplicationController
  before_action :authenticate_user!
  before_action :require_admin
  before_action :set_issued_book, only: %i[ show edit update destroy ]

  # GET /issued_books or /issued_books.json
  def index
    @issued_books = IssuedBook.includes(:book, :user)
    
    if params[:query].present?
      book_ids = Book.search(params[:query]).pluck(:id)
      @issued_books = @issued_books.where(book_id: book_ids)
    end
    
    @issued_books = @issued_books.order(created_at: :asc)
  end

  # GET /issued_books/1 or /issued_books/1.json
  def show
  end

  # GET /issued_books/new
  def new
    @issued_book = IssuedBook.new
  end

  # GET /issued_books/1/edit
  def edit
  end

  # POST /issued_books or /issued_books.json
  def create
    existing_record = IssuedBook.find_by(user_id: issued_book_params[:user_id], book_id: issued_book_params[:book_id])

    if existing_record
      redirect_to books_path, alert: 'You have already requested this book.'
    else
      @issued_book = IssuedBook.new(issued_book_params)
    
    if @issued_book.save
      redirect_to books_path, notice: 'Book request submitted successfully.'
    else
        redirect_to books_path, alert: 'Unable to request book.'
      end
    end
  end

  # PATCH/PUT /issued_books/1 or /issued_books/1.json
  def update
    respond_to do |format|
      if @issued_book.update(issued_book_params)
        format.html { redirect_to @issued_book, notice: "Issued book was successfully updated." }
        format.json { render :show, status: :ok, location: @issued_book }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @issued_book.errors, status: :unprocessable_entity }
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
    @issued_book = IssuedBook.find(params.expect(:id))
    @issued_book.destroy!
    @book = Book.find(@issued_book.book_id)
    if @book.user_id.present?
      alert = "Book already issued to another user."
      redirect_to issued_books_path, alert: alert
    else
      @book.user_id = @issued_book.user_id
      @book.save!
      notice = "Book issued successfully."
      redirect_to issued_books_path, notice: notice
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_issued_book
      @issued_book = IssuedBook.find(params.expect(:id))
    end

    # Only allow a list of trusted parameters through.
    def issued_book_params
      params.require(:issued_book).permit(:book_id, :user_id)
    end

    def require_admin
      unless current_user.is_admin?
        flash[:alert] = "You are not authorized to access this page."
        redirect_to root_path
      end
    end
end
