# Quartz Development Archive: Custom CSV Viewer & Dynamic Book Gallery Layouts

This diagnostic archive compiles the entire architectural conversation, debugging loops, and source configuration modifications required to establish reactive tables and book gallery views inside the React-less Quartz framework structure.

---

## 🛠️ Phase 1: Embedding Native CSV Data Tables Within Note Layouts

Because Quartz compiles `.tsx` layouts strictly as server-side template files, React state models (`useState`) do not run inside live client sessions. A decoupled, two-part architecture was engineered to fetch raw data and securely append rendered table rows onto specific Markdown documents.

### 📄 1. The Interaction Pipeline Script
Create this file to automatically parse your data streams using raw browser DOM APIs on client-side navigation.

**File Location:** `quartz/components/scripts/CsvViewer.inline.ts`

```ts
document.addEventListener("nav", () => {
  // Select target placeholder elements mapped in raw markdown documents
  const container = document.getElementById("inline-csv-viewer")
  if (!container) return

  // Base serving directory mapping. (Ensure data.csv is stored inside quartz/static/)
  const targetUrl = "/data.csv" 

  fetch(targetUrl)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP Error Status: ${res.status}`)
      return res.text()
    })
    .then((rawText) => {
      const cleanRows = rawText
        .split(/\r?\n/)
        .map(row => row.split(","))
        .filter(row => row.length > 0 && row[0] !== "")
      
      if (cleanRows.length === 0) {
        container.textContent = "The requested CSV file is empty."
        return
      }

      const table = document.createElement("table")
      table.className = "csv-table"

      // Generate Table Element Headers
      const thead = document.createElement("thead")
      const headerRow = document.createElement("tr")
      cleanRows[0].forEach((headerText) => {
        const th = document.createElement("th")
        th.textContent = headerText.trim()
        headerRow.appendChild(th)
      })
      thead.appendChild(headerRow)
      table.appendChild(thead)

      // Append Table Data Records
      const tbody = document.createElement("tbody")
      for (let i = 1; i < cleanRows.length; i++) {
        const dataRow = document.createElement("tr")
        cleanRows[i].forEach((cellText) => {
          const td = document.createElement("td")
          td.textContent = cellText.trim()
          dataRow.appendChild(td)
        })
        tbody.appendChild(dataRow)
      }
      table.appendChild(tbody)

      container.innerHTML = ""
      container.appendChild(table)
    })
    .catch((error) => {
      container.innerHTML = `<span style="color:red;font-weight:bold;">Failed to load dataset: ${error.message}</span>`
    })
})
```

### 📄 2. The Functional Template Layout Wrapper
Create the TSX component layer to deliver global styles and tie the client-side pipeline directly into Quartz's production builder pipeline.

**File Location:** `quartz/components/CsvViewer.tsx`

```tsx
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
// @ts-ignore: Quartz bundler pipeline asset attachment hook
import csvScript from "./scripts/CsvViewer.inline"

export default (() => {
  function CsvViewer() {
    return null // Layout elements are handled dynamically by the decoupled script engine
  }

  CsvViewer.css = `
    .csv-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;
      margin: 1.5rem 0;
    }
    .csv-table th, .csv-table td {
      padding: 10px 14px;
      border: 1px solid var(--lightgray);
    }
    .csv-table th {
      background-color: var(--light);
      font-weight: 600;
    }
  `

  CsvViewer.afterDOMLoaded = csvScript
  return CsvViewer
}) satisfies QuartzComponentConstructor
```

### 📋 3. Target Markdown Note Setup
To embed the table on a page, simply insert the corresponding element hook target anywhere inside your Markdown file:

```markdown
---
title: My Raw Project Data
---

Here is the parsed data rendered directly from our asset folder:

<div id="inline-csv-viewer"></div>

Text content continues seamlessly down here...
```

---

## 🎨 Phase 2: Building the Dynamic Book Gallery Card Grid Layout

To replicate the Obsidian "Bases" card dashboard layout without active plugins, a specialized component checks the structural tree properties array (`allFiles`) to find and visually transform files contained within your vault's `content/Books/` folder.

### 📄 1. The Multi-Property Card Engine Component
This contains the fallback logic to check frontmatter properties for both `cover` and `coverSmallUrl` fields automatically.

**File Location:** `quartz/components/BookGrid.tsx`

```tsx
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { resolveRelative } from "../util/path"

export default (() => {
  function BookGrid({ allFiles, fileData }: QuartzComponentProps) {
    // Collect all documents nested within the localized folder boundaries
    const bookPages = allFiles.filter((page) => 
      page.slug?.startsWith("Books/") && page.slug !== "Books/index"
    )

    return (
      <div className="book-grid-container">
        <div className="book-grid-header">
          <h2>📚 Library Collection ({bookPages.length} Records)</h2>
        </div>
        
        <div className="book-grid">
          {bookPages.map((page) => {
            const title = page.frontmatter?.title || page.slug?.replace("Books/", "")
            const author = page.frontmatter?.author || "Unknown Author"
            const status = page.frontmatter?.status || "Unread"
            
            // Prioritization Fallback Chain Tree
            const coverUrl = page.frontmatter?.cover || page.frontmatter?.coverSmallUrl || "/static/icon.png"

            return (
              <a href={resolveRelative(fileData.slug!, page.slug!)} className="book-card" key={page.slug}>
                <div className="book-cover-wrapper">
                  <img src={coverUrl} alt={title} loading="lazy" />
                </div>
                <div className="book-info">
                  <div className="book-title">{title}</div>
                  <div className="book-author">{author}</div>
                  <span className={`book-status status-${status.toLowerCase().replace(/\s+/g, '-')}`}>
                    {status}
                  </span>
                </div>
              </a>
            )
          })}
        </div>
      </div>
    )
  }

  BookGrid.css = `
    .book-grid-container { margin: 2rem 0; }
    .book-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 1.5rem;
      padding: 1rem 0;
    }
    .book-card {
      background: var(--light);
      border: 1px solid var(--lightgray);
      border-radius: 8px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      text-decoration: none !important;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .book-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      border-color: var(--gray);
    }
    .book-cover-wrapper {
      width: 100%;
      height: 220px;
      overflow: hidden;
      background: var(--darkgray);
    }
    .book-cover-wrapper img { width: 100%; height: 100%; object-fit: cover; }
    .book-info { padding: 0.75rem; flex-grow: 1; display: flex; flex-direction: column; }
    .book-title { font-weight: 600; font-size: 0.95rem; color: var(--dark); margin-bottom: 0.25rem; }
    .book-author { font-size: 0.8rem; color: var(--gray); margin-bottom: 0.5rem; }
    .book-status { font-size: 0.75rem; padding: 2px 6px; border-radius: 4px; align-self: flex-start; }
    .status-reading { background: #e0f2fe; color: #0369a1; }
    .status-completed { background: #dcfce7; color: #15803d; }
  `

  return BookGrid
}) satisfies QuartzComponentConstructor
```

---

## 🗺️ Global Framework Assembly & Registration Settings

To register and use these custom additions, you must update Quartz's root compilation index and global page layout files.

### 🖊️ Step A: Component Registry Integration
Open **`quartz/components/index.ts`** and register your modules via strict named exports at the bottom of the file:

```ts
export { default as CsvViewer } from "./CsvViewer"
export { default as BookGrid } from "./BookGrid"
```

### 🖊️ Step B: Layout Assignment Configuration
Open **`quartz.layout.ts`**. Use explicit bracketed named imports to load your additions, keeping them distinct from Quartz's default `Component` namespace macros:

```ts
import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"
import { CsvViewer, BookGrid } from "./quartz/components" // Clean explicit import handling

export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.Breadcrumbs(),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    CsvViewer(), // Handles inline element injection silently in the background
    BookGrid(),  // Processes dynamic folder generation maps natively
    Component.TagList(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Search(),
    Component.Darkmode(),
    Component.DesktopOnly(Component.Explorer()),
  ],
  right: [
    Component.Graph(),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
  ],
}
```

---

## ⚡ Cache Rebuilding Procedures
Whenever modifying `.inline.ts` layout hooks or creating physical system files, clear your local production server memory cache:

```bash
# Force a clean development pipeline restart
npx quartz build --serve
```
