class BooksController < ApplicationController
  before_action :authenticate_user!, except: %i[ index show ]
  before_action :set_book, only: %i[ show edit update destroy ]
  before_action :require_admin, only: %i[ update destroy create new edit ]

  # GET /books or /books.json
  def index
  if user_signed_in? && !current_user.is_admin?
    issued_books = IssuedBook.where(user_id: current_user.id)
    @books = Book.all
    @books = @books.search(params[:query]) if params[:query].present?
    @books = @books.order(created_at: :asc)

    
    # Adjust quantities without converting @books to an array
    @books = @books.map do |book|
      book.total_quantity -= issued_books.where(book_id: book.id).sum(:quantity)
      book.total_quantity = 0 if book.total_quantity < 0
      book
    end
  else
    @books = Book.all
    @books = @books.order(created_at: :asc)
    @books = @books.search(params[:query]) if params[:query].present?
  end
end

  
  # GET /books/1 or /books/1.json
  def show
  end

  # GET /books/new
  def new
    @book = Book.new
  end

  # GET /books/1/edit
  def edit
  end

  # POST /books or /books.json
  def create
    @book = Book.new(book_params)

    respond_to do |format|
      if @book.save
        format.html { redirect_to @book, notice: "Book was successfully created." }
        format.json { render :show, status: :created, location: @book }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @book.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /books/1 or /books/1.json
  def update
    respond_to do |format|
      if @book.update(book_params)
        format.html { redirect_to @book, notice: "Book was successfully updated." }
        format.json { render :show, status: :ok, location: @book }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @book.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /books/1 or /books/1.json
  def destroy
    @book.destroy!

    respond_to do |format|
      format.html { redirect_to books_path, status: :see_other, notice: "Book was successfully destroyed." }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_book
      @book = Book.find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def book_params
      params.expect(book: [ :author_name, :book_name, :image_url, :total_quantity ])
    end

    def require_admin
      unless current_user.is_admin?
        flash[:alert] = "You can not perform this action."
        redirect_to root_path
      end
    end
end
