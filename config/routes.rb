Rails.application.routes.draw do
  post "returned_books/request_return_book", to: "returned_books#request_return_book", as: "request_return_book"
  post "issued_books/issue_book", to: "issued_books#issue_book", as: "issue_book"
  post "issued_books/approve_issue/:id", to: "issued_books#approve_issue", as: "approve_issue"
  get "borrowed_books/my_books", to: "borrowed_books#my_books", as: "my_books"
  get "borrowed_books/request_return", to: "borrowed_books#request_return", as: "request_return"
  post "returned_books/approve_return_book/:id", to: "returned_books#approve_return_book", as: "approve_return_book"
  resources :books
  resources :borrowed_books
  resources :issued_books
  resources :returned_books
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
