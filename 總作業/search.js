/* jshint esversion: 8, browser: true, devel: true */
// ===== 全站搜尋 =====
// 導覽列加一個搜尋按鈕 → 打開 <dialog>，即時搜尋同語言的所有頁面
// 第一次打開才 fetch 各頁並建立索引（以標題切段落），之後都用快取
// 快捷鍵：「/」或 Ctrl / ⌘ + K
(() => {
    const isEn = document.documentElement.lang === "en";
    // 要搜尋的頁面（中文版檔名；英文版自動加 -en）
    const PAGES = ["home", "Founder", "president", "headmaster", "Vice", "courses"];
    const MAX_RESULTS = 30;
    // 段落以這些標題切開｜同頁跳轉也用同一個順序找回標題
    const HEADINGS = ".chronicle h1, .chronicle h2, .chronicle h3, .chronicle h4, main h1, main h2, main h3, main h4";
    const T = isEn
        ? {
              open: "Search",
              placeholder: "Search this site…",
              close: "Close search",
              hint: "Type a keyword, e.g. history, anthem, Ph.D.",
              loading: "Loading…",
              empty: (q) => `No results for “${q}”`,
              count: (n) => `${n} result${n === 1 ? "" : "s"}`,
              error: "Search could not load the pages. Please open the site through a web server.",
              keys: "↑ ↓ to move · Enter to open · Esc to close",
          }
        : {
              open: "搜尋",
              placeholder: "搜尋本站內容…",
              close: "關閉搜尋",
              hint: "輸入關鍵字，例如：校歌、創校、博士",
              loading: "載入中…",
              empty: (q) => `找不到「${q}」的相關內容`,
              count: (n) => `共 ${n} 筆結果`,
              error: "無法載入頁面內容，請透過網頁伺服器開啟本站。",
              keys: "↑ ↓ 選擇 · Enter 開啟 · Esc 關閉",
          };
    const suffix = isEn ? "-en" : "";
    const currentFile = decodeURIComponent(location.pathname.split("/").pop() || "home.html");

    // ---- 索引 ----
    let indexPromise = null;
    const normalize = (s) => s.replace(/\s+/g, " ").trim();

    // 把一頁切成「標題 + 底下文字」的段落
    function extractSections(doc, file) {
        const pageTitle = normalize((doc.querySelector("title") || {}).textContent || file).split(/\s*[|｜]\s*/)[0];
        const roots = [...doc.querySelectorAll(".chronicle, main")];
        const allHeadings = [...doc.querySelectorAll(HEADINGS)];
        const sections = [];
        roots.forEach((root) => {
            let current = { heading: pageTitle, id: "", text: "", hIndex: -1 };
            const push = () => {
                current.text = normalize(current.text);
                if (current.text || current.hIndex >= 0) sections.push(current);
            };
            const walker = doc.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
                acceptNode(node) {
                    if (node.nodeType === 1) {
                        if (/^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE|SVG|BUTTON)$/i.test(node.tagName)) return NodeFilter.FILTER_REJECT;
                        return /^H[1-4]$/.test(node.tagName) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
                    }
                    return NodeFilter.FILTER_ACCEPT;
                },
            });
            let node;
            while ((node = walker.nextNode())) {
                if (node.nodeType === 1) {
                    push();
                    const heading = normalize(node.textContent);
                    const anchorEl = node.id ? node : node.parentElement && node.parentElement.closest("[id]");
                    const hIndex = allHeadings.indexOf(node);
                    current = { heading, id: anchorEl && root.contains(anchorEl) ? anchorEl.id : "", text: "", hIndex, ownId: !!node.id };
                } else if (node.parentElement && !node.parentElement.closest("h1,h2,h3,h4")) {
                    current.text += " " + node.textContent;
                }
            }
            push();
        });
        const bodyText = doc.body ? doc.body.textContent.replace(/\s+/g, " ") : "";
        return sections.map((s) => {
            // 標題本身沒有 id → 加 #:~:text= 讓支援的瀏覽器捲到並標示該標題
            let hash = s.id ? "#" + s.id : "";
            // 只有標題文字在整頁唯一時才用（重複的「學歷」會跳到第一個，不一定是這段）
            if (!s.ownId && s.hIndex >= 0 && s.heading && bodyText.split(s.heading).length === 2) hash = (hash || "#") + ":~:text=" + encodeURIComponent(s.heading);
            return {
                page: pageTitle,
                file,
                heading: s.heading,
                text: s.text,
                hIndex: s.hIndex,
                href: file + hash,
                haystack: (s.heading + " " + s.text).toLowerCase(),
                headLower: s.heading.toLowerCase(),
            };
        });
    }

    function buildIndex() {
        if (indexPromise) return indexPromise;
        const parser = new DOMParser();
        indexPromise = Promise.all(
            PAGES.map((name) => {
                const file = name + suffix + ".html";
                return fetch(file)
                    .then((r) => {
                        if (!r.ok) throw new Error(file);
                        return r.text();
                    })
                    .then((html) => extractSections(parser.parseFromString(html, "text/html"), file))
                    .catch(() => null);
            })
        ).then((lists) => {
            const ok = lists.filter(Boolean);
            if (!ok.length) {
                indexPromise = null; // 下次打開再試
                throw new Error("index failed");
            }
            return ok.flat();
        });
        return indexPromise;
    }

    // ---- 搜尋與顯示 ----
    const escapeHtml = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
    const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    function highlight(text, terms) {
        if (!terms.length) return escapeHtml(text);
        const re = new RegExp("(" + terms.map(escapeRe).join("|") + ")", "gi");
        return text
            .split(re)
            .map((part, i) => (i % 2 ? "<mark>" + escapeHtml(part) + "</mark>" : escapeHtml(part)))
            .join("");
    }

    function snippet(text, terms) {
        const lower = text.toLowerCase();
        let pos = -1;
        terms.forEach((t) => {
            const p = lower.indexOf(t);
            if (p >= 0 && (pos < 0 || p < pos)) pos = p;
        });
        if (pos < 0) return text.slice(0, 90) + (text.length > 90 ? "…" : "");
        const start = Math.max(0, pos - 30);
        const end = Math.min(text.length, pos + 80);
        return (start > 0 ? "…" : "") + text.slice(start, end) + (end < text.length ? "…" : "");
    }

    function search(index, query) {
        const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
        if (!terms.length) return { terms, results: [] };
        const results = [];
        index.forEach((item) => {
            if (!terms.every((t) => item.haystack.includes(t))) return;
            let score = 0;
            terms.forEach((t) => {
                if (item.headLower.includes(t)) score += 10;
                if (item.page.toLowerCase().includes(t)) score += 3;
                score += Math.min(item.haystack.split(t).length - 1, 5);
            });
            results.push({ item, score });
        });
        results.sort((a, b) => b.score - a.score);
        return { terms, results: results.slice(0, MAX_RESULTS).map((r) => r.item) };
    }

    // ---- 介面 ----
    const ICON = '<svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/></svg>';
    let dialog, input, list, status;
    let activeIndex = -1;

    function createDialog() {
        dialog = document.createElement("dialog");
        dialog.className = "site-search";
        dialog.setAttribute("aria-label", T.open);
        dialog.innerHTML = `
            <div class="site-search-box">
                <div class="site-search-field">
                    ${ICON}
                    <input type="search" role="combobox" aria-expanded="false" aria-autocomplete="list" aria-controls="site-search-list" autocomplete="off" spellcheck="false" enterkeyhint="search" placeholder="${T.placeholder}" aria-label="${T.placeholder}" />
                    <button type="button" class="site-search-close" aria-label="${T.close}">Esc</button>
                </div>
                <p class="site-search-status" role="status" aria-live="polite"></p>
                <ul class="site-search-list" id="site-search-list" role="listbox" aria-label="${T.open}"></ul>
                <p class="site-search-keys" aria-hidden="true">${T.keys}</p>
            </div>`;
        document.body.appendChild(dialog);
        input = dialog.querySelector("input");
        list = dialog.querySelector(".site-search-list");
        status = dialog.querySelector(".site-search-status");

        dialog.querySelector(".site-search-close").addEventListener("click", closeSearch);
        // 點對話框外的灰色背景 → 關閉
        dialog.addEventListener("click", (e) => {
            if (e.target === dialog) closeSearch();
        });
        let timer;
        input.addEventListener("input", () => {
            clearTimeout(timer);
            timer = setTimeout(render, 80);
        });
        input.addEventListener("keydown", onInputKey);
        list.addEventListener("click", onResultClick);
    }

    function setActive(i) {
        const items = list.querySelectorAll("a");
        if (!items.length) return;
        activeIndex = (i + items.length) % items.length;
        items.forEach((a, n) => a.setAttribute("aria-selected", String(n === activeIndex)));
        const a = items[activeIndex];
        input.setAttribute("aria-activedescendant", a.id);
        a.scrollIntoView({ block: "nearest" });
    }

    function onInputKey(e) {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive(activeIndex + 1);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive(activeIndex - 1);
        } else if (e.key === "Enter") {
            const a = list.querySelectorAll("a")[Math.max(activeIndex, 0)];
            if (a) {
                e.preventDefault();
                a.click();
            }
        }
    }

    // 同一頁的結果：直接捲到該標題（text fragment 在同頁不會生效）
    function onResultClick(e) {
        const a = e.target.closest("a");
        if (!a) return;
        if (a.dataset.file === currentFile && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
            const headings = document.querySelectorAll(HEADINGS);
            const target = headings[Number(a.dataset.h)];
            if (target) {
                e.preventDefault();
                closeSearch();
                target.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
                target.classList.add("search-flash");
                setTimeout(() => target.classList.remove("search-flash"), 1600);
                return;
            }
        }
        closeSearch();
    }

    function render() {
        const query = input.value.trim();
        activeIndex = -1;
        input.removeAttribute("aria-activedescendant");
        if (!query) {
            list.innerHTML = "";
            status.textContent = T.hint;
            input.setAttribute("aria-expanded", "false");
            return;
        }
        status.textContent = T.loading;
        buildIndex()
            .then((index) => {
                if (input.value.trim() !== query) return; // 已輸入新字
                const { terms, results } = search(index, query);
                status.textContent = results.length ? T.count(results.length) : T.empty(query);
                list.innerHTML = results
                    .map(
                        (r, i) => `<li role="presentation"><a role="option" id="site-search-opt-${i}" aria-selected="false" href="${escapeHtml(r.href)}" data-file="${escapeHtml(r.file)}" data-h="${r.hIndex}">
                            <span class="site-search-page">${escapeHtml(r.page)}</span>
                            <span class="site-search-title">${highlight(r.heading, terms)}</span>
                            ${r.text ? `<span class="site-search-snippet">${highlight(snippet(r.text, terms), terms)}</span>` : ""}
                        </a></li>`
                    )
                    .join("");
                input.setAttribute("aria-expanded", String(results.length > 0));
                if (results.length) setActive(0);
            })
            .catch(() => {
                status.textContent = T.error;
                list.innerHTML = "";
            });
    }

    function openSearch() {
        if (!dialog) createDialog();
        if (dialog.open) return;
        dialog.showModal();
        document.documentElement.classList.add("search-open");
        input.select();
        render();
        buildIndex().catch(() => {}); // 先在背景載入
    }

    function closeSearch() {
        if (dialog && dialog.open) dialog.close();
    }

    // ---- 導覽列按鈕：由 components.js 在頁首就緒後呼叫 ----
    window.setupSiteSearch = () => {
        const bar = document.querySelector(".nav-container");
        if (!bar || bar.querySelector(".search-trigger")) return;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "search-trigger";
        btn.setAttribute("aria-label", T.open);
        btn.setAttribute("aria-haspopup", "dialog");
        btn.innerHTML = `${ICON}<span class="search-trigger-text">${T.open}</span><kbd>/</kbd>`;
        btn.addEventListener("click", openSearch);
        bar.appendChild(btn);
    };

    document.addEventListener("keydown", (e) => {
        const t = e.target;
        const typing = t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
        if ((e.key === "k" || e.key === "K") && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            openSearch();
        } else if (e.key === "/" && !typing && !e.ctrlKey && !e.metaKey && !e.altKey) {
            e.preventDefault();
            openSearch();
        }
    });
    document.addEventListener("close", (e) => {
        if (e.target === dialog) document.documentElement.classList.remove("search-open");
    }, true);
})();
