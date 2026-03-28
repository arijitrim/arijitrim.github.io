document.addEventListener("DOMContentLoaded", () => {
	initRevealAnimations();
	protectHeroPhoto();
	initProfileOverlay();
});

function initRevealAnimations() {
	const revealItems = document.querySelectorAll(".reveal");

	if (!("IntersectionObserver" in window)) {
		revealItems.forEach((item) => item.classList.add("is-visible"));
		return;
	}

	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.add("is-visible");
					observer.unobserve(entry.target);
				}
			});
		},
		{
			threshold: 0.15,
			rootMargin: "0px 0px -40px 0px",
		}
	);

	revealItems.forEach((item) => observer.observe(item));
}

function protectHeroPhoto() {
	const heroPhoto = document.querySelector(".photo-frame img");
	if (!heroPhoto) return;

	heroPhoto.addEventListener("contextmenu", (event) => event.preventDefault());
	heroPhoto.addEventListener("dragstart", (event) => event.preventDefault());
}

function initProfileOverlay() {
	const overlay = document.getElementById("profile-overlay");
	const qrImage = document.getElementById("profile-overlay-qr");
	const overlayTitle = document.getElementById("profile-overlay-title");
	const overlayLink = document.getElementById("profile-overlay-link");
	const profileLinks = document.querySelectorAll(".topbar a[data-profile-url]");

	if (!overlay || !qrImage || !overlayTitle || !overlayLink || profileLinks.length === 0) {
		return;
	}

	const closeOverlay = () => {
		overlay.hidden = true;
		document.body.style.overflow = "";
	};

	const openOverlay = (name, url, icon) => {
		overlayTitle.textContent = name;
		overlayLink.href = url;
		overlayTitle.className = "profile-overlay__title-text";
		if (icon) {
			overlayTitle.classList.add(`brand-${icon}`);
		}
		qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(url)}`;
		qrImage.alt = `${name} QR code`;
		overlay.hidden = false;
		document.body.style.overflow = "hidden";
	};

	profileLinks.forEach((link) => {
		link.addEventListener("click", (event) => {
			event.preventDefault();
			openOverlay(
				link.dataset.profileName || "Profile",
				link.dataset.profileUrl || link.href,
				link.dataset.profileIcon || ""
			);
		});
	});

	overlay.addEventListener("click", (event) => {
		if (event.target instanceof HTMLElement && event.target.hasAttribute("data-close-overlay")) {
			closeOverlay();
		}
	});

	document.addEventListener("keydown", (event) => {
		if (event.key === "Escape" && !overlay.hidden) {
			closeOverlay();
		}
	});
}
