from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class Supermarket(Base):
    __tablename__ = "supermarkets"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    address = Column(String(200), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    phone = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    prices = relationship("Price", back_populates="supermarket")

class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    category = Column(String(50), nullable=False, index=True)
    brand = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    prices = relationship("Price", back_populates="product")

class Price(Base):
    __tablename__ = "prices"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    supermarket_id = Column(Integer, ForeignKey("supermarkets.id"), nullable=False)
    price = Column(Float, nullable=False)
    unit = Column(String(20), default="個")
    recorded_by = Column(String(50), nullable=False)
    recorded_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    product = relationship("Product", back_populates="prices")
    supermarket = relationship("Supermarket", back_populates="prices")

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    favorites = relationship("Favorite", back_populates="user")

class Favorite(Base):
    __tablename__ = "favorites"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    supermarket_id = Column(Integer, ForeignKey("supermarkets.id"), nullable=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="favorites")
    supermarket = relationship("Supermarket")
    product = relationship("Product")