require "application_system_test_case"

class IssuedBooksTest < ApplicationSystemTestCase
  setup do
    @issued_book = issued_books(:one)
  end

  test "visiting the index" do
    visit issued_books_url
    assert_selector "h1", text: "Issued books"
  end

  test "should create issued book" do
    visit issued_books_url
    click_on "New issued book"

    fill_in "Book", with: @issued_book.book_id
    fill_in "User", with: @issued_book.user_id
    click_on "Create Issued book"

    assert_text "Issued book was successfully created"
    click_on "Back"
  end

  test "should update Issued book" do
    visit issued_book_url(@issued_book)
    click_on "Edit this issued book", match: :first

    fill_in "Book", with: @issued_book.book_id
    fill_in "User", with: @issued_book.user_id
    click_on "Update Issued book"

    assert_text "Issued book was successfully updated"
    click_on "Back"
  end

  test "should destroy Issued book" do
    visit issued_book_url(@issued_book)
    click_on "Destroy this issued book", match: :first

    assert_text "Issued book was successfully destroyed"
  end
end
