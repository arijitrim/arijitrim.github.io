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
});

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

	const ctx = canvas.getContext('2d');
	let particles = [];
	let animationFrameId;

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
			ctx.fillStyle = `rgba(0, 255, 136, ${this.opacity})`;
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
					ctx.strokeStyle = `rgba(0, 255, 136, ${0.1 * (1 - distance / 100)})`;
					ctx.lineWidth = 0.5;
					ctx.stroke();
				}
			});
		});

		animationFrameId = requestAnimationFrame(animate);
	}

	animate();

	// Cleanup on page unload
	window.addEventListener('beforeunload', () => {
		cancelAnimationFrame(animationFrameId);
	});
}

// Fetch GitHub data
async function fetchGitHubData() {
	try {
		const reposData = await fetch(`${GITHUB_API}/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`).then(r => r.json());
		displayRecentRepos(reposData);
	} catch (error) {
		console.error('Error fetching GitHub data:', error);
		const reposList = document.getElementById('repos-list');
		if (reposList) {
			reposList.innerHTML = `
				<div class="loading">Unable to load repositories. Please try again later.</div>
			`;
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
