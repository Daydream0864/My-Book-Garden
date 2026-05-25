import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { FullSlug, SimpleSlug, resolveRelative } from "../util/path"

export default (() => {
  function BookGrid({ allFiles, fileData }: QuartzComponentProps) {
    // Filtert alle Notizen, die im Ordner /Books/ liegen
    const bookPages = allFiles.filter((page) => 
      page.slug?.startsWith("Books/") && page.slug !== "Books/index"
    )

    return (
      <div className="book-grid-container">
        <div className="book-grid-header">
          <h2>📚 Meine Bibliothek ({bookPages.length} Bücher)</h2>
        </div>
        
        <div className="book-grid">
          {bookPages.map((page) => {
            const title = page.frontmatter?.title || page.slug?.replace("Books/", "")
            //const coverUrl = page.frontmatter?.cover || "/static/icon.png" // Fallback-Bild
            const coverUrl = page.frontmatter?.cover || page.frontmatter?.coverSmallUrl || "/static/icon.png"
            const author = page.frontmatter?.author || "Unbekannter Autor"
            const status = page.frontmatter?.status || " "
//---------

            



//--------
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

  // CSS-Styling für das exakte Grid- und Card-Layout aus dem Screenshot
  BookGrid.css = `
    .book-grid-container {
      margin: 2rem 0;
    }
    .book-grid-header {
      margin-bottom: 1rem;
      border-bottom: 1px solid var(--lightgray);
      padding-bottom: 0.5rem;
    }
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
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .book-cover-wrapper img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .book-info {
      padding: 0.75rem;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
    }
    .book-title {
      font-weight: 600;
      font-size: 0.95rem;
      line-height: 1.2;
      color: var(--dark);
      margin-bottom: 0.25rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .book-author {
      font-size: 0.8rem;
      color: var(--gray);
      margin-bottom: 0.5rem;
    }
    .book-status {
      font-size: 0.75rem;
      padding: 2px 6px;
      border-radius: 4px;
      align-self: flex-start;
      font-weight: 500;
      background: var(--lightgray);
      color: var(--dark);
    }
    /* Status-Farben anpassen */
    .status-reading { background: #e0f2fe; color: #0369a1; }
    .status-completed { background: #dcfce7; color: #15803d; }
  `

  return BookGrid
}) satisfies QuartzComponentConstructor
