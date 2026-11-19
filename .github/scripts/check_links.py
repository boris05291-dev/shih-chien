"""檢查站內連結：每個 HTML 的 href / src 指到的檔案都要存在，sitemap 的網址也要對得到檔案。

外部網址（http/https）、mailto:、tel:、#錨點、data: 不檢查。
/shih-chien/... 開頭的絕對路徑（GitHub Pages 的專案路徑）對應到 repo 根目錄。
用法：python3 .github/scripts/check_links.py
"""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import re
import sys

ROOT = Path(__file__).resolve().parents[2]
SITE_PREFIX = "/shih-chien/"
SKIP = ("http://", "https://", "//", "mailto:", "tel:", "data:", "javascript:", "#")


class Collector(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []

    def handle_starttag(self, tag, attrs):
        for name, value in attrs:
            if name in ("href", "src") and value:
                self.links.append((self.getpos()[0], value.strip()))


def resolve(link: str, base: Path) -> Path | None:
    if link.startswith(SKIP):
        return None
    path = unquote(urlsplit(link).path)
    if not path:
        return None
    if path.startswith(SITE_PREFIX):
        return ROOT / path[len(SITE_PREFIX):]
    if path.startswith("/"):
        return ROOT / path.lstrip("/")
    return base / path


def main() -> int:
    errors = []
    for html in sorted(ROOT.rglob("*.html")):
        if ".git" in html.parts:
            continue
        parser = Collector()
        parser.feed(html.read_text(encoding="utf-8"))
        # components/*.html 是被 components.js 插進 site/ 底下的頁面，相對路徑以 site/ 為準
        base = html.parent.parent if html.parent.name == "components" else html.parent
        for line, link in parser.links:
            target = resolve(link, base)
            if target is not None and not target.exists():
                errors.append(f"{html.relative_to(ROOT)}:{line}  找不到 {link}")

    sitemap = ROOT / "sitemap.xml"
    if sitemap.exists():
        for url in re.findall(r"<loc>(.*?)</loc>", sitemap.read_text(encoding="utf-8")):
            path = unquote(urlsplit(url).path)
            target = ROOT / path[len(SITE_PREFIX):] if path.startswith(SITE_PREFIX) else None
            if target is None or not target.is_file():
                errors.append(f"sitemap.xml  找不到 {url}")

    for e in errors:
        print(e)
    print(f"{'❌' if errors else '✅'} 壞掉的站內連結：{len(errors)} 個")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
