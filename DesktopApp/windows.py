# Add the parent directory to the Python path
import sys, os
parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(parent_dir)

import Backend.mod as mod, DesktopApp.widgets as widgets, Backend.loadFromJson as loadFromJson, DesktopApp.modTable as modTable
from PyQt6 import QtCore, QtGui, QtWidgets, QtTest

_appInstance = QtWidgets.QApplication.instance()
if _appInstance:
    _primaryScreen = _appInstance.primaryScreen()
    _scaleFactor = 1 / _primaryScreen.devicePixelRatio()
else:
    _scaleFactor = 1

# Manages the two primary displays in the main window, including communication and switching displays. Also manages the small loading window.
class WindowManager(QtWidgets.QStackedWidget):
    global _scaleFactor
    _selectView:'ProfileSelectWindow'
    _profileManager:mod.ProfileManager
    _detailsView:'DetailsWindow'
    _loadingWindow:'LoadingWindow'
    
    def __init__(self, window:QtWidgets.QMainWindow, loadJson=True, openLoadingWindow=True, printLoadingText=True, processEventsFunc = lambda : 1+1):
        super().__init__(window) # Initialize QStackedWidget

        # configure window
        window.setObjectName("MainWindow")
        window.setWindowTitle("Mod Tracker")
        window.resize(1000, 500)

        # update window manager to fit the window
        self.setGeometry(QtCore.QRect(0, 0, round(1920 * _scaleFactor), round(1080 * _scaleFactor)))
        window.setCentralWidget(self)

        # create profile manager and select view
        self._profileManager = mod.ProfileManager()
        self._selectView = ProfileSelectWindow(self._openDetailsView, self._profileManager)
        self._selectView.setParent(self)
        self._selectView.setGeometry(QtCore.QRect(0, 0, round(1920 * _scaleFactor), round(1080 * _scaleFactor)))

        # load profile data from json file (if enabled). Create and open a LoadingWindow (if enabled)
        if loadJson:
            if openLoadingWindow:
                self._loadingWindow = LoadingWindow()
                self._loadingWindow.show()
                processEventsFunc()
            
            self._loadProfile(printLoadingText)

            if openLoadingWindow:
                self._loadingWindow.close()

    def _loadProfile(self, printLoadingText=True):
        import Backend.callModrinth as callModrinth, Backend.callCurseForge as callCurseForge
        pingModrinth = callModrinth.ping()
        pingCurseForge = callCurseForge.ping()

        if not pingModrinth or not pingCurseForge:
            self._showPingErrorPopup(pingModrinth, pingCurseForge)

        if printLoadingText:
            print("Loading profiles...")

        # call create profile list and add the resulting data to the select view
        profiles = loadFromJson.createProfileList()
        for profile in profiles:
            self._selectView.addProfile(profile, profileName=profile.name, saveToFile=False)

        self._selectView.sortModLists()

    def _showPingErrorPopup(self, canReachModrinth, canReachCurseForge):
        unreachableServices = ""
        if canReachModrinth and canReachCurseForge:
            return
        elif canReachCurseForge:
            unreachableServices = "CurseForge API"
        elif canReachModrinth:
            unreachableServices = "Modrinth API"
        else:
            unreachableServices = "Modrinth and CurseForge APIs"

        popup = QtWidgets.QMessageBox(self)
        popup.setWindowTitle("Warning")
        popup.setText(f"WARNING: Failed to reach {unreachableServices}. Please check your internet connection.\n\n"
                      + "Mod Tracker may be unable to show up-to-date information, and some features may not work as intended. "
                      + "Please proceed with caution and report any bugs at https://github.com/Stephen-Nuttall/ModTracker/issues.")
        popup.setIcon(QtWidgets.QMessageBox.Icon.Warning)
        popup.exec()

    def _openDetailsView(self, profile:mod.Profile):
        self._detailsView = DetailsWindow(profile, self._closeDetailsView, self._selectView.saveAndRefresh)
        self.addWidget(self._detailsView)
        self.setCurrentWidget(self._detailsView)
        self._selectView.hide()

    def _closeDetailsView(self):
        self.removeWidget(self._detailsView)
        self._detailsView.deleteLater()
        self._selectView.show()


# Temporary window to display while the app is starting
class LoadingWindow(QtWidgets.QWidget):
    _movie:QtGui.QMovie

    def __init__(self):
        super().__init__()
        self.setWindowTitle("Loading")
        self.setFixedSize(300, 200)
        layout = QtWidgets.QVBoxLayout()

        # Add a QLabel for the GIF
        gif_label = QtWidgets.QLabel()
        gif_label.setAlignment(QtCore.Qt.AlignmentFlag.AlignCenter)

        # Load and set the GIF
        self._movie = QtGui.QMovie("assets/loading.gif")
        self._movie.setScaledSize(QtCore.QSize(150, 150))
        gif_label.setMovie(self._movie)
        self._movie.start()

        # Add a text label below the GIF
        text_label = QtWidgets.QLabel("Loading, please wait...")
        text_label.setAlignment(QtCore.Qt.AlignmentFlag.AlignCenter)

        # Add widgets to the layout
        layout.addWidget(gif_label)
        layout.addWidget(text_label)
        self.setLayout(layout)


# Small, customizable window that gives the user several options to choose from.
# Adds a button for each button label provided. Will only show a 
# MultipleChoiceWindow.exec() will return the number option chosen (1 indexed). If no option is chosen, it will return 0.
class MultipleChoiceWindow(QtWidgets.QDialog):
    global _scaleFactor

    buttonList = []
    inputField = None

    def __init__(
            self,
            button_labels = ["Option 1", "Option 2", "Option 3"],

            parent=None,
            windowTitle="Select an option",

            button_width = 250,
            button_height = 40,
            button_fontSize = 12,

            showLabel=False,
            label_text="Select an option",
            label_fontSize = 14,
            
            showTextInput = False,
            textInput_labelText = "Enter Text:",
            textInput_placeholderText = "Enter Text Here"
    ):
        super().__init__(parent)
        self.setWindowTitle(windowTitle)
        self.setModal(True)

        self.layout = QtWidgets.QVBoxLayout(self)

        if showLabel:
            label = widgets.createLabel(labelText=label_text, fontSize=label_fontSize, bold=True, alignment=QtCore.Qt.AlignmentFlag.AlignCenter)
            self.layout.addWidget(label)

        if showTextInput:
            inputField_label = widgets.createLabel(labelText=textInput_labelText)
            self.inputField = widgets.createTextField(placeholderText=textInput_placeholderText)

            self.layout.addWidget(inputField_label)
            self.layout.addWidget(self.inputField)

        for i, inputField_label in enumerate(button_labels):
            button = widgets.createButton(btnText=inputField_label, fontSize=button_fontSize, minimumWidth=button_width, minimumHeight=button_height)
            self.buttonList.append(button)
            self.layout.addWidget(button)
            button.clicked.connect(lambda checked=False, idx=i + 1: self.done(idx))
    
    def getInputFieldText(self):
        if self.inputField:
            return self.inputField.text()
        else:
            return None


# Displays a detailed view of a specific mod profile and allows them to manipulate it
class DetailsWindow(QtWidgets.QWidget):
    # Parameters
    _profile:mod.Profile
    
    # Complex Widgets
    _modTable:modTable.tableManager
    _pieChart:widgets.PieChart
    _modLoaderDropdown:widgets.DropdownBtn

    # Buttons
    _addModBtn:QtWidgets.QPushButton
    _refreshBtn:QtWidgets.QPushButton
    _exportBtn:QtWidgets.QPushButton
    _backBtn:QtWidgets.QPushButton
    _downloadBtn:QtWidgets.QPushButton

    # Labels and Text Fields
    _addModTextField:QtWidgets.QLineEdit
    _selectedVersionLabel:QtWidgets.QLabel
    _selectedVersionTextField:QtWidgets.QLineEdit
    _errorLabel:QtWidgets.QLabel
    
    # Constructor. Creates window and runs functions to create widgets
    def __init__(self, profile:mod.Profile = None, onBackButtonClick = None, savefunc = None):
        super().__init__()

        if not profile:
            profile = mod.Profile()

        self._profile = profile
        self._onBackBtnClick = onBackButtonClick
        self._saveFunc = savefunc
        self._createWidgets()

    # Inserts new data to diplay instead. Used for testing.
    def loadNewData(self, detailsWindowData:mod.Profile = None):
        self._profile = detailsWindowData

        self._modTable.loadNewData(self._profile.getModList(), self._profile.getPriorityList(), self._profile.getSelectedVersion())
        self._pieChart.loadNewData(self._profile.getModList(), self._profile.getPriorityList(), self._profile.getSelectedVersion())

    # Refreshes all the widgets on screen
    def reloadWidgets(self, rowNum = 0, reloadEverything = False):
        self._pieChart.loadChart(self._profile.getSelectedVersion())

        if (reloadEverything):
            self._modTable.loadTable(self._profile.getSelectedVersion())
        else:
            # self._modTable.reloadTableRow(rowNum)
            self._modTable.loadTable(self._profile.getSelectedVersion()) # required for tests to work properly
        
        self._callSaveFunction()

    # Simulates the user typing a URL and clicking the add mod button. Used for testing
    def simulate_enterAndAddMod(self, modURL:str):
        self._addModTextField.setText("")
        QtTest.QTest.keyClicks(self._addModTextField, modURL)
        QtTest.QTest.mouseClick(self._addModBtn, QtCore.Qt.MouseButton.LeftButton)

    # Simulates the user selecting a mod loader and clikced the download ready mods button. Used for testing
    def simulate_downloadMod(self, modLoaderOption:int):
        self._modLoaderDropdown.clickDropdownOption(modLoaderOption)
        return self._downloadReadyMods(True)
    
    def simulate_export(self, customFileName:str=False):
        if customFileName:
            fileName = customFileName
        else:
            fileName = "tests/testProfile.json"

        self._exportProfile(fileName, printDebugMessage=False)
    
    # Getters
    def getModTable(self): return self._modTable
    
    def getPieChart(self): return self._pieChart

    def getProfile(self): return self._profile

    def getModList(self): return self._profile.getModList()

    def getPriorityList(self): return self._profile.getPriorityList()

    def getSelectedVersion(self): return self._profile.getSelectedVersion()

    def _createWidgets(self):
        # create complex widgets
        self._pieChart = widgets.PieChart(self, self._profile.getModList(), self._profile.getSelectedVersion())
        self._modTable = modTable.tableManager(self, self._profile.getModList(), self._profile.getPriorityList(),
                                                  self._profile.getSelectedVersion(), self.reloadWidgets, self._callSaveFunction)

        # create add mod widget
        self._addModBtn = widgets.createButton(self, "Add Mod", QtCore.QRect(800, 910, 200, 70), self._addMod, objectName="addModBtn")
        self._addModTextField = widgets.createTextField(self, "Enter mod URL here", QtCore.QRect(0, 910, 800, 70), objectName="addModTextField")
        self._errorLabel = widgets.createLabel(self, "Could not add mod. Invalid URL?", QtCore.QRect(1020, 910, 300, 70), objectName="errorLabel")
        self._errorLabel.setVisible(False)

        # create selected version widget
        self._selectedVersionLabel = widgets.createLabel(self, "Selected Version:", QtCore.QRect(1505, 10, 120, 50), objectName="selectedVersionLabel")
        self._selectedVersionTextField = widgets.createTextField(self, "", QtCore.QRect(1630, 10, 120, 50), objectName="selectedVersionTextField")
        self._selectedVersionTextField.setText(self._profile.getSelectedVersion())

        # create download widget
        self._downloadBtn = widgets.createButton(self, "Download Ready Mods", QtCore.QRect(1525, 910, 275, 70), self._downloadReadyMods, objectName="downloadBtn")
        self._modLoaderDropdown = widgets.DropdownBtn(self, ["Forge", "Fabric", "NeoForge", "Quilt"], buttonRect=QtCore.QRect(1800, 910, 110, 70))

        # create utility buttons
        self._refreshBtn = widgets.createButton(self, "", QtCore.QRect(1755, 10, 50, 50), self._refresh, objectName="refreshBtn", useSpecialSymbolFont=True)
        self._exportBtn = widgets.createButton(self, "", QtCore.QRect(1810, 10, 50, 50), self._exportProfile, objectName="exportBtn", useSpecialSymbolFont=True)
        self._exportLabel = widgets.createLabel(self, "Exported Successfully!", QtCore.QRect(1758, 50, 200, 70), objectName="exportLabel")
        self._exportLabel.setVisible(False)
        self._backBtn = widgets.createButton(self, "", QtCore.QRect(1865, 10, 50, 50), self._closeView, objectName="backBtn", useSpecialSymbolFont=True)

    # Adds a mod to the profile. Triggered when the add mod button is clicked
    def _addMod(self):
        inputString = self._addModTextField.text()
        success = self._profile.addMod(inputString)

        if success:
            self.reloadWidgets(reloadEverything=True)
            self._callSaveFunction()
            self._errorLabel.setVisible(False)
        else:
            self._errorLabel.setVisible(True)

    # Refreshes the data for each mod by making API calls and reloading the widgets
    def _refresh(self):
        selectedVersion = self._selectedVersionTextField.text()
        self._profile.refresh(selectedVersion)
        self.reloadWidgets()
        self._callSaveFunction()

    # Downloads every mod that is marked as ready in the mod table
    def _downloadReadyMods(self, preventDownload = False):
        if preventDownload == False:
            # create a pop up box that asks the user if they want to proceed
            popup = QtWidgets.QMessageBox(self)
            popup.setWindowTitle("Download Warning")
            popup.setText(f"Mod Tracker is about to open up to {len(self._profile.getModList())} tabs in your web browser to download your mods. Do you want to continue?")
            popup.setIcon(QtWidgets.QMessageBox.Icon.Information)
            popup.setStandardButtons(QtWidgets.QMessageBox.StandardButton.Yes | QtWidgets.QMessageBox.StandardButton.Cancel)
            popupAnswer = popup.exec()

            # if the user does want to continue, download each mod that's ready
            if popupAnswer == QtWidgets.QMessageBox.StandardButton.Yes:
                return self._profile.downloadReadyMods(self._modLoaderDropdown.getSelectedOption(), preventDownload)
            else:
                return []
        else:
            return self._profile.downloadReadyMods(self._modLoaderDropdown.getSelectedOption(), preventDownload)
    
    # Has the user select a directory and enter a file name, and then exports the profile as a json file
    def _exportProfile(self, directPath:str=False, printDebugMessage=True):
        if directPath == False:
            directory = QtWidgets.QFileDialog.getExistingDirectory(None, "Select a directory")

            if directory:
                fileName, dialogSubmitted = QtWidgets.QInputDialog.getText(None, "Enter file name", "File name:")
                if dialogSubmitted and fileName:
                    path = f"{directory}/{fileName}.json"
                else:
                    path = False
            else:
                path = False
        else:
            path = directPath
            fileName = "Test Profile"

        success = self._profile.exportProfile(path, fileName, printDebugMessage)    
        self._exportLabel.setVisible(success)

    # Closes the details window and returns to the profile select window
    def _closeView(self):
        self._callSaveFunction()
        self._onBackBtnClick()

    def _callSaveFunction(self):
        if self._saveFunc is not None:
            self._saveFunc(updatedProfile=self._profile)


# Displays all profiles in the profile manager and allows the user createa new profile or select one to view in detail.
class ProfileSelectWindow(QtWidgets.QWidget):
    _layout:widgets.ProfileSelectLayout
    _profileManager:mod.ProfileManager
    _editedProfileIndex:int  # the index of the profile that's currently being (or most recently been) displayed in the details view

    def __init__(self, onProfileClick, profileManager = mod.ProfileManager()):
        super().__init__()  # Initialize QWidget
        self._profileManager = profileManager
        self._onProfileClick = onProfileClick

        self._profileManager.updatePriorityLists()

        self._layout = widgets.ProfileSelectLayout(None, self._openDetailsView, self._chooseCreateProfileOption, self._profileManager.deleteProfile, self._profileManager.getProfileList)
        self._layout.createWidgetRows()
        self.setLayout(self._layout)

        self._editedProfileIndex = -1

    def addProfile(self, newProfile:mod.Profile, profileName:str = None, saveToFile = True):
        if not profileName or profileName == "":
            dialog = QtWidgets.QInputDialog(self)
            inputStr, okPressed = dialog.getText(self, "Create new mod profile", "New mod profile name:")
            if okPressed and len(inputStr) > 0:
                profileName = inputStr
            else:
                return
        else:
            newProfile.name = profileName
        
        self._profileManager.addProfile(newProfile, profileName, saveToFile)
        self._layout.createProfileWidget(newProfile)

    def saveAndRefresh(self, filename="mods.json", updatedProfile:mod.Profile = None):
        self._profileManager.saveToJson(filename, updatedProfile, self._editedProfileIndex)
        self._layout.createWidgetRows()

    def sortModLists(self): self._profileManager.sortModLists()

    # Simulates importing a mod. Used for testing. RequireValidMod will allow mods without a valid URL to be tested.
    def simulate_import(self, directPath:str=False, requireValidModURL=True):
        if directPath:
            fileName = directPath
        else:
            fileName = "tests/testProfile"

        profile = self._importFromJSON(directPath=fileName, requireValidModURL=requireValidModURL)
        self.addProfile(profile, "Test Profile")

    # Getters
    def getProfile(self, index): return self._profileManager.getProfile(index)

    def getNumProfiles(self): return self._profileManager.getNumProfiles()

    def getProfileList(self): return self._profileManager.getProfileList()

    def getPriorityList(self): return self._profileManager.getPriorityList()

    # Open details view for a given profile
    def _openDetailsView(self, profileNum: int):
        self._editedProfileIndex = profileNum
        profile = self._profileManager.getProfile(profileNum)
        self._onProfileClick(profile)

    # Opens dialog to enter a profile name and choose an import option. Runs when the import button is pressed.
    def _chooseCreateProfileOption(self):
        dialog = MultipleChoiceWindow(
            ["Create new profile", "Import from JSON file", "Import from mods folder", "Cancel"],
            windowTitle="Create a profile",
            showTextInput=True,
            textInput_labelText="Profile Name:",
            textInput_placeholderText="Enter profile name here"
        )

        choice = dialog.exec()
        profileName = dialog.getInputFieldText()

        match choice:
            case 1:
                profile = mod.Profile()
            case 2:
                profile = self._importFromJSON()
            case 3:
                profile = self._importFromFolder()
            case _:
                return

        self.addProfile(profile, profileName=profileName)

    def _importFromJSON(self, directPath:str=None, requireValidModURL = True):
        if directPath:
            path = directPath
        else:
            path, _ = QtWidgets.QFileDialog.getOpenFileName(None, "Select a json file", filter="JSON Files (*.json)")

        return self._profileManager.importFromJSON(path, requireValidModURL)

    def _importFromFolder(self, directory:str = None, showPopups = True):
        if not directory:
            modsFolder = os.path.join(os.environ["APPDATA"], ".minecraft", "mods")
            directory = QtWidgets.QFileDialog.getExistingDirectory(None, "Select a directory", modsFolder)

            if not directory:
                return
            
        if showPopups:
            disclaimerDialog = QtWidgets.QMessageBox(None)
            disclaimerDialog.setWindowTitle("Import Information")
            disclaimerDialog.setText(
                "Mod Tracker will search Modrinth and CurseForge for mods matching the ones in the folder you have selected. "
                "However, the correct mod cannot always be found.\n\n"
                "Please check that Mod Tracker added the correct mods when the import is complete."
            )
            disclaimerDialog.setStandardButtons(QtWidgets.QMessageBox.StandardButton.Ok | QtWidgets.QMessageBox.StandardButton.Cancel)

            disclaimerAcknowledged = disclaimerDialog.exec()
            if disclaimerAcknowledged != QtWidgets.QMessageBox.StandardButton.Ok:
                return

            self._loadingWindow = LoadingWindow()
            self._loadingWindow.show()

        profile = self._profileManager.importFromFolder(directory)

        for i, mod in enumerate(profile.modList):
            mod.tablePosition = i

        if showPopups:
            self._loadingWindow.close()

        return profile

