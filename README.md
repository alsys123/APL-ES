Readme for A Prior Learning Exam System (APL-ES)

v25.12 r10
- fix import export.

Dec 8, 2025:
- entry point to the code is the google-sites html.  This creates the iframe, the Config for accessing the data and also loads up the css, html and the js mainline for the code.  Each test has its own entry point.
- Help&About has its own file.  A single html.
- The entire site would be build by individual entries for the googles-sites html and another for the Help & About.
- The old version'ing is now obsolete since starting github.

v24.1
.. move the mainline to git

v24.0
- move validate js code into git.
- prove working git into code

To test in ubuntu:

1)
Got to working directory.
In a termial window start a local server.

python3 -m http.server 8080
for local net
python3 -m http.server 8080 --bind 0.0.0.0


2)
in firefox bring up the local file:

http://localhost:8080/Examv10.html

==== git commands ====
git status
git add .
git commit -m "Describe what you changed"
git push

git pull .... for a coplete refresh
git restore to forget local changes


General flow:
   entry (development): 
         --> indexBridge.html
                --> https://apis.google.com/js/api.js
                --> https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js
                --> Config-Bridge-Exam.js
                --> mainline.js
                --> style.css
                --> body.html

   entry (production: bridge exam): (NEWer style)
        --> google-sites/bridgeExam-v2.html
                 --> https://alsys123.github.io/APL-ES/loader.js
                         --> https://apis.google.com/js/api.js
                         --> https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js
                         --> https://alsys123.github.io/APL-ES/configBridge.js
                         --> https://alsys123.github.io/APL-ES/mainline.js
                         --> https://alsys123.github.io/APL-ES/style.css
                         --> https://alsys123.github.io/APL-ES/body.html

        
   entry (production: pilot, cognitive and auto exams): (OLDer style)
     copied into embedded page on google sites (all files are the same structure)
           - googleSites-iframe-CIXExam.html
           - ...motorvehicle-license.html
           - ...dementia.html
                SAME Structure for each:
                 --> https://apis.google.com/js/api.js
                 --> https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js
                 --> a config definition is unique to each test: 
                    example:     const CONFIG = {
                       apiKey: "AIzaSyD9hYZTf-8u-mgnwz1JsjU44UJ6DurbXdc",
                       spreadsheetId: "1S0ITwkBBa1IAbIBUM54RJOp9aj5xxc3XvVhyrnaB89U",
                       questionsRange: ["examQuestions!A:J", "sectionPartTitles!A:E"],
                       discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"]
                       };
                --> https://alsys123.github.io/APL-ES/mainline.js
                --> https://alsys123.github.io/APL-ES/style.css
                --> https://alsys123.github.io/APL-ES/body.html

