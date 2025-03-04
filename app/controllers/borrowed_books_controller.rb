class BorrowedBooksController < ApplicationController
  before_action :set_borrowed_book, only: %i[ show edit update destroy ]

  # GET /borrowed_books or /borrowed_books.json
  def index
    @borrowed_books = BorrowedBook.all
  end

  # GET /borrowed_books/1 or /borrowed_books/1.json
  def show
  end

  # GET /borrowed_books/new
  def new
    @borrowed_book = BorrowedBook.new
  end

  # GET /borrowed_books/1/edit
  def edit
  end

  # POST /borrowed_books or /borrowed_books.json
  def create
    existing_record = BorrowedBook.find_by(user_id: borrowed_book_params[:user_id], book_id: borrowed_book_params[:book_id])
    # puts "existing_record: #{existing_record}"

    if existing_record
      existing_record.quantity += Integer(borrowed_book_params[:quantity])
      existing_record.save!
    else
      @borrowed_book = BorrowedBook.new(borrowed_book_params)
      @borrowed_book.save!
    end
    flash[:notice] = 'Book request submitted successfully.'
    redirect_to books_path
  end

  # PATCH/PUT /borrowed_books/1 or /borrowed_books/1.json
  def update
    respond_to do |format|
      if @borrowed_book.update(borrowed_book_params)
        format.html { redirect_to @borrowed_book, notice: "Borrowed book was successfully updated." }
        format.json { render :show, status: :ok, location: @borrowed_book }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @borrowed_book.errors, status: :unprocessable_entity }
      end
    end
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
      @borrowed_books = @borrowed_books.search(params[:query])
    end
    
    @borrowed_books = @borrowed_books.order(created_at: :asc)
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
