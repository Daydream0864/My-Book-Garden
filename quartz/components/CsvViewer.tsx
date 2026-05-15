import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

export default (() => {
  function CsvViewer({ displayClass }: QuartzComponentProps) {
    return (
      <div className={`csv-container ${displayClass ?? ""}`}>
        <h3>CSV Data Viewer</h3>
        {/* The component layout is basic HTML. JavaScript will inject the table here */}
        <div id="csv-table-wrapper">Loading CSV data...</div>
      </div>
    )
  }

  // Add CSS styles locally to the component
  CsvViewer.css = `
  .csv-container {
    margin: 2rem 0;
    padding: 1rem;
    border: 1px solid var(--lightgray);
    border-radius: 5px;
  }
  .csv-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;
  }
  .csv-table th, .csv-table td {
    padding: 8px 12px;
    border: 1px solid var(--lightgray);
    text-align: left;
  }
  .csv-table th {
    background-color: var(--light);
    font-weight: bold;
  }
  `

  // Add the Client-Side Script for interactivity/fetching
  CsvViewer.afterDOMLoaded = `
  document.addEventListener("nav", () => {
    const wrapper = document.getElementById("csv-table-wrapper");
    if (!wrapper) return;

    // Replace this URL with the path to your actual CSV file
    const csvUrl = "/static/canca.csv"; 

    fetch(csvUrl)
      .then(response => {
        if (!response.ok) throw new Error("Network error fetching CSV");
        return response.text();
      })
      .then(text => {
        // Simple manual vanilla JS CSV parsing logic
        const rows = text.split("\\n").map(row => row.split(","));
        if (rows.length === 0 || rows[0].length === 0) {
          wrapper.innerText = "CSV file is empty.";
          return;
        }

        let html = '<table class="csv-table"><thead><tr>';
        
        // Render Headers
        rows[0].forEach(header => {
          html += \`<th>\${header.trim()}</th>\`;
        });
        html += '</tr></thead><tbody>';

        // Render Rows
        for (let i = 1; i < rows.length; i++) {
          if (rows[i].length === 1 && rows[i][0] === "") continue; // Skip empty rows
          html += '<tr>';
          rows[i].forEach(cell => {
            html += \`<td>\${cell.trim()}</td>\`;
          });
          html += '</tr>';
        }
        html += '</tbody></table>';

        wrapper.innerHTML = html;
      })
      .catch(err => {
        wrapper.innerText = "Error loading CSV: " + err.message;
      });
  });
  `


  return CsvViewer
}) satisfies QuartzComponentConstructor
