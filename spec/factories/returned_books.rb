FactoryBot.define do
  factory :returned_book do
    association :borrowed_book
    quantity { 1 }
  end
end 