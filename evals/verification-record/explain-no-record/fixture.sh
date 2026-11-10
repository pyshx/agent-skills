#!/usr/bin/env bash
set -eu
cat > slugify.py <<'PY'
import re


def slugify(title: str) -> str:
    """Return a URL slug: lowercase words joined by hyphens."""
    words = re.findall(r"[A-Za-z0-9]+", title)
    return "-".join(words)
PY
cat > test_slugify.py <<'PY'
import unittest

from slugify import slugify


class SlugifyTest(unittest.TestCase):
    def test_joins_words(self):
        self.assertEqual(slugify("hello world"), "hello-world")

    def test_drops_punctuation(self):
        self.assertEqual(slugify("a, b!"), "a-b")


if __name__ == "__main__":
    unittest.main()
PY
mkdir -p web
cat > web/package.json <<'JSON'
{
  "name": "blog-web",
  "private": true,
  "scripts": {
    "e2e": "playwright test"
  }
}
JSON
cat > README.md <<'MD'
# blog

`slugify.py` builds post URLs. Unit tests: `python3 -m unittest`.

The web app in `web/` shows posts at `/posts/<slug>`. Its end-to-end tests run with
`cd web && npm run e2e` against the deployed staging site, and need `STAGING_URL`
set to that site's address. Only CI has it.
MD
