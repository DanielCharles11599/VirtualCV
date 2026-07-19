// Splash screen
let intro = document.querySelector('.intro');
let splash = document.querySelector('.splash-header');
let splashSpan = document.querySelectorAll('.splash');

window.addEventListener('DOMContentLoaded', ()=>{

    setTimeout(()=>{

        splashSpan.forEach((span, idx)=>{
            setTimeout(()=>{
                span.classList.add('active');
            }, (idx + 1) * 400)
        });

        setTimeout(()=>{
            splashSpan.forEach((span, idx)=>{
                setTimeout(()=>{
                    span.classList.remove('active');
                    span.classList.add('fade');
                }, (idx + 1) * 50)
            })
        }, 2000);

        setTimeout(()=>{
            intro.style.top = '-100vh';
        }, 2300)
    })
})

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {

    anchor.addEventListener('click', function (e) {

        const target = document.querySelector(this.getAttribute('href'));

        if (!target) return;

        e.preventDefault();

        target.scrollIntoView({
            behavior: "smooth"
        });
    });
});


// Navbar scroll effect
const navbar = document.querySelector(".navbar");

window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 50);
});

// Dark Mode/Light Mode toggle
const themeSwitch = document.getElementById("theme-switch");
const logo = document.getElementById("site-logo");

themeSwitch.addEventListener("change", () => {

    const rect = document.querySelector(".theme-switch").getBoundingClientRect();

    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    document.documentElement.style.setProperty("--theme-x", `${x}px`);
    document.documentElement.style.setProperty("--theme-y", `${y}px`);

    if (!document.startViewTransition) {
        toggleTheme();
        return;
    }

    document.startViewTransition(() => {
        toggleTheme();
    });
});

function toggleTheme() {

    document.body.classList.toggle("light-mode");

    if (document.body.classList.contains("light-mode")) {
        logo.src = "Virtual_CV-Logo_Light_Theme.png";
    } 
    else {
        logo.src = "Virtual_CV-Logo_Dark_Theme.png";
    }
}

// Expanding projectCards on click
const projectCards = document.querySelectorAll(".project-card");

projectCards.forEach(card => {

    const header = card.querySelector(".project-header");

    header.addEventListener("click", () => {

        projectCards.forEach(otherCard => {
            if (otherCard !== card) {
                otherCard.classList.remove("active");
            }
        });

        card.classList.toggle("active");
    });
});

// Filter for Projects
// projectCards declared above in expanding projectCards
const filterButtons = document.querySelectorAll(".filter-btn");
const projectCounter = document.getElementById("project-count");

// Restore last selected filter
let currentFilter = localStorage.getItem("projectFilter") || "all";

filterButtons.forEach(button => {

    if(button.dataset.filter === currentFilter){
        button.classList.add("active");
    }
    else{
        button.classList.remove("active");
    }

});

filterProjects(currentFilter);

filterButtons.forEach(button=>{

    button.addEventListener("click",()=>{

        const filter = button.dataset.filter;

        localStorage.setItem("projectFilter",filter);

        filterButtons.forEach(btn=>btn.classList.remove("active"));

        button.classList.add("active");

        filterProjects(filter);
    });
});

function filterProjects(filter){

    let visibleProjects = 0;

    projectCards.forEach(card=>{

        // Collapse any expanded accordion

        card.classList.remove("expanded");

        const details = card.querySelector(".project-details");

        if(details){
            details.style.maxHeight = null;
        }

        // Filter projects

        if(filter==="all"){
            card.classList.remove("hide");
            visibleProjects++;
            return;
        }

        const languages = card.dataset.language.toLowerCase();

        if(languages.includes(filter.toLowerCase())){
            card.classList.remove("hide");
            visibleProjects++;
        }
        else{
            card.classList.add("hide");
        }
    });

    const label = document.querySelector(".project-count");

    if(filter==="all"){
        label.innerHTML =
            `Showing <span id="project-count">${visibleProjects}</span> projects`;
    }
    else{
        const activeButton = document.querySelector(".filter-btn.active");
        const displayName = activeButton.textContent.trim();

        label.innerHTML =
            `Showing <span id="project-count">${visibleProjects}</span> ${displayName} project${visibleProjects !== 1 ? "s" : ""}`;
    }
}


// GitHub Dashboard
const username = "DanielCharles11599";

loadGithub();

async function loadGithub(){

    const response =
        await fetch(
        `https://api.github.com/users/${username}`);

    const user =
        await response.json();

    document.getElementById("github-avatar").src =
        user.avatar_url;

    document.getElementById("github-name").textContent =
        user.name;

    document.getElementById("github-bio").textContent =
        user.bio;

    document.getElementById("repo-count").textContent =
        user.public_repos;

    document.getElementById("followers").textContent =
        user.followers;

    document.getElementById("following").textContent =
        user.following;

    document.getElementById("public-repos").textContent =
        user.public_repos;

    document.getElementById("public-gists").textContent =
        user.public_gists;

    document.getElementById("followers-stat").textContent =
        user.followers;

    document.getElementById("following-stat").textContent =
        user.following;

    document.getElementById("heatmap").src =
`https://ghchart.rshah.org/${username}`;

    loadRepositories();

}


// Recent Repositories
async function loadRepositories(){

    const response =
        await fetch(
`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`);

    const repos =
        await response.json();

    const grid =
        document.getElementById("repository-grid");

    repos.forEach(repo=>{

        grid.innerHTML +=`

        <div class="repository-card glass-card">

            <h4>${repo.name}</h4>

            <p>${repo.description || "No description available."}</p>

            <p>

                ⭐ ${repo.stargazers_count}
                &nbsp;&nbsp;

                🍴 ${repo.forks_count}

            </p>

            <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">

                View Repository
                <i class="fa-solid fa-arrow-up-right-from-square"></i>

            </a>

        </div>

        `;
    });
}

function createThemeCircle(x, y) {
    const circle = document.createElement("div");

    circle.className = "theme-transition";
    circle.style.left = `${x}px`;
    circle.style.top = `${y}px`;

    document.body.appendChild(circle);

    circle.addEventListener("animationend", () => {
        circle.remove();
    });
}