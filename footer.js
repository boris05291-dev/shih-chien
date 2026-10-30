/* jshint esversion: 6, browser: true, devel: true */
// ===== 只載入共用頁尾 =====
// 註：目前沒有 HTML 載入此檔（courses.html 已改用 components.js）
document.addEventListener("DOMContentLoaded", () => {
    const footerElem = document.querySelector("footer");
    if (!footerElem) return;
    fetch("./components/footer.html")
        .then(response => {
            if (!response.ok) throw new Error("Footer 載入失敗"); // fetch 遇到 404 不會丟錯 → 自己檢查 ok
            return response.text();
        })
        .then(html => {
            footerElem.innerHTML = html; // 成功才換掉備用文字
            // 圖示是裝飾 → 補 aria-hidden
            footerElem.querySelectorAll("i").forEach(icon => icon.setAttribute("aria-hidden", "true"));
        })
        .catch(error => console.error(error));
});
