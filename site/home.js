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
// ===== 閱讀進度條：捲多少比例，頂端綠線就長多少 =====
const readBar = document.createElement("div");
readBar.className = "read-progress";
readBar.setAttribute("aria-hidden", "true");
document.body.append(readBar);
onScrollOrLayout(() => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    readBar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
});
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
// ===== 側邊選單：捲到哪段，哪項加 active（首頁、副校長頁共用）=====
// 選單 data-target = 區塊 id｜找不到區塊的項目（首頁的 top-section）→ 還沒捲到任何區塊時的預設
const spyLinks = Array.from(document.querySelectorAll(".side-menu .menu-link[data-target]"));
const spySections = spyLinks.map((link) => document.getElementById(link.dataset.target)).filter(Boolean);
if (spySections.length) {
    const OFFSET = 150; // 提早 150px 判定（上方有東西擋）
    onScrollOrLayout(() => {
        const pos = window.scrollY + OFFSET;
        // 由上往下，最後一個捲過判定線的就是目前段落
        let current = spyLinks[0].dataset.target;
        spySections.forEach((sec) => {
            if (pos >= docTop(sec)) current = sec.id;
        });
        // 已捲到底 → 直接算最後一段（最後一段太短時判定線碰不到）｜-2 容許誤差
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
            current = spySections[spySections.length - 1].id;
        }
        // toggle(class, true / false) → 加上 / 拿掉
        spyLinks.forEach((link) => link.classList.toggle("active", link.dataset.target === current));
    });
}
// ---- 深色模式：<html data-theme="dark"> → all.css 換一組變數 ----
// 立即執行函式 (() => {})() → 變數不會跟其他檔案撞名
(() => {
    const KEY = "theme";
    const root = document.documentElement;
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
    // 每頁 <head> 已先設好 data-theme（避免閃白）→ 這裡只同步按鈕圖示
    apply(root.getAttribute("data-theme") || "light");
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
        ".all1 .timeline li, .p-2, .p-3, .p-4, .vall-1, .pdd, .carousel, .i-1, .i-2:not(.person-hero .i-2), .pp1, .li-1, .li-2, .li-3, .li-4, .li-5",
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
    // YouTube 縮圖是播放鈕、輪播照片點了要換頁 → 不放大
    const imgs = Array.from(document.querySelectorAll(".all1 img")).filter((img) => !img.closest(".yt-lite, .carousel"));
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

// ---- 輪播（.carousel）：左右箭頭、圓點、自動播放 ----
// 換頁 = 叫 .carousel-track 橫向捲到那一張（CSS scroll-snap 負責對齊）→ 手指滑、鍵盤、按鈕都走同一套
// querySelectorAll + forEach → 同一頁放好幾個輪播也可以
document.querySelectorAll(".carousel").forEach((carousel) => {
    const track = carousel.querySelector(".carousel-track");
    const slides = Array.from(track.children);
    if (slides.length < 2) return;
    const DELAY = 5000; // 5 秒換一張
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = isEn
        ? { prev: "Previous slide", next: "Next slide", goto: "Go to slide ", pause: "Pause autoplay", play: "Start autoplay" }
        : { prev: "上一張", next: "下一張", goto: "跳到第 ", pause: "暫停自動播放", play: "開始自動播放" };
    // 圖示用內嵌 SVG：精簡版 Font Awesome 沒有箭頭、播放、暫停這幾個字｜currentColor → 跟著文字變色（深色模式也對）
    const ICON = {
        prev: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M15.4 4.6 8 12l7.4 7.4 1.4-1.4-6-6 6-6z" fill="currentColor"/></svg>',
        next: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M8.6 4.6 7.2 6l6 6-6 6 1.4 1.4L16 12z" fill="currentColor"/></svg>',
        play: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>',
        pause: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M7 5h3.5v14H7zm6.5 0H17v14h-3.5z" fill="currentColor"/></svg>',
    };
    let current = 0;
    let timer = null;
    let userPaused = reduceMotion; // 不要動畫的人 → 一開始就不自動播
    let hoverPaused = false; // 滑鼠移上去、或鍵盤焦點在裡面 → 先停，免得正在讀就被換走

    // 每張補上「第幾張 / 共幾張」給螢幕閱讀器
    slides.forEach((slide, i) => slide.setAttribute("aria-label", `${i + 1} / ${slides.length}`));

    // 小工具：建一個按鈕
    const makeBtn = (cls, label, html) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = cls;
        b.setAttribute("aria-label", label);
        b.innerHTML = html;
        return b;
    };
    const prevBtn = makeBtn("carousel-btn", t.prev, ICON.prev);
    const nextBtn = makeBtn("carousel-btn", t.next, ICON.next);
    const pauseBtn = makeBtn("carousel-btn", "", "");
    const dotsWrap = document.createElement("div");
    dotsWrap.className = "carousel-dots";
    const dots = slides.map((_, i) => {
        const d = makeBtn("carousel-dot", t.goto + (i + 1) + (isEn ? "" : " 張"), "");
        d.addEventListener("click", () => goTo(i));
        dotsWrap.append(d);
        return d;
    });
    const controls = document.createElement("div");
    controls.className = "carousel-controls";
    controls.append(prevBtn, dotsWrap, nextBtn, pauseBtn);
    carousel.append(controls);

    // 換到第 i 張｜% 讓最後一張的下一張回到第一張
    function goTo(i) {
        const n = (i + slides.length) % slides.length;
        // 先記下目標 → 動畫還沒跑完就連按，也是從目標往下算（不然連按兩下只會動一張）
        current = n;
        markDots();
        track.scrollTo({ left: slides[n].offsetLeft - track.offsetLeft, behavior: reduceMotion ? "auto" : "smooth" });
    }
    // 目前是第幾張：看捲了幾個「軌道寬」｜手指滑的時候也會更新
    const markDots = () => dots.forEach((d, i) => d.setAttribute("aria-current", i === current ? "true" : "false"));
    const sync = () => {
        current = Math.round(track.scrollLeft / track.clientWidth);
        markDots();
    };

    // ---- 自動播放：只要有任何一個「停」的理由就停 ----
    const update = () => {
        clearInterval(timer);
        timer = null;
        if (!userPaused && !hoverPaused && !document.hidden) timer = setInterval(() => goTo(current + 1), DELAY);
        // 暫停鈕顯示「按下去會怎樣」
        pauseBtn.innerHTML = userPaused ? ICON.play : ICON.pause;
        pauseBtn.setAttribute("aria-label", userPaused ? t.play : t.pause);
    };
    // 手動換頁 → 重新計時（不然剛按完又馬上被自動換走）
    prevBtn.addEventListener("click", () => {
        goTo(current - 1);
        update();
    });
    nextBtn.addEventListener("click", () => {
        goTo(current + 1);
        update();
    });
    pauseBtn.addEventListener("click", () => {
        userPaused = !userPaused;
        update();
    });
    // 只停輪播本身，不包含控制列 → 不然游標停在暫停鈕上時，按「播放」看起來沒反應
    track.addEventListener("mouseenter", () => {
        hoverPaused = true;
        update();
    });
    track.addEventListener("mouseleave", () => {
        hoverPaused = false;
        update();
    });
    track.addEventListener("focusin", () => {
        hoverPaused = true;
        update();
    });
    track.addEventListener("focusout", () => {
        hoverPaused = false;
        update();
    });
    // 切到別的分頁 → 停（看不到還一直換很浪費）
    document.addEventListener("visibilitychange", update);
    // 鍵盤：焦點在輪播裡時，左右鍵換頁
    carousel.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft") goTo(current - 1);
        else if (e.key === "ArrowRight") goTo(current + 1);
        else return;
        e.preventDefault();
    });
    // 停止捲動 100ms 後才算「停在哪張」（debounce）→ 平滑捲動途中不會亂跳圓點｜手指滑完也會更新
    let settle = null;
    track.addEventListener(
        "scroll",
        () => {
            clearTimeout(settle);
            settle = setTimeout(sync, 100);
        },
        { passive: true },
    );
    // 視窗縮放後寬度變了 → 重新對齊到目前這張
    window.addEventListener("resize", () => goTo(current));
    sync();
    update();
});
