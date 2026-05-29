#!/usr/bin/env bash
#
# Daily HTTP health check for notafintech.co.
# Pure HTTP-level — no Google API / OAuth calls, safe to run anytime.
#
# Usage:
#   ./scripts/health-check.sh              # check production
#   BASE=https://<hash>.notafintech.pages.dev ./scripts/health-check.sh   # check a preview
#
# Exit code: 0 if all checks pass, 1 if any fail (CI-friendly).

set -uo pipefail

BASE="${BASE:-https://www.notafintech.co}"
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
TIMEOUT=15
FAILS=0

green() { printf "  \033[32m✓\033[0m %s\n" "$1"; }
red()   { printf "  \033[31m✗\033[0m %s\n" "$1"; FAILS=$((FAILS+1)); }
head2() { printf "\n\033[1m%s\033[0m\n" "$1"; }

# status_check <url> <expected_code> <label>
status_check() {
  local url="$1" expected="$2" label="$3"
  local code
  code=$(curl -sI -A "$UA" -o /dev/null -w "%{http_code}" --max-time "$TIMEOUT" "$url" 2>/dev/null)
  if [ "$code" = "$expected" ]; then
    green "$label ($code)"
  else
    red "$label — got $code, expected $expected"
  fi
}

# redirect_check <url> <expected_location> <label>
redirect_check() {
  local url="$1" expected="$2" label="$3"
  local code location
  code=$(curl -sI -A "$UA" -o /dev/null -w "%{http_code}" --max-time "$TIMEOUT" "$url" 2>/dev/null)
  location=$(curl -sI -A "$UA" --max-time "$TIMEOUT" "$url" 2>/dev/null | awk 'tolower($1)=="location:"{print $2}' | tr -d '\r')
  if [ "$code" = "301" ] && [ "$location" = "$expected" ]; then
    green "$label (301 → $location)"
  else
    red "$label — got $code → ${location:-<none>}, expected 301 → $expected"
  fi
}

echo "Health check: $BASE  ($(date -u +%Y-%m-%dT%H:%M:%SZ))"

head2 "Core pages (expect 200)"
status_check "$BASE/"                                          200 "homepage"
status_check "$BASE/guides/"                                   200 "guides index"
status_check "$BASE/guides/how-to-launch-a-card-product/"      200 "card-product guide"
status_check "$BASE/models/credit-card/"                       200 "credit-card model"
status_check "$BASE/tools/term-loan/"                          200 "term-loan tool"
status_check "$BASE/about/"                                    200 "about"
status_check "$BASE/resources/"                                200 "resources"

head2 "SEO endpoints (expect 200)"
status_check "$BASE/sitemap-index.xml"                         200 "sitemap-index"
status_check "$BASE/sitemap-0.xml"                             200 "sitemap-0"
status_check "$BASE/robots.txt"                                200 "robots.txt"
status_check "$BASE/llms.txt"                                  200 "llms.txt"
status_check "$BASE/favicon.svg"                               200 "favicon.svg"
status_check "$BASE/og-image.png"                              200 "og-image"

head2 "Soft-404 guard (expect 404, NOT 200)"
status_check "$BASE/this-page-does-not-exist-xyz/"             404 "bogus path returns 404"

# Legacy-domain redirects only make sense against production, not previews.
if [ "$BASE" = "https://www.notafintech.co" ]; then
  head2 "Redirects (expect 301, path-preserving)"
  redirect_check "https://notafintech.co/"                                          "https://www.notafintech.co/" "apex .co → www"
  redirect_check "https://notafintech.company/guides/how-to-launch-a-card-product/" "https://www.notafintech.co/guides/how-to-launch-a-card-product/" "legacy .company deep"
  redirect_check "https://notafintechcompany.com/tools/term-loan/"                  "https://www.notafintech.co/tools/term-loan/" "legacy .com deep"

  head2 "Security headers (expect present on homepage)"
  HDRS=$(curl -sI -A "$UA" --max-time "$TIMEOUT" "$BASE/" 2>/dev/null)
  echo "$HDRS" | grep -qi "^strict-transport-security:" && green "HSTS present" || red "HSTS missing"
  echo "$HDRS" | grep -qi "^content-security-policy:"   && green "CSP present"  || red "CSP missing"
  echo "$HDRS" | grep -qi "^x-content-type-options:"    && green "X-Content-Type-Options present" || red "X-Content-Type-Options missing"
fi

head2 "Result"
if [ "$FAILS" -eq 0 ]; then
  printf "\033[32mAll checks passed.\033[0m\n"
  exit 0
else
  printf "\033[31m%d check(s) failed.\033[0m\n" "$FAILS"
  exit 1
fi
