Rails.application.config.session_store :cookie_store,
  key: '_session_id',
  httponly: true,
  domain: :all