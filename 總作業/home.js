/* jshint esversion: 6, browser: true */
// 小工具：元素離整頁頂端的距離
const docTop = (el) => el.getBoundingClientRect().top + window.scrollY;
// 英文頁的 <html lang="en"> → JS 產生的文字也換英文
const isEn = document.documentElement.lang === "en";
// 小工具：捲動 / 縮放 / 載入時執行 fn｜requestAnimationFrame + ticking 節流 → 每幀最多一次
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
    window.addEventListener("scroll", run, { passive: true }); // passive → 保證不 preventDefault，捲動更順
    window.addEventListener("resize", run);
    window.addEventListener("load", run);
    fn();
};
// ===== 回到頂部按鈕 =====
// 捲超過 300px 加 .show，點了回頂端
const btop = document.getElementById("b-top");
if (btop) {
    onScrollOrLayout(() => btop.classList.toggle("show", window.scrollY > 300));
    btop.addEventListener("click", () => window.scrollTo(0, 0));
}
// YouTube：點縮圖才建立 iframe
document.querySelectorAll(".yt-lite").forEach((btn) => {
    btn.addEventListener("click", () => {
        const iframe = document.createElement("iframe");
        iframe.src = "https://www.youtube.com/embed/" + btn.dataset.id + "?autoplay=1";
        iframe.title = isEn ? "Shih Chien University anthem" : "實踐大學校歌";
        iframe.allow = "accelerometer; autoplay; encrypted-media; web-share";
        iframe.referrerPolicy = "strict-origin-when-cross-origin";
        iframe.allowFullscreen = true;
        btn.replaceWith(iframe);
    });
});
// ===== 首頁側邊選單：捲到哪段，哪項加 active =====
// 只有首頁有 h1、h7 區塊
const h1Section = document.getElementById("h1");
const h7Section = document.getElementById("h7");
if (h1Section && h7Section) {
    const menuLinks = document.querySelectorAll(".side-menu .menu-link");
    const OFFSET = 150; // 提早 150px 判定（上方有東西擋）
    onScrollOrLayout(() => {
        const pos = window.scrollY + OFFSET;
        let current = "top-section";
        if (pos >= docTop(h7Section)) current = "h7";
        else if (pos >= docTop(h1Section)) current = "h1";
        // toggle(class, true / false) → 加上 / 拿掉
        menuLinks.forEach((link) => {
            link.classList.toggle("active", link.getAttribute("data-target") === current);
        });
    });
}
// ---- 深色模式：<html data-theme="dark"> → all.css 換一組變數 ----
// 立即執行函式 (() => {})() → 變數不會跟其他檔案撞名
(() => {
    const KEY = "theme";
    const root = document.documentElement;
    // localStorage 可能丟錯（無痕模式）→ try/catch
    let saved = null;
    try {
        saved = localStorage.getItem(KEY);
    } catch (e) {}
    // 沒存過 → 跟系統深淺色設定
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    // apply 用到後面的 btn 沒關係：btn 建好後才呼叫
    const apply = (theme) => {
        root.setAttribute("data-theme", theme);
        btn.innerHTML = theme === "dark" ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
        const labels = isEn ? ["Switch to light mode", "Switch to dark mode"] : ["切換成淺色模式", "切換成深色模式"];
        btn.setAttribute("aria-label", theme === "dark" ? labels[0] : labels[1]);
    };
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "theme-toggle";
    document.body.appendChild(btn);
    apply(saved || (prefersDark ? "dark" : "light"));
    btn.addEventListener("click", () => {
        const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
        apply(next);
        try {
            localStorage.setItem(KEY, next);
        } catch (e) {}
    });
})();

// ---- 開場校史：捲動距離 → 年份、目前事件、書法 ----
(() => {
    const section = document.querySelector(".chronicle");
    // html.scrub 由 <head> 判斷（減少動態的使用者不會有）
    if (!section || !document.documentElement.classList.contains("scrub")) return;
    const stage = section.querySelector(".chronicle-stage");
    const yearEl = section.querySelector(".chronicle-year");
    const brush = section.querySelector(".chronicle-brush");
    const bar = section.querySelector(".chronicle-bar span");
    const items = Array.from(section.querySelectorAll(".timeline li"));
    // 年份直接讀 <time datetime>，不用另外維護一份
    const years = items.map((li) => Number(li.querySelector("time").dateTime.slice(0, 4)));
    const last = items.length - 1;
    const clamp01 = (n) => Math.min(1, Math.max(0, n));

    onScrollOrLayout(() => {
        const range = section.offsetHeight - stage.offsetHeight;
        const progress = clamp01((parseFloat(getComputedStyle(stage).top) - section.getBoundingClientRect().top) / range);
        // × 1.12 → 提早走到終點，最後停留一下讓人看完書法
        const pos = Math.min(last, progress * last * 1.12);
        const current = Math.round(pos);
        // 大年份跟目前事件同一筆，不插值（插值會在民國68年旁顯示1981這種不存在的年份）
        const year = String(years[current]);
        if (yearEl.textContent !== year) yearEl.textContent = year;
        items.forEach((li, i) => li.classList.toggle("is-current", i === current));
        // 只有最後一段（1995 → 1997）才寫出校名
        brush.style.clipPath = `inset(0 ${100 - clamp01(pos - (last - 1)) * 100}% 0 0)`;
        bar.style.transform = `scaleX(${progress})`;
    });
})();

// ---- 捲動淡入：卡片捲進畫面才浮現 ----
(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // 不要動畫或瀏覽器不支援 → 不處理（卡片照常顯示）
    if (reduceMotion || !("IntersectionObserver" in window)) return;
    // 開場照片（.person-hero）不淡入：先透明會拖慢最大內容繪製（LCP）
    const cards = document.querySelectorAll(
        ".all1 .timeline li, .p-2, .p-3, .p-4, .vall-1, .pdd, .i-1, .i-2:not(.person-hero .i-2), .pp1, .li-1, .li-2, .li-3, .li-4, .li-5",
    );
    // IntersectionObserver：瀏覽器偵測進畫面，比監聽 scroll 省效能｜rootMargin 底部 -10% → 多露出一點才算
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target); // 浮現一次就停止觀察
            });
        },
        { rootMargin: "0px 0px -10% 0px" },
    );
    cards.forEach((card) => {
        card.classList.add("reveal");
        observer.observe(card);
    });
})();

// ---- 照片燈箱：點圖片放大，按 Esc、點背景或關閉鈕收起 ----
(() => {
    // YouTube 縮圖是播放鈕 → 不放大
    const imgs = Array.from(document.querySelectorAll(".all1 img")).filter((img) => !img.closest(".yt-lite"));
    if (!imgs.length) return;

    // 燈箱只建一個，換 src 和說明文字重複用
    const box = document.createElement("div");
    box.className = "lightbox";
    box.hidden = true;
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", isEn ? "Enlarged image" : "圖片放大檢視");
    box.innerHTML =
        `<button type="button" class="lightbox-close" aria-label="${isEn ? "Close" : "關閉"}">&times;</button>` +
        '<figure><img alt="" /><figcaption></figcaption></figure>';
    document.body.appendChild(box);
    const bigImg = box.querySelector("img");
    const caption = box.querySelector("figcaption");
    const closeBtn = box.querySelector(".lightbox-close");
    let lastImg = null;

    const open = (img) => {
        bigImg.src = img.currentSrc || img.src; // currentSrc = 實際載入的那張
        bigImg.alt = img.alt;
        caption.textContent = img.alt;
        lastImg = img;
        box.hidden = false;
        document.body.style.overflow = "hidden"; // 開燈箱時背景不捲動
        closeBtn.focus();
    };
    const close = () => {
        if (box.hidden) return;
        box.hidden = true;
        document.body.style.overflow = "";
        if (lastImg) lastImg.focus(); // 焦點回到原圖（鍵盤使用者不迷路）
    };

    imgs.forEach((img) => {
        img.classList.add("zoomable");
        // Tab 可選到，Enter / 空白鍵打開
        img.tabIndex = 0;
        img.setAttribute("role", "button");
        img.setAttribute("aria-label", (isEn ? "Enlarge: " : "放大檢視：") + img.alt);
        img.addEventListener("click", () => open(img));
        img.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                open(img);
            }
        });
    });
    // 點大圖以外（背景、關閉鈕）→ 關閉
    box.addEventListener("click", (e) => {
        if (e.target !== bigImg) close();
    });
    document.addEventListener("keydown", (e) => {
        if (box.hidden) return;
        if (e.key === "Escape") close();
        // 只有一個按鈕 → Tab 焦點留在它身上
        if (e.key === "Tab") {
            e.preventDefault();
            closeBtn.focus();
        }
    });
})();
