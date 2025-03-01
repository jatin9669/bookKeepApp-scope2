require "application_system_test_case"

class ReturnedBooksTest < ApplicationSystemTestCase
  setup do
    @returned_book = returned_books(:one)
  end

  test "visiting the index" do
    visit returned_books_url
    assert_selector "h1", text: "Returned books"
  end

  test "should create returned book" do
    visit returned_books_url
    click_on "New returned book"

    fill_in "Book", with: @returned_book.book_id
    fill_in "User", with: @returned_book.user_id
    click_on "Create Returned book"

    assert_text "Returned book was successfully created"
    click_on "Back"
  end

  test "should update Returned book" do
    visit returned_book_url(@returned_book)
    click_on "Edit this returned book", match: :first

    fill_in "Book", with: @returned_book.book_id
    fill_in "User", with: @returned_book.user_id
    click_on "Update Returned book"

    assert_text "Returned book was successfully updated"
    click_on "Back"
  end

  test "should destroy Returned book" do
    visit returned_book_url(@returned_book)
    click_on "Destroy this returned book", match: :first

    assert_text "Returned book was successfully destroyed"
  end
end
