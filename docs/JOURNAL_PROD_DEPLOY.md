# Journal per-post images — production deploy

Manual steps only (no migration scripts in this repo).

## 1. Deploy application code

Push and deploy **backend** and **frontend**.

## 2. Upload files to production

Copy from your prepared backend tree to the live server, same paths:

```text
uploads/cms/blog/posts/
```

Checklist file (from local): `docs/migration-backups/blog-upload-manifest.txt`

**Cover:** `uploads/cms/blog/posts/<id>/hero/<filename>` — `filename` matches `blog.image`.

**Body:** `uploads/cms/blog/posts/<id>/inline/<filename>`.

## 3. Update production `blog.description` (MySQL)

For each post, inline images in HTML must use the new prefix. Example for post `8`:

| Replace | With |
|---------|------|
| `/uploads/cms/editor/blog/` | `/uploads/cms/blog/posts/8/inline/` |

Use a different post `id` for each row. Only posts **7–10** had legacy inline URLs in the 2026 migration.

**Option B — SQL per post** (example post 8):

```sql
UPDATE blog
SET description = REPLACE(description, '/uploads/cms/editor/blog/', '/uploads/cms/blog/posts/8/inline/')
WHERE id = 8
  AND description LIKE '%/uploads/cms/editor/blog/%';
```

Back up `description` first. Pre-change HTML for local rollback is in  
`docs/migration-backups/blog-description-before-per-post-paths.json`.

The `image` column is unchanged.

If descriptions already use `/uploads/cms/journal/posts/`, fix once:

```sql
UPDATE blog
SET description = REPLACE(description, '/uploads/cms/journal/posts/', '/uploads/cms/blog/posts/')
WHERE description LIKE '%/uploads/cms/journal/posts/%';
```

## 4. Verify

- Public journal URLs for posts 7–10.
- Admin: new cover and body uploads under `/uploads/cms/blog/posts/<id>/hero/` and `.../inline/`.