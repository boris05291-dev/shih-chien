/* jshint esversion: 6, browser: true, devel: true */
// ===== 手機版漢堡選單 =====
// 頁首是用 fetch 載入的，要等 header 塞進去之後才能呼叫這個函式（看最下面）
function setupNavToggle() {
    const bar = document.querySelector(".nav-container");
    const menu = bar && bar.querySelector(".nav-menu"); // bar 是 null 就直接回傳 null，不會報錯（短路寫法）
    if (!menu) return;
    // 有 .hl-1 外層就收合整個外層，沒有就收合選單本身
    const panel = menu.closest(".hl-1") || menu;
    panel.classList.add("nav-collapse");
    if (!panel.id) panel.id = "nav-panel";
    // 頁首 HTML 裡可能本來就有按鈕，而且還綁了 onclick
    // cloneNode 複製一顆乾淨的換掉舊的，舊的事件就跟著一起丟掉；完全沒按鈕就自己做一顆
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
    // 開關選單都走這個函式：class 跟 aria 屬性一起改，螢幕閱讀器才知道選單現在是開還是關
    const setOpen = (open) => {
        panel.classList.toggle("is-active", open);
        btn.setAttribute("aria-expanded", String(open));
        btn.setAttribute("aria-label", open ? "關閉選單" : "開啟選單");
    };
    setOpen(false);
    btn.addEventListener("click", () => setOpen(!panel.classList.contains("is-active")));
    // 事件委派：不用每個連結各綁一次，直接綁在整個選單上，再用 closest 看點到的是不是連結
    menu.addEventListener("click", (e) => {
        if (e.target.closest("a")) setOpen(false);
    });
    // 點選單外面的地方就關起來
    document.addEventListener("click", (e) => {
        if (!bar.contains(e.target)) setOpen(false);
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") setOpen(false);
    });
    // 視窗拉回桌機寬度（900px 以上）就自動關掉，數字要跟 CSS 的斷點一樣
    window.addEventListener("resize", () => {
        if (window.innerWidth > 900) setOpen(false);
    });
}
// ===== 手機版側邊選單的下拉按鈕 =====
// 桌機時這顆按鈕會被 CSS 藏起來，所以不管什麼尺寸都可以放心建立
function setupSideMenuDropdown() {
    const aside = document.querySelector(".side-menu");
    const list = aside && aside.querySelector(":scope > ul"); // :scope > ul → 只抓 aside 底下第一層的 ul，不會抓到子選單
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

    // 按鈕上顯示目前所在的項目；有好幾個 active 就取最後一個（子選單比較精準）
    const updateLabel = () => {
        const actives = aside.querySelectorAll("a.active");
        const current = actives[actives.length - 1] || aside.querySelector("a");
        if (current) label.textContent = current.textContent.trim();
    };
    updateLabel();
    // MutationObserver：監視裡面元素的 class 有沒有變
    // 捲動時 home.js / Vice.js 會換 active，這邊一發現就跟著更新按鈕文字
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
// 用 fetch 把共用的頁首頁尾 HTML 抓回來塞進 <header>、<footer>，每頁就不用重複寫一樣的東西
// 注意：直接雙擊開檔（file://）fetch 會失敗，要用本機伺服器開
document.addEventListener("DOMContentLoaded", () => {
    setupSideMenuDropdown();
    const headerElem = document.querySelector("header");
    if (headerElem) {
        fetch("./components/header.html")
            .then(response => {
                if (!response.ok) throw new Error("Header 載入失敗"); // fetch 遇到 404 不會自己丟錯，要自己檢查 ok
                return response.text();
            })
            .then(html => {
                headerElem.innerHTML = html;
                setupNavToggle(); // 頁首塞好了才有漢堡按鈕可以設定
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