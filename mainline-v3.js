

const students = {
    'student1': 'a',
    'student2': 'b',
    'student3': 'c',
    'admin': 'admin123',
    'Z': 'z',
    'z': 'z',
    'a': 'a',
    'A': 'a'
};

// new



// endod new
//   let currentUser = null;
// Global variables - v12
let currentUser = 'student1';
let currentSection = 1;
let currentPart = 1;
let answers = {};
let questions = {};
let totalQuestions = 0;
let sectionPartTitlesDesc = {};
let autoCheckEnabled = false; // default OFF false

let questionStats = {}; 
// keyed by qId: { attempts: number, correct: boolean }
let shuffleMap = {};       // qId → array of original indices

function scrollPageBottom() {
    // Use the element that actually scrolls inside Google Sites
    const scrollTarget = document.scrollingElement || document.documentElement;

    const maxScroll = scrollTarget.scrollHeight - scrollTarget.clientHeight;
    scrollTarget.scrollTo({ top: maxScroll, behavior: 'smooth' });
}

      function showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        const messageEl = document.getElementById('notificationMessage');
        messageEl.innerHTML = message;
        notification.className = `notification ${type} show`;
        setTimeout(() => notification.classList.remove('show'), 4000);
      } //showNotification

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
} //showScreen

// Existing initExam signature (adapted)
async function initExam(examQuestionsCVSParsed, sectionPartTitlesCVSParsed, examDataCVSParsed) {
  // Setup exam state
    /*
    const questions = examQuestions.slice(1); // skip header row
  const sections = sectionPartTitles.slice(1);
  const metadata = examData.slice(1);
*/
    // leave header row
    const questions = examQuestionsCVSParsed.slice(); // skip header row
  const sections = sectionPartTitlesCVSParsed.slice();
  const metadata = examDataCVSParsed.slice();

  // Example: validate first question
  console.log("First question:", questions[0]);
  console.log("Sections:", sections[0]);
  console.log("Metadata:", metadata);

  // Continue into your normal exam rendering/validation flow
  // e.g. ValidateBridgeQuestion(questions);
    // renderExamUI(questions, sections, metadata);

    await loadQuestionsFromCSV(questions,sections,metadata);
    
    showScreen('loginScreen');
    
}

async function loadQuestionsFromCSV(questions,sections,metadata) {

	// we have questions, sections, metadata arrays from cvs
	
	/*
          //v11
          const valueRanges = response.result.valueRanges || [];

          if (valueRanges.length === 0) {
            throw new Error("Err04: No ranges returned at all");
          }
          console.log(`Log01: Found ${valueRanges.length} number of sheets in Google Sheets`);

          if (valueRanges.length === 0 || !valueRanges[0].values) {
            throw new Error('Err01: No questions found in questions sheet');
          }

          const rows = valueRanges[0].values;  // the first Sheet - questions
	*/
	
//	const rows = questions;
//	console.log("my first question: ", questions[0]);

	const rows = [...questions];
          //v11 out      const rows = response.result.values || [];

          if (rows.length <= 1) {
            throw new Error('Err02: No questions found in sheet');
          }

          questions = {};

//	console.log("my fist row: ", rows[0]);
	
//	return;
	
          for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row[0]) continue;

            const qId = parseInt(row[0]);
            const section = parseInt(row[1]);
            const part = parseInt(row[2]);


            // special only for error checking bridge quesions
            //let textCheck = row[3];
            //const text = checkMyText(textCheck);
            
            const text = row[3];   // uncomment when special error checking is done
              const options = [row[4], row[5], row[6], row[7]];


  	      // Shuffle options
	      const shuffled = options
		    .map((opt, i) => ({ opt, i }))
		    .sort(() => Math.random() - 0.5);
	  
              const correctLetter = (row[8] || "").toUpperCase();

	      const correctIndexOriginal = correctLetter.charCodeAt(0) - 65;
	      const correctIndexShuffled = shuffled.findIndex(o => o.i === correctIndexOriginal);

	      shuffleMap[qId] = shuffled.map(o => o.i);
	    //  console.log("shuffle map", shuffleMap[qId]);

            const correctIndex = correctLetter.charCodeAt(0) - 65;
              const explanation = row[9] || '';
	           
              if (!questions[section]) questions[section] = {};
              if (!questions[section][part]) questions[section][part] = [];

	      
	      // Save shuffled options and new correct index
	      questions[section][part].push({
		  id: qId,
		  text: row[3],
		  options: shuffled.map(o => o.opt),
		  correct: correctIndexShuffled,
		  explanation: row[9] || ""
	      });
	      }
	      
          totalQuestions = rows.length - 1;
          console.log(`Log01:  Loaded ${totalQuestions} questions from CVS`);

    /*
          // --- v12 load the section and part Titles array- sectionPartTitlesDesc
          if (valueRanges.length === 0 || !valueRanges[1].values) {
            throw new Error('Err09: No titles found in questions sheet');
          }
    */
    
    //      const rowsT = valueRanges[1].values;  // the second Sheet - the titles
    const rowsT = [...sections];
    
    if (rowsT.length <= 1) {
        throw new Error('Err08: No titles found in sheet');
    }
    
    console.log(`Loaded ${rowsT.length} titles from CSV`);
    
    sectionPartTitlesDesc = {};
    
          for (let i = 1; i < rowsT.length; i++) {
            const row = rowsT[i];
            if (!row[0]) continue;

            const sNum = parseInt(row[0]);
            const pNum = parseInt(row[1]);
            const sText = row[2];
            const pText = row[3];
            // NEW: optional notes column
            const notesText = row[4] || "";
            //            console.log('Notes: ', notesText);

            if (!sectionPartTitlesDesc[sNum]) sectionPartTitlesDesc[sNum] = {};
            if (!sectionPartTitlesDesc[sNum][pNum]) sectionPartTitlesDesc[sNum][pNum] = [];

            sectionPartTitlesDesc[sNum][pNum].push({
              textSection: sText,
              textPart: pText,
              notes: notesText
            });

	   //   console.log(`Saving section/part: ${sText} and ${pText}.`);  //v13

          } // end of loop

// debug only
//    const titles = sectionPartTitlesDesc[1]?.[1] || [];
//    console.log("Size of titles=",titles.length);

/*
          // end of try			  
        } catch (error) {
          console.error('Err05: Error loading questions and titles from spreadsheet', error);
          throw error;
        }
*/
	
        populateJumpDropdown();
        populateJumpGrid();

      }  // loadQuestionsFromCSV


/* using the one above only???
async function initExam() {
    try {
        await new Promise(resolve => {
            gapi.load('client', resolve);
        });

        await gapi.client.init({
            apiKey: CONFIG.apiKey,
            discoveryDocs: CONFIG.discoveryDocs
        });

        await loadQuestionsFromSheet();

        //    showScreen('loginScreen');  v10 out

    } catch (error) {
        console.error('Init error:', error);
        showNotification('Failed to load exam. Please refresh.', 'error');
        document.querySelector('.loading-text').textContent = 'Error loading exam. Please refresh the page.';
    }

    showScreen('loginScreen');
} //initExam
*/

/*
      //3.0
      async function loadQuestionsFromSheet() {

        try {
          const response = await gapi.client.sheets.spreadsheets.values.batchGet({
            spreadsheetId: CONFIG.spreadsheetId,
            ranges: CONFIG.questionsRange
          });


          //v11
          const valueRanges = response.result.valueRanges || [];

          if (valueRanges.length === 0) {
            throw new Error("Err04: No ranges returned at all");
          }
          console.log(`Log01: Found ${valueRanges.length} number of sheets in Google Sheets`);

          if (valueRanges.length === 0 || !valueRanges[0].values) {
            throw new Error('Err01: No questions found in questions sheet');
          }

          const rows = valueRanges[0].values;  // the first Sheet - questions

          //v11 out      const rows = response.result.values || [];

          if (rows.length <= 1) {
            throw new Error('Err02: No questions found in sheet');
          }

          questions = {};

          for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row[0]) continue;

            const qId = parseInt(row[0]);
            const section = parseInt(row[1]);
            const part = parseInt(row[2]);


            // special only for error checking bridge quesions
            //let textCheck = row[3];
            //const text = checkMyText(textCheck);
            
            const text = row[3];   // uncomment when special error checking is done
              const options = [row[4], row[5], row[6], row[7]];


  	      // Shuffle options
	      const shuffled = options
		    .map((opt, i) => ({ opt, i }))
		    .sort(() => Math.random() - 0.5);
	  
              const correctLetter = (row[8] || "").toUpperCase();

	      const correctIndexOriginal = correctLetter.charCodeAt(0) - 65;
	      const correctIndexShuffled = shuffled.findIndex(o => o.i === correctIndexOriginal);

	      shuffleMap[qId] = shuffled.map(o => o.i);
	    //  console.log("shuffle map", shuffleMap[qId]);

            const correctIndex = correctLetter.charCodeAt(0) - 65;
              const explanation = row[9] || '';
	           
              if (!questions[section]) questions[section] = {};
              if (!questions[section][part]) questions[section][part] = [];

	      
	      // Save shuffled options and new correct index
	      questions[section][part].push({
		  id: qId,
		  text: row[3],
		  options: shuffled.map(o => o.opt),
		  correct: correctIndexShuffled,
		  explanation: row[9] || ""
	      });
	      }
	      
          totalQuestions = rows.length - 1;
          console.log(`Log01:  Loaded ${totalQuestions} questions from Google Sheets`);

          // --- v12 load the section and part Titles array- sectionPartTitlesDesc
          if (valueRanges.length === 0 || !valueRanges[1].values) {
            throw new Error('Err09: No titles found in questions sheet');
          }

          const rowsT = valueRanges[1].values;  // the second Sheet - the titles

          if (rowsT.length <= 1) {
            throw new Error('Err08: No titles found in sheet');
          }
          console.log(`Loaded ${rowsT.length} titles from Google Sheets`);

          sectionPartTitlesDesc = {};

          for (let i = 1; i < rowsT.length; i++) {
            const row = rowsT[i];
            if (!row[0]) continue;

            const sNum = parseInt(row[0]);
            const pNum = parseInt(row[1]);
            const sText = row[2];
            const pText = row[3];
            // NEW: optional notes column
            const notesText = row[4] || "";
            //            console.log('Notes: ', notesText);

            if (!sectionPartTitlesDesc[sNum]) sectionPartTitlesDesc[sNum] = {};
            if (!sectionPartTitlesDesc[sNum][pNum]) sectionPartTitlesDesc[sNum][pNum] = [];

            sectionPartTitlesDesc[sNum][pNum].push({
              textSection: sText,
              textPart: pText,
              notes: notesText
            });
            //	 console.log(`Saving section/part: ${sText} and ${pText}.`);  //v13
          } // end of loop



          // end of try			  
        } catch (error) {
          console.error('Err05: Error loading questions and titles from spreadsheet', error);
          throw error;
        }

        populateJumpDropdown();
        populateJumpGrid();

      }  // loadQuestionsFromSheet

*/


      function login() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const errorEl = document.getElementById('loginError');


        if (!username || !password) {
          errorEl.textContent = 'Please enter username and password';
          return;
        }

        if (students[username] === password) {
          currentUser = username;
          loadProgress();
          showScreen('examScreen');
          document.getElementById('studentName').textContent = username;
          renderQuestions();
          showNotification('Welcome! Your progress is saved automatically.', 'success');
        } else {
          errorEl.textContent = 'Invalid username or password';
        }

      } // login

      function logout() {
        saveProgress();
        currentUser = null;
        currentSection = 1;
        currentPart = 1;
        answers = {};
        showScreen('loginScreen');
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        document.getElementById('loginError').textContent = '';
      } //logout

      function loadProgress() {
        const saved = localStorage.getItem(`exam_${currentUser}`);
        if (saved) {
          try {
            const data = JSON.parse(saved);
            currentSection = data.section || 1;
            currentPart = data.part || 1;
            answers = data.answers || {};
            console.log('Progress loaded:', Object.keys(answers).length, 'answers');
          } catch (e) {
            console.error('Err6: Error loading progress:', e);
          }
        }
      } //loadProgress

      function saveProgress() {
        const data = {
          section: currentSection,
          part: currentPart,
          answers: answers,
          lastSaved: new Date().toISOString()
        };
        localStorage.setItem(`exam_${currentUser}`, JSON.stringify(data));

        const totalAnswered = Object.keys(answers).length;
        showNotification(`Progress saved!<br>Answered: ${totalAnswered}/${totalQuestions}<br>Section ${currentSection}, Part ${currentPart}`, 'success');
      } //saveProgress

      function renderQuestions() {
        const container = document.getElementById('questionsContainer');
        container.innerHTML = '';

        const currentQuestions = questions[currentSection]?.[currentPart] || [];

        if (currentQuestions.length === 0) {
          container.innerHTML = `
      <div style="text-align:center;padding:40px;color:#666;">
        <p>No questions available for this section/part.</p>
        <p>Please check your Google Sheet.</p>
      </div>`;
          return; // stop here if no questions
        }
        // look up titles for this section/part
        const currentTitles = sectionPartTitlesDesc[currentSection]?.[currentPart] || [];
        const notes = currentTitles.length ? currentTitles[0].notes : "";

        if (notes) {
          // decide label based on whether notes exist
          const buttonLabel = notes ? "Study Notes" : "Explain";

          // build the block with dynamic label
          const explainBlock = document.createElement('div');
          explainBlock.className = 'explain-block';
          explainBlock.innerHTML = `
  <button class="explain-btn" onclick="openExplainModal()">${buttonLabel}</button>
`;
          container.appendChild(explainBlock);
        }

        // ✅ Create explain block
        //   const explainBlock = document.createElement('div');
        //   explainBlock.className = 'explain-block';
        //   explainBlock.innerHTML = `
        // <button class="explain-btn" onclick="openExplainModal()">Notes</button>
        //`;
        //     container.appendChild(explainBlock);

        // ✅ Render questions
        currentQuestions.forEach((q, index) => {
          const globalNum = ((currentSection - 1) * 50) + ((currentPart - 1) * 5) + (index + 1);

          let statusClass = 'unanswered';
          let explanationHtml = '';

          if (autoCheckEnabled && answers[q.id] !== undefined) {
            if (answers[q.id] === q.correct) {
              statusClass = 'correct';
            } else {
              statusClass = 'incorrect';
              if (q.explanation) {
                explanationHtml = `<div class="explanation">💡 ${q.explanation}</div>`;
              }
            }
          }

          const div = document.createElement('div');
          div.className = `question-card ${statusClass}`;
          div.innerHTML = `
      <div class="question-number">Question ${globalNum} of ${totalQuestions}</div>
      <div class="question-text">${q.text}</div>
      <div class="options">
        ${q.options.map((opt, i) => `
          <label class="option ${answers[q.id] === i ? 'selected' : ''}" onclick="selectAnswer(${q.id}, ${i})">
            <input type="radio" name="q${q.id}" value="${i}" ${answers[q.id] === i ? 'checked' : ''}>
            <span>${opt}</span>
          </label>
        `).join('')}
      </div>
      ${explanationHtml}
    `;
          container.appendChild(div);
        });

        updateProgress();
        updateNavigation();
      } //renderQuestions

      function openExplainModal() {
        const modal = document.getElementById("explainModal");
        const notesDiv = document.getElementById("notes-content");
        const titleEl = document.getElementById("modalTitle");

        const currentTitles = sectionPartTitlesDesc[currentSection]?.[currentPart] || [];
        const sectionTitle = currentTitles.length ? currentTitles[0].textSection : "";
        const partTitle = currentTitles.length ? currentTitles[0].textPart : "";
        const notes = currentTitles.length ? currentTitles[0].notes : "";

        if (notes) {
          titleEl.textContent = `Section ${currentSection}: ${sectionTitle} — Part ${currentPart}: ${partTitle} — Notes`;
          notesDiv.textContent = notes;
        } else {
          titleEl.textContent = `Section ${currentSection}: ${sectionTitle} — Part ${currentPart}: ${partTitle} — Explanation`;
          notesDiv.textContent = "No notes available for this section/part.";
        }

        modal.style.display = "block";
      }


      function closeExplainModal() {
        document.getElementById("explainModal").style.display = "none";
      }

      // Optional: close when clicking outside modal
      window.onclick = function (event) {
        const modal = document.getElementById("explainModal");
        if (event.target === modal) {
          modal.style.display = "none";
        }
      };


function selectAnswer(qId, optionIndex) {
  // Increment attempts
  if (!questionStats[qId]) {
    questionStats[qId] = { attempts: 0, correct: false };
  }
  questionStats[qId].attempts++;

  // Record answer
  answers[qId] = optionIndex;

  // Check correctness
  const currentQuestions = questions[currentSection]?.[currentPart] || [];
  const q = currentQuestions.find(q => q.id === qId);
  if (q) {
    questionStats[qId].correct = (optionIndex === q.correct);
  }

  renderQuestions(); // refresh UI
} //selectAnswer

      function updateProgress() {
        const totalAnswered = Object.keys(answers).length;
        const percentage = totalQuestions > 0 ? Math.round((totalAnswered / totalQuestions) * 100) : 0;

        document.getElementById('progressFill').style.width = Math.max(percentage, 5) + '%';
        document.getElementById('progressFill').textContent = `${totalAnswered}/${totalQuestions}`;
        document.getElementById('progressPercent').textContent = percentage + '%';
        document.getElementById('currentSection').textContent = `${currentSection} of 6`;
        document.getElementById('currentPart').textContent = `${currentPart} of 10`;

        // v13 check we have all the titles in an array
        const currentTitles = sectionPartTitlesDesc[currentSection]?.[currentPart] || [];

        if (currentTitles.length === 0) {
          throw new Error('Err13: Cannot find the array of titles.');
        }
        const sectionTitle = currentTitles[0].textSection;
        const partTitle = currentTitles[0].textPart;

        // default
        document.getElementById('currentSectionLabel').textContent = 'Section: To be filled in...';
        document.getElementById('currentPartLabel').textContent = 'Part: To be Filled in...';

        //document.getElementById('currentSectionLabel').textContent = `${sectionTitle}`;
        //document.getElementById('currentPartLabel').textContent = `${partTitle}`;
        document.getElementById('currentSectionLabel').textContent = `Section ${currentSection}: ${sectionTitle}`;
        document.getElementById('currentPartLabel').textContent = `Part ${currentPart}: ${partTitle}`;

      }

      function updateNavigation() {
        const prevBtn = document.getElementById('prevBtn');
        prevBtn.disabled = (currentSection === 1 && currentPart === 1);
        prevBtn.style.opacity = prevBtn.disabled ? '0.5' : '1';
      }

      function nextPart() {
        if (currentPart < 10) {
          currentPart++;
        } else if (currentSection < 6) {
          currentSection++;
          currentPart = 1;
        } else {
          showNotification('Congratulations! You have completed all sections!', 'success');
          return;
        }
        renderQuestions();
        document.documentElement.scrollTop = 0; // For modern browsers -v10
        document.body.scrollTop = 0; 		    // v10
      }

      function previousPart() {
        if (currentPart > 1) {
          currentPart--;
        } else if (currentSection > 1) {
          currentSection--;
          currentPart = 10;
        }
        renderQuestions();
        document.documentElement.scrollTop = 0; // For modern browsers -v10
        document.body.scrollTop = 0; 		    // v10
      }

      function checkAnswers() {
        const currentQuestions = questions[currentSection]?.[currentPart] || [];
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

        let html = `
            <div class="result-summary">
                <h3>Section ${currentSection}, Part ${currentPart}</h3>
                <div class="score">${percentage}%</div>
                <p><strong>${correct}</strong> correct | <strong>${incorrect}</strong> incorrect | <strong>${unanswered}</strong> unanswered</p>
            </div>
        `;

        currentQuestions.forEach((q, index) => {
          const globalNum = ((currentSection - 1) * 50) + ((currentPart - 1) * 5) + (index + 1);
          let status = 'unanswered';
          let statusText = 'Not answered';

          if (answers[q.id] !== undefined) {
            if (answers[q.id] === q.correct) {
              status = 'correct';
              statusText = '✓ Correct';
            } else {
              status = 'incorrect';
              statusText = `✗ Incorrect - You chose: ${q.options[answers[q.id]]}<br>Correct answer: ${q.options[q.correct]}`;
            }
          }

	    /*
          html += `
                <div class="result-item ${status}">
                    <strong>Question ${globalNum}:</strong> ${q.text}<br>
                    <em>${statusText}</em>
                    ${status === 'incorrect' && q.explanation ? `<div class="explanation">💡 ${q.explanation}</div>` : ''}
                </div>
            `;
	    */
const stats = questionStats[q.id] || { attempts: 0, correct: false };
const attemptsText = stats.attempts > 0 
  ? `${stats.attempts} attempt${stats.attempts > 1 ? 's' : ''}` 
  : "No attempts";

const outcomeText = stats.correct ? "✅ Eventually Correct" : "❌ Not Correct";

html += `
  <div class="result-item ${status}">
    <strong>Question ${globalNum}:</strong> ${q.text}<br>
    <em>${statusText}</em><br>
    <span class="attempts">Attempts: ${attemptsText}</span><br>
    <span class="outcome">${outcomeText}</span>
    ${status === 'incorrect' && q.explanation ? `<div class="explanation">💡 ${q.explanation}</div>` : ''}
  </div>
`;

	    
        });

        document.getElementById('resultsContent').innerHTML = html;
        document.getElementById('resultsModal').classList.add('active');
      }

      function closeResults() {
        document.getElementById('resultsModal').classList.remove('active');
      } //closeResults

// **** Entry Point ****
// window.onload = initExam;


// New

/*
window.onload = function() {

    console.log("ready to load login");
    
    showScreen('loginScreen');

    //showScreen('loadingScreen');
    
    //showScreen('pickLoaderScreen');
    
    // Initialize picker UI
    //  document.getElementById("examPicker").value = "";
    //  document.getElementById("status").textContent = "Please select an exam to begin.";
    
};
*/



// **** Start of import/export ****


// --- Export current progress to ZIP ---
//3.0 new
async function exportToZip() {
  try {
    if (!currentUser) {
      showNotification('Please log in before exporting.', 'warning');
      return;
    }

    const payload = {
      version: '3.0',
      user: currentUser,
      section: currentSection,
      part: currentPart,
      answers,           // ✅ selected index in shuffled order
      stats: questionStats, // ✅ attempts + correctness
      shuffleMap,        // ✅ qId → array of original indices (shuffle order)
      totalQuestions,
      timestamp: new Date().toISOString()
    };

    const zip = new JSZip();
    const fileName = `progress_${currentUser}.json`;
    zip.file(fileName, JSON.stringify(payload, null, 2), { date: new Date() });

    const blob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });

    const downloadName = `exam_${currentUser}_${new Date().toISOString().replace(/[:.]/g, '-')}.zip`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = downloadName;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(a.href);
    a.remove();

    showNotification('Exported progress to ZIP.', 'success');
  } catch (err) {
    console.error('Export error:', err);
    showNotification('Failed to export progress.', 'error');
  }
}
/*
async function exportToZip() {
  try {
    if (!currentUser) {
      showNotification('Please log in before exporting.', 'warning');
      return;
    }

    // Prepare payload
    const payload = {
      version: '2.0',
      user: currentUser,
      section: currentSection,
      part: currentPart,
      answers,          // ✅ raw selected indices for re‑rendering
      stats: questionStats, // ✅ attempts + correctness
      totalQuestions,
      timestamp: new Date().toISOString()
    };

    // Create ZIP with progress.json
    const zip = new JSZip();
    const fileName = `progress_${currentUser}.json`;
    zip.file(fileName, JSON.stringify(payload, null, 2), { date: new Date() });

    const blob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });

    // Trigger download
    const downloadName = `exam_${currentUser}_${new Date().toISOString().replace(/[:.]/g, '-')}.zip`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = downloadName;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(a.href);
    a.remove();

    showNotification('Exported progress to ZIP.', 'success');
  } catch (err) {
    console.error('Export error:', err);
    showNotification('Failed to export progress.', 'error');
  }
}
*/

      // --- Import progress from ZIP ---
      function triggerImport() {
        const input = document.getElementById('importFileInput');
        input.value = ''; // reset
        input.onchange = async (e) => {
          const file = e.target.files && e.target.files[0];
          if (!file) return;
          await importFromZip(file);
        };
        input.click();
      }
// savedIdx is the index in the OLD (exported) shuffled order
// returns the index in the CURRENT shuffled order
function translateSelectedIndex(qId, savedIdx, oldMap, currentMap) {
//    console.log("remap on import: Q", qId, ".  Saved index = ", savedIdx );
 //   console.log("   oldmap: ", oldMap );
 //   console.log("   curmap: ", currentMap );
    
  const old = oldMap?.[qId];
  const cur = currentMap?.[qId];
  if (!Array.isArray(old) || !Array.isArray(cur)) return savedIdx; // graceful fallback

  // Find which ORIGINAL option the learner selected back then
  const originalIdx = old[savedIdx]; // e.g., savedIdx=1, old=[2,1,0,3] → originalIdx=1

  // Where is that ORIGINAL option in the current shuffle?
    const newIdx = cur.indexOf(originalIdx); // e.g., cur=[1,0,3,2] → newIdx=0

 //   console.log("   import fix  ==> ", newIdx );
    
  return newIdx === -1 ? savedIdx : newIdx;
} //translateSelectedIndex

// import from zip
// new 3.0
async function importFromZip(file) {

  //  console.log('Current shuffleMap:', shuffleMap);
    
  try {
    if (!currentUser) {
      showNotification('Please log in before importing.', 'warning');
      return;
    }

    const zip = await JSZip.loadAsync(file);
    const entry = Object.values(zip.files).find(f => !f.dir && f.name.toLowerCase().endsWith('.json'));
    if (!entry) {
      showNotification('ZIP does not contain a JSON progress file.', 'error');
      return;
    }

    const jsonText = await entry.async('string');
    let data;
    try {
      data = JSON.parse(jsonText);
    } catch (e) {
      showNotification('Invalid JSON inside ZIP.', 'error');
      return;
    }

    if (data.user !== currentUser) {
      showNotification(`Progress belongs to ${data.user}. Log in as that user to import.`, 'warning');
      return;
    }

    // ✅ Restore section/part, answers, stats, and shuffleMap
    currentSection = Number(data.section) || 1;
    currentPart = Number(data.part) || 1;
    answers = typeof data.answers === 'object' && data.answers !== null ? data.answers : {};
    questionStats = typeof data.stats === 'object' && data.stats !== null ? data.stats : {};
    importShuffleMap = typeof data.shuffleMap === 'object' && data.shuffleMap !== null ? data.shuffleMap : {};

      /*
    // ✅ Reapply shuffle order to questions
    Object.values(questions).forEach(sectionParts => {
      Object.values(sectionParts).forEach(partQuestions => {
        partQuestions.forEach(q => {
          const map = shuffleMap[q.id];
          if (map) {
            // reorder options back to saved shuffle
            q.options = map.map(originalIndex => q.options[originalIndex]);
            // recompute correct index in shuffled order
            q.correct = map.indexOf(q.correct);
          }
        });
      });
    });
*/

      

      
      // Assume: importedData.answers, importedData.shuffleMap are from the ZIP
//         shuffleMap is the current in-memory map for this session
Object.keys(data.answers).forEach(qId => {
  const savedIdx = data.answers[qId];
  const translated = translateSelectedIndex(qId, savedIdx, importShuffleMap, shuffleMap);
  answers[qId] = translated; // now aligned to current q.options
});

          // Persist to localStorage
      saveProgress();
      
    // Refresh UI
    renderQuestions();

    const totalAnswered = Object.keys(answers).length;
    showNotification(
      `Imported progress.<br>Answered: ${totalAnswered}/${totalQuestions}<br>Section ${currentSection}, Part ${currentPart}`,
      'success'
    );
  } catch (err) {
    console.error('Import error:', err);
    showNotification('Failed to import progress from ZIP.', 'error');
  }
}
/*
async function importFromZip(file) {
  try {
    if (!currentUser) {
      showNotification('Please log in before importing.', 'warning');
      return;
    }

    const zip = await JSZip.loadAsync(file);
    const entry = Object.values(zip.files).find(f => !f.dir && f.name.toLowerCase().endsWith('.json'));
    if (!entry) {
      showNotification('ZIP does not contain a JSON progress file.', 'error');
      return;
    }

    const jsonText = await entry.async('string');
    let data;
    try {
      data = JSON.parse(jsonText);
    } catch (e) {
      showNotification('Invalid JSON inside ZIP.', 'error');
      return;
    }

    if (data.user !== currentUser) {
      showNotification(`Progress belongs to ${data.user}. Log in as that user to import.`, 'warning');
      return;
    }

    // ✅ Restore both answers and stats
    currentSection = Number(data.section) || 1;
    currentPart = Number(data.part) || 1;
    answers = typeof data.answers === 'object' && data.answers !== null ? data.answers : {};
    questionStats = typeof data.stats === 'object' && data.stats !== null ? data.stats : {};

    // Persist to localStorage
    saveProgress();

    // Refresh UI
    renderQuestions();

    const totalAnswered = Object.keys(answers).length;
    showNotification(
      `Imported progress.<br>Answered: ${totalAnswered}/${totalQuestions}<br>Section ${currentSection}, Part ${currentPart}`,
      'success'
    );
  } catch (err) {
    console.error('Import error:', err);
    showNotification('Failed to import progress from ZIP.', 'error');
  }
}
*/
/*
      async function importFromZip(file) {
        try {
          if (!currentUser) {
            showNotification('Please log in before importing.', 'warning');
            return;
          }

          const zip = await JSZip.loadAsync(file);
          // Find the first JSON file inside ZIP
          const entry = Object.values(zip.files).find(f => !f.dir && f.name.toLowerCase().endsWith('.json'));
          if (!entry) {
            showNotification('ZIP does not contain a JSON progress file.', 'error');
            return;
          }

          const jsonText = await entry.async('string');
          let data;
          try {
            data = JSON.parse(jsonText);
          } catch (e) {
            showNotification('Invalid JSON inside ZIP.', 'error');
            return;
          }

          // Basic validation
          const requiredFields = ['version', 'user', 'section', 'part', 'answers'];
          const missing = requiredFields.filter(k => !(k in data));
          if (missing.length) {
            showNotification(`Missing fields: ${missing.join(', ')}`, 'error');
            return;
          }

          // Optional: ensure importing only for the same user
          if (data.user !== currentUser) {
            showNotification(`Progress belongs to ${data.user}. Log in as that user to import.`, 'warning');
            return;
          }

            // Apply imported state
	      // Restore stats
  questionStats = data.stats || {};
          currentSection = Number(data.section) || 1;
          currentPart = Number(data.part) || 1;
          answers = typeof data.answers === 'object' && data.answers !== null ? data.answers : {};

          // Persist to localStorage
          saveProgress();

          // Refresh UI
          renderQuestions();

          const totalAnswered = Object.keys(answers).length;
          showNotification(`Imported progress.<br>Answered: ${totalAnswered}/${totalQuestions}<br>Section ${currentSection}, Part ${currentPart}`, 'success');
        } catch (err) {
          console.error('Import error:', err);
          showNotification('Failed to import progress from ZIP.', 'error');
        }
      } //importFromZip
*/

// ****  end of import/export  ****

/// ** Start of grading exam ****
      function gradeExam() {
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
        }

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

// *** END of grading exam ***

      function populateJumpDropdown() {
        const select = document.getElementById('jumpSection');
        if (!select) return;

        // Reset dropdown
        select.innerHTML = '<option value="">-- Select Section/Part --</option>';

        // Helper: shorten section text only
        const shortenSection = (text, max = 30) =>
          text && text.length > max ? text.substring(0, max) + "…" : text;

        for (let s = 1; s <= 6; s++) {
          for (let p = 1; p <= 10; p++) {
            const titles = sectionPartTitlesDesc[s]?.[p] || [];

//	      console.log("Size of titles=",titles.length);

	      
	      let label;

	      if (titles.length) {
              // ✅ shorten only the section text
              const sectionText = shortenSection(titles[0].textSection, 30);
              const partText = titles[0].textPart; // untouched
		label = `Section ${s}, Part ${p} — ${sectionText}: ${partText}`;
		
	//      console.log("got titles =", `Section ${s}, Part ${p} — ${sectionText}: ${partText}`);

            } else {
              label = `Section ${s}, Part ${p}`;
            }

	      
            const opt = document.createElement('option');
            opt.value = `${s}-${p}`;
            opt.textContent = label;
            select.appendChild(opt);
          }
        }
      } // populateJumpDropdown


      function jumpToSectionPart() {
        const val = document.getElementById('jumpSection').value;
        if (!val) return;
        const [s, p] = val.split('-').map(Number);


        // ✅ Close Quick Nav if it was open
        const grid = document.getElementById("jumpGridContainer");
        if (grid && grid.style.display === "block") {
          toggleJumpGrid(); // only call if open
        }

        currentSection = s;
        currentPart = p;
        renderQuestions();
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }

      function toggleJumpGrid() {
        const container = document.getElementById('jumpGridContainer');
        const btn = event.target;
        if (container.style.display === 'none') {
          // 👉 Rebuild grid so current section/part is highlighted
          populateJumpGrid();
          container.style.display = 'block';
          btn.textContent = '📑 Hide Quick Navigation';
        } else {
          container.style.display = 'none';
          btn.textContent = '📑 Show Quick Navigation';
        }
      }


      function getStatusClass(correct, incorrect, unanswered, total, section, part) {
        if (total === 0) return null;

        const allUnanswered = unanswered === total;
        const allCorrect = correct === total && incorrect === 0;

        //console.log(correct, incorrect);

        // partial fill squares
        if (correct === 4 && incorrect === 1) return 'done4-wrong1';
        if (correct === 3 && incorrect === 2) return 'done3-wrong2';
        if (correct === 2 && incorrect === 3) return 'done2-wrong3';

        // full fill squares
        if (allUnanswered) return null;
        if (incorrect >= 1) return 'wrong';   // red
        if (allCorrect) return 'done';        // green
        return 'progress';                    // yellow
      }

      function getButtonClasses(correct, incorrect, unanswered, total, section, part) {
        const classes = [];
        const statusClass = getStatusClass(correct, incorrect, unanswered, total, section, part);
        if (statusClass) classes.push(statusClass);

        // Highlight active part directly here
        if (currentSection === section && currentPart === part) {
          classes.push('active');
        }

        return classes;
      }

      function populateJumpGrid() {
        const grid = document.getElementById('jumpGrid');
        grid.innerHTML = '';

        // Loop through all sections
        for (let s = 1; s <= 6; s++) {
          const sectionTitles = sectionPartTitlesDesc[s];
          if (!sectionTitles) continue;

          // Section heading
          const sectionHeader = document.createElement('h3');
          sectionHeader.textContent = `Section ${s}: ${sectionTitles[1]?.[0]?.textSection || ''}`;
          grid.appendChild(sectionHeader);

          // Flat list of parts (numbers only)
          for (let p = 1; p <= 10; p++) {
            if (!sectionTitles[p]) continue;

            const btn = document.createElement('button');
            btn.textContent = `Part ${p}`; // ✅ only number, no title
            btn.onclick = () => {
              currentSection = s;
              currentPart = p;
              renderQuestions();
              populateJumpGrid(); // refresh grid so active button updates
            };

            // --- Compute status for this part ---
            const currentQuestions = questions[s]?.[p] || [];
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
            // Apply modular worker function
            const classes = getButtonClasses(correct, incorrect, unanswered, currentQuestions.length, s, p);
            classes.forEach(cls => btn.classList.add(cls));

            // Highlight active part
            if (currentSection === s && currentPart === p) {
              btn.classList.add('active');
            }
            //console.log(`Section ${s} Part ${p}`, correct, incorrect, unanswered, total);

            grid.appendChild(btn);
          }
        }
      }

      function enableCollapsibles() {
        const coll = document.querySelectorAll(".collapsible");
        coll.forEach(btn => {
          btn.onclick = function () {
            this.parentElement.classList.toggle("active");
          };
        });

        // 👉 Auto‑open failed sections
        coll.forEach(btn => {
          const sectionContent = btn.nextElementSibling;
          if (sectionContent && sectionContent.innerHTML.includes("❌ Fail")) {
            btn.parentElement.classList.add("active");
          }
        });
      } // enableCollapsibles


      function scrollToBottom() {
        const modalContent = document.querySelector('#resultsModal .modal-content');
        modalContent.scrollTo({ top: modalContent.scrollHeight, behavior: 'smooth' });
      }
      function scrollToTop() {
        const modalContent = document.querySelector('#resultsModal .modal-content');
        modalContent.scrollTo({ top: 0, behavior: 'smooth' });
      }


      function scrollMainBottom() {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      } // scrollMainBottom

      function scrollMainTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } // scrollMainTop

      function highlightCurrentJump() {
        const gridButtons = document.querySelectorAll('#jumpGrid button');
        gridButtons.forEach(btn => {
          btn.classList.remove('active');
          if (btn.textContent === `S${currentSection}P${currentPart}`) {
            btn.classList.add('active');
          }
        });

        const dropdown = document.getElementById('jumpSection');
        if (dropdown) {
          dropdown.value = `${currentSection}-${currentPart}`;
        }
      }

      function toggleAutoCheck() {
        autoCheckEnabled = !autoCheckEnabled;
        const btn = document.getElementById('autoCheckBtn');

        if (autoCheckEnabled) {
          btn.textContent = "🟢 Auto-Check ON";
          btn.classList.remove("off");
          btn.classList.add("on");
          showNotification("Auto-check is now ON", "success");
        } else {
          btn.textContent = "⚪ Auto-Check OFF";
          btn.classList.remove("on");
          btn.classList.add("off");
          showNotification("Auto-check is now OFF", "warning");
        }

        renderQuestions(); // refresh cards immediately
      }

