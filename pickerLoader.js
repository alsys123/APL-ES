

    const status = document.getElementById("status");

    // Map exam types to GitHub ZIP URLs
    const examZips = {
      bridge: "https://raw.githubusercontent.com/alsys123/APL-ES/main/dataSets/APL-ES-exporter-Bridge.zip",
      pilot: "https://raw.githubusercontent.com/alsys123/APL-ES/main/dataSets/APL-ES-exporter-Pilot.zip",
      cognitive: "https://raw.githubusercontent.com/alsys123/APL-ES/main/dataSets/APL-ES-exporter-Cognitive.zip",
      auto: "https://raw.githubusercontent.com/alsys123/APL-ES/main/dataSets/APL-ES-exporter-Auto.zip"
    };

    function handleExamSelect() {
      const choice = document.getElementById("examPicker").value;
      if (!choice) return;

      if (choice === "custom") {
        document.getElementById("customFile").style.display = "block";
      } else {
        document.getElementById("customFile").style.display = "none";
        loadExamZip(examZips[choice]);
      }
    }

async function loadExamZip(url) {

   
      try {
        status.textContent = "Fetching " + url + "...";
        const resp = await fetch(url);
        const blob = await resp.blob();
        const zip = await JSZip.loadAsync(blob);

        await parseExamZip(zip);
      } catch (err) {
        status.textContent = "Error loading exam: " + err.message;
      }
    }

    async function loadCustomZip(file) {
      try {
        status.textContent = "Loading custom ZIP...";
        const data = await file.arrayBuffer();
        const zip = await JSZip.loadAsync(data);

        await parseExamZip(zip);
      } catch (err) {
        status.textContent = "Error loading custom exam: " + err.message;
      }
    }

    async function parseExamZip(zip) {
      // Expecting examQuestions.csv, sectionPartTitles.csv, examData.csv
      const examQuestionsCSV = await zip.file("examQuestions.csv").async("string");
      const sectionPartTitlesCSV = await zip.file("sectionPartTitles.csv").async("string");
      const examDataCSV = await zip.file("examData.csv").async("string");

      const parseCSV = txt => txt.trim().split("\n").map(line => line.split(","));

      const examQuestionsCVSParsed = parseCSV(examQuestionsCSV);
      const sectionPartTitlesCVSParsed = parseCSV(sectionPartTitlesCSV);
      const examDataCVSParsed = parseCSV(examDataCSV);

      status.textContent = "Loaded exam:\n" +
        "examQuestions rows: " + examQuestions.length + "\n" +
        "sectionPartTitles rows: " + sectionPartTitles.length + "\n" +
        "examData rows: " + examData.length;

      // 👉 Here you hand off to your usual APL-ES code flow
	// runExam(examQuestions, sectionPartTitles, examData);
	initExam(examQuestionsCVSParsed, sectionPartTitlesCVSParsed, examDataCVSParsed);
	
    } //parseExamZip

