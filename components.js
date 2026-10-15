/* jshint esversion: 6, browser: true, devel: true */
function setupNavToggle() {
    const bar = document.querySelector(".nav-container");
    const menu = bar && bar.querySelector(".nav-menu");
    if (!menu) return;
    const panel = menu.closest(".hl-1") || menu;
    panel.classList.add("nav-collapse");
    if (!panel.id) panel.id = "nav-panel";
    let btn = bar.querySelector(".nav-toggle, .menu-toggle, .hamburger, button");
    if (btn) {
        const fresh = btn.cloneNode(true);
        fresh.removeAttribute("onclick");
        btn.replaceWith(fresh);
        btn = fresh;
    } else {
        btn = document.createElement("button");
        bar.insertBefore(btn, panel);
    }
    btn.type = "button";
    btn.classList.add("nav-toggle");
    btn.innerHTML = "<span></span><span></span><span></span>";
    btn.setAttribute("aria-controls", panel.id);
    const setOpen = (open) => {
        panel.classList.toggle("is-active", open);
        btn.setAttribute("aria-expanded", String(open));
        btn.setAttribute("aria-label", open ? "關閉選單" : "開啟選單");
    };
    setOpen(false);
    btn.addEventListener("click", () => setOpen(!panel.classList.contains("is-active")));
    menu.addEventListener("click", (e) => {
        if (e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("click", (e) => {
        if (!bar.contains(e.target)) setOpen(false);
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") setOpen(false);
    });
    window.addEventListener("resize", () => {
        if (window.innerWidth > 900) setOpen(false);
    });
}
function setupSideMenuDropdown() {
    const aside = document.querySelector(".side-menu");
    const list = aside && aside.querySelector(":scope > ul");
    if (!list) return;
    if (!list.id) list.id = "side-menu-list";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "side-toggle";
    btn.setAttribute("aria-controls", list.id);
    btn.setAttribute("aria-expanded", "false");
    btn.innerHTML = '<span class="side-toggle-label"></span><span class="side-toggle-icon" aria-hidden="true"></span>';
    aside.insertBefore(btn, list);
    const label = btn.querySelector(".side-toggle-label");

    const updateLabel = () => {
        const actives = aside.querySelectorAll("a.active");
        const current = actives[actives.length - 1] || aside.querySelector("a");
        if (current) label.textContent = current.textContent.trim();
    };
    updateLabel();
    new MutationObserver(updateLabel).observe(aside, {
        attributes: true,
        attributeFilter: ["class"],
        subtree: true,
    });
    const setOpen = (open) => {
        aside.classList.toggle("is-open", open);
        btn.setAttribute("aria-expanded", String(open));
    };
    btn.addEventListener("click", () => setOpen(!aside.classList.contains("is-open")));
    list.addEventListener("click", (e) => {
        const link = e.target.closest("a");
        if (!link) return;
        label.textContent = link.textContent.trim();
        setOpen(false);
    });
    document.addEventListener("click", (e) => {
        if (!aside.contains(e.target)) setOpen(false);
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") setOpen(false);
    });
    window.addEventListener("resize", () => {
        if (window.innerWidth > 900) setOpen(false);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    setupSideMenuDropdown();
    const headerElem = document.querySelector("header");
    if (headerElem) {
        fetch("./components/header.html")
            .then(response => {
                if (!response.ok) throw new Error("Header 載入失敗");
                return response.text();
            })
            .then(html => {
                headerElem.innerHTML = html;
                setupNavToggle();
            })
            .catch(error => console.error(error));
    }
    const footerElem = document.querySelector("footer");
    if (footerElem) {
        fetch("./components/footer.html")
            .then(response => {
                if (!response.ok) throw new Error("Footer 載入失敗");
                return response.text();
            })
            .then(html => {
                footerElem.innerHTML = html;
            })
            .catch(error => console.error(error));
    }
});