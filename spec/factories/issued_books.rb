FactoryBot.define do
  factory :issued_book do
    association :user
    association :book
    quantity { 1 }
  end
end 