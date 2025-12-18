// 1. Mobile Navigation Toggle
function initMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            this.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking on links
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
}

// 2. Premium Modal Handler
function initPremiumModal() {
    const premiumModal = document.getElementById('premiumModal');
    const closeModal = document.getElementById('closeModal');
    
    if (premiumModal && closeModal) {
        // Close modal when X is clicked
        closeModal.addEventListener('click', () => {
            premiumModal.style.display = 'none';
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === premiumModal) {
                premiumModal.style.display = 'none';
            }
        });
        
        // Open modal for premium games
        document.querySelectorAll('.premium-game').forEach(game => {
            game.addEventListener('click', (e) => {
                e.stopPropagation();
                premiumModal.style.display = 'flex';
            });
        });
    }
}

// 3. Parallax Scrolling Effect
function initParallax() {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        
        // Parallax for law background
        const lawBackground = document.querySelector('.law-background');
        if (lawBackground) {
            lawBackground.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
        
        // Header background on scroll
        const header = document.querySelector('header');
        if (header) {
            if (scrolled > 100) {
                header.style.backgroundColor = 'rgba(10, 10, 26, 0.98)';
            } else {
                header.style.backgroundColor = 'rgba(10, 10, 26, 0.95)';
            }
        }
    });
}

// 4. Smooth Scrolling for Anchor Links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// 5. Game Search Functionality
function initGameSearch() {
    const searchInput = document.getElementById('game-search');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        const gameCards = document.querySelectorAll('.game-card');
        
        gameCards.forEach(card => {
            const gameName = card.querySelector('.game-name').textContent.toLowerCase();
            if (gameName.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
}

// 6. Download Button Handlers
function initDownloadButtons() {
    document.querySelectorAll('.download-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const service = this.querySelector('h3').textContent;
            const gameName = document.querySelector('h1')?.textContent || 'this game';
            
            alert(`Starting download of "${gameName}" via ${service}...\n\nIn a real implementation, the download would begin automatically.`);
            
            // Track download (for analytics)
            console.log(`Download attempted: ${gameName} via ${service}`);
        });
    });
}

// 7. Statistics Animation (for homepage)
function initStatistics() {
    const counters = document.querySelectorAll('.stat-number');
    if (counters.length === 0) return;
    
    counters.forEach(counter => {
        const originalText = counter.textContent;
        const isK = originalText.includes('K');
        const isM = originalText.includes('M');
        const isPlus = originalText.includes('+');
        
        let target = parseInt(originalText.replace(/[^0-9]/g, ''));
        if (isK) target *= 1000;
        if (isM) target *= 1000000;
        
        let current = 0;
        const increment = target / 100;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                counter.textContent = originalText;
                clearInterval(timer);
            } else {
                let display = Math.floor(current);
                if (isK) display = Math.floor(current/1000) + 'K';
                if (isM) display = Math.floor(current/1000000) + 'M';
                if (isPlus) display += '+';
                counter.textContent = display;
            }
        }, 20);
    });
}

// 8. Update Copyright Year
function updateCopyrightYear() {
    const yearSpans = document.querySelectorAll('#current-year, .current-year');
    const currentYear = new Date().getFullYear();
    
    yearSpans.forEach(span => {
        span.textContent = currentYear;
    });
}

// 9. Platform Filter System
function initPlatformFilters() {
    const filters = document.querySelectorAll('.platform-filter, .genre-filter');
    
    filters.forEach(filter => {
        filter.addEventListener('click', function() {
            // Remove active class from all filters
            filters.forEach(f => f.classList.remove('active'));
            
            // Add active class to clicked filter
            this.classList.add('active');
            
            const platform = this.getAttribute('data-platform') || 
                            this.getAttribute('data-genre') || 
                            this.textContent.toLowerCase();
            
            // Filter games (simplified example)
            filterGames(platform);
        });
    });
}

function filterGames(filter) {
    const gameCards = document.querySelectorAll('.game-card');
    
    gameCards.forEach(card => {
        if (filter === 'all') {
            card.style.display = 'block';
            setTimeout(() => card.style.opacity = '1', 10);
            return;
        }
        
        const platforms = card.querySelector('.game-platforms')?.textContent.toLowerCase() || '';
        const genre = card.getAttribute('data-genre') || '';
        
        if (platforms.includes(filter) || genre.includes(filter)) {
            card.style.display = 'block';
            setTimeout(() => card.style.opacity = '1', 10);
        } else {
            card.style.opacity = '0';
            setTimeout(() => card.style.display = 'none', 300);
        }
    });
}

// 10. Newsletter Signup Form
function initNewsletter() {
    const newsletterForm = document.getElementById('newsletter-form');
    if (!newsletterForm) return;
    
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = this.querySelector('input[type="email"]').value;
        
        if (!validateEmail(email)) {
            alert('Please enter a valid email address.');
            return;
        }
        
        // Simulate API call
        this.innerHTML = '<p style="color: #4ecdc4; text-align: center;"><i class="fas fa-check-circle"></i> Thank you for subscribing!</p>';
        
        // Save to localStorage
        let subscribers = JSON.parse(localStorage.getItem('newsletterSubscribers') || '[]');
        subscribers.push({ email: email, date: new Date().toISOString() });
        localStorage.setItem('newsletterSubscribers', JSON.stringify(subscribers));
    });
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// ======================
// INITIALIZATION
// ======================

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Games Arc Website Loaded');
    
    // Core functionalities
    initMobileMenu();
    initPremiumModal();
    initParallax();
    initSmoothScroll();
    updateCopyrightYear();
    
    // Page-specific functionalities
    initGameSearch();
    initDownloadButtons();
    initPlatformFilters();
    initNewsletter();
    
    // Only run statistics on homepage
    if (document.querySelector('.stats-section')) {
        initStatistics();
    }
    
    // Add loading animation for game cards
    const gameCards = document.querySelectorAll('.game-card');
    gameCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('fade-in');
    });
});

// ======================
// HELPER FUNCTIONS
// ======================

// Show notification message
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Add CSS for notification if not already present
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(to right, #5d3fd3, #0ea5e9);
                color: white;
                padding: 15px 25px;
                border-radius: 10px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                gap: 10px;
                z-index: 10000;
                transform: translateX(150%);
                transition: transform 0.3s ease;
                max-width: 400px;
            }
            .notification.show {
                transform: translateX(0);
            }
            .notification-success {
                background: linear-gradient(to right, #4ecdc4, #44a08d);
            }
            .notification-warning {
                background: linear-gradient(to right, #ffd166, #ff9500);
            }
            .notification-error {
                background: linear-gradient(to right, #ff6b6b, #ee5a52);
            }
            .notification-close {
                background: none;
                border: none;
                color: white;
                font-size: 1.5rem;
                cursor: pointer;
                margin-left: auto;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Close button handler
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Lazy load images
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.getAttribute('data-src');
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Initialize lazy loading
lazyLoadImages();

// Export functions for global use (if needed)
window.GamesArc = {
    showNotification,
    formatFileSize,
    isInViewport
};