// TEGO Main JavaScript

const API_BASE_URL = 'http://localhost:8000/api';

// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.getElementById('navLinks');

if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = mobileMenuBtn.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });
}

// Close mobile menu on link click
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        if (navLinks) navLinks.classList.remove('active');
        const icon = mobileMenuBtn?.querySelector('i');
        if (icon) {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
    } else {
        navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
    }
});

// Fetch and display impact metrics
async function loadImpactMetrics() {
    const container = document.getElementById('impactMetrics');
    if (!container) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/impact/`);
        const metrics = await response.json();
        
        container.innerHTML = metrics.map(metric => `
            <div class="impact-item">
                <h3>${metric.value}</h3>
                <p>${metric.label}</p>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading impact metrics:', error);
        container.innerHTML = `
            <div class="impact-item"><h3>24</h3><p>Self-Help Groups Formed</p></div>
            <div class="impact-item"><h3>3,500+</h3><p>People Reached</p></div>
            <div class="impact-item"><h3>150</h3><p>Acres Under Conservation</p></div>
            <div class="impact-item"><h3>12</h3><p>Water Points Established</p></div>
        `;
    }
}

// Fetch and display testimonials
async function loadTestimonials() {
    const container = document.getElementById('testimonialsContainer');
    if (!container) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/testimonials/`);
        const testimonials = await response.json();
        
        container.innerHTML = testimonials.map(t => `
            <div class="testimonial-card">
                <div class="testimonial-content">${t.content}</div>
                <div class="testimonial-author">
                    <div class="testimonial-avatar">${t.name.charAt(0)}</div>
                    <div class="testimonial-author-info">
                        <h4>${t.name}</h4>
                        <span>${t.role || 'Community Member'}</span>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading testimonials:', error);
    }
}

// Fetch and display projects
async function loadProjects() {
    const container = document.getElementById('projectsContainer');
    if (!container) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/projects/`);
        const projects = await response.json();
        
        if (projects.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:#666;">No projects available.</p>';
            return;
        }

        container.innerHTML = projects.map(p => `
            <a href="project-detail.html?id=${p.id}" style="text-decoration: none; color: inherit;">
                <div class="project-card" style="cursor: pointer; transition: transform 0.2s;">
                    <div class="project-image">
                        <img src="${p.image_url || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600'}" alt="${p.title}">
                        <span class="project-badge">${p.status}</span>
                    </div>
                    <div class="project-content">
                        <h3>${p.title}</h3>
                        <p>${p.summary || p.description || ''}</p>
                        <div class="project-meta">
                            <span>📍 ${p.location || 'Turkana County'}</span>
                            <span>👥 ${p.beneficiaries || 0} beneficiaries</span>
                        </div>
                    </div>
                </div>
            </a>
        `).join('');
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

// Fetch and display blog posts
async function loadBlogPosts() {
    const container = document.getElementById('blogContainer');
    if (!container) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/blog/`);
        const posts = await response.json();
        
        if (posts.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:#666;">No blog posts available.</p>';
            return;
        }

        container.innerHTML = posts.map(post => `
            <a href="blog-detail.html?id=${post.id}" style="text-decoration: none; color: inherit;">
                <div class="blog-card" style="cursor: pointer; transition: transform 0.2s;">
                    <div class="blog-image">
                        <img src="${post.image_url || 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600'}" alt="${post.title}">
                    </div>
                    <div class="blog-content">
                        <div class="blog-meta">
                            <span>📅 ${new Date(post.created_at).toLocaleDateString()}</span>
                            <span>✍️ ${post.author || 'TEGO Team'}</span>
                        </div>
                        <h3>${post.title}</h3>
                        <p>${post.excerpt || (post.content ? post.content.substring(0, 120) + '...' : '')}</p>
                        <span style="color: var(--primary-green); font-weight: 600;">Read More →</span>
                    </div>
                </div>
            </a>
        `).join('');
    } catch (error) {
        console.error('Error loading blog posts:', error);
        container.innerHTML = '<p class="text-center">No blog posts available yet.</p>';
    }
}

// Contact form submission
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="loading"></span> Sending...';
        submitBtn.disabled = true;
        
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value
        };
        
        try {
            const response = await fetch(`${API_BASE_URL}/contact/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                showAlert('Thank you! Your message has been sent successfully. We will get back to you soon.', 'success');
                contactForm.reset();
            } else {
                throw new Error('Failed to send message');
            }
        } catch (error) {
            showAlert('Sorry, there was an error sending your message. Please try again later.', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Volunteer form
const volunteerForm = document.getElementById('volunteerForm');
if (volunteerForm) {
    volunteerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        showAlert('Thank you for your interest! We will contact you with volunteer opportunities.', 'success');
        volunteerForm.reset();
    });
}

function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    const form = document.querySelector('form');
    if (form && form.parentNode) {
        form.parentNode.insertBefore(alertDiv, form);
        setTimeout(() => alertDiv.remove(), 5000);
    }
}

// Scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadImpactMetrics();
    loadTestimonials();
    loadProjects();
    loadBlogPosts();
    
    // Animate elements on scroll
    document.querySelectorAll('.focus-card, .project-card, .testimonial-card, .work-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});