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
