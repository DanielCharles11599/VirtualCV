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


// Dark Mode/Light Mode toggle
const themeSwitch = document.getElementById("theme-switch");
const logo = document.getElementById("site-logo");

themeSwitch.addEventListener("change", () => {

    document.body.classList.toggle("light-mode");

    if(document.body.classList.contains("light-mode")){

        logo.src = "Virtual_CV-Logo_Light_Theme.png";

    }
    else{

        logo.src = "Virtual_CV-Logo_Dark_Theme.png";

    }
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