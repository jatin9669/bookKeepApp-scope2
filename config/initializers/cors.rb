Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins 'http://localhost:5173'  # Specific origin for your Vite frontend
    
    resource '*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: true,  # Changed to true to allow credentials
      expose: ['access-token', 'expiry', 'token-type', 'uid', 'client']  # Add if using token auth
  end
end 