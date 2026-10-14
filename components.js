/* jshint esversion: 6, browser: true, devel: true */
//以下為ai輔助完成
document.addEventListener("DOMContentLoaded", () => {
    
    // 載入 Header
    const headerElem = document.querySelector("header");
    if (headerElem) {
        fetch("./components/header.html")
            .then(response => {
                if (!response.ok) throw new Error("Header 載入失敗");
                return response.text();
            })
            .then(html => {
                headerElem.innerHTML = html;
            })
            .catch(error => console.error(error));
    }

    // 載入 Footer
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