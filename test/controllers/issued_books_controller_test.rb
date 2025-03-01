require "test_helper"

class IssuedBooksControllerTest < ActionDispatch::IntegrationTest
  setup do
    @issued_book = issued_books(:one)
  end

  test "should get index" do
    get issued_books_url
    assert_response :success
  end

  test "should get new" do
    get new_issued_book_url
    assert_response :success
  end

  test "should create issued_book" do
    assert_difference("IssuedBook.count") do
      post issued_books_url, params: { issued_book: { book_id: @issued_book.book_id, user_id: @issued_book.user_id } }
    end

    assert_redirected_to issued_book_url(IssuedBook.last)
  end

  test "should show issued_book" do
    get issued_book_url(@issued_book)
    assert_response :success
  end

  test "should get edit" do
    get edit_issued_book_url(@issued_book)
    assert_response :success
  end

  test "should update issued_book" do
    patch issued_book_url(@issued_book), params: { issued_book: { book_id: @issued_book.book_id, user_id: @issued_book.user_id } }
    assert_redirected_to issued_book_url(@issued_book)
  end

  test "should destroy issued_book" do
    assert_difference("IssuedBook.count", -1) do
      delete issued_book_url(@issued_book)
    end

    assert_redirected_to issued_books_url
  end
end
