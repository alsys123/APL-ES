Readme for A Prior Learning Exam System (APL-ES)

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
