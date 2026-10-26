# Personal academic website

A plain HTML/CSS site with no build step. It works on GitHub Pages, Netlify, Cloudflare Pages or any web host.

## Files

| File | What to edit |
|---|---|
| `assets/site.js` | Your **name, title and menu**. Change them once here and every page updates. |
| `index.html` | Home: photo, short intro, links, research interests, news |
| `bio.html` | Biography, education, positions, awards |
| `research.html` | Project cards |
| `publications.html` | Paper list (copy one `<li>` block per paper) |
| `teaching.html` | Courses and supervision |
| `gallery.html` | Photos |
| `contact.html` | Email, office, map |
| `notes.html` + `notes/` | Lab Notes: weekly ideas and simulations (see below) |
| `assets/style.css` | Colours and fonts (the variables at the top) |
| `assets/img/` | Your photos (`profile.jpg`, gallery images) |
| `assets/img/cv.pdf` | Your CV, linked from Home and Bio |

To preview the site, open `index.html` in a browser.

**After changing `assets/style.css` or `assets/site.js`:** bump the version tag on every page so visitors' browsers
fetch the new file instead of an old saved copy (e.g. change `?v=20261026` to today's date):

```bash
sed -i '' 's/?v=20261026/?v=20261101/g' *.html notes/*.html
```

## Adding a weekly Lab Note

1. Copy `notes/_template.html` to a new file, e.g. `notes/2026-10-29-my-topic.html`, and write the note.
2. Add an entry at the **top** of the `NOTES` list in `assets/site.js` (date, title, summary, tags).
   It then appears on the Lab Notes page and in "Latest Lab Notes" on the Home page.
3. For an interactive demo, copy the `<div class="sim">` block and the `<script>` from
   `notes/2026-10-15-synchrony.html` and change the model.
4. Publish:
   ```bash
   git add -A && git commit -m "New lab note" && git push
   ```

## Publish free on GitHub Pages

1. Create a free account at https://github.com.
2. Create a **new public repository** named exactly `YOUR-USERNAME.github.io`.
3. Upload the files in this folder:
   - **Easiest:** on the repository page, click *Add file → Upload files* and drag in everything in this folder, including the `assets` folder.
   - **With git (Terminal):**
     ```bash
     cd ~/Desktop/EEG101/PersonelWebSite
     git init -b main
     git add .
     git commit -m "First version of website"
     git remote add origin https://github.com/YOUR-USERNAME/YOUR-USERNAME.github.io.git
     git push -u origin main
     ```
4. In the repository, open **Settings → Pages**. Under "Build and deployment", choose *Deploy from a branch*, then select `main` and `/ (root)`, and click Save.
5. After about a minute, the site is live at `https://YOUR-USERNAME.github.io`.

To update the site, edit the files and upload or push them again. The site updates within about a minute.

## Optional: your own domain (about $10–15 a year)

1. Buy a domain such as `fatihonay.com` from Cloudflare, Porkbun or Namecheap.
2. In GitHub, open **Settings → Pages → Custom domain**, enter the domain, and tick *Enforce HTTPS*.
3. At the domain registrar, add the DNS records that GitHub shows. These are four `A` records for the root domain and a `CNAME` for `www` pointing to `YOUR-USERNAME.github.io`.
