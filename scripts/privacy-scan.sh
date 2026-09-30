#!/usr/bin/env bash
# Scan the built site (dist/) for private strings before any deploy.
# Patterns live in .privacy-patterns (local only). Exit 1 on any hit.
set -u
cd "$(dirname "$0")/.."
[ -d dist ] || { echo "no dist/ — run npm run build first"; exit 2; }
[ -f .privacy-patterns ] || { echo ".privacy-patterns missing"; exit 2; }
hits=0
while IFS= read -r pat; do
  case "$pat" in ''|'#'*) continue;; esac
  # Text files only; skip binary assets and minified 3D libraries.
  out=$(grep -rInE --include='*.html' --include='*.js' --include='*.css' --include='*.xml' --include='*.txt' --include='*.json' \
        --exclude='scene-*.js' --exclude='vrm-*.js' -o "$pat" dist 2>/dev/null | head -5)
  if [ -n "$out" ]; then echo "HIT [$pat]"; echo "$out" | sed 's/^/   /'; hits=1; fi
done < .privacy-patterns
# The resume PDF is published as-is; check its text too.
pdf_text() {
  if command -v pdftotext >/dev/null; then pdftotext "$1" - 2>/dev/null; return; fi
  # macOS fallback: a tiny PDFKit reader, compiled once into the temp dir.
  bin="${TMPDIR:-/tmp}/portfolio-pdftext"
  if [ ! -x "$bin" ]; then
    printf 'import PDFKit\nprint(PDFDocument(url: URL(fileURLWithPath: CommandLine.arguments[1]))?.string ?? "")\n' > "$bin.swift"
    swiftc -O -o "$bin" "$bin.swift" >/dev/null 2>&1 || return
  fi
  "$bin" "$1"
}
if [ -f dist/Shikhar-Kansal-Resume.pdf ]; then
  txt=$(pdf_text dist/Shikhar-Kansal-Resume.pdf)
  [ -n "$txt" ] || { echo "could not read resume PDF text"; hits=1; }
  while IFS= read -r pat; do
    case "$pat" in ''|'#'*) continue;; esac
    m=$(printf '%s' "$txt" | grep -oE "$pat" | head -3)
    [ -n "$m" ] && { echo "HIT in resume PDF [$pat]: $m"; hits=1; }
  done < .privacy-patterns
fi
[ $hits = 0 ] && echo "privacy scan: clean" || echo "privacy scan: FAILED"
exit $hits
