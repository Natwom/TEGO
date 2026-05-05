const API_BASE_URL = 'https://tego-api.onrender.com/api';
// const API_BASE_URL = 'http://localhost:8000/api'; // local dev

console.log('[ADMIN] Admin JS loaded successfully');

// ===== AUTH =====
function getToken() { return localStorage.getItem('tego_token'); }
function setToken(token) { localStorage.setItem('tego_token', token); }
function removeToken() { localStorage.removeItem('tego_token'); }
function isLoggedIn() { return !!getToken(); }

function logout() {
    console.log('[ADMIN] Logging out...');
    removeToken();
    window.location.href = 'login.html';
}

// ===== API =====
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const isFormData = options.body instanceof FormData;
    
    const config = {
        headers: {
            ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
            ...(getToken() ? { 'Authorization': `Bearer ${getToken()}` } : {}),
            ...options.headers
        },
        ...options
    };
    
    if (config.body && typeof config.body === 'object' && !isFormData) {
        config.body = JSON.stringify(config.body);
    }
    
    console.log(`[API] ${config.method || 'GET'} ${url}`);
    
    try {
        const response = await fetch(url, config);
        console.log(`[API] Response status: ${response.status}`);
        
        if (response.status === 401) {
            console.error('[API] 401 Unauthorized - redirecting to login');
            removeToken();
            window.location.href = 'login.html';
            return;
        }
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Request failed' }));
            console.error(`[API] Error:`, error);
            throw new Error(error.detail || `HTTP ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`[API] Success:`, data);
        return data;
    } catch (err) {
        console.error(`[API] Network/Error:`, err);
        throw err;
    }
}

// ===== TOASTS =====
function showToast(message, type = 'success') {
    console.log(`[Toast] ${type}: ${message}`);
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : '⚠';
    toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-content">
            <h4>${type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Warning'}</h4>
            <p>${message}</p>
        </div>
    `;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

// ===== LOGIN =====
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    console.log('[ADMIN] Login form found, attaching handler');
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = loginForm.querySelector('button');
        btn.innerHTML = '<span class="loading"></span> Signing in...';
        btn.disabled = true;
        
        try {
            const data = await apiRequest('/admin/login', {
                method: 'POST',
                body: {
                    username: document.getElementById('username').value,
                    password: document.getElementById('password').value
                }
            });
            setToken(data.access_token);
            showToast('Login successful!');
            setTimeout(() => window.location.href = 'dashboard.html', 500);
        } catch (error) {
            showToast(error.message, 'error');
            btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
            btn.disabled = false;
        }
    });
}

// ===== NAVIGATION =====
function showSection(sectionId) {
    console.log(`[NAV] Switching to section: ${sectionId}`);
    document.querySelectorAll('.content-section').forEach(s => s.classList.add('hidden'));
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.remove('hidden');
        console.log(`[NAV] Section ${sectionId} shown`);
    } else {
        console.error(`[NAV] Section ${sectionId} not found!`);
    }
    
    document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
    const navLink = document.querySelector(`[onclick="showSection('${sectionId}')"]`);
    if (navLink) navLink.classList.add('active');
    
    if (sectionId === 'projects') loadProjects();
    if (sectionId === 'blog') loadBlogPosts();
    if (sectionId === 'messages') loadMessages();
}

// ===== MODALS =====
function openModal(modalId) {
    console.log(`[Modal] Opening ${modalId}`);
    const el = document.getElementById(modalId);
    if (el) {
        el.classList.add('active');
        console.log(`[Modal] ${modalId} opened`);
    } else {
        console.error(`[Modal] Element #${modalId} not found!`);
    }
}

function closeModal(modalId) {
    console.log(`[Modal] Closing ${modalId}`);
    const el = document.getElementById(modalId);
    if (el) {
        el.classList.remove('active');
    }
    if (modalId === 'projectModal') resetProjectForm();
    if (modalId === 'blogModal') resetBlogForm();
}

// ===== STATS =====
async function loadStats() {
    console.log('[Stats] Loading...');
    try {
        const stats = await apiRequest('/admin/stats');
        document.getElementById('statProjects').textContent = stats.projects;
        document.getElementById('statBlog').textContent = stats.blog_posts;
        document.getElementById('statMessages').textContent = stats.messages;
        document.getElementById('statUnread').textContent = stats.unread_messages;
        console.log('[Stats] Loaded:', stats);
    } catch (error) {
        console.error('[Stats] Error:', error);
        // Don't redirect on stats error - just show 0
        document.getElementById('statProjects').textContent = '0';
        document.getElementById('statBlog').textContent = '0';
        document.getElementById('statMessages').textContent = '0';
        document.getElementById('statUnread').textContent = '0';
    }
}

// ===== PROJECTS =====
function addNewProject() {
    console.log('[Projects] Add new clicked');
    resetProjectForm();
    openModal('projectModal');
}

function resetProjectForm() {
    console.log('[Projects] Resetting form');
    document.getElementById('projectId').value = '';
    document.getElementById('projectTitle').value = '';
    document.getElementById('projectSlug').value = '';
    document.getElementById('projectSummary').value = '';
    document.getElementById('projectDescription').value = '';
    document.getElementById('projectCategory').value = '';
    document.getElementById('projectStatus').value = 'ongoing';
    document.getElementById('projectLocation').value = '';
    document.getElementById('projectBeneficiaries').value = '0';
    document.getElementById('projectImage').value = '';
    document.getElementById('projectImagePreview').innerHTML = '';
    document.getElementById('projectModalTitle').textContent = 'Add Project';
}

async function loadProjects() {
    console.log('[Projects] Loading...');
    const tbody = document.getElementById('projectsTableBody');
    if (!tbody) {
        console.error('[Projects] Table body not found!');
        return;
    }
    
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem"><i class="fas fa-spinner fa-spin"></i> Loading...</td></tr>';
    
    try {
        const projects = await apiRequest('/projects/');
        if (projects.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="empty-state"><i class="fas fa-folder-open"></i><h4>No projects yet</h4><p>Click "Add Project" to create one</p></td></tr>';
            return;
        }
        
        tbody.innerHTML = projects.map(p => `
            <tr>
                <td>#${p.id}</td>
                <td>
                    ${p.image_url 
                        ? `<img src="${p.image_url}" style="width:50px;height:50px;object-fit:cover;border-radius:6px;">` 
                        : '<span style="color:#aaa;font-size:0.8rem;">No image</span>'}
                </td>
                <td><strong>${escapeHtml(p.title)}</strong></td>
                <td><span class="badge badge-info">${p.category || 'General'}</span></td>
                <td><span class="badge badge-${p.status === 'ongoing' ? 'success' : p.status === 'completed' ? 'secondary' : 'warning'}">${p.status}</span></td>
                <td>${escapeHtml(p.location) || '—'}</td>
                <td>
                    <div class="actions">
                        <button class="btn btn-info btn-sm" onclick="viewProject(${p.id})" title="View"><i class="fas fa-eye"></i></button>
                        <button class="btn btn-warning btn-sm" onclick="editProject(${p.id})" title="Edit"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-danger btn-sm" onclick="deleteProject(${p.id})" title="Delete"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
        console.log(`[Projects] Loaded ${projects.length} projects`);
    } catch (error) {
        console.error('[Projects] Error:', error);
        tbody.innerHTML = `<tr><td colspan="7" class="empty-state"><i class="fas fa-exclamation-circle"></i><h4>Error</h4><p>${escapeHtml(error.message)}</p></td></tr>`;
    }
}

function viewProject(id) {
    console.log(`[Projects] View project ${id}`);
    apiRequest(`/projects/${id}`).then(project => {
        showDetailModal('Project Details', `
            ${project.image_url ? `<div class="detail-section"><img src="${project.image_url}" style="max-width:100%;border-radius:8px;margin-bottom:1rem;"></div>` : ''}
            <div class="detail-section"><h4>Title</h4><p>${escapeHtml(project.title)}</p></div>
            <div class="detail-section"><h4>Summary</h4><p>${escapeHtml(project.summary) || 'No summary.'}</p></div>
            <div class="detail-section"><h4>Description</h4><p>${escapeHtml(project.description) || 'No description.'}</p></div>
            <div class="detail-section"><h4>Details</h4>
                <p><strong>Category:</strong> ${escapeHtml(project.category) || 'N/A'}<br>
                <strong>Status:</strong> ${project.status}<br>
                <strong>Location:</strong> ${escapeHtml(project.location) || 'N/A'}<br>
                <strong>Beneficiaries:</strong> ${project.beneficiaries || 0}<br>
                <strong>Created:</strong> ${new Date(project.created_at).toLocaleString()}</p>
            </div>
        `);
    }).catch(err => {
        console.error('[Projects] View error:', err);
        showToast(err.message, 'error');
    });
}

function editProject(id) {
    console.log(`[Projects] Edit project ${id}`);
    apiRequest(`/projects/${id}`).then(project => {
        document.getElementById('projectId').value = project.id;
        document.getElementById('projectTitle').value = project.title;
        document.getElementById('projectSlug').value = project.slug;
        document.getElementById('projectSummary').value = project.summary || '';
        document.getElementById('projectDescription').value = project.description || '';
        document.getElementById('projectCategory').value = project.category || '';
        document.getElementById('projectStatus').value = project.status;
        document.getElementById('projectLocation').value = project.location || '';
        document.getElementById('projectBeneficiaries').value = project.beneficiaries || 0;
        document.getElementById('projectImage').value = '';
        
        const preview = document.getElementById('projectImagePreview');
        if (project.image_url) {
            preview.innerHTML = `<img src="${project.image_url}" style="max-width:200px;max-height:150px;border-radius:8px;">`;
        } else {
            preview.innerHTML = '';
        }
        
        document.getElementById('projectModalTitle').textContent = 'Edit Project';
        openModal('projectModal');
    }).catch(err => {
        console.error('[Projects] Edit error:', err);
        showToast(err.message, 'error');
    });
}

async function saveProject() {
    console.log('[Projects] Save clicked');
    const id = document.getElementById('projectId').value;
    const formData = new FormData();
    formData.append('title', document.getElementById('projectTitle').value);
    formData.append('slug', document.getElementById('projectSlug').value);
    formData.append('summary', document.getElementById('projectSummary').value);
    formData.append('description', document.getElementById('projectDescription').value);
    formData.append('category', document.getElementById('projectCategory').value);
    formData.append('status', document.getElementById('projectStatus').value);
    formData.append('location', document.getElementById('projectLocation').value);
    formData.append('beneficiaries', document.getElementById('projectBeneficiaries').value || '0');
    
    const imageFile = document.getElementById('projectImage').files[0];
    if (imageFile) {
        formData.append('image', imageFile);
    }
    
    try {
        if (id) {
            console.log(`[Projects] Updating project ${id}`);
            await apiRequest(`/projects/${id}`, { method: 'PUT', body: formData });
            showToast('Project updated!');
        } else {
            console.log('[Projects] Creating new project');
            await apiRequest('/projects/', { method: 'POST', body: formData });
            showToast('Project created!');
        }
        closeModal('projectModal');
        loadProjects();
        loadStats();
    } catch (error) {
        console.error('[Projects] Save error:', error);
        showToast(error.message, 'error');
    }
}

async function deleteProject(id) {
    if (!confirm('Delete this project?')) return;
    console.log(`[Projects] Deleting ${id}`);
    try {
        await apiRequest(`/projects/${id}`, { method: 'DELETE' });
        showToast('Project deleted');
        loadProjects();
        loadStats();
    } catch (error) {
        console.error('[Projects] Delete error:', error);
        showToast(error.message, 'error');
    }
}

// ===== BLOG =====
function addNewBlog() {
    console.log('[Blog] Add new clicked');
    resetBlogForm();
    openModal('blogModal');
}

function resetBlogForm() {
    console.log('[Blog] Resetting form');
    document.getElementById('blogId').value = '';
    document.getElementById('blogTitle').value = '';
    document.getElementById('blogSlug').value = '';
    document.getElementById('blogExcerpt').value = '';
    document.getElementById('blogContent').value = '';
    document.getElementById('blogAuthor').value = '';
    document.getElementById('blogCategory').value = '';
    document.getElementById('blogPublished').checked = true;
    document.getElementById('blogImage').value = '';
    document.getElementById('blogImagePreview').innerHTML = '';
    document.getElementById('blogModalTitle').textContent = 'Add Blog Post';
}

async function loadBlogPosts() {
    console.log('[Blog] Loading...');
    const tbody = document.getElementById('blogTableBody');
    if (!tbody) {
        console.error('[Blog] Table body not found!');
        return;
    }
    
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem"><i class="fas fa-spinner fa-spin"></i> Loading...</td></tr>';
    
    try {
        const posts = await apiRequest('/blog/');
        if (posts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="empty-state"><i class="fas fa-newspaper"></i><h4>No posts yet</h4><p>Click "Add Post" to create one</p></td></tr>';
            return;
        }
        
        tbody.innerHTML = posts.map(p => `
            <tr>
                <td>#${p.id}</td>
                <td>
                    ${p.image_url 
                        ? `<img src="${p.image_url}" style="width:50px;height:50px;object-fit:cover;border-radius:6px;">` 
                        : '<span style="color:#aaa;font-size:0.8rem;">No image</span>'}
                </td>
                <td><strong>${escapeHtml(p.title)}</strong></td>
                <td>${escapeHtml(p.author) || 'TEGO'}</td>
                <td><span class="badge badge-${p.is_published ? 'success' : 'warning'}">${p.is_published ? 'Published' : 'Draft'}</span></td>
                <td>${new Date(p.created_at).toLocaleDateString()}</td>
                <td>
                    <div class="actions">
                        <button class="btn btn-info btn-sm" onclick="viewBlog(${p.id})" title="View"><i class="fas fa-eye"></i></button>
                        <button class="btn btn-warning btn-sm" onclick="editBlog(${p.id})" title="Edit"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-danger btn-sm" onclick="deleteBlog(${p.id})" title="Delete"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
        console.log(`[Blog] Loaded ${posts.length} posts`);
    } catch (error) {
        console.error('[Blog] Error:', error);
        tbody.innerHTML = `<tr><td colspan="7" class="empty-state"><i class="fas fa-exclamation-circle"></i><h4>Error</h4><p>${escapeHtml(error.message)}</p></td></tr>`;
    }
}

function viewBlog(id) {
    console.log(`[Blog] View post ${id}`);
    apiRequest(`/blog/${id}`).then(post => {
        showDetailModal('Blog Post Details', `
            ${post.image_url ? `<div class="detail-section"><img src="${post.image_url}" style="max-width:100%;border-radius:8px;margin-bottom:1rem;"></div>` : ''}
            <div class="detail-section"><h4>Title</h4><p>${escapeHtml(post.title)}</p></div>
            <div class="detail-section"><h4>Excerpt</h4><p>${escapeHtml(post.excerpt) || 'No excerpt.'}</p></div>
            <div class="detail-section"><h4>Content</h4><p>${escapeHtml(post.content) || 'No content.'}</p></div>
            <div class="detail-section"><h4>Details</h4>
                <p><strong>Author:</strong> ${escapeHtml(post.author) || 'TEGO'}<br>
                <strong>Category:</strong> ${escapeHtml(post.category) || 'N/A'}<br>
                <strong>Status:</strong> ${post.is_published ? 'Published' : 'Draft'}<br>
                <strong>Created:</strong> ${new Date(post.created_at).toLocaleString()}</p>
            </div>
        `);
    }).catch(err => {
        console.error('[Blog] View error:', err);
        showToast(err.message, 'error');
    });
}

function editBlog(id) {
    console.log(`[Blog] Edit post ${id}`);
    apiRequest(`/blog/${id}`).then(post => {
        document.getElementById('blogId').value = post.id;
        document.getElementById('blogTitle').value = post.title;
        document.getElementById('blogSlug').value = post.slug;
        document.getElementById('blogExcerpt').value = post.excerpt || '';
        document.getElementById('blogContent').value = post.content || '';
        document.getElementById('blogAuthor').value = post.author || '';
        document.getElementById('blogCategory').value = post.category || '';
        document.getElementById('blogPublished').checked = post.is_published;
        document.getElementById('blogImage').value = '';
        
        const preview = document.getElementById('blogImagePreview');
        if (post.image_url) {
            preview.innerHTML = `<img src="${post.image_url}" style="max-width:200px;max-height:150px;border-radius:8px;">`;
        } else {
            preview.innerHTML = '';
        }
        
        document.getElementById('blogModalTitle').textContent = 'Edit Blog Post';
        openModal('blogModal');
    }).catch(err => {
        console.error('[Blog] Edit error:', err);
        showToast(err.message, 'error');
    });
}

async function saveBlog() {
    console.log('[Blog] Save clicked');
    const id = document.getElementById('blogId').value;
    const formData = new FormData();
    formData.append('title', document.getElementById('blogTitle').value);
    formData.append('slug', document.getElementById('blogSlug').value);
    formData.append('excerpt', document.getElementById('blogExcerpt').value);
    formData.append('content', document.getElementById('blogContent').value);
    formData.append('author', document.getElementById('blogAuthor').value);
    formData.append('category', document.getElementById('blogCategory').value);
    formData.append('is_published', document.getElementById('blogPublished').checked);
    
    const imageFile = document.getElementById('blogImage').files[0];
    if (imageFile) {
        formData.append('image', imageFile);
    }
    
    try {
        if (id) {
            console.log(`[Blog] Updating post ${id}`);
            await apiRequest(`/blog/${id}`, { method: 'PUT', body: formData });
            showToast('Blog post updated!');
        } else {
            console.log('[Blog] Creating new post');
            await apiRequest('/blog/', { method: 'POST', body: formData });
            showToast('Blog post created!');
        }
        closeModal('blogModal');
        loadBlogPosts();
        loadStats();
    } catch (error) {
        console.error('[Blog] Save error:', error);
        showToast(error.message, 'error');
    }
}

async function deleteBlog(id) {
    if (!confirm('Delete this post?')) return;
    console.log(`[Blog] Deleting ${id}`);
    try {
        await apiRequest(`/blog/${id}`, { method: 'DELETE' });
        showToast('Blog post deleted');
        loadBlogPosts();
        loadStats();
    } catch (error) {
        console.error('[Blog] Delete error:', error);
        showToast(error.message, 'error');
    }
}

// ===== MESSAGES =====
async function loadMessages() {
    console.log('[Messages] Loading...');
    const tbody = document.getElementById('messagesTableBody');
    if (!tbody) {
        console.error('[Messages] Table body not found!');
        return;
    }
    
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem"><i class="fas fa-spinner fa-spin"></i> Loading...</td></tr>';
    
    try {
        const messages = await apiRequest('/contact/');
        if (messages.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-state"><i class="fas fa-inbox"></i><h4>No messages</h4><p>Contact form submissions appear here</p></td></tr>';
            return;
        }
        
        tbody.innerHTML = messages.map(m => `
            <tr style="${!m.is_read ? 'background:#f0f9ff;' : ''}">
                <td>#${m.id}</td>
                <td><strong>${escapeHtml(m.name)}</strong></td>
                <td>${escapeHtml(m.email)}</td>
                <td>${escapeHtml(m.subject) || '—'}</td>
                <td><span class="badge badge-${m.is_read ? 'secondary' : 'info'}">${m.is_read ? 'Read' : 'New'}</span></td>
                <td>
                    <div class="actions">
                        <button class="btn btn-info btn-sm" onclick="viewMessage(${m.id})" title="View"><i class="fas fa-eye"></i></button>
                        ${!m.is_read ? `<button class="btn btn-success btn-sm" onclick="markMessageRead(${m.id})" title="Mark Read"><i class="fas fa-check"></i></button>` : ''}
                        <button class="btn btn-danger btn-sm" onclick="deleteMessage(${m.id})" title="Delete"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
        console.log(`[Messages] Loaded ${messages.length} messages`);
    } catch (error) {
        console.error('[Messages] Error:', error);
        tbody.innerHTML = `<tr><td colspan="6" class="empty-state"><i class="fas fa-exclamation-circle"></i><h4>Error</h4><p>${escapeHtml(error.message)}</p></td></tr>`;
    }
}

function viewMessage(id) {
    console.log(`[Messages] View ${id}`);
    apiRequest(`/contact/${id}`).then(msg => {
        showDetailModal('Message', `
            <div class="detail-section"><h4>From</h4>
                <p><strong>Name:</strong> ${escapeHtml(msg.name)}<br>
                <strong>Email:</strong> ${escapeHtml(msg.email)}<br>
                <strong>Phone:</strong> ${escapeHtml(msg.phone) || 'N/A'}</p>
            </div>
            <div class="detail-section"><h4>Subject</h4><p>${escapeHtml(msg.subject) || 'No subject'}</p></div>
            <div class="detail-section"><h4>Message</h4><p>${escapeHtml(msg.message)}</p></div>
            <div class="detail-section"><h4>Received</h4><p>${new Date(msg.created_at).toLocaleString()}</p></div>
        `);
        if (!msg.is_read) markMessageRead(id, false);
    }).catch(err => showToast(err.message, 'error'));
}

async function markMessageRead(id, reload = true) {
    try {
        await apiRequest(`/contact/${id}/read`, { method: 'PUT' });
        if (reload) { showToast('Marked as read'); loadMessages(); loadStats(); }
    } catch (error) { showToast(error.message, 'error'); }
}

async function deleteMessage(id) {
    if (!confirm('Delete this message?')) return;
    try {
        await apiRequest(`/contact/${id}`, { method: 'DELETE' });
        showToast('Message deleted');
        loadMessages();
        loadStats();
    } catch (error) { showToast(error.message, 'error'); }
}

// ===== DETAIL MODAL =====
function showDetailModal(title, content) {
    console.log(`[Detail] Showing: ${title}`);
    document.getElementById('detailModalTitle').textContent = title;
    document.getElementById('detailModalBody').innerHTML = content;
    openModal('detailModal');
}

// ===== UTILS =====
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('[ADMIN] DOM loaded');
    if (document.getElementById('dashboard')) {
        if (!isLoggedIn()) {
            console.log('[ADMIN] Not logged in, redirecting...');
            window.location.href = 'login.html';
            return;
        }
        console.log('[ADMIN] Loading dashboard...');
        loadStats();
    }
});