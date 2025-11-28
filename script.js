/**
 * Modern Personal Portfolio JavaScript
 * Fetches GitHub data and adds interactive effects
 */

// Configuration
const GITHUB_USERNAME = 'arijitrim';
const GITHUB_API = 'https://api.github.com';

// Language colors (GitHub standard)
const LANGUAGE_COLORS = {
	JavaScript: '#f1e05a',
	TypeScript: '#2b7489',
	Python: '#3572A5',
	Java: '#b07219',
	Go: '#00ADD8',
	Rust: '#dea584',
	Ruby: '#701516',
	PHP: '#4F5D95',
	C: '#555555',
	'C++': '#f34b7d',
	'C#': '#178600',
	Swift: '#ffac45',
	Kotlin: '#F18E33',
	HTML: '#e34c26',
	CSS: '#563d7c',
	Shell: '#89e051',
	Dart: '#00B4AB',
	Vue: '#41b883',
	React: '#61dafb',
};

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
	initLucideIcons();
	initParticles();
	fetchGitHubData();
	initCardAnimations();
	initTheme();
});

// Initialize Theme
function initTheme() {
	const themeToggle = document.getElementById('theme-toggle');
	const html = document.documentElement;

	// Check local storage or system preference
	const savedTheme = localStorage.getItem('theme');
	const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	const currentTheme = savedTheme || systemTheme;

	html.setAttribute('data-theme', currentTheme);

	if (themeToggle) {
		themeToggle.addEventListener('click', () => {
			const newTheme = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
			html.setAttribute('data-theme', newTheme);
			localStorage.setItem('theme', newTheme);

			// Update particles color if needed (optional, as we used CSS vars but might need to re-trigger)
			// For now, the particles use the initial color. To make them dynamic, we'd need to update the particle system.
			// Let's just reload the page for full effect or leave as is. 
			// Ideally we'd emit an event or call a method in initParticles.
		});
	}
}

// Initialize Lucide icons
function initLucideIcons() {
	if (typeof lucide !== 'undefined') {
		lucide.createIcons();
	}
}


// Particle animation for background
function initParticles() {
	const canvas = document.getElementById('particles');
	if (!canvas) return;

	// Check for reduced motion preference
	const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	if (prefersReducedMotion) return;

	const ctx = canvas.getContext('2d');
	let particles = [];
	let animationFrameId;
	let isVisible = true;

	// Get colors from CSS variables
	const getPrimaryColor = () => {
		const style = getComputedStyle(document.documentElement);
		const color = style.getPropertyValue('--color-primary').trim();
		// Convert hex/named color to rgba for opacity manipulation if needed, 
		// but for now we'll just use the variable and assume it's compatible or handle it simply.
		// To properly handle opacity with CSS vars, we might need to parse it, 
		// but for simplicity let's assume a fixed base color or use the variable directly if possible.
		// However, the original code used rgba(0, 255, 136, opacity). 
		// Let's try to parse the hex from the variable or fallback.
		return color || '#00ff88';
	};

	// Helper to convert hex to rgb
	function hexToRgb(hex) {
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16)
		} : { r: 0, g: 255, b: 136 }; // Fallback
	}

	let primaryColorRgb = hexToRgb(getPrimaryColor());

	// Update color on theme change (if we implement theme toggle later)
	// For now, just set it once.

	// Set canvas size
	function resizeCanvas() {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
	}
	resizeCanvas();
	window.addEventListener('resize', resizeCanvas);

	// Particle class
	class Particle {
		constructor() {
			this.reset();
		}

		reset() {
			this.x = Math.random() * canvas.width;
			this.y = Math.random() * canvas.height;
			this.vx = (Math.random() - 0.5) * 0.5;
			this.vy = (Math.random() - 0.5) * 0.5;
			this.radius = Math.random() * 2;
			this.opacity = Math.random() * 0.5;
		}

		update() {
			this.x += this.vx;
			this.y += this.vy;

			// Wrap around edges
			if (this.x < 0) this.x = canvas.width;
			if (this.x > canvas.width) this.x = 0;
			if (this.y < 0) this.y = canvas.height;
			if (this.y > canvas.height) this.y = 0;
		}

		draw() {
			ctx.beginPath();
			ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
			ctx.fillStyle = `rgba(${primaryColorRgb.r}, ${primaryColorRgb.g}, ${primaryColorRgb.b}, ${this.opacity})`;
			ctx.fill();
		}
	}

	// Create particles
	const particleCount = Math.min(100, Math.floor(canvas.width / 10));
	for (let i = 0; i < particleCount; i++) {
		particles.push(new Particle());
	}

	// Animation loop
	function animate() {
		if (!isVisible) return;

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		particles.forEach((particle, i) => {
			particle.update();
			particle.draw();

			// Connect nearby particles
			particles.slice(i + 1).forEach(otherParticle => {
				const dx = particle.x - otherParticle.x;
				const dy = particle.y - otherParticle.y;
				const distance = Math.sqrt(dx * dx + dy * dy);

				if (distance < 100) {
					ctx.beginPath();
					ctx.moveTo(particle.x, particle.y);
					ctx.lineTo(otherParticle.x, otherParticle.y);
					ctx.strokeStyle = `rgba(${primaryColorRgb.r}, ${primaryColorRgb.g}, ${primaryColorRgb.b}, ${0.1 * (1 - distance / 100)})`;
					ctx.lineWidth = 0.5;
					ctx.stroke();
				}
			});
		});

		animationFrameId = requestAnimationFrame(animate);
	}

	// Intersection Observer to pause when off-screen
	const observer = new IntersectionObserver((entries) => {
		entries.forEach(entry => {
			if (entry.isIntersecting) {
				isVisible = true;
				animate();
			} else {
				isVisible = false;
				cancelAnimationFrame(animationFrameId);
			}
		});
	});
	observer.observe(canvas);

	// Visibility API to pause when tab is hidden
	document.addEventListener('visibilitychange', () => {
		if (document.hidden) {
			isVisible = false;
			cancelAnimationFrame(animationFrameId);
		} else {
			isVisible = true;
			animate();
		}
	});

	animate();

	// Cleanup on page unload
	window.addEventListener('beforeunload', () => {
		cancelAnimationFrame(animationFrameId);
		observer.disconnect();
	});
}

// Fetch GitHub data
async function fetchGitHubData() {
	const reposList = document.getElementById('repos-list');
	if (!reposList) return;

	try {
		const response = await fetch(`${GITHUB_API}/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`);

		if (!response.ok) {
			if (response.status === 403) {
				throw new Error('Rate limit exceeded');
			}
			throw new Error('Failed to fetch repositories');
		}

		const reposData = await response.json();
		displayRecentRepos(reposData);
	} catch (error) {
		console.error('Error fetching GitHub data:', error);

		let errorMessage = 'Unable to load repositories. Please try again later.';
		if (error.message === 'Rate limit exceeded') {
			errorMessage = 'GitHub API rate limit exceeded. Please check back in an hour.';
		}

		reposList.innerHTML = `
			<div class="loading error">
				<i data-lucide="alert-circle"></i>
				<p>${errorMessage}</p>
			</div>
		`;
		if (typeof lucide !== 'undefined') {
			lucide.createIcons();
		}
	}
}

// Display recent repositories
function displayRecentRepos(repos) {
	const reposList = document.getElementById('repos-list');
	if (!reposList) return;

	// Filter out forks unless they have stars, and limit to 6 most recent
	const filteredRepos = repos
		.filter(repo => !repo.fork || repo.stargazers_count > 0)
		.slice(0, 6);

	if (filteredRepos.length === 0) {
		reposList.innerHTML = '<div class="loading">No repositories found.</div>';
		return;
	}

	reposList.innerHTML = filteredRepos.map(repo => {
		const languageColor = LANGUAGE_COLORS[repo.language] || '#888888';

		return `
			<a href="${repo.html_url}" class="repo-card" target="_blank" rel="noopener noreferrer">
				<div class="repo-name">${repo.name}</div>
				${repo.description ? `<div class="repo-description">${repo.description}</div>` : ''}
				<div class="repo-meta">
					${repo.language ? `
						<div class="repo-language">
							<span class="language-dot" style="background-color: ${languageColor}"></span>
							<span>${repo.language}</span>
						</div>
					` : ''}
					${repo.stargazers_count > 0 ? `
						<div class="repo-stars">
							<i data-lucide="star" style="width: 1rem; height: 1rem;"></i>
							<span>${repo.stargazers_count}</span>
						</div>
					` : ''}
				</div>
			</a>
		`;
	}).join('');

	// Re-initialize Lucide icons for the new content
	if (typeof lucide !== 'undefined') {
		lucide.createIcons();
	}
}

// Initialize card animations
function initCardAnimations() {
	const observerOptions = {
		threshold: 0.1,
		rootMargin: '0px 0px -100px 0px'
	};

	const observer = new IntersectionObserver((entries) => {
		entries.forEach(entry => {
			if (entry.isIntersecting) {
				entry.target.style.opacity = '1';
				entry.target.style.transform = 'translateY(0)';
			}
		});
	}, observerOptions);

	// Observe all social buttons and repo cards
	setTimeout(() => {
		document.querySelectorAll('.social-btn, .repo-card').forEach(card => {
			observer.observe(card);
		});
	}, 100);
}
