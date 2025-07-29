from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import models
import database
from pydantic import BaseModel
from datetime import datetime

app = FastAPI(title="スーパーマーケット価格比較API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # すべてのオリジンを許可（開発環境用）
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

models.Base.metadata.create_all(bind=database.engine)

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

class SupermarketCreate(BaseModel):
    name: str
    address: str
    latitude: float
    longitude: float
    phone: Optional[str] = None

class SupermarketResponse(BaseModel):
    id: int
    name: str
    address: str
    latitude: float
    longitude: float
    phone: Optional[str]
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ProductCreate(BaseModel):
    name: str
    category: str
    brand: Optional[str] = None

class ProductResponse(BaseModel):
    id: int
    name: str
    category: str
    brand: Optional[str]
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class PriceCreate(BaseModel):
    product_id: int
    supermarket_id: int
    price: float
    unit: str = "個"
    recorded_by: str

class PriceResponse(BaseModel):
    id: int
    product_id: int
    supermarket_id: int
    price: float
    unit: str
    recorded_by: str
    recorded_at: Optional[datetime] = None
    product: ProductResponse
    supermarket: SupermarketResponse

    class Config:
        from_attributes = True

@app.get("/")
async def root():
    return {"message": "スーパーマーケット価格比較API"}

@app.post("/supermarkets/", response_model=SupermarketResponse)
async def create_supermarket(supermarket: SupermarketCreate, db: Session = Depends(get_db)):
    db_supermarket = models.Supermarket(**supermarket.dict())
    db.add(db_supermarket)
    db.commit()
    db.refresh(db_supermarket)
    return db_supermarket

@app.get("/supermarkets/", response_model=List[SupermarketResponse])
async def get_supermarkets(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    supermarkets = db.query(models.Supermarket).offset(skip).limit(limit).all()
    return supermarkets

@app.get("/supermarkets-nearby")
async def get_nearby_supermarkets(
    latitude: float, 
    longitude: float, 
    radius: float = 5.0,
    db: Session = Depends(get_db)
):
    supermarkets = db.query(models.Supermarket).all()
    nearby_supermarkets = []
    
    for supermarket in supermarkets:
        distance = calculate_distance(latitude, longitude, supermarket.latitude, supermarket.longitude)
        if distance <= radius:
            nearby_supermarkets.append({
                "id": supermarket.id,
                "name": supermarket.name,
                "address": supermarket.address,
                "latitude": supermarket.latitude,
                "longitude": supermarket.longitude,
                "phone": supermarket.phone,
                "distance_km": round(distance, 2)
            })
    
    nearby_supermarkets.sort(key=lambda x: x["distance_km"])
    return nearby_supermarkets

@app.get("/supermarkets/{supermarket_id}", response_model=SupermarketResponse)
async def get_supermarket(supermarket_id: int, db: Session = Depends(get_db)):
    supermarket = db.query(models.Supermarket).filter(models.Supermarket.id == supermarket_id).first()
    if supermarket is None:
        raise HTTPException(status_code=404, detail="スーパーマーケットが見つかりません")
    return supermarket

@app.post("/products/", response_model=ProductResponse)
async def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    db_product = models.Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@app.get("/products/", response_model=List[ProductResponse])
async def get_products(skip: int = 0, limit: int = 100, category: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.Product)
    if category:
        query = query.filter(models.Product.category == category)
    products = query.offset(skip).limit(limit).all()
    return products

@app.get("/products/search")
async def search_products(q: str, db: Session = Depends(get_db)):
    products = db.query(models.Product).filter(models.Product.name.contains(q)).all()
    return products

@app.post("/prices/", response_model=PriceResponse)
async def create_price(price: PriceCreate, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == price.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="商品が見つかりません")
    
    supermarket = db.query(models.Supermarket).filter(models.Supermarket.id == price.supermarket_id).first()
    if not supermarket:
        raise HTTPException(status_code=404, detail="スーパーマーケットが見つかりません")
    
    db_price = models.Price(**price.dict())
    db.add(db_price)
    db.commit()
    db.refresh(db_price)
    return db_price

@app.get("/prices/", response_model=List[PriceResponse])
async def get_prices(
    skip: int = 0, 
    limit: int = 100, 
    product_id: Optional[int] = None,
    supermarket_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Price)
    if product_id:
        query = query.filter(models.Price.product_id == product_id)
    if supermarket_id:
        query = query.filter(models.Price.supermarket_id == supermarket_id)
    
    prices = query.offset(skip).limit(limit).all()
    return prices

@app.get("/prices/compare/{product_id}")
async def compare_prices(product_id: int, db: Session = Depends(get_db)):
    prices = db.query(models.Price).filter(models.Price.product_id == product_id).all()
    if not prices:
        raise HTTPException(status_code=404, detail="価格情報が見つかりません")
    
    price_comparison = []
    for price in prices:
        price_comparison.append({
            "supermarket": price.supermarket.name,
            "address": price.supermarket.address,
            "price": price.price,
            "unit": price.unit,
            "recorded_at": price.recorded_at
        })
    
    price_comparison.sort(key=lambda x: x["price"])
    return {
        "product": prices[0].product.name,
        "prices": price_comparison
    }

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    import math
    
    R = 6371
    
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)
    
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    
    a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    
    return R * c

if __name__ == "__main__":
    import uvicorn
    # 全てのネットワークインターフェースでリッスン（Expo Goからのアクセスを許可）
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)