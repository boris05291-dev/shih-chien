# 實踐大學高雄校區｜網頁程式設計總作業

介紹實踐大學高雄校區的中英雙語網站：校史、校歌、校徽，以及創辦人、董事長、校長、副校長與推薦課程。
純 HTML / CSS / JavaScript 手寫，沒有使用框架，部署在 GitHub Pages。

🔗 **網站：<https://boris05291-dev.github.io/shih-chien/>**

> 本站為課堂作品，**非**實踐大學官方網站。

## 頁面

| 頁面 | 中文 | English |
|---|---|---|
| 首頁（簡史、本校沿革、校名由來、校歌、校徽、校區地圖） | [home.html](site/home.html) | [home-en.html](site/home-en.html) |
| 創辦人 | [Founder.html](site/Founder.html) | [Founder-en.html](site/Founder-en.html) |
| 董事長 | [president.html](site/president.html) | [president-en.html](site/president-en.html) |
| 校長 | [headmaster.html](site/headmaster.html) | [headmaster-en.html](site/headmaster-en.html) |
| 副校長 | [Vice.html](site/Vice.html) | [Vice-en.html](site/Vice-en.html) |
| 推薦課程 | [courses.html](site/courses.html) | [courses-en.html](site/courses-en.html) |

## 功能

- **捲動校史開場**：往下捲時年份跟著跳動，依序帶出校史事件；開啟「減少動態效果」的使用者會看到一般時間軸
- **深色模式**：預設跟隨系統設定，可手動切換並記住選擇，載入時不會閃白
- **全站搜尋**：按 `/` 或 `Ctrl` / `⌘` + `K` 開啟，即時搜尋同語言的所有頁面
- **中英切換**：切換語言時停留在同一個段落
- **共用頁首頁尾**：`components.js` 用 `fetch` 載入 `components/` 裡的片段，改一次全站套用
- **閱讀進度條、回到頂部、側邊選單**會標示目前讀到的段落
- **照片燈箱**：點圖片放大，按 `Esc` 關閉
- **效能**：圖片延遲載入、改用 WebP、YouTube 點了才載入、Font Awesome 和 Google Fonts 只載入用到的字
- **無障礙**：跳至主內容連結、鍵盤可操作、外部連結 ↗ 標示
- **SEO**：description、Open Graph、canonical / hreflang、`sitemap.xml`、自訂 404（舊網址自動轉址）

## 資料夾結構

```
.
├── index.html          # GitHub Pages 入口，轉址到 site/home.html
├── 404.html            # 找不到頁面＋舊網址轉址
├── sitemap.xml
├── site/
│   ├── *.html          # 各頁（-en 結尾為英文版）
│   ├── components/     # 共用頁首、頁尾
│   ├── all.css         # 全站樣式（含深色模式）
│   ├── home.js         # 捲動效果、深色模式、燈箱等
│   ├── search.js       # 全站搜尋
│   ├── components.js   # 載入頁首頁尾、漢堡選單、語言切換
│   ├── p/              # 圖片與 PDF
│   └── fonts/          # Font Awesome 精簡版字型
└── .github/            # 自動檢查（見下方）
```

## 本機預覽

頁首頁尾用 `fetch` 載入，直接雙擊 HTML（`file://`）會失敗，請開本機伺服器：

```bash
python3 -m http.server 8000
# 打開 http://localhost:8000/site/home.html
```

## 自動檢查（GitHub Actions）

每次 push 或開 PR 會跑 [.github/workflows/check.yml](.github/workflows/check.yml)：

1. **站內連結**：`python3 .github/scripts/check_links.py`，確認每個 `href` / `src` 和 sitemap 網址都對得到檔案
2. **HTML 語法**：`npx html-validate@8.24.0 --config .github/htmlvalidate.json "**/*.html"`

本機也可以直接跑上面兩行指令。

## 作者

栢睿（A115510310）｜網頁程式設計 總作業 · © 2026 ladybug05
