# Mod Tracker

Make downloading and keeping track of all your mods easy and seamless!

Mod tracker is a windows app that keeps track of the mods you're waiting on to update to the latest Minecraft version. It also lets you download all them with a single click, easily share them with your friends, and more! Say goodbye to that mile long bookmark folder of Mondrinth and CurseForge links - Mod Tracker will do the job for you!

- Create profile(s) - a list of Minecraft mods you want track. Either Modrinth or CurseForge will work!
- Easily see what mods are updated by looking at the color-coded list or detailed pie chart.
- Download all your mods with a single click!
- Share your mods easily by exporting your profile.
- Assign priority levels to categorize your must-have mods your nice-to-have mods. (This is reflected in the pie chart!)

**[Download here!](https://github.com/Stephen-Nuttall/ModTracker/releases)**
[Click here for instructions](#how-to-download)

![alt text](assets/screenshot%201.png)

*Please note that this app is still in beta, so expect some bugs. If you encounter a bug or have ideas to improve Mod Tracker, create an issue on our [issues page](https://github.com/Stephen-Nuttall/ModTracker/issues).*


## How to Download
1. Go to our [releases page](https://github.com/Stephen-Nuttall/ModTracker/releases).
2. Open the assets dropdown on the latest release, and download the installer.
3. Run the installer, and you should be good!

Alternatively, you can install the executable directly from the latest action on our [actions page](https://github.com/Stephen-Nuttall/ModTracker/actions/workflows/build-test.yml). Note that there is currently a bug where the unittest results will be blank.


## Changes in Beta 5.0
- **New web version!!!** [More Details Here]
- Bugfixes and refactoring.

If there are any issues with this version Mod Tracker, report it on our [issues page](https://github.com/Stephen-Nuttall/ModTracker/issues).

## Technical Details
For those who want to clone this repository, here's some helpful information.

Required Python libraries:
- requests
- levenshtein
- (for web app only) fastapi
- (for desktop app only) PyQt6
- (for desktop app only) PyQt6-Charts

To run Mod Tracker Web in your IDE:
- Install Python 3 and the required libraries listed above (You do not need to install ones used for the desktop app).
- Ensure localhost ports 5173 and 8000 are available.
- In your python virtual environment and from the WebApp directory, run `./runServers.ps1`. (Note: this script accepts an optional -Path argument. Example use: `./WebApp/runServers.ps1 -Path "./WebApp"`)
- Open http://localhost:5173/ in your web browser.

To run Mod Tracker Desktop in your IDE:
- Install Python 3 and the required libraries listed above (You do not need to install ones used for the web app).
- Create a file called API_Keys.py and create a variable inside it called CurseForge. Set it to your API key for CurseForge. Do not use our API key for your project.
- Run `DesktopApp/main.py`.

To generate your own executable:
- Install the pyinstaller library (make sure you also have other libraries installed).
- Run `pyinstaller --name "Mod Tracker" --onefile --noconsole --icon=assets/icon.ico DesktopApp/main.py --add-data "fonts/fontello.ttf;fonts"`.
- The executable can then be found in the newly generated dist directory.

To generate your own installer:
- Download [Inno Setup](https://jrsoftware.org/isinfo.php).
- Run inno setup script.iss with Inno Setup. Make sure you've already built the executable.

To run unit tests, run the tests.py file. You can also test specific modules using a file with the test_ prefix, found in the tests directory.

<sup> README updated 10/5/2025 (unless I forgot to update this)