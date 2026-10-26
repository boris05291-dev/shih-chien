# 專案說明：實踐大學高雄校區介紹網站

張栢睿的「網頁程式設計」總作業。純 HTML + CSS + JavaScript，沒有框架、沒有建置工具、沒有 npm。

- 線上網址：https://boris05291-dev.github.io/shih-chien/home.html （GitHub Pages）
- 編輯器：Phoenix Code（用它的即時預覽開發伺服器）

## 回覆與程式碼慣例

- 一律用繁體中文回覆；程式碼註解也用繁體中文。
- 我是學生，改動時簡短說明「改了什麼、為什麼」，方便我學習。
- 只改我要求的部分，不要順手重構或重新排版其他檔案。
- 改之前先說明打算改哪些檔案；刪除檔案前一定要先問我。

## 頁面結構

| 頁面 | 專屬 CSS | 內容 |
| --- | --- | --- |
| `home.html` | `總作業.css` | 首頁：本校沿革、簡史、校名由來、校歌及校徽 |
| `Founder.html` | `Founder.css` | 創辦人 |
| `president.html` | `president.css` | 董事長 |
| `headmaster.html` | `headmaster.css` | 校長 |
| `Vice.html` | `Vice.css`、`Vice.js` | 副校長 |

每一頁都會載入：

- `all.css`：全站共用樣式與顏色變數（放在 `:root`）。共用的東西改這裡，單頁的改各自的 CSS。
- `components.js`：用 `fetch` 把 `components/header.html`、`components/footer.html` 塞進 `<header>`、`<footer>`，並處理手機版漢堡選單與側邊選單。
- `home.js`：回到頂部按鈕等互動。
- Font Awesome 6.4.0（CDN）提供圖示。

注意：因為頁首頁尾是用 `fetch` 載入，直接雙擊打開 HTML（`file://`）會看不到頁首頁尾，要用 Phoenix Code 的即時預覽或其他本機伺服器開。

## 設計

- 沿用這個網站現有的風格，不要換成別的設計系統。
- 顏色一律用 `all.css` 的 CSS 變數，例如 `var(--primary-color)`、`var(--text-main)`，不要寫死色碼。
- 手機版斷點是 900px（`components.js` 也用同一個值）。
- 新增區塊時參考現有的卡片寫法（圓角 `--border-radius-main`、陰影 `--box-shadow-main`）。

## 不要動的地方

- `0917/`、`1001/`、`練習/`、`練習.html`、`練習.css`：上課練習，跟總作業無關，不要讀也不要改。
- `p/`（圖片、PDF）和 `m/`（影片）：素材資料夾，不需要讀取內容。只在需要引用檔名時列出檔案。
- `jsconfig.json`、`.phcode.json`：Phoenix Code 自動產生的設定。
- 上一層的「輕量化」資料夾是壓縮後的版本，不要在那裡改程式；一律改這裡的原始碼。

## 上傳

這個資料夾就是 GitHub 的 `shih-chien` 倉庫。要我 commit 或 push 之前，先把改動列給我看，我同意後再做。
