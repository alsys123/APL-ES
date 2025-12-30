
//console.log("pickerLader LOADED");

const gPickerLoaderStatus = document.getElementById("pickerLoaderStatus");

// Map exam types to GitHub ZIP URLs
const examZips = {
    bridge: "https://cdn.jsdelivr.net/gh/alsys123/APL-ES/dataSets/APL-ES-exporter-Bridge.zip",
    aviation: "https://cdn.jsdelivr.net/gh/alsys123/APL-ES/dataSets/APL-ES-exporter-Pilot.zip",
    cognitive: "https://cdn.jsdelivr.net/gh/alsys123/APL-ES/dataSets/APL-ES-exporter-Cognitive.zip",
    driver: "https://cdn.jsdelivr.net/gh/alsys123/APL-ES/dataSets/APL-ES-exporter-Auto.zip"
};


// _ getJsDelivrURL
function getJsDelivrURL(examName) {
    return `https://cdn.jsdelivr.net/gh/alsys123/APL-ES/dataSets/${examName}.zip`;
} //getJsDelivrURL

//_ handleExamSelect
function handleExamSelect() {
    const choice = document.getElementById("examPicker").value;
    if (!choice) return;
    
    if (choice === "custom") {
        document.getElementById("customFile").style.display = "block";
    } else {
        document.getElementById("customFile").style.display = "none";
        loadExamZip(examZips[choice]);
    }
} // handleExamSelect


// __ loadExamZip
async function loadExamZip(url) {
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

// __loadCustomZip
async function loadCustomZip(file) {
      try {
        gPickerLoaderStatus.textContent = "Loading custom ZIP...";
        const data = await file.arrayBuffer();
        const zip = await JSZip.loadAsync(data);

        await parseExamZip(zip);
      } catch (err) {
        gPickerLoaderStatus.textContent = "Error loading custom exam: " + err.message;
      }
    } // loadCustomZip

//
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
} //parseCVS
	    
// __ parseExamZip
async function parseExamZip(zip) {
		// Expecting examQuestions.csv, sectionPartTitles.csv, examData.csv
		const examQuestionsCSV = await zip.file("examQuestions.csv").async("string");
		const sectionPartTitlesCSV = await zip.file("sectionPartTitles.csv").async("string");
		const examDataCSV = await zip.file("examData.csv").async("string");
		
		const parseCSV = txt => txt.trim().split("\n").map(line => line.split(","));
		
		const examQuestionsCVSParsed = parseCSVFull(examQuestionsCSV);
		
		const sectionPartTitlesCVSParsed = parseCSVFull(sectionPartTitlesCSV);
		const examDataCVSParsed = parseCSVFull(examDataCSV);
		
		gPickerLoaderStatus.textContent = "\n\n" + "Loaded exam:\n" +
		    "examQuestions rows: " + examQuestionsCVSParsed.length + "\n" +
		    "sectionPartTitles rows: " + sectionPartTitlesCVSParsed.length + "\n" +
		    "examData rows: " + examDataCVSParsed.length;
		
		// 👉 Here you hand off to your usual APL-ES code flow
		initExam(examQuestionsCVSParsed, sectionPartTitlesCVSParsed, examDataCVSParsed);
		
} //parseExamZip


// __ setupPickerLoaderUI
    function setupPickerLoaderUI() {
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

	    
