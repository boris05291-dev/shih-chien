/* jshint esversion: 6, browser: true */
// ===== 副校長頁：捲到哪位副校長，子選單就亮哪一項 =====
// 跟 home.js 同樣的概念，但這邊是從選單的 data-target 去找對應區塊，所以不管幾位都能用
(() => {
    const links = document.querySelectorAll(".sub-menu .menu-link");
    if (!links.length) return;
    // 把每個連結的 data-target 換成對應的 section；filter(Boolean) 把找不到的（null）濾掉
    const sections = Array.from(links)
        .map((l) => document.getElementById(l.getAttribute("data-target")))
        .filter(Boolean);
    if (!sections.length) return;
    const docTop = (el) => el.getBoundingClientRect().top + window.scrollY;
    const OFFSET = 150;
    let ticking = false;
    const update = () => {
        // 從上往下檢查，最後一個「已經捲過判定線」的區塊就是目前這段
        const pos = window.scrollY + OFFSET;
        let current = sections[0].id;
        sections.forEach((sec) => {
            if (pos >= docTop(sec)) current = sec.id;
        });
        // 已經捲到底了：最後一段可能太矮碰不到判定線，直接算最後一段（-2 是容許一點誤差）
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
            current = sections[sections.length - 1].id;
        }
        links.forEach((l) => {
            l.classList.toggle("active", l.getAttribute("data-target") === current);
        });
    };
    // 跟 home.js 一樣用 requestAnimationFrame 節流，每一幀最多更新一次
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