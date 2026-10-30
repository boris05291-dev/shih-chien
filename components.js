/* jshint esversion: 6, browser: true, devel: true */
// ===== 手機版漢堡選單 =====
// 頁首 fetch 塞好後才能呼叫（見最下面）
function setupNavToggle() {
    const bar = document.querySelector(".nav-container");
    const menu = bar && bar.querySelector(".nav-menu"); // 短路寫法：bar 是 null 就直接回傳 null
    if (!menu) return;
    // 有 .hl-1 就收合外層，沒有就收合選單本身
    const panel = menu.closest(".hl-1") || menu;
    panel.classList.add("nav-collapse");
    if (!panel.id) panel.id = "nav-panel";
    // 舊按鈕可能綁了 onclick → cloneNode 換成乾淨的｜沒有按鈕就自己建
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
    // 開關選單：class + aria 一起改（螢幕閱讀器才知道狀態）
    const setOpen = (open) => {
        panel.classList.toggle("is-active", open);
        btn.setAttribute("aria-expanded", String(open));
        btn.setAttribute("aria-label", open ? "關閉選單" : "開啟選單");
    };
    setOpen(false);
    btn.addEventListener("click", () => setOpen(!panel.classList.contains("is-active")));
    // 事件委派：綁在整個選單上，用 closest 判斷是否點到連結
    menu.addEventListener("click", (e) => {
        if (e.target.closest("a")) setOpen(false);
    });
    // 點選單外面 → 關閉
    document.addEventListener("click", (e) => {
        if (!bar.contains(e.target)) setOpen(false);
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") setOpen(false);
    });
    // 拉回桌機寬度（> 900px）自動關閉｜數字要跟 CSS 斷點一致
    window.addEventListener("resize", () => {
        if (window.innerWidth > 900) setOpen(false);
    });
}
// ===== 手機版側邊選單的下拉按鈕 =====
// 桌機時按鈕被 CSS 藏起來 → 任何尺寸都能建立
function setupSideMenuDropdown() {
    const aside = document.querySelector(".side-menu");
    const list = aside && aside.querySelector(":scope > ul"); // :scope > ul → 只抓第一層 ul
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

    // 按鈕顯示目前項目｜多個 active 取最後一個（子選單較精準）
    const updateLabel = () => {
        const actives = aside.querySelectorAll("a.active");
        const current = actives[actives.length - 1] || aside.querySelector("a");
        if (current) label.textContent = current.textContent.trim();
    };
    updateLabel();
    // MutationObserver 監視 class → home.js / Vice.js 換 active 時同步更新按鈕文字
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

// ===== 頁面 HTML 讀完後開始 =====
// fetch 共用頁首頁尾塞進 <header>、<footer>｜file:// 會失敗，要用本機伺服器
document.addEventListener("DOMContentLoaded", () => {
    setupSideMenuDropdown();
    const headerElem = document.querySelector("header");
    // 頁首已寫在 HTML 裡（courses.html）→ 不 fetch，直接設定漢堡選單
    if (headerElem && headerElem.children.length > 0) {
        setupNavToggle();
    } else if (headerElem) {
        fetch("./components/header.html")
            .then(response => {
                if (!response.ok) throw new Error("Header 載入失敗"); // fetch 遇到 404 不會丟錯 → 自己檢查 ok
                return response.text();
            })
            .then(html => {
                headerElem.innerHTML = html;
                setupNavToggle(); // 頁首塞好才有漢堡按鈕
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