#
# INSTRUCTIONS TO USE
#

FIRST INSTALL NODE JS HERE
https://nodejs.org/en/

THEN TYPE node -v in your terminal it should display something like this
v14.17.5

THEN CLONE THE REPOSITORY
then type npm install or npm i in the directory

AFTER TYPE THIS
npm install nodemon --save-dev

ON THE PACKAGE.JSON
Add this line under the scripts

  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js"
  },
  
  
Now you can run the program type "npm run dev" to run and visit the site

