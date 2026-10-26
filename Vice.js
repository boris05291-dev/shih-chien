/* jshint esversion: 6, browser: true */
(() => {
    const links = document.querySelectorAll(".sub-menu .menu-link");
    if (!links.length) return;
    const sections = Array.from(links)
        .map((l) => document.getElementById(l.getAttribute("data-target")))
        .filter(Boolean);
    if (!sections.length) return;
    const docTop = (el) => el.getBoundingClientRect().top + window.scrollY;
    const OFFSET = 150;
    let ticking = false;
    const update = () => {
        const pos = window.scrollY + OFFSET;
        let current = sections[0].id;
        sections.forEach((sec) => {
            if (pos >= docTop(sec)) current = sec.id;
        });
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
            current = sections[sections.length - 1].id;
        }
        links.forEach((l) => {
            l.classList.toggle("active", l.getAttribute("data-target") === current);
        });
    };
    const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            update();
            ticking = false;
        });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("load", onScroll); 
    update();
})();