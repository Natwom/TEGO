import os
os.environ["DATABASE_URL"] = "postgresql://postgres.dzvyeutupeuukjnvntpe:Apiaro%402026@aws-0-eu-west-1.pooler.supabase.com:5432/postgres"

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import User, Project, BlogPost, ContactMessage, Testimonial, ImpactMetric

# SQLite source
sqlite_engine = create_engine("sqlite:///./tego.db")
SQLiteSession = sessionmaker(bind=sqlite_engine)
sqlite_db = SQLiteSession()

# Supabase target
from app.database import engine as pg_engine, SessionLocal as PGSession
pg_db = PGSession()

tables = [
    ("tego_users", User),
    ("tego_projects", Project),
    ("tego_blog_posts", BlogPost),
    ("tego_contact_messages", ContactMessage),
    ("tego_testimonials", Testimonial),
    ("tego_impact_metrics", ImpactMetric),
]

for name, model in tables:
    rows = sqlite_db.query(model).all()
    print(f"Migrating {name}: {len(rows)} rows")
    for row in rows:
        pg_db.merge(row)
    pg_db.commit()

print("🎉 Migration complete!")

sqlite_db.close()
pg_db.close()
