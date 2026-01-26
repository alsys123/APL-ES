

//__ progressReport v2
function progressReport() {

    document.getElementById("resultsTitle").textContent = "📊 Progress Report";

    //__ inner: getStatus
    function getStatus(answered, unanswered, total) {
  if (answered === 0) {
    return '<span class="blue-pin">📌 Not Started</span>';
  }

  if (unanswered > 0) {
    const percent = Math.round((answered / total) * 100);
    return `⏳ In Progress (${percent}%)`;
  }

  return "✔️ Completed";
    } // inner: getStatus

  let summaryHtml = `<div class="result-summary"><h3>Section Progress</h3>`;
  let detailsHtml = "";
  let totalAnswered = 0, totalQuestionsCounted = 0;

  for (let s = 1; s <= 6; s++) {
    let sectionAnswered = 0, sectionUnanswered = 0, sectionTotal = 0;

    const sectionTitle = sectionPartTitlesDesc[s]?.[1]?.[0]?.textSection || `Section ${s}`;
    const shortSectionTitle = sectionTitle.length > 25
      ? sectionTitle.substring(0, 25) + "…"
      : sectionTitle;

    let sectionDetails = `
      <div class="section-block">
        <button class="collapsible">Section ${s}: ${sectionTitle}</button>
        <div class="section-content">
    `;

    for (let p = 1; p <= 10; p++) {
      const currentQuestions = questions[s]?.[p] || [];
      if (currentQuestions.length === 0) continue;

      let answered = 0, unanswered = 0;

      currentQuestions.forEach(q => {
        if (answers[q.id] === undefined) {
          unanswered++;
        } else {
          answered++;
        }
      });

      const total = currentQuestions.length;
      const status = getStatus(answered, unanswered, total);
      const partTitle = sectionPartTitlesDesc[s]?.[p]?.[0]?.textPart || `Part ${p}`;

      let counts = [];
      if (answered > 0) counts.push(`${answered} answered`);
      if (unanswered > 0) counts.push(`${unanswered} not answered`);

      sectionDetails += `
        <div class="grade-text" style="display:flex; justify-content:space-between;">
          <span>Part ${p}: ${partTitle} — ${counts.join(", ")}</span>
          <span style="text-align:right;">${status}</span>
        </div>
      `;

      sectionAnswered += answered;
      sectionUnanswered += unanswered;
      sectionTotal += total;

      totalAnswered += answered;
      totalQuestionsCounted += total;
    }

    if (sectionTotal > 0) {
      const sectionStatus = getStatus(sectionAnswered, sectionUnanswered, sectionTotal);

	// Section Progress -- top summary -- each section
      summaryHtml += `
        <div style="clear:both; margin-bottom:20px; font-size:14px;">
          <span style="float:left">Section ${s}: ${shortSectionTitle}</span>
          <span style="float:right">${sectionAnswered}/${sectionTotal} answered — ${sectionStatus}</span>
        </div>
      `;

      let counts = [];
      if (sectionAnswered > 0) counts.push(`${sectionAnswered} answered`);
      if (sectionUnanswered > 0) counts.push(`${sectionUnanswered} not answered`);

      sectionDetails += `
        <div style="margin-top:5px; clear:both;">
          <span style="float:left; font-style:italic;">Total: ${counts.join(", ")}</span>
          <span style="float:right; font-style:italic;">${sectionStatus}</span>
        </div>
      </div></div>
      `;

      detailsHtml += sectionDetails;
    }
  }

  const totalUnanswered = totalQuestionsCounted - totalAnswered;
  const overallStatus = getStatus(totalAnswered, totalUnanswered, totalQuestionsCounted);

  summaryHtml += `
    <div style="clear:both; margin-top:60px; margin-bottom:10px; font-weight:bold; line-height:1;font-size:24px;" 
      class="score">${totalAnswered}/${totalQuestionsCounted} answered — ${overallStatus}</div>
    </div>
  `;

  document.getElementById('resultsContent').innerHTML = summaryHtml + detailsHtml;
  document.getElementById('resultsModal').classList.add('active');

  enableCollapsibles();
} // progressReport

//__ gradeExam - also turns into Progress Report for student examType
function gradeExam() {
    document.getElementById("resultsTitle").textContent = "📊 Grade Report";

    //__ inner: getStatus
    function getStatus(correct, incorrect, unanswered, total) {
        if (correct === 0 && incorrect === 0 && unanswered > 0) {
            //   return "📌 Not Started";
            return '<span class="blue-pin">📌 Not Started</span>';
        }
        if (correct === 0 && incorrect > 0 && unanswered === 0) {
            return "❌ Wrong";
        }
        if (correct > 0 && incorrect === 0 && unanswered === 0) {
            return "✅ Pass"; // 5 0 0 case
        }
        if (unanswered > 0) {
            return "⏳ In Progress";
        }
          // Mixed case: some correct + some wrong, no unanswered
        const percent = total > 0 ? Math.round((correct / total) * 100) : 0;
        return percent >= 80 ? "✅ Pass" : "❌ Fail";
    } // inner: getStatus
    
        let summaryHtml = `<div class="result-summary"><h3>Section Summaries</h3>`;
        let detailsHtml = "";
        let totalCorrect = 0, totalQuestionsCounted = 0;

        for (let s = 1; s <= 6; s++) {
          let sectionCorrect = 0, sectionIncorrect = 0, sectionUnanswered = 0, sectionTotal = 0;

          const sectionTitle = sectionPartTitlesDesc[s]?.[1]?.[0]?.textSection || `Section ${s}`;
          const shortSectionTitle = sectionTitle.length > 25
            ? sectionTitle.substring(0, 25) + "…"
            : sectionTitle;

          let sectionDetails = `
      <div class="section-block">
        <button class="collapsible">Section ${s}: ${sectionTitle}</button>
        <div class="section-content">
    `;

          for (let p = 1; p <= 10; p++) {
            const currentQuestions = questions[s]?.[p] || [];
            if (currentQuestions.length === 0) continue;

            let correct = 0, incorrect = 0, unanswered = 0;

            currentQuestions.forEach(q => {
              if (answers[q.id] === undefined) {
                unanswered++;
              } else if (answers[q.id] === q.correct) {
                correct++;
              } else {
                incorrect++;
              }
            });

            const total = currentQuestions.length;
            const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
            const status = getStatus(correct, incorrect, unanswered, total);

            const partTitle = sectionPartTitlesDesc[s]?.[p]?.[0]?.textPart || `Part ${p}`;

            // Build counts string, ignoring zeros
            let counts = [];
            if (correct > 0) counts.push(`${correct} correct`);
            if (incorrect > 0) counts.push(`${incorrect} wrong`);
            if (unanswered > 0) counts.push(`${unanswered} not answered`);

            sectionDetails += `<div class="grade-text" style="display:flex; justify-content:space-between;">
      <span>Part ${p}: ${partTitle} — ${percentage}% (${counts.join(", ")})
      </span><span style="text-align:right;">${status}</span></div>`;


            sectionCorrect += correct;
            sectionIncorrect += incorrect;
            sectionUnanswered += unanswered;
            sectionTotal += total;

            totalCorrect += correct;
            totalQuestionsCounted += total;
          }

          if (sectionTotal > 0) {
            const sectionPercent = Math.round((sectionCorrect / sectionTotal) * 100);
            const sectionStatus = getStatus(sectionCorrect, sectionIncorrect, sectionUnanswered, sectionTotal);

            summaryHtml += `<div style="clear:both; margin-bottom:20px;">
    <span style="float:left">Section ${s}: ${shortSectionTitle}</span>
    <span style="float:right">${sectionPercent}% ${sectionStatus}</span>
  </div>`;



            let counts = [];
            if (sectionCorrect > 0) counts.push(`${sectionCorrect} correct`);
            if (sectionIncorrect > 0) counts.push(`${sectionIncorrect} wrong`);
            if (sectionUnanswered > 0) counts.push(`${sectionUnanswered} not answered`);

            sectionDetails += `
  <div style="margin-top:5px; clear:both;">
    <span style="float:left; font-style:italic;">Total: ${sectionPercent}% (${counts.join(", ")})</span>
    <span style="float:right; font-style:italic;">${sectionStatus}</span>
  </div></div></div>
`;


            detailsHtml += sectionDetails;
          }
        }

        const overallPercent = totalQuestionsCounted > 0 ? Math.round((totalCorrect / totalQuestionsCounted) * 100) : 0;
        const totalIncorrect = totalQuestionsCounted - totalCorrect;
        const totalUnanswered = totalQuestionsCounted - Object.keys(answers).length;
        const overallStatus = getStatus(totalCorrect, totalIncorrect, totalUnanswered, totalQuestionsCounted);

        summaryHtml += `<div style="clear:both; margin-top:40px; 
        margin-bottom:10px; font-weight:bold; line-height:1;font-size:24px;" 
        class="score">${overallPercent}% Overall — ${overallStatus}</div></div>`;



          document.getElementById('resultsContent').innerHTML = summaryHtml + detailsHtml;
          document.getElementById('resultsModal').classList.add('active');

        enableCollapsibles();
      } // gradeExam
function fullReport() {

    document.getElementById("resultsTitle").textContent = "📘 Full Exam Report";

    let html = `<div class="full-report">`;

    // Loop through all sections
    for (let s = 1; s <= 6; s++) {

        const sectionTitle =
            sectionPartTitlesDesc[s]?.[1]?.[0]?.textSection ||
            `Section ${s}`;

        html += `
            <div class="section-block">
                <h2>Section ${s}: ${sectionTitle}</h2>
        `;

        // Loop through parts
        for (let p = 1; p <= 10; p++) {

            const partQuestions = questions[s]?.[p] || [];
            if (partQuestions.length === 0) continue;

            const partTitle =
                sectionPartTitlesDesc[s]?.[p]?.[0]?.textPart ||
                `Part ${p}`;


//        const currentTitles = sectionPartTitlesDesc[currentSection]?.[currentPart] || [];
//        const notes = currentTitles.length ? currentTitles[0].notes : "";

            const studyNotes =
                sectionPartTitlesDesc[s]?.[p]?.[0]?.notes || "";

            html += `
                <div class="part-block">
                    <h3>Part ${p}: ${partTitle}</h3>
            `;

            // Study notes
            if (studyNotes.trim() !== "") {
                html += `
                    <div class="study-notes">
                        <strong>Study Notes:</strong> 
                        <i>${studyNotes}</i> <br>
                    </div>
                `;
            }

            // Questions + correct answers
            html += `<div class="questions-block">`;

	    let qNum = 1;

            partQuestions.forEach(q => {

                // Correct answer text
                let correctAnswer = "";
                if (q.correct !== undefined) {
                    correctAnswer = q.options?.[q.correct] || "";
                }

                html += `
                    <div class="question-item">
                        Q${qNum})  ${q.text}  <em>✦</em> <i>${correctAnswer}</i>
                    </div>
                `;
		qNum++;
            });  // forEach

            html += `</div></div><br>`; // end part-block
        }

        html += `</div><br><br>`; // end section-block
    }

    html += `</div>`; // end full-report

    document.getElementById("resultsContent").innerHTML = html;
    document.getElementById("resultsModal").classList.add("active");
}


