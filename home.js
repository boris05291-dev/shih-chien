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
// 點縮圖才建立 YouTube iframe，避免一打開頁面就下載 YouTube 播放器
document.querySelectorAll(".yt-lite").forEach((btn) => {
    btn.addEventListener("click", () => {
        const iframe = document.createElement("iframe");
        iframe.src = "https://www.youtube.com/embed/" + btn.dataset.id + "?autoplay=1";
        iframe.title = "實踐大學校歌";
        iframe.allow = "accelerometer; autoplay; encrypted-media; web-share";
        iframe.referrerPolicy = "strict-origin-when-cross-origin";
        iframe.allowFullscreen = true;
        btn.replaceWith(iframe);
    });
});
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
// ---- 深色模式：在 <html> 加上 data-theme="dark"，all.css 就會換一組顏色變數 ----
(() => {
    const KEY = "theme";
    const root = document.documentElement;
    // localStorage 在無痕模式等情況可能丟錯，所以包 try/catch
    let saved = null;
    try {
        saved = localStorage.getItem(KEY);
    } catch (e) {}
    // 沒存過就跟著作業系統的深淺色設定
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const apply = (theme) => {
        root.setAttribute("data-theme", theme);
        btn.innerHTML = theme === "dark" ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
        btn.setAttribute("aria-label", theme === "dark" ? "切換成淺色模式" : "切換成深色模式");
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

// ---- 捲動淡入：卡片捲進畫面才浮現 ----
(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // 使用者不想要動畫，或瀏覽器太舊不支援，就什麼都不做（卡片照常顯示）
    if (reduceMotion || !("IntersectionObserver" in window)) return;
    const cards = document.querySelectorAll(
        ".all1 .timeline li, .p-2, .p-3, .p-4, .vall-1, .pdd, .i-1, .i-2, .pp1, .li-1, .li-2, .li-3, .li-4, .li-5",
    );
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target); // 浮現一次就好，不用再盯著
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
    // YouTube 縮圖本身是播放按鈕，不要放大
    const imgs = Array.from(document.querySelectorAll(".all1 img")).filter((img) => !img.closest(".yt-lite"));
    if (!imgs.length) return;

    const box = document.createElement("div");
    box.className = "lightbox";
    box.hidden = true;
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", "圖片放大檢視");
    box.innerHTML =
        '<button type="button" class="lightbox-close" aria-label="關閉">&times;</button>' +
        '<figure><img alt="" /><figcaption></figcaption></figure>';
    document.body.appendChild(box);
    const bigImg = box.querySelector("img");
    const caption = box.querySelector("figcaption");
    const closeBtn = box.querySelector(".lightbox-close");
    let lastImg = null;

    const open = (img) => {
        bigImg.src = img.currentSrc || img.src;
        bigImg.alt = img.alt;
        caption.textContent = img.alt;
        lastImg = img;
        box.hidden = false;
        document.body.style.overflow = "hidden"; // 開著燈箱時背景不要捲動
        closeBtn.focus();
    };
    const close = () => {
        if (box.hidden) return;
        box.hidden = true;
        document.body.style.overflow = "";
        if (lastImg) lastImg.focus(); // 焦點回到剛剛點的圖片，鍵盤使用者才不會迷路
    };

    imgs.forEach((img) => {
        img.classList.add("zoomable");
        // 讓圖片可以用 Tab 選到、按 Enter 或空白鍵打開
        img.tabIndex = 0;
        img.setAttribute("role", "button");
        img.setAttribute("aria-label", "放大檢視：" + img.alt);
        img.addEventListener("click", () => open(img));
        img.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                open(img);
            }
        });
    });
    // 點大圖以外的地方（背景、關閉鈕）都關閉
    box.addEventListener("click", (e) => {
        if (e.target !== bigImg) close();
    });
    document.addEventListener("keydown", (e) => {
        if (box.hidden) return;
        if (e.key === "Escape") close();
        // 燈箱裡只有一個按鈕，按 Tab 時把焦點留在它身上
        if (e.key === "Tab") {
            e.preventDefault();
            closeBtn.focus();
        }
    });
})();
