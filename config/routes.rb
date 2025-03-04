Rails.application.routes.draw do
  post "issued_books/issue_book/:id", to: "issued_books#issue_book", as: "issue_book"
  post "returned_books/return_book/:id", to: "returned_books#return_book", as: "return_book"
  get "borrowed_books/my_books", to: "borrowed_books#my_books", as: "my_books"
  resources :borrowed_books
  resources :issued_books
  resources :returned_books
  resources :books
  devise_for :users
  root "books#index"
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker

  # Defines the root path route ("/")
  # root "posts#index"
end
