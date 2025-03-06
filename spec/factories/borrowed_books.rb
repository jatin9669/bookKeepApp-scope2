FactoryBot.define do
  factory :borrowed_book do
    association :user
    association :book
    quantity { 1 }
  end
end 