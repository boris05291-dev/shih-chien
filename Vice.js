/* jshint esversion: 6, browser: true */
(() => {
    const links = document.querySelectorAll(".sub-menu .menu-link");
    if (!links.length) return;
    const sections = Array.from(links)
        .map((l) => document.getElementById(l.getAttribute("data-target")))
        .filter(Boolean);
    const update = () => {
        const pos = window.scrollY + 150;
        let current = sections[0].id;

        sections.forEach((sec) => {
            if (pos >= sec.offsetTop) current = sec.id;
        });
        if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 2) {
            current = sections[sections.length - 1].id;
        }

        links.forEach((l) => {
            l.classList.toggle("active", l.getAttribute("data-target") === current);
        });
    };
    window.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    update();
})();
