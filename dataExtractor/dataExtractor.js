
// exportSpreadsheet
async function exportSpreadsheet() {
      const spreadsheetId = document.getElementById('spreadsheetId').value.trim();
      const status = document.getElementById("status");
      const preview = document.getElementById("csvPreview");
      preview.textContent = "";
      if (!spreadsheetId) {
        status.textContent = "Please enter a Spreadsheet ID.";
        return;
      }

      // Hard-coded ranges
      const ranges = [
        { name: "examQuestions", range: "examQuestions!A:J" },
        { name: "sectionPartTitles", range: "sectionPartTitles!A:E" },
        { name: "examData", range: "examData!A:B" }
      ];

      try {
        const zip = new JSZip();

	  let examDataCsv = null;
	  
        for (const [index, sheet] of ranges.entries()) {
          status.textContent += `Fetching ${sheet.range}...\n`;
          const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheet.name)}&range=${encodeURIComponent(sheet.range)}`;
          const resp = await fetch(csvUrl);
          const csv = await resp.text();
          zip.file(`${sheet.name}.csv`, csv);

	    if (sheet.name === "examData") {
		examDataCsv = csv;
	    }

	    // Show preview of the first sheet
	    if (index === 0) {
		const lines = csv.split(/\r?\n/);        // handle LF or CRLF
		const firstSample = lines.slice(0, 5).join("\n");
		preview.textContent = `Preview of ${sheet.name}:\n\n` + firstSample;
	    }
	}
	  
	  const exportName = examDataCsv
		? extractExportNameFromExamData(examDataCsv)
		: null;
	  
	  const timestamp = formatTimestamp();
	  const baseName = exportName || "Spreadsheet";
	  const safeName = baseName.replace(/[^a-z0-9_\-]+/gi, "_");
	  
          status.textContent += "Packaging ZIP...\n";
          const content = await zip.generateAsync({ type: "blob" });
	  saveAs(content, `${safeName}-${timestamp}.zip`);
	  
//        saveAs(content, `APL-ES-exporter-${spreadsheetId}.zip`);
        status.textContent += "Download complete.";
      } catch (err) {
        status.textContent = "Error: " + err.message;
      }
    
    }




//__ formatTimestamp
function formatTimestamp() {
  const now = new Date();

  const year = now.getFullYear();
  const month = now.toLocaleString("en", { month: "short" }).toUpperCase(); // JAN, FEB, MAR...
  const day = String(now.getDate()).padStart(2, "0");

  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");

  return `${year}${month}${day}-${hh}${mm}`;
} // formatTimestamp

//__ extractExportNameFromExamData
function extractExportNameFromExamData(csv) {
  const rows = parseTwoColumnCsv(csv);

    console.log("key values",rows);
    
  for (const [key, value] of rows) {

	  console.log(key, "-->", value);

      if (key && key.trim().toLowerCase() === "extractorname") {

	  
      return value || null;
      }
      
  }

  return null;
} //extractExportNameFromExamData


//_ parseTwoColumnCsv
function parseTwoColumnCsv(csv) {
  return csv
    .trim()
    .split(/\r?\n/)
    .map(line => {
      // Split on commas that are NOT inside quotes
      const parts = line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/);
      return parts.map(p => p.replace(/^"|"$/g, "").trim());
    });
} //parseTwoColumnCsv

