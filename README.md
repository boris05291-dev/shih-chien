
# 網頁程式設計：實踐大學個人作品集專案技術筆記

## 📌 專案簡介與開發背景

這個專案是我在實踐大學資訊管理課程裡的期末網頁作業。當時的想法蠻簡單的，就是想幫學校做一個資訊清楚、視覺風格統一的校務平台，把首頁、創辦人、董事長、校長還有副校長等單元通通串在一起。

過往寫 HTML 和 CSS 時，常常畫面排得出來就好，但這次我想挑戰看看更紮實的寫法。我嘗試導入模組化架構，搭配語意化標籤與響應式設計（RWD），希望在保留學校網站該有的正式感之餘，也能讓整體的瀏覽體驗變得更順暢。

---

## 🛠️ 一、 專案架構與核心設計思路

### 1. 共用樣式與多頁面模組化
我不希望每個頁面都重新寫一套樣式，所以採用了「共用 CSS (`all.css`) + 多頁面 HTML」的架構。我把導覽列 (Header)、頁尾 (Footer)、全站字體以及側邊選單 (Sidebar) 抽離出來統一管理，確保使用者切換頁面時視覺不會有落差。

### 2. 雙欄位區塊對齊 (Flexbox Layout)
整個網站的主容器 (`.page-all` 與 `.all1`) 是用 Flexbox 彈性盒模型來蓋的。左邊固定放 250px 寬度的側邊導覽選單（設定了 `position: sticky; top: 40px;` 讓它跟著滾動），右邊則是放主要的內容區（設定 `flex: 1; max-width: 900px;`）。這樣跨頁面維護時，排版基準線才不會跑掉。

### 3. 響應式與內容適應 (RWD)
為了讓手機瀏覽時不會卡住，我大量使用了媒體查詢 (`@media`) 以及 CSS 的 `column-count` 多欄位排版，讓原本很佔空間的表格、卡片與清單在小螢幕上可以自動折疊或轉成單欄。
## 🐞 二、 核心除錯與問題解決紀錄 (Bug Fixes)

在開發過程中遇到了不少坑，以下是我整理出的幾個關鍵採坑與修復過程：

### 1. 圖片比例失真修正 (Image Aspect Ratio)
- **狀況**：之前在 `.pdd img` 上誤設了強制的正方形比例 (`aspect-ratio: 1/1`)，結果像「實踐大學」書法字體或校徽這種橫向圖片，全部都被壓到嚴重變形。
- **修改前**：
  ```css
  .pdd img { aspect-ratio: 1/1; }

```

* **修改後**：
```css
.pdd img { width: 100%; height: auto; object-fit: contain; }

```



### 2. 子頁面版面跑版與邊距修復

* **狀況**：像校長介紹這類子頁面，一開始忘了引入排版樣式，導致 `<main class="all1">` 抓不到寬度設定，整排字直接擠在一起，頂部還留了大片奇怪的空白。
* **修改前**：子頁面缺乏共用 `.all1` 樣式支援。
* **修改後**：
```css
.all1 { flex: 1; max-width: 900px; margin: 0; padding: 0; }

```



### 3. 程式碼選擇器筆誤與語法修復

* **狀況**：寫快的時候很容易出現這種低級錯誤，例如 CSS 選擇器少打一個點（寫成 `pdd .ii-1`），或是 HTML 標籤裡的類別名稱多了奇怪的符號（像 `<section class="=li-5">`）。
* **修改前**：
```html
<section class="=li-5">

```


* **修改後**：
```html
<section class="li-5">

```



### 4. 共用 JavaScript 的安全防呆 (Guard Clauses)

* **狀況**：我在共用的 JS 檔裡寫了首頁專用的滾動監聽（ScrollSpy）。當其他子頁面載入這支 JS 時，因為頁面上根本沒有對應的 HTML ID，程式抓不到 DOM 元素就直接在控制台報 Null 錯誤，順便連帶把後面的程式碼全部凍結。
* **修改前**：直接綁定 DOM 元素導致非首頁環境報錯。
* **修改後**：
```javascript
const h1Section = document.getElementById("h1");
if (h1Section) { 
    /* 確定畫面上抓得到這個元素才執行滾動監聽 */ 
}

```



---

## 🎨 三、 UI/UX 與視覺美化升級

1. **語意化標籤 (Semantic HTML)**：
原本幾乎滿地都是無意義的 `<div>`，後來我動手把它們改掉，重要區塊換成 `<section>` 與 `<main>`，內文標題也依層級梳理成 `<h3>` 或 `<h4>`。這樣寫不只對搜尋引擎（SEO）比較友善，螢幕閱讀器（a11y）也才讀得懂結構。
2. **微互動與點擊回饋 (Micro-interactions)**：
按鈕如果點下去沒反應會讓人很不安。我在按鈕與社群 Icon 上補了 `:hover` 浮起效果 (`transform: translateY(-5px)`) 以及 `:active` 的微幅下壓反饋 (`transform: scale(0.95)`)，按起來的手感順暢很多。
3. **色彩對比與無障礙優化**：
一開始用的預設卡其色 (`darkkhaki`) 在白底上對比太低，看久了眼睛很酸。後來我把它換成比較符合學校形象、且對比度通過無障礙標準的品牌綠色 (`#6b9e58`)。
4. **預防版面配置轉移 (CLS Prevention)**：
有些圖片如果沒有預設寬高，載入的瞬間會把下方的文字往下拉，造成畫面閃爍位移（這就是所謂的 CLS 累積版面配置轉移）。我在 HTML 標籤裡先把圖片的寬高尺寸給定，並在 CSS 加上 `max-width` 與 `height: auto`，這樣瀏覽器在圖片下載完前就會先留好空間。

---

## 🧩 四、 HTML 模組化實作 (Fetch API)

在開發初期，最痛苦的就是改個 Header 或 Footer 的連結，就要開 5 個不同的 `.html` 檔逐一複製貼上。為了徹底解決這個維護噩夢，我導入了前端動態載入的機制：

1. **元件拆分**：把頁首和頁尾抽出來，各自獨立成 `components/header.html` 與 `components/footer.html`。
2. **主頁面標籤簡化**：在主要的 HTML 檔案裡，只需要留空的容器即可：
```html
<header></header>
<main class="all1">...</main>
<footer class="f-1"></footer>

```


3. **JS 動態注入 (`components.js`)**：
```javascript
document.addEventListener("DOMContentLoaded", () => {
    const headerElem = document.querySelector("header");
    if (headerElem) {
        fetch("./components/header.html")
            .then(res => res.text())
            .then(html => { headerElem.innerHTML = html; });
    }
});

```



---

## 💡 五、 工程反思

剛開始寫網頁時，常常為了圖方便，把所有樣式一腦袋塞進同一支 CSS 檔案，結果到後面光是尋找哪一段程式碼覆蓋了樣式就花掉半天。這次經歷讓我很深刻地體會到「關注點分離」的重要性—把全站佈局（`all.css`）與各頁面元件（Component CSS）切開，維護起來才不會像在解亂麻。

另外就是檔案命名的好習慣。以前很喜歡用流水號（像 `style_1.css`, `style_2.css`）來版控，最後連自己都分不清哪一個才是最新版。下次如果要做更大規模的專案，一定要直接導入 Git 來做分支與版本管理。

---

## 🚀 六、 未來學習計畫

* **CSS 預處理器與框架**：這次寫純 CSS 發現重複性屬性還是偏多，下一步打算研究 Sass/SCSS 的變數與巢狀結構，或是直接嘗試 Tailwind CSS 來加快排版節奏。
* **前端單頁應用框架 (SPA)**：這次用 Fetch API 做組件化只是個起步，之後希望能進一步摸索 React 或 Vue.js，學習如何做組件狀態管理，並實現免刷頁的 SPA 切換體驗。

