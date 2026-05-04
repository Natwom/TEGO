from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/api/impact", tags=["impact"])

@router.get("/", response_model=List[schemas.ImpactMetricResponse])
def get_metrics(db: Session = Depends(get_db)):
    metrics = db.query(models.ImpactMetric).filter(models.ImpactMetric.is_active == True).order_by(models.ImpactMetric.display_order).all()
    return metrics

@router.post("/", response_model=schemas.ImpactMetricResponse)
def create_metric(metric: schemas.ImpactMetricCreate, db: Session = Depends(get_db)):
    db_metric = models.ImpactMetric(**metric.dict())
    db.add(db_metric)
    db.commit()
    db.refresh(db_metric)
    return db_metric

@router.put("/{metric_id}", response_model=schemas.ImpactMetricResponse)
def update_metric(metric_id: int, metric: schemas.ImpactMetricCreate, db: Session = Depends(get_db)):
    db_metric = db.query(models.ImpactMetric).filter(models.ImpactMetric.id == metric_id).first()
    if not db_metric:
        raise HTTPException(status_code=404, detail="Metric not found")
    for key, value in metric.dict().items():
        setattr(db_metric, key, value)
    db.commit()
    db.refresh(db_metric)
    return db_metric

@router.delete("/{metric_id}")
def delete_metric(metric_id: int, db: Session = Depends(get_db)):
    db_metric = db.query(models.ImpactMetric).filter(models.ImpactMetric.id == metric_id).first()
    if not db_metric:
        raise HTTPException(status_code=404, detail="Metric not found")
    db.delete(db_metric)
    db.commit()
    return {"message": "Metric deleted successfully"}