require "test_helper"

class ReturnedBooksControllerTest < ActionDispatch::IntegrationTest
  setup do
    @returned_book = returned_books(:one)
  end

  test "should get index" do
    get returned_books_url
    assert_response :success
  end

  test "should get new" do
    get new_returned_book_url
    assert_response :success
  end

  test "should create returned_book" do
    assert_difference("ReturnedBook.count") do
      post returned_books_url, params: { returned_book: { book_id: @returned_book.book_id, user_id: @returned_book.user_id } }
    end

    assert_redirected_to returned_book_url(ReturnedBook.last)
  end

  test "should show returned_book" do
    get returned_book_url(@returned_book)
    assert_response :success
  end

  test "should get edit" do
    get edit_returned_book_url(@returned_book)
    assert_response :success
  end

  test "should update returned_book" do
    patch returned_book_url(@returned_book), params: { returned_book: { book_id: @returned_book.book_id, user_id: @returned_book.user_id } }
    assert_redirected_to returned_book_url(@returned_book)
  end

  test "should destroy returned_book" do
    assert_difference("ReturnedBook.count", -1) do
      delete returned_book_url(@returned_book)
    end

    assert_redirected_to returned_books_url
  end
end
