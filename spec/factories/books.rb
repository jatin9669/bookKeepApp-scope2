FactoryBot.define do
  factory :book do
    book_name { 'Default Book' }
    author_name { 'Default Author' }
    total_quantity { 1 }

    factory :book1 do
      book_name { 'Ruby Programming' }
      author_name { 'John Doe' }
      total_quantity { 5 }
    end

    factory :book2 do
      book_name { 'JavaScript Basics' }
      author_name { 'Jane Smith' }
      total_quantity { 3 }
    end

    factory :book3 do
      book_name { 'Python Guide' }
      author_name { 'Alice Brown' }
      total_quantity { 0 }
    end
  end
end
