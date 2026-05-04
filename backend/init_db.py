from app.database import engine, SessionLocal
from app import models, auth

def init_database():
    # Create tables
    models.Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Create default admin user if not exists
    admin = db.query(models.User).filter(models.User.username == "admin").first()
    if not admin:
        admin_user = models.User(
            username="admin",
            email="admin@tego.org",
            hashed_password=auth.get_password_hash("admin123"),
            is_active=True,
            is_superuser=True
        )
        db.add(admin_user)
        
        # Seed impact metrics
        metrics = [
            models.ImpactMetric(label="Self-Help Groups Formed", value="24", icon="users", display_order=1),
            models.ImpactMetric(label="People Reached", value="3,500+", icon="heart", display_order=2),
            models.ImpactMetric(label="Acres Under Conservation", value="150", icon="leaf", display_order=3),
            models.ImpactMetric(label="Water Points Established", value="12", icon="droplet", display_order=4),
        ]
        for m in metrics:
            db.add(m)
            
        # Seed testimonials
        testimonials = [
            models.Testimonial(
                name="Akai Lopeyok",
                role="Community Leader, Lokichoggio",
                content="TEGO has transformed how our community approaches farming. The poultry project has given our women a steady income source.",
                is_active=True
            ),
            models.Testimonial(
                name="Peter Ekal",
                role="Youth Volunteer",
                content="Being part of TEGO's climate adaptation programs has taught me sustainable farming techniques that I now teach others in my village.",
                is_active=True
            ),
        ]
        for t in testimonials:
            db.add(t)
            
        # Seed projects
        projects = [
            models.Project(
                title="Integrated Livestock-Crop Systems Project",
                slug="integrated-livestock-crop",
                summary="Building resilient food systems through poultry, fodder, and climate-smart agriculture.",
                description="This flagship project integrates poultry production, fodder farming, and climate-smart agriculture to build resilient livelihoods in Turkana County. We work with self-help groups to establish sustainable food production systems.",
                category="Food Security",
                status="ongoing",
                location="Turkana County, Kenya",
                beneficiaries=1200
            ),
            models.Project(
                title="Turkana Water Access Initiative",
                slug="water-access-initiative",
                summary="Establishing sustainable water points for communities and livestock.",
                description="Addressing water scarcity through borehole rehabilitation, rainwater harvesting, and community water management training.",
                category="Water & Sanitation",
                status="ongoing",
                location="Turkana North",
                beneficiaries=800
            ),
        ]
        for p in projects:
            db.add(p)
            
        db.commit()
        print("Database initialized with default data.")
    else:
        print("Admin user already exists.")
    
    db.close()

if __name__ == "__main__":
    init_database()