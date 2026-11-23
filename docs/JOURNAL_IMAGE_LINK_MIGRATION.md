# Journal image link migration

Date: 2026-10-08

Legacy Laravel journal (blog) posts embedded images with absolute URLs
(`https://chefdclub.com//public/Admin/BI/<file>`). Those links break once the old site is gone,
so they were rewritten to relative `/uploads/...` links that work on any host.

## What changed in the database

- Table `blog_post` (the Journal posts; DB names keep "blog") (Prisma model `BlogPost`), column `description` only.
- 4 rows: ids **7, 8, 9, 10**. 18 links, 16 distinct files. No other column or table was touched.
- Only the image URL (the `src` value) changed; the rest of the HTML is identical.

Example (post id 8). Before, the `src` was an absolute URL on the old site:

```html
<img alt="" src="https://chefdclub.com//public/Admin/BI/b4a.jpeg" style="height:600px; width:600px" />
```

After, the `src` is a relative path; the other attributes are unchanged:

```html
<img alt="" src="/uploads/cms/editor/blog/b4a.jpeg" style="height:600px; width:600px" />
```

| `src` before | `src` after |
|---|---|
| `https://chefdclub.com//public/Admin/BI/<file>` (also the single-slash form) | `/uploads/cms/editor/blog/<file>` |

How we know nothing else changed: each replaced link is 14 characters shorter (13 for the
single-slash form), and the total length change of every post equals exactly that
(post 7: 3x14 + 2x13 = 68, 9201 to 9133; post 8: 42; posts 9 and 10: 70 each).

Note: the rewrite matched the link text itself, not the `<img>` tag. The sample link above is an
`<img src>`, but each of the 18 matches was not checked one by one to be inside an `<img>` tag.

| Post id | Links | Files |
|---|---|---|
| 7 | 5 | `cf.jpeg` (x2), `gb.jpeg`, `fi.jpeg`, `br.jpeg` |
| 8 | 3 | `b4a.jpeg` (x2), `b4.jpeg` |
| 9 | 5 | `b5.png`, `b5.jpeg`, `b51.jpeg`, `b52.jpeg`, `b53.jpeg` |
| 10 | 5 | `b61.jpeg`, `b62.png`, `b63.png`, `b64.png`, `b65.jpeg` |

### Full list of the 18 links

| # | Post id | Old `src` | New `src` |
|---|---|---|---|
| 1 | 7 | `https://chefdclub.com//public/Admin/BI/cf.jpeg` | `/uploads/cms/editor/blog/cf.jpeg` |
| 2 | 7 | `https://chefdclub.com//public/Admin/BI/cf.jpeg` (same file, second use) | `/uploads/cms/editor/blog/cf.jpeg` |
| 3 | 7 | `https://chefdclub.com/public/Admin/BI/gb.jpeg` | `/uploads/cms/editor/blog/gb.jpeg` |
| 4 | 7 | `https://chefdclub.com//public/Admin/BI/fi.jpeg` | `/uploads/cms/editor/blog/fi.jpeg` |
| 5 | 7 | `https://chefdclub.com/public/Admin/BI/br.jpeg` | `/uploads/cms/editor/blog/br.jpeg` |
| 6 | 8 | `https://chefdclub.com//public/Admin/BI/b4a.jpeg` | `/uploads/cms/editor/blog/b4a.jpeg` |
| 7 | 8 | `https://chefdclub.com//public/Admin/BI/b4a.jpeg` (same file, second use) | `/uploads/cms/editor/blog/b4a.jpeg` |
| 8 | 8 | `https://chefdclub.com//public/Admin/BI/b4.jpeg` | `/uploads/cms/editor/blog/b4.jpeg` |
| 9 | 9 | `https://chefdclub.com//public/Admin/BI/b5.png` | `/uploads/cms/editor/blog/b5.png` |
| 10 | 9 | `https://chefdclub.com//public/Admin/BI/b5.jpeg` | `/uploads/cms/editor/blog/b5.jpeg` |
| 11 | 9 | `https://chefdclub.com//public/Admin/BI/b51.jpeg` | `/uploads/cms/editor/blog/b51.jpeg` |
| 12 | 9 | `https://chefdclub.com//public/Admin/BI/b52.jpeg` | `/uploads/cms/editor/blog/b52.jpeg` |
| 13 | 9 | `https://chefdclub.com//public/Admin/BI/b53.jpeg` | `/uploads/cms/editor/blog/b53.jpeg` |
| 14 | 10 | `https://chefdclub.com//public/Admin/BI/b62.png` | `/uploads/cms/editor/blog/b62.png` |
| 15 | 10 | `https://chefdclub.com//public/Admin/BI/b61.jpeg` | `/uploads/cms/editor/blog/b61.jpeg` |
| 16 | 10 | `https://chefdclub.com//public/Admin/BI/b63.png` | `/uploads/cms/editor/blog/b63.png` |
| 17 | 10 | `https://chefdclub.com//public/Admin/BI/b64.png` | `/uploads/cms/editor/blog/b64.png` |
| 18 | 10 | `https://chefdclub.com//public/Admin/BI/b65.jpeg` | `/uploads/cms/editor/blog/b65.jpeg` |

Left unchanged on purpose: post id 5 contains a plain text link to `www.chefdclub.com`
(reservation page). It is not an image.

## Files copied

The 16 images were copied (not moved) from the Laravel project `public/Admin/BI/` into
`uploads/cms/editor/blog/`. Nothing was changed or deleted in the Laravel project.

## Code changes

- Backend `POST /api/admin/uploads/editor-image/journal?postId=<id>` saves new Journal editor
  images to `uploads/cms/blog/posts/<id>/inline/`. Legacy HTML still references
  `uploads/cms/editor/blog/`. The older `POST /editor-image` still saves to `uploads/cms/editor/`
  (FAQ and pages editors).
- Journal cover images save to `uploads/cms/blog/posts/<id>/hero/` (staging on create, then
  moved after insert). Legacy covers may remain in `uploads/cms/blog/` until copied manually
  into the per-post `hero/` folder.
- Frontend `RichTextEditor` takes an optional `uploadFolder` prop; the Journal form passes `"journal"`.
- Frontend editor upload adapter now saves the relative `/uploads/...` URL as returned by the
  backend, instead of turning it into an absolute URL.
- Frontend `next.config.ts` rewrites `/uploads/:path*` to the backend (`NEXT_PUBLIC_API_URL`
  without `/api`). This is why relative links render on whatever host the site runs on.
  The rewrite is fixed at build time, so restart `next dev` or rebuild after changing it.

## Rename: Blog to Journal (2026-10-09)

The feature is now called Journal (the public website already used that name). Not renamed on
purpose: DB tables/columns (`blog_post`, `blog_category`, ...), Prisma models and the upload folders
on disk (`uploads/cms/blog`, `uploads/cms/editor/blog`), because existing files and saved links use them.

| Was | Now |
|---|---|
| `GET /api/blog/posts[/:slug]` (public) | `GET /api/journal/posts[/:slug]` |
| `/api/admin/blog/categories`, `/api/admin/blog/posts` | `/api/admin/journal/categories`, `/api/admin/journal/posts` |
| `POST /api/admin/uploads/editor-image/blog` | `POST /api/admin/uploads/editor-image/journal` |
| backend folder `src/modules/blog/` (`blog-*.ts`) | `src/modules/journal/` (`journal-*.ts`) |
| admin pages `/admin/cms/blog/...`, menu label "Blog" | `/admin/cms/journal/...`, menu label "Journal" |

Old API URLs return 404 now, so update any saved Postman or external calls.

## Rollback

The original `description` of the 4 posts is saved in
[`migration-backups/blog-description-before-link-rewrite.json`](./migration-backups/blog-description-before-link-rewrite.json)
as `[{ "id": <number>, "description": "<original html>" }]`. To undo, write each `description`
back to its `blog_post` row by `id`.

## Per-post storage paths (2026-11-23)

Journal images now live under `uploads/cms/blog/posts/<id>/hero/` (cover) and
`.../inline/` (body). Legacy HTML pointed at `uploads/cms/editor/blog/`.

**Database:** `blog` table, column `description` only — posts **7, 8, 9, 10** (18 inline
`src` values). Cover column `image` was not changed (filename only).

| `src` before | `src` after |
|---|---|
| `/uploads/cms/editor/blog/<file>` | `/uploads/cms/blog/posts/<post id>/inline/<file>` |

Rollback: restore from
[`migration-backups/blog-description-before-per-post-paths.json`](./migration-backups/blog-description-before-per-post-paths.json)
(the earlier link-rewrite backup still applies to the pre-2026-10-08 absolute URLs).

**Production (manual uploads + SQL):** see [`JOURNAL_PROD_DEPLOY.md`](./JOURNAL_PROD_DEPLOY.md).

## Not covered

- Images referenced inside the HTML of other content (FAQ answers, CMS pages): the database dump
  of 2026-09-24 had no other legacy `chefdclub.com/.../public/` image links.
- Legacy videos from the Laravel `public/Videos` folder were not copied.
