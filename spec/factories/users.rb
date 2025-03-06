FactoryBot.define do
  factory :user do
    sequence(:name) { |n| "User #{n}" }
    sequence(:email) { |n| "user#{n}@example.com" }
    password { "password" }
    password_confirmation { "password" }
    is_admin { false }

    # You can create an admin user using this trait
    trait :admin do
      is_admin { true }
    end
  end

  factory :admin, parent: :user, traits: [:admin]
end 