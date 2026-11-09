/* jshint esversion: 6, browser: true */
// ===== 副校長頁：捲到哪位副校長，子選單就亮哪一項 =====
// 從選單 data-target 找區塊 → 幾位副校長都適用
(() => {
    const links = document.querySelectorAll(".sub-menu .menu-link");
    if (!links.length) return;
    // data-target → 對應 section｜filter(Boolean) 濾掉 null
    const sections = Array.from(links)
        .map((l) => document.getElementById(l.getAttribute("data-target")))
        .filter(Boolean);
    if (!sections.length) return;
    const docTop = (el) => el.getBoundingClientRect().top + window.scrollY;
    const OFFSET = 150;
    let ticking = false;
    const update = () => {
        // 由上往下，最後一個捲過判定線的就是目前段落
        const pos = window.scrollY + OFFSET;
        let current = sections[0].id;
        sections.forEach((sec) => {
            if (pos >= docTop(sec)) current = sec.id;
        });
        // 已捲到底 → 直接算最後一段（-2 容許誤差）
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
            current = sections[sections.length - 1].id;
        }
        links.forEach((l) => {
            l.classList.toggle("active", l.getAttribute("data-target") === current);
        });
    };
    // requestAnimationFrame 節流（同 home.js）
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