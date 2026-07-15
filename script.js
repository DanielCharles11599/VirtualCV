// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
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

themeSwitch.addEventListener("change", function () {

    if (this.checked) {
        document.body.classList.add("light-mode");
    } else {
        document.body.classList.remove("light-mode");
    }

});
