# Changes before deployment

Manual steps to run on the production server/database when deploying. Nothing here deletes data.

## 1. About Us page heading (database)

The About Us page (`/chef`) shows the `description` of the `cms` row for About Us. The existing text stays as it is; only a heading is added at the top: "Simple yet sophisticated — a phrase he learned at home."

Check first that the row is About Us (the id may differ in production):

```sql
SELECT id, title FROM cms WHERE id = 1;
```

Then run. It puts the heading in front of the current text and does nothing if the description already starts with an `<h2>`, so running it twice is safe:

```sql
UPDATE cms
SET description = CONCAT(
  '<h2>Simple yet sophisticated &mdash; <em>a phrase he learned at home.</em></h2>\n\n',
  description
)
WHERE id = 1 AND description NOT LIKE '<h2>%';
```

Only `description` changes. `title`, `short`, `banner`, SEO fields and `add_date` stay as they are.

## 2. Admin profile images (files)

The admin Settings > Profile tab builds the image URL as `/uploads/admin/<filename>`, where the filename is `admin.image`. Legacy Laravel kept these files in `public/Admin/assets/images/`.

Copy the legacy profile images into the backend's `uploads/admin/` folder on the server:

- `1625118197-1.png`
- `1.png`, `1.jpg`, `1.jpeg`, `2.png`, `6.png`, `avatar-17.png`

Check which file the live `admin.image` column actually points to:

```sql
SELECT id, email, image FROM admin;
```

New uploads from the Profile tab are saved into the same folder automatically (the backend creates it on start).

## 3. Homepage photo cards (new table + images)

The dish photo cards on the homepage are managed in admin (CMS > Homepage Photo Cards) and read from a new table `home_spotlight`. There are two spots: `hero` (beside the headline) and `story` (the two photos in the dining section). It is a new table, not a Laravel one. Nothing existing is changed.

Create the table (safe to run twice):

```sql
CREATE TABLE IF NOT EXISTS home_spotlight (
  id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  tag VARCHAR(255) NULL,
  badge VARCHAR(50) NULL,
  placement VARCHAR(20) NOT NULL DEFAULT 'hero',
  image VARCHAR(255) NULL,
  alt VARCHAR(255) NULL,
  status TINYINT(1) NOT NULL DEFAULT 1,
  sort INT NOT NULL DEFAULT 0,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

If the table already exists without the `placement` column (an earlier deploy of this step), add it. Existing rows become `hero`:

```sql
ALTER TABLE home_spotlight ADD COLUMN placement VARCHAR(20) NOT NULL DEFAULT 'hero' AFTER badge;
```

Likewise, if the table was created before the image alt text option, add that column (empty alt means the website uses the card title):

```sql
ALTER TABLE home_spotlight ADD COLUMN alt VARCHAR(255) NULL AFTER image;
```

Run each `ALTER` only if the column is missing (`SHOW COLUMNS FROM home_spotlight;`).

Add the cards that used to be hard-coded on the homepage (run once, only if the table is empty):

```sql
INSERT INTO home_spotlight (title, tag, badge, placement, image, status, sort) VALUES
  ('Crabmeat omelette, passionfruit balsamic emulsion', 'New this season', 'Spotlight', 'hero', 'crabmeat-omelette.png', 1, 1),
  ('Steamed, butter-poached lobster, wine sauce', 'Signature', NULL, 'hero', 'butter-poached-lobster.png', 1, 2),
  ('Spicy grilled snapper', 'Blow-torched · Seared · Oven-grilled', NULL, 'story', 'spicy_grilled_snapper.png', 1, 1),
  ('Crab islands, kombu-yuzu', 'Signature', NULL, 'story', 'crab_islands_kombu-yuzu.png', 1, 2);
```

If the table already has the two `hero` rows, insert only the two `story` rows.

Copy the four photos into the backend's `uploads/cms/spotlight/` folder on the server (the backend creates the folder on start). All files are in the frontend repo at `public/images/home/`:

- `crabmeat-omelette.png`
- `butter-poached-lobster.png`
- `spicy_grilled_snapper.png`
- `crab_islands_kombu-yuzu.png`

If this step is skipped, the homepage hero and the dining story section simply show no photo cards until cards are added in admin.

## 4. Notes

- Passwords are still plain text, matching the legacy login. The Change password tab writes plain text to stay compatible with it.
- The `site_settings` table is no longer used by the admin UI (the Site contact tab was removed). Leave it in place.
