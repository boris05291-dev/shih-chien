/* jshint esversion: 6, browser: true */
const docTop = (el) => el.getBoundingClientRect().top + window.scrollY;
const onScrollOrLayout = (fn) => {
    let ticking = false;
    const run = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            fn();
            ticking = false;
        });
    };
    window.addEventListener("scroll", run, { passive: true });
    window.addEventListener("resize", run);
    window.addEventListener("load", run);
    fn();
};
const btop = document.getElementById("b-top");
if (btop) {
    onScrollOrLayout(() => btop.classList.toggle("show", window.scrollY > 300));
    btop.addEventListener("click", () => window.scrollTo(0, 0));
}
const h1Section = document.getElementById("h1");
const h7Section = document.getElementById("h7");
if (h1Section && h7Section) {
    const menuLinks = document.querySelectorAll(".side-menu .menu-link");
    const OFFSET = 150; 
    onScrollOrLayout(() => {
        const pos = window.scrollY + OFFSET;
        let current = "top-section";
        if (pos >= docTop(h7Section)) current = "h7";
        else if (pos >= docTop(h1Section)) current = "h1";
        menuLinks.forEach((link) => {
            link.classList.toggle("active", link.getAttribute("data-target") === current);
        });
    });
}