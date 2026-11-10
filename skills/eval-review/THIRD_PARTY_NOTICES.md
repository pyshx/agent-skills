# Third-party notices

The skill's own code (`SKILL.md`, `references/`, `scripts/`, `assets/template.html`,
`assets/app.js`, `assets/app.css`, `examples/`) is distributed under the
repository MIT license. The files in `assets/vendor/` are unmodified copies of the
packages below, taken from their npm tarballs on 2026-10-08. They are inlined into
every generated page, so the build script embeds this whole file in each
generated HTML file as a comment at the top. Keep it free of HTML comment delimiters;
the build fails if it contains them.

| File | Package | Version | Path in the npm tarball | License |
|------|---------|---------|-------------------------|---------|
| `assets/vendor/papaparse.min.js` | [papaparse](https://www.npmjs.com/package/papaparse/v/5.4.1) ([source](https://github.com/mholt/PapaParse)) | 5.4.1 | `package/papaparse.min.js` | MIT |
| `assets/vendor/tabulator.min.js` | [tabulator-tables](https://www.npmjs.com/package/tabulator-tables/v/6.3.1) ([source](https://github.com/olifolkerd/tabulator)) | 6.3.1 | `package/dist/js/tabulator.min.js` | MIT |
| `assets/vendor/tabulator.min.css` | [tabulator-tables](https://www.npmjs.com/package/tabulator-tables/v/6.3.1) ([source](https://github.com/olifolkerd/tabulator)) | 6.3.1 | `package/dist/css/tabulator.min.css` | MIT |

SHA-256 of the vendored files:

```text
b8e870c5d2b29772f10c9fa9a693c8b896aac8540ed6701e3cc6304c683febdb  papaparse.min.js
e952272c3b2afa4ebb60cef5db8cbe9cbaabaa52b50c3cd3d22993ca5215a6ff  tabulator.min.js
a46d8051944c745cae8a7976b4fb9d93d894d20876a4521cc4f6f035cfef52ea  tabulator.min.css
```

To update a library, download the new npm tarball, copy the same paths, update the
table and the hashes, and rebuild the examples to check that nothing broke.

## Papa Parse - MIT

The MIT License (MIT)

Copyright (c) 2015 Matthew Holt

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Tabulator - MIT

The MIT License (MIT)

Copyright (c) 2015-2025 Oli Folkerd

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
