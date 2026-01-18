
//console.log("pickerLader LOADED");

const gPickerLoaderStatus = document.getElementById("pickerLoaderStatus");

// Map exam types to GitHub ZIP URLs
const examZips = {
    aviation: "https://cdn.jsdelivr.net/gh/alsys123/APL-ES/dataSets/APLES-Aviation.zip",
    aviationStudent: "https://cdn.jsdelivr.net/gh/alsys123/APL-ES/dataSets/APLES-Aviation-student.zip",
    bridge: "https://cdn.jsdelivr.net/gh/alsys123/APL-ES/dataSets/APLES-Bridge.zip",
    bridgeStudentLearning:
    "https://cdn.jsdelivr.net/gh/alsys123/APL-ES/dataSets/APLES-Bridge-withLearning.zip",
    cognitive: "https://cdn.jsdelivr.net/gh/alsys123/APL-ES/dataSets/APLES-Cognitive.zip",
    driver: "https://cdn.jsdelivr.net/gh/alsys123/APL-ES/dataSets/APLES-Driver.zip"
};


// _ getJsDelivrURL
function getJsDelivrURL(examName) {
    return `https://cdn.jsdelivr.net/gh/alsys123/APL-ES/dataSets/${examName}.zip`;
} //getJsDelivrURL

//__ loadExamFromGitHub
// dynamic loader where we need to infer the filename ... not used yet. Keep for reference
async function loadExamFromGitHub(examName) {
  const apiUrl = "https://api.github.com/repos/alsys123/APL-ES/contents/dataSets";

  try {
    // Fetch directory listing
    const response = await fetch(apiUrl);
    const files = await response.json();

    // Find the ZIP whose name starts with examName-
    const match = files.find(file =>
      file.name.startsWith(`${examName}-`) &&
      file.name.endsWith(".zip")
    );

    if (!match) {
      console.error(`No ZIP found for exam: ${examName}`);
      return;
    }

    // Use GitHub's direct download URL
    const zipUrl = match.download_url;
    console.log("Resolved ZIP URL:", zipUrl);

    loadZipFromUrl(zipUrl);

  } catch (err) {
    console.error("Error loading exam from GitHub:", err);
  }
} // loadExamFromGitHub

//_ handleExamSelect
function handleExamSelect() {
    const choice = document.getElementById("examPicker").value;
    if (!choice) return;

    console.log("choice is: ",choice);
    
    if (choice === "custom") {
        document.getElementById("customFile").style.display = "block";
	return;
    }

    if (choice === "googleSpreadsheet") {
	//        document.getElementById("customFile").style.display = "block";
	console.log("selected speadsheet");
	return;
    }
    

    // else
    document.getElementById("customFile").style.display = "none";
    loadExamZip(examZips[choice]);
    
} // handleExamSelect


// __ loadExamZip
async function loadExamZip(url) {

    if (url === undefined) return;
    
//    console.log("loadExamZip:", url);

    try {
        gPickerLoaderStatus.textContent = "Fetching " + url + "...";
        const resp = await fetch(url);
        const blob = await resp.blob();
        const zip = await JSZip.loadAsync(blob);

        await parseExamZip(zip);
      } catch (err) {
        gPickerLoaderStatus.textContent = "Error loading exam: " + err.message;
      }
    
} // loadExamZip

//__ loadGoogleSheet (from html)
async function loadGoogleSheet(sheetID) {
    console.log("here is my id: ", sheetID );
    //    initExam(examQuestionsCVSParsed, sectionPartTitlesCVSParsed, examDataCVSParsed);
    initExam([], [], []);
} // loadGoogleSheet


// __loadCustomZip (from html)
async function loadCustomZip(file) {
      try {
        gPickerLoaderStatus.textContent = "Loading custom ZIP...";
        const data = await file.arrayBuffer();
        const zip = await JSZip.loadAsync(data);

        await parseExamZip(zip);
      } catch (err) {
        gPickerLoaderStatus.textContent = "Error loading CUSTOM exam: " + err.message;
      }
    } // loadCustomZip

//__ parseCSVFull
function parseCSVFull(text) {
  const rows = [];
  let current = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (c === '"' && next === '"') {
        field += '"';      // escaped quote
        i++;               // skip next
      } else if (c === '"') {
        inQuotes = false;  // closing quote
      } else {
        field += c;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
      } else if (c === ",") {
        current.push(field);
        field = "";
      } else if (c === "\n") {
        current.push(field);
        rows.push(current);
        current = [];
        field = "";
      } else if (c === "\r") {
        // ignore CR (Windows line endings)
      } else {
        field += c;
      }
    }
  }

  // push last field/row if file doesn't end with newline
  if (field.length > 0 || current.length > 0) {
    current.push(field);
    rows.push(current);
  }

    return rows;
} //parseCSVFull
	    
//__ parseExamZip
async function parseExamZip(zip) {
		// Expecting examQuestions.csv, sectionPartTitles.csv, examData.csv
		const examQuestionsCSV = await zip.file("examQuestions.csv").async("string");
		const sectionPartTitlesCSV = await zip.file("sectionPartTitles.csv").async("string");
		const examDataCSV = await zip.file("examData.csv").async("string");

 //   console.log("Exam Data cvs",examDataCSV);
    
//		const parseCSV = txt => txt.trim().split("\n").map(line => line.split(","));
		
		const examQuestionsCVSParsed = parseCSVFull(examQuestionsCSV);
		
		const sectionPartTitlesCVSParsed = parseCSVFull(sectionPartTitlesCSV);
		const examDataCVSParsed = parseCSVFull(examDataCSV);
		
		gPickerLoaderStatus.textContent = "\n\n" + "Loaded exam:\n" +
		    "examQuestions rows: " + examQuestionsCVSParsed.length + "\n" +
		    "sectionPartTitles rows: " + sectionPartTitlesCVSParsed.length + "\n" +
		    "examData rows: " + examDataCVSParsed.length;

    console.log("\n\n" + "Loaded exam:\n" +
		    "examQuestions rows: " + examQuestionsCVSParsed.length + "\n" +
		    "sectionPartTitles rows: " + sectionPartTitlesCVSParsed.length + "\n" +
		"examData rows: " + examDataCVSParsed.length);
		
		// 👉 Here you hand off to your usual APL-ES code flow
		initExam(examQuestionsCVSParsed, sectionPartTitlesCVSParsed, examDataCVSParsed);
		
} //parseExamZip


// __ setupPickerLoaderUI
function setupPickerLoaderUI() {

    console.log("setup Picker");
    
	// Card click
	document.querySelectorAll(".examCard").forEach(card => {
	    card.addEventListener("click", () => {
		const exam = card.dataset.exam;
		// loadExamByName(exam);
		loadExamZip(examZips[exam]);
	    });
	});
	// Button click (prevents double-trigger)
	document.querySelectorAll(".examButton").forEach(btn => {
	    btn.addEventListener("click", e => {
		e.stopPropagation();
		const exam = btn.closest(".examCard").dataset.exam;
		// loadExamByName(exam);
		loadExamZip(examZips[exam]);
	    });
	});

	// Google Spreadsheet - prep
	const GoogleSCard = document.querySelector('.examCard[data-exam="googleSpreadsheet"]');
//	if (GoogleSCard) { true; }
//	    const fileInput = customCard.querySelector("#customFile");
	 //   const button = customCard.querySelector(".examButton");
	    
	    // Clicking the card opens the file picker
//	    customCard.addEventListener("click", () => {
//		fileInput.click();
//	    });
	    
	    // Clicking the button also opens the file picker
//	    button.addEventListener("click", e => {
//		e.stopPropagation();
//		fileInput.click();
//	    });
//	}
	
	// Custom exam card
	const customCard = document.querySelector('.examCard[data-exam="custom"]');
	if (customCard) {
	    const fileInput = customCard.querySelector("#customFile");
	    const button = customCard.querySelector(".examButton");
	    
	    // Clicking the card opens the file picker
	    customCard.addEventListener("click", () => {
		fileInput.click();
	    });
	    
	    // Clicking the button also opens the file picker
	    button.addEventListener("click", e => {
		e.stopPropagation();
		fileInput.click();
	    });
	}
	// Help/About
	const helpBtn = document.getElementById("helpButton");
	if (helpBtn) {
	    helpBtn.addEventListener("click", () => {
		showScreen("helpScreen");
	    });
	}
    } //setupPickerLoaderUI


// __ extractSpreadsheet
async function extractSpreadsheet(spreadSheetId, buildType) {
//    const spreadsheetId = document.getElementById('spreadsheetId').value.trim();
    const status = document.getElementById("status");
/*
    const preview = document.getElementById("csvPreview");
    preview.textContent = "";
    if (!spreadsheetId) {
        status.textContent = "Please enter a Spreadsheet ID.";
        return;
    }
  */  
    const ranges = [
        { name: "examQuestions", range: "examQuestions!A:J" },
        { name: "sectionPartTitles", range: "sectionPartTitles!A:E" },
        { name: "examData", range: "examData!A:C" }
    ];
    
 //   try {
//        const zip = new JSZip();
        let examDataCsv = null;
    
        for (const [index, sheet] of ranges.entries()) {
            status.textContent += `Fetching ${sheet.range}...\n`;

	    const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheet.name)}&range=${encodeURIComponent(sheet.range)}`;
   
            const resp = await fetch(csvUrl);
	    let csv = await resp.text();

	    /*
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
	    
*/	    
//	    zip.file(`${sheet.name}.csv`, csv);
	    
	    
//            if (sheet.name === "examData") {
//                examDataCsv = csv;
//            }

	    /*
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

	*/
/*
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
*/
	    
	}
}// extractSpreadsheet
