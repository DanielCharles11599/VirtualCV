"use strict";

/* ==========================================================================
   Helpers
   ========================================================================== */
const root = document.documentElement;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// localStorage/sessionStorage can throw (private mode, blocked cookies), so wrap them
const storage = {
    get(key, area = localStorage) {
        try { return area.getItem(key); } catch (e) { return null; }
    },
    set(key, value, area = localStorage) {
        try { area.setItem(key, value); } catch (e) { /* ignore */ }
    }
};


/* ==========================================================================
   Splash screen (once per browser session, skipped for reduced motion)
   ========================================================================== */
const intro = document.querySelector(".intro");
const splashSpans = document.querySelectorAll(".splash");
let splashRunning = false;

if (intro && !root.classList.contains("no-splash")) {
    splashRunning = true;
    storage.set("splashSeen", "1", sessionStorage);

    splashSpans.forEach((span, idx) => {
        setTimeout(() => span.classList.add("active"), (idx + 1) * 400);
    });

    setTimeout(() => {
        splashSpans.forEach((span, idx) => {
            setTimeout(() => {
                span.classList.remove("active");
                span.classList.add("fade");
            }, (idx + 1) * 50);
        });
    }, 2000);

    setTimeout(() => { intro.style.top = "-100vh"; }, 2300);

    // Remove it from the page once it has slid away
    setTimeout(() => { intro.remove(); splashRunning = false; }, 3500);
}


/* ==========================================================================
   Mobile menu (hamburger)
   ========================================================================== */
const menuButton = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

function setMenu(open) {
    if (!menuButton || !navLinks) return;
    navLinks.classList.toggle("active", open);
    menuButton.setAttribute("aria-expanded", String(open));
    const icon = menuButton.querySelector("i");
    if (icon) {
        icon.classList.toggle("fa-bars", !open);
        icon.classList.toggle("fa-xmark", open);
    }
}

if (menuButton && navLinks) {
    menuButton.addEventListener("click", () => {
        setMenu(!navLinks.classList.contains("active"));
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && navLinks.classList.contains("active")) {
            setMenu(false);
            menuButton.focus();
        }
    });

    document.addEventListener("click", (event) => {
        if (navLinks.classList.contains("active") &&
            !navLinks.contains(event.target) &&
            !menuButton.contains(event.target)) {
            setMenu(false);
        }
    });
}


/* ==========================================================================
   Smooth scrolling (closes the mobile menu and keeps the URL hash in sync)
   ========================================================================== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
        const id = this.getAttribute("href");
        if (!id || id === "#") return;

        const target = document.querySelector(id);
        if (!target) return;

        e.preventDefault();
        target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });

        if (history.replaceState) history.replaceState(null, "", id);
        setMenu(false);
    });
});


/* ==========================================================================
   Scroll effects: navbar, progress bar, back-to-top (one throttled handler)
   ========================================================================== */
const navbar = document.querySelector(".navbar");
const progressBar = document.querySelector(".scroll-progress");
const backToTop = document.querySelector(".back-to-top");
let scrollTicking = false;

function updateOnScroll() {
    const y = window.scrollY;
    const max = root.scrollHeight - window.innerHeight;

    if (navbar) navbar.classList.toggle("scrolled", y > 50);
    if (progressBar) progressBar.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
    if (backToTop) backToTop.classList.toggle("visible", y > 600);

    scrollTicking = false;
}

window.addEventListener("scroll", () => {
    if (!scrollTicking) {
        scrollTicking = true;
        requestAnimationFrame(updateOnScroll);
    }
}, { passive: true });

updateOnScroll();

if (backToTop) {
    backToTop.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
}


/* ==========================================================================
   Dark / light theme (remembered, follows the system until the user chooses)
   ========================================================================== */
const themeSwitch = document.getElementById("theme-switch");
const toggleSlider = document.querySelector(".toggle-slider");
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
const lightQuery = window.matchMedia("(prefers-color-scheme: light)");

function applyTheme(light) {
    document.body.classList.toggle("light-mode", light);
    if (themeSwitch) themeSwitch.checked = light;
    if (themeColorMeta) themeColorMeta.setAttribute("content", light ? "#f7f8f6" : "#0a0a0a");
}

const savedTheme = storage.get("theme");
applyTheme(savedTheme ? savedTheme === "light" : lightQuery.matches);

if (lightQuery.addEventListener) {
    lightQuery.addEventListener("change", (e) => {
        if (!storage.get("theme")) applyTheme(e.matches);
    });
}

if (themeSwitch && toggleSlider) {
    themeSwitch.addEventListener("change", () => {
        const light = themeSwitch.checked;
        storage.set("theme", light ? "light" : "dark");

        // The circular reveal starts from the toggle
        const rect = toggleSlider.getBoundingClientRect();
        root.style.setProperty("--theme-x", `${rect.left + rect.width / 2}px`);
        root.style.setProperty("--theme-y", `${rect.top + rect.height / 2}px`);

        const change = () => applyTheme(light);

        if (!document.startViewTransition || prefersReducedMotion) {
            change();
        } else {
            document.startViewTransition(change);
        }
    });
}


/* ==========================================================================
   Projects: accordion + language filter
   ========================================================================== */
const projectCards = Array.from(document.querySelectorAll(".project-card"));
const projectGroups = Array.from(document.querySelectorAll(".project-group"));
const filterButtons = Array.from(document.querySelectorAll(".filter-btn"));
const countNumber = document.getElementById("project-visible");
const countLabel = document.getElementById("project-label");

function cardLanguages(card) {
    return (card.dataset.language || "").toLowerCase().split(/\s+/).filter(Boolean);
}

function setCardOpen(card, open) {
    card.classList.toggle("active", open);
    const header = card.querySelector(".project-header");
    if (header) header.setAttribute("aria-expanded", String(open));
}

// Accordion: one card open at a time
projectCards.forEach((card, index) => {
    const header = card.querySelector(".project-header");
    const content = card.querySelector(".project-content");
    if (!header) return;

    if (content) {
        if (!content.id) content.id = `project-details-${index + 1}`;
        header.setAttribute("aria-controls", content.id);
    }
    header.setAttribute("aria-expanded", "false");

    header.addEventListener("click", () => {
        const willOpen = !card.classList.contains("active");
        projectCards.forEach(other => setCardOpen(other, false));
        setCardOpen(card, willOpen);
    });
});

function applyFilter(filter, persist = true) {
    if (persist) storage.set("projectFilter", filter);

    let visible = 0;
    let displayName = "";

    filterButtons.forEach(button => {
        const isActive = button.dataset.filter === filter;
        button.classList.toggle("active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
        if (isActive) displayName = button.textContent.trim();
    });

    projectCards.forEach(card => {
        // Collapse any open accordion before filtering
        setCardOpen(card, false);

        const show = filter === "all" || cardLanguages(card).includes(filter.toLowerCase());
        card.classList.toggle("hide", !show);
        if (show) visible++;
    });

    // Hide a group's heading when none of its cards match
    projectGroups.forEach(group => {
        group.classList.toggle("hide-group", !group.querySelector(".project-card:not(.hide)"));
    });

    const empty = document.getElementById("project-empty");
    if (empty) {
        empty.classList.toggle("is-hidden", visible > 0);
        const emptyLabel = document.getElementById("project-empty-label");
        if (emptyLabel) emptyLabel.textContent = displayName;
    }

    if (countNumber) countNumber.textContent = visible;
    if (countLabel) {
        countLabel.textContent = filter === "all"
            ? "projects"
            : `${displayName} project${visible !== 1 ? "s" : ""}`;
    }
}

const validFilters = filterButtons.map(button => button.dataset.filter);
const savedFilter = storage.get("projectFilter");

filterButtons.forEach(button => {
    button.addEventListener("click", () => applyFilter(button.dataset.filter));
});

applyFilter(validFilters.includes(savedFilter) ? savedFilter : "all", false);

// Skill "evidence" links: show how many projects use a language, and jump to them filtered
document.querySelectorAll("[data-project-count]").forEach(el => {
    const language = el.dataset.projectCount;
    const total = projectCards.filter(card => cardLanguages(card).includes(language)).length;
    el.textContent = `${total} project${total !== 1 ? "s" : ""}`;
});

document.querySelectorAll("[data-filter-link]").forEach(link => {
    link.addEventListener("click", () => applyFilter(link.dataset.filterLink));
});


/* ==========================================================================
   Hero stats count-up (values come from the page itself where possible)
   ========================================================================== */
const statEls = Array.from(document.querySelectorAll(".hero-stat strong"));

statEls.forEach(el => {
    if (el.dataset.stat === "projects") el.dataset.count = projectCards.length;
    if (el.dataset.stat === "certs") el.dataset.count = document.querySelectorAll(".certification-card").length;
});

function runCount(el) {
    const target = Number(el.dataset.count) || 0;
    const suffix = el.dataset.suffix || "";

    if (prefersReducedMotion) {
        el.textContent = target + suffix;
        return;
    }

    const duration = 1200;
    const start = performance.now();

    function step(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

if (statEls.length) {
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
        statEls.forEach(el => { el.textContent = (Number(el.dataset.count) || 0) + (el.dataset.suffix || ""); });
    } else {
        statEls.forEach(el => { el.textContent = "0" + (el.dataset.suffix || ""); });

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                obs.unobserve(entry.target);
                // wait for the splash screen to finish before counting
                setTimeout(() => runCount(entry.target), splashRunning ? 2800 : 0);
            });
        }, { threshold: 0.4 });

        statEls.forEach(el => observer.observe(el));
    }
}


/* ==========================================================================
   GitHub dashboard (one cached request pair, with a graceful fallback)
   ========================================================================== */
const GITHUB_USER = "DanielCharles11599";
const GITHUB_CACHE_KEY = "githubCache.v1";
const GITHUB_CACHE_MS = 10 * 60 * 1000;   // the unauthenticated API only allows 60 requests/hour

function readGithubCache() {
    try {
        const cached = JSON.parse(storage.get(GITHUB_CACHE_KEY, sessionStorage));
        if (cached && Date.now() - cached.time < GITHUB_CACHE_MS) return cached.data;
    } catch (e) { /* ignore */ }
    return null;
}

async function fetchGithub() {
    const cached = readGithubCache();
    if (cached) return cached;

    const [userResponse, repoResponse] = await Promise.all([
        fetch(`https://api.github.com/users/${GITHUB_USER}`),
        fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=pushed`)
    ]);

    if (!userResponse.ok || !repoResponse.ok) {
        throw new Error(`GitHub API responded ${userResponse.status}/${repoResponse.status}`);
    }

    const data = { user: await userResponse.json(), repos: await repoResponse.json() };
    storage.set(GITHUB_CACHE_KEY, JSON.stringify({ time: Date.now(), data }), sessionStorage);
    return data;
}

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function makeEl(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
}

function metaItem(iconClass, label, value) {
    const item = makeEl("span");
    const icon = makeEl("i", iconClass);
    icon.setAttribute("aria-hidden", "true");
    item.append(icon, `${value}`);
    item.title = label;
    return item;
}

function renderRepositories(repos) {
    const grid = document.getElementById("repository-grid");
    if (!grid) return;
    grid.textContent = "";

    repos.slice(0, 6).forEach(repo => {
        const card = makeEl("div", "repository-card glass-card");

        card.append(makeEl("h4", "", repo.name));
        card.append(makeEl("p", "", repo.description || "No description available."));

        const meta = makeEl("div", "repo-meta");
        if (repo.language) meta.append(metaItem("fa-solid fa-code", "Main language", repo.language));
        meta.append(metaItem("fa-solid fa-star", "Stars", repo.stargazers_count));
        meta.append(metaItem("fa-solid fa-code-fork", "Forks", repo.forks_count));
        card.append(meta);

        const link = makeEl("a", "", "View Repository ");
        link.href = repo.html_url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        const arrow = makeEl("i", "fa-solid fa-arrow-up-right-from-square");
        arrow.setAttribute("aria-hidden", "true");
        link.append(arrow);
        card.append(link);

        grid.append(card);
    });
}

function renderGithub(user, allRepos) {
    const avatar = document.getElementById("github-avatar");
    if (avatar && user.avatar_url) {
        avatar.src = user.avatar_url;
        avatar.alt = `${user.name || user.login} GitHub profile picture`;
    }

    setText("github-name", user.name || user.login);
    setText("github-bio", user.bio || "");
    setText("repo-count", user.public_repos);
    setText("followers", user.followers);
    setText("following", user.following);

    // Stats are calculated from the repositories so they don't repeat the profile card
    const repos = allRepos
        .filter(repo => !repo.fork)
        .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at));

    const languageCounts = {};
    let stars = 0;
    repos.forEach(repo => {
        stars += repo.stargazers_count || 0;
        if (repo.language) languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
    });

    const languages = Object.keys(languageCounts).sort((a, b) => languageCounts[b] - languageCounts[a]);

    setText("stat-stars", stars);
    setText("stat-languages", languages.length);
    setText("stat-top-language", languages[0] || "-");
    setText("stat-last-push", repos[0]
        ? new Date(repos[0].pushed_at).toLocaleDateString("en-ZA", { month: "short", year: "numeric" })
        : "-");

    renderRepositories(repos);
}

function showGithubError() {
    ["github-profile-card", "github-stats", "github-recent"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add("is-hidden");
    });
    const error = document.getElementById("github-error");
    if (error) error.classList.remove("is-hidden");
}

async function loadGithub() {
    // The contribution graph is a separate service; hide its card if it fails
    const heatmap = document.getElementById("heatmap");
    if (heatmap) {
        heatmap.addEventListener("error", () => {
            const card = document.getElementById("github-heatmap-card");
            if (card) card.classList.add("is-hidden");
        });
        heatmap.src = `https://ghchart.rshah.org/${GITHUB_USER}`;
    }

    try {
        const { user, repos } = await fetchGithub();
        renderGithub(user, repos);
    } catch (error) {
        console.warn("GitHub data unavailable:", error.message);
        showGithubError();
    }
}

loadGithub();


/* ==========================================================================
   Cursor glow (hidden until the mouse moves, throttled to animation frames)
   ========================================================================== */
const cursorGlow = document.querySelector(".cursor-glow");

if (cursorGlow && window.matchMedia("(hover: hover)").matches) {
    let glowX = 0;
    let glowY = 0;
    let glowQueued = false;

    document.addEventListener("mousemove", (event) => {
        glowX = event.clientX;
        glowY = event.clientY;
        cursorGlow.classList.add("visible");

        if (!glowQueued) {
            glowQueued = true;
            requestAnimationFrame(() => {
                cursorGlow.style.transform =
                    `translate3d(${glowX}px, ${glowY}px, 0) translate(-50%, -50%)`;
                glowQueued = false;
            });
        }
    });

    root.addEventListener("mouseleave", () => cursorGlow.classList.remove("visible"));
}
