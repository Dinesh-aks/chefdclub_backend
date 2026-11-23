# Laravel feature inventory (Chef'd Club)

Reference: `E:\chefdclub\laravel_code\routes\web.php`. Use this to track parity with Next.js + Node.

## Public site (Phase2 routes — active)

| Feature | Laravel route | DB / notes |
|---------|---------------|------------|
| Home | `/` | CMS, sliders, products/menus |
| About | `/about-us-page` | CMS |
| Photos / videos | `/photos-page`, `/videos-page` | gallery tables |
| Contact | `POST /SaveContactUs` | `contact_us` |
| Reservation | `POST /SaveReservation` | `reservation` |
| Menus | `/veg`, `/non-veg`, `/wine-paring` | `products`, `solutions` |
| Blog | `/blogs-page`, `/blog-details/{slug}` | `blog`, `blog_category` |
| User auth | `/login`, `/sign-up`, user dashboard | `users` |

## Admin (`/Admin/*`, middleware `IsAdminLogin`)

| Module | Laravel | DB (typical) | Node module (planned) |
|--------|---------|--------------|------------------------|
| Dashboard | `DashboardController` | — | `admin` |
| Reservations | `ReservationRequest`, status, comments | `reservation` | `reservations` |
| Reviews | `ReservationReview` | `reservation_rating` | `reviews` |
| Contact inbox | `ContactRequest` | `contact_us` | `contact` |
| Newsletter | `NewsLetterRequest` | `newsletter` | TBD |
| Settings / profile | `SettingController` | `admin` | `auth` / `settings` |
| FAQ | `FaqController` | `faq` | `faq` |
| Blog | `BlogController` | `blog`, `blog_category` | `blog` |
| CMS / pages | `CMSController` | `cms`, stats, clients, … | `cms` |
| Slider | `SliderController` | `slider` | `content` |
| Products / menus (legacy admin) | `ProductController` | `products` | confirm with client |
| Solutions | `SolutionController` | `solutions` | menus / wine |
| Industry, ingredients, career, customer | various | various | confirm with client |

## Node API status (website-first slices)

| API | Status |
|-----|--------|
| `GET /api/health` | Done |
| `POST /api/contact` | Done (writes `contact_us`) |
| `POST /api/reservations` | Done (writes `reservation`) |
| Admin JWT auth (`/api/admin/auth/*`) + dashboard shell | Done (lists CRUD next) |

Update this file as each slice ships.
