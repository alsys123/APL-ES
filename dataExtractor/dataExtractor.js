
//__ exportSpreadsheet
async function exportSpreadsheet(buildType) {
    const spreadsheetId = document.getElementById('spreadsheetId').value.trim();
    const status = document.getElementById("status");
    const preview = document.getElementById("csvPreview");
    preview.textContent = "";
    if (!spreadsheetId) {
        status.textContent = "Please enter a Spreadsheet ID.";
        return;
    }
    
    const ranges = [
        { name: "examQuestions", range: "examQuestions!A:J" },
        { name: "sectionPartTitles", range: "sectionPartTitles!A:E" },
        { name: "examData", range: "examData!A:C" }
    ];
    
    try {
        const zip = new JSZip();
        let examDataCsv = null;
    
        for (const [index, sheet] of ranges.entries()) {
            status.textContent += `Fetching ${sheet.range}...\n`;

	    const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheet.name)}&range=${encodeURIComponent(sheet.range)}`;
   
            const resp = await fetch(csvUrl);
	    let csv = await resp.text();
	    
	    // do we build a full version or a student version?
	    if (buildType === 'student') {
		// Blank specific columns depending on sheet
		if (sheet.name === "examQuestions") {
		    csv = blankColumnsInCsv(csv, [8, 9]);   // Columns I, J
		}
		if (sheet.name === "sectionPartTitles") {
		    csv = blankColumnsInCsv(csv, [4]);      // Column E
		}
	    }

	    if (buildType === 'withLearning') {
		// Blank specific columns depending on sheet
		if (sheet.name === "examQuestions") {
		    csv = blankColumnsInCsv(csv, [8, 9]);   // Columns I, J
		}
	    }
	    
	    
	    zip.file(`${sheet.name}.csv`, csv);
	    
	    
            if (sheet.name === "examData") {
                examDataCsv = csv;
            }
	    
	    // examData
            if (index === 2) {
                const lines = csv.split(/\r?\n/);
                const firstSample = lines.slice(0, 8).join("\n");
                preview.textContent += `Preview of ${sheet.name}:\n\n${firstSample}\n\n`;
            }
	
            // Questions
            if (index === 0) {
                const lines = csv.split(/\r?\n/);
                const firstSample = lines.slice(0, 5).join("\n");
                preview.textContent += `Preview of ${sheet.name}:\n\n${firstSample}\n\n`;
            }
	
            // Questions
            if (index === 1) {
                const lines = csv.split(/\r?\n/);
                const firstSample = lines.slice(0, 5).join("\n");
                preview.textContent += `Preview of ${sheet.name}:\n\n${firstSample}\n\n`;
            }
        } // <-- closes for-loop

        const exportName = examDataCsv
            ? extractExportNameFromExamData(examDataCsv)
            : null;
        
        const timestamp = formatTimestamp();
        const baseName = exportName || "Spreadsheet";
        const safeName = baseName.replace(/[^a-z0-9_\-]+/gi, "_");
        
        status.textContent += "Packaging ZIP...\n";
        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, `${safeName}-${buildType}-${timestamp}.zip`);
        
        status.textContent += "Download complete.";
    } catch (err) {
        status.textContent = "Error: " + err.message;
    }
} // <-- closes exportSpreadsheet


//__ blankColumnsInCsv (quote‑aware)
function blankColumnsInCsv(csv, columnsToBlank) {
    const lines = csv.split(/\r?\n/);

    const output = lines.map(line => {
        if (line.trim() === "") return line;

        const cols = parseCsvLine(line);

        columnsToBlank.forEach(idx => {
            if (cols[idx] !== undefined) cols[idx] = "";
        });

        return cols.map(escapeCsvField).join(",");
    });

    return output.join("\n");
}  // blankColumnsInCsv

function parseCsvLine(line) {
    const result = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const next = line[i + 1];

        if (char === '"' && inQuotes && next === '"') {
            // Escaped quote ("")
            current += '"';
            i++;
        } else if (char === '"') {
            // Toggle quote mode
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            // End of field
            result.push(current);
            current = "";
        } else {
            current += char;
        }
    }

    result.push(current);
    return result;
} //parseCsvLine

function escapeCsvField(field) {
    if (field === "") return ""; // blanked column stays blank

    // If field contains comma or quote, wrap in quotes
    if (field.includes(",") || field.includes('"')) {
        return '"' + field.replace(/"/g, '""') + '"';
    }
    return field;
} //escapeCsvField

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
    const lines = csv.split(/\r?\n/);

    for (const line of lines) {
        const parts = splitCsvLine(line); // ["4","ExtractorName","PilotData"]

        if (parts[1] && parts[1].trim() === "ExtractorName") {
            return parts[2] || null;
        }
    }

    return null;
} //extractExportNameFromExamData


//_ parseTwoColumnCsv
function parseTwoColumnCsv(csv) {
    const rows = [];
    const lines = csv.trim().split(/\r?\n/);
    
    for (let i = 0; i < lines.length; i++) {
	const line = lines[i];
	//   console.log(`\n[Line ${i}] Raw:`, line);
	
	const parts = splitCsvLine(line);
	
	//   console.log(`[Line ${i}] Parsed parts:`, parts);
	
	// Ensure exactly two columns (pad or trim as needed)
	if (parts.length !== 2) {
	    console.warn(`[Line ${i}] Expected 2 columns, got ${parts.length}`);
	}
	
	rows.push(parts);
    }
    
    return rows;
} //parseTwoColumnCsv

//__ splitCsvLine
function splitCsvLine(line) {
    const result = [];
    let current = "";
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
	const char = line[i];
	const next = line[i + 1];
	
	if (char === '"') {
	    if (inQuotes && next === '"') {
		// Escaped quote ("")
		current += '"';
		i++; // skip next quote
	    } else {
		// Toggle quoted state
		inQuotes = !inQuotes;
	    }
	} else if (char === ',' && !inQuotes) {
	    // End of field
	    result.push(current.trim());
	    current = "";
	} else {
	    current += char;
	}
    }
    
    // Push last field
    result.push(current.trim());
    
    // Remove wrapping quotes if present
    return result.map(v => {
	if (v.startsWith('"') && v.endsWith('"')) {
	    return v.slice(1, -1);
    }
	return v;
    });
} // splitCsvLine
