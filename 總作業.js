/* jshint esversion: 6, browser: true */
const btop = document.getElementById("b-top");
window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
        btop.classList.add("show");
    } else {
        btop.classList.remove("show");
    }
});
btop.addEventListener("click", () => {
    window.scrollTo(0, 0);
});
const h1Section = document.getElementById("h1");
const h7Section = document.getElementById("h7");

if (h1Section && h7Section) {
    const menuLinks = document.querySelectorAll(".side-menu .menu-link");
    window.addEventListener("scroll", () => {
        let scrollPos = window.scrollY + 150;
        let currentTarget = "";
        if (h7Section && scrollPos >= h7Section.offsetTop - 50) {
            currentTarget = "h7";
        } else if (h1Section && scrollPos >= h1Section.offsetTop - 50) {
            currentTarget = "h1";
        }
        menuLinks.forEach((link) => {
            link.classList.remove("active");
            const target = link.getAttribute("data-target");
            if (currentTarget === "" && target === "top-section") {
                link.classList.add("active");
            } else if (target === currentTarget) {
                link.classList.add("active");
            }
        });
        if (window.scrollY < 100) {
            menuLinks.forEach((link) => link.classList.remove("active"));
            const homeLink = document.querySelector('.side-menu .menu-link[data-target="top-section"]');
            if (homeLink) homeLink.classList.add("active");
        }
    });
}
(() => {
    const menu = document.querySelector(".side-menu");
    if (!menu) return;
    const centerActive = () => {
        const active = menu.querySelector("a.active");
        if (!active || menu.scrollWidth <= menu.clientWidth) return;
        const m = menu.getBoundingClientRect();
        const a = active.getBoundingClientRect();
        const left = menu.scrollLeft + (a.left - m.left) - (m.width - a.width) / 2;
        menu.scrollTo({ left, behavior: "smooth" });
    };
    new MutationObserver(centerActive).observe(menu, {
        attributes: true,
        attributeFilter: ["class"],
        subtree: true,
    });
    window.addEventListener("load", centerActive);
})();
