class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable
  has_many :borrowed_books, dependent: :destroy
  has_many :issued_books, dependent: :destroy
  validates :name, presence: true
  validates :is_admin, inclusion: { in: [true, false] }
end
