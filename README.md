# Mod Tracker

Make downloading and keeping track of all your mods easy and seamless!

Mod Tracker is a website that keeps track of the mods you're waiting on to update to the latest Minecraft version. It also lets you download all them with a single click, easily share them with your friends, and more! Say goodbye to that mile long bookmark folder of Mondrinth and CurseForge links - Mod Tracker will do the job for you! Mod tracker is available both as a website and windows application.

- Create profile(s) - a list of Minecraft mods you want track. Either Modrinth or CurseForge will work!
- Easily see what mods are updated by looking at the color-coded list or detailed pie chart.
- Download all your mods with a single click!
- Share your mods easily by exporting your profile.
- Assign priority levels to categorize your must-have mods your nice-to-have mods. (This is reflected in the pie chart!)

**[Visit Mod Tracker Here!](https://stephen-nuttall.github.io/ModTracker/)**

[...or download the desktop app here!](https://github.com/Stephen-Nuttall/ModTracker/releases) *[Click here for download instructions](#how-to-download-desktop-app)*

Screenshot of Mod Tracker Web:
![Screenshot - Mod Tracker Web](assets/screenshot%203.png)

Screenshot of Mod Tracker Desktop:
![Screenshot - Mod Tracker Desktop](assets/screenshot%201.png)

*Please note that both the website and desktop app are still in beta, so expect some bugs. If you encounter a bug or have ideas to improve Mod Tracker, create an issue on our [issues page](https://github.com/Stephen-Nuttall/ModTracker/issues).*


## Changes in Beta 6.0
- **Massive performance improvements for the web app!** The front end and backend servers have been merged into one after rewriting the entire back end in javascript. The initial two server approach turned out to be really inefficent and unnecessary for this project.
- Bugfixes, as well as a new suite of unit tests for the web app.


## How to Download Mod Tracker Desktop
Mod Tracker also has an app for Windows!
> Please note that Mod Tracker is not recognized by Windows and it will trigger a warning when you try to install it. If you do not feel comfortable brushing off theis warning (which is completely understandable), we recommend you [visit the web version of Mod Tracker](https://stephen-nuttall.github.io/ModTracker/).
1. Go to our [releases page](https://github.com/Stephen-Nuttall/ModTracker/releases).
2. Open the assets dropdown on the latest release, and download the installer.
3. Run the installer, and you should be good!

Alternatively, you can install the executable directly from the latest action on our [actions page](https://github.com/Stephen-Nuttall/ModTracker/actions/workflows/build-test.yml). Note that there is currently a bug where the unittest results will be blank.


## Technical Details
For those who want to clone this repository, here's some helpful information.
- Mod Tracker Web uses React and Nodejs running on one web server. The files for the web app can be found entirely in the WebApp folder, and you should run your npm commands from that directory.
- Mod Tracker Desktop is a python app whose front end is built with the PyQt6 library. The files for the desktop app can be found entirely in the DesktopApp folder.

### Instructions for Mod Tracker Web:
To run the web app in your development environment:
1. Install nodejs. Verify the installation by running `node -v `and `npm -v`.
2. Ensure your are in the WebApp directory.
3. Inject the API key into the project using environment variables OR a json file.
    - These are easy ways to inject the API key into the project without exposing it on our GitHub page. **Do not use our internal API key for your project.**
    - Environment variable approach: Set an enviroment variable CURSEFORGE_API_KEY or VITE_CURSEFORGE_API_KEY to your API key.
    - JSON file approach:
        - Create a public folder if it doesn't already exist, and add a file called API_Keys.json to it.
        - Set it to have the following contents: `{ "CurseForge": "!!! YOUR CURSEFORGE API KEY HERE !!!" }`.
4. Run `npm install` to install dependencies listed in package.json.
5. Run `npm run dev` to start the development server. The site can be found at http://localhost:5173/ by default.

To build and run the web app for production:
1. Follow the steps for running the web app in your development environment first.
2. Ensure your are in the WebApp directory.
3. run `npm run build` and `npm run preview --host` to build and run.

To run the unit tests for the web app:
1. Follow the steps for running the web app in your development environment first.
2. Ensure you are in the WebApp directory.
3. Make a file in the tests directory called API_Keys.js.
    - Set it to have the following contents: `const CurseForge = "!!! YOUR CURSEFORGE API KEY HERE !!!"; export default CurseForge;`
    - This is only required for running tests with vitest. The vitest server cannot read the public folder and this is easier and more reliable than injecting an environment variable.
    - **Do not use our internal API key for your project.**
4. Run `npm run test`. You can also generate a test converage report with `npm run test_coverage`.

### Instructions for Mod Tracker Desktop:
To run the desktop app in your development environment:
1. Install Python 3 and open the DesktopApp directory in a python virtual environment
2. Install the required libraries using pip: requests, PyQt6, PyQt6-Charts, and levenshtein
3. Create a file called API_Keys.py in the DesktopApp folder and create a variable inside it called CurseForge. Set it to your API key for CurseForge. **Do not use our internal API key for your project.**
4. Run `DesktopApp/main.py`.

To generate your own executable:
1. Follow the steps for running the desktop app in your development environment first.
2. Install the pyinstaller library (make sure you also have other libraries installed).
3. Run `pyinstaller --name "Mod Tracker" --onefile --noconsole --icon=assets/icon.ico --paths="." DesktopApp/main.py --add-data "fonts/fontello.ttf;fonts" --add-data "Backend;Backend"`.
4. The executable can then be found in the newly generated dist directory.

To generate your own installer:
1. Follow the steps for running the desktop app in your development environment first.
2. Download [Inno Setup](https://jrsoftware.org/isinfo.php).
3. Run inno setup script.iss with Inno Setup. Make sure you've already built the executable.

To run unit tests, run the tests.py file. You can also test specific modules using a file with the test_ prefix, found in the tests directory.

<sup> README updated 1/4/2026 (unless I forgot to update this)