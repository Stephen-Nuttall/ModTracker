from PyQt6 import QtCore, QtGui, QtWidgets, QtCharts
import os, mod

_appInstance = QtWidgets.QApplication.instance()
if _appInstance:
    _primaryScreen = _appInstance.primaryScreen()
    _scaleFactor = 1 / _primaryScreen.devicePixelRatio()
else:
    _scaleFactor = 1

_btnFontSize = 18
_specialSymbolFontSize = 16
_labelFontSize = 12

_fontelloPath:str

# Button that when clicked, displays a dropdown menu.
class DropdownBtn():
    global _scaleFactor
    
    _parentWidget:QtWidgets.QWidget
    _menuOptions:list[str]
    _buttonRect:QtCore.QRect
    _selectedOption:int
    _fontSize:int
    _includeCarrot:bool
    _customButtonText:str

    _buttonWidget:QtWidgets.QPushButton
    _menuWidget:QtWidgets.QMenu


    def __init__(self, parentWidget:QtWidgets.QWidget, menuOptions:list[str], onOptionClick = None,
                 buttonRect:QtCore.QRect = None, selectedOption = 0, buttonFontSize = round(14 * _scaleFactor),
                 includeCarrot = True, customButtonText:str = None):
        self._parentWidget = parentWidget
        self._menuOptions = menuOptions
        self._onOptionClick = onOptionClick
        self._selectedOption = selectedOption
        self._fontSize = buttonFontSize
        self._includeCarrot = includeCarrot
        self._customButtonText = customButtonText

        if buttonRect:
            scaledGeometry = QtCore.QRect(
                round(buttonRect.x() * _scaleFactor),
                round(buttonRect.y() * _scaleFactor),
                round(buttonRect.width() * _scaleFactor),
                round(buttonRect.height() * _scaleFactor)
            )
            self._buttonRect = scaledGeometry
        else:
            self._buttonRect = buttonRect

        self._createButtonWidget()
        self._createMenuWidget()

    def clickDropdownOption(self, index):
        if self._menuOptions and 0 <= index < len(self._menuWidget.actions()):
            self._clickOption(index)

    def setStyleSheet(self, backgroundColor = "gray", textColor = "black", fontSize:int = None):
        if not fontSize:
            fontSize = self._fontSize

        self._buttonWidget.setStyleSheet(f"background-color: {backgroundColor};"
                                          + f"color: {textColor};"
                                          + f"font-size: {fontSize}px;")
        
    def setCustomButtonText(self, customButtonText:str):
        self._customButtonText = customButtonText
        self._buttonWidget.setText(self._customButtonText)

    def getSelectedOption(self):
        return self._menuOptions[self._selectedOption]
    
    def getOptions(self):
        return self._menuOptions

    def getButtonWidget(self):
        return self._buttonWidget
    
    def getMenuWidget(self):
        return self._menuWidget

    def _createButtonWidget(self):
        # create font for button
        buttonFont = QtGui.QFont()
        buttonFont.setPointSize(self._fontSize)
        
        # create button
        self._buttonWidget = QtWidgets.QPushButton(parent=self._parentWidget)
        if self._buttonRect:
            self._buttonWidget.setGeometry(self._buttonRect)
        self._buttonWidget.setFont(buttonFont)
        self._updateButtonText()

        self._buttonWidget.clicked.connect(
            lambda : self._menuWidget.exec(
                self._buttonWidget.mapToGlobal(self._buttonWidget.rect().bottomLeft())))
        
    def _createMenuWidget(self):
        self._menuWidget = QtWidgets.QMenu(self._parentWidget)

        for i in range(len(self._menuOptions)):
            self._menuWidget.addAction(self._menuOptions[i], lambda index=i : self._clickOption(index))

    def _clickOption(self, index):
        self._selectedOption = index
        self._updateButtonText()
        
        if self._onOptionClick and callable(self._onOptionClick):
            self._onOptionClick(index)

    def _updateButtonText(self):
        if self._customButtonText:
            self._buttonWidget.setText(self._customButtonText)
        elif self._includeCarrot:
            self._buttonWidget.setText(self._menuOptions[self._selectedOption] + " ▾")
        else:
            self._buttonWidget.setText(self._menuOptions[self._selectedOption])


# This is the pie chart that displays how many of the mods in a profile are ready,
# and then breaks down the rest by priority level.
class PieChart():
    global _scaleFactor
    
    _parentWidget: QtWidgets.QWidget
    _modList: list[mod.Mod]
    _selectedVersion: str

    _chartView: QtCharts.QChartView
    _series: QtCharts.QPieSeries
    _readySlice = mod.Priority("Ready", 0, 255, 0)
    _sliceSizes = {_readySlice: 0}

    _titleFontSize = round(24 * _scaleFactor)
    _labelFontSize = round(14 * _scaleFactor)

    def __init__(self, parent:QtWidgets.QWidget, modList:list[mod.Mod], selectedVersion:str):
        # Assign variables
        self._parentWidget = parent
        self._modList = modList
        self._selectedVersion = selectedVersion

        self._series = QtCharts.QPieSeries()
        self._chartView = QtCharts.QChartView(parent=self._parentWidget)
        self._chartView.setRenderHint(QtGui.QPainter.RenderHint.Antialiasing)
        self._chartView.setGeometry(QtCore.QRect(
            round(1000 * _scaleFactor), 
            round(50 * _scaleFactor), 
            round(900 * _scaleFactor), 
            round(900 * _scaleFactor)
        ))

        self.loadChart()

    def getSliceSizes(self): return self._sliceSizes

    def loadNewData(self, modList, priorityList, selectedVersion):
        self._modList = modList
        self._priorityList = priorityList
        self._selectedVersion = selectedVersion
        self.loadChart()

    def loadChart(self, selectedVersion:str = ""):
        if selectedVersion != "":
            self._selectedVersion = selectedVersion

        # Calculate the size of each slice
        self._calculateSliceSizes()

        # Create chart and add pie slices to it
        chart = QtCharts.QChart()
        self._createSeries()
        chart.addSeries(self._series)

        # Create title text
        title_font = QtGui.QFont()
        title_font.setPointSize(self._titleFontSize)
        chart.setTitle('Mod Priority Chart')
        chart.setTitleFont(title_font)
        if (isDarkTheme()):
            chart.setTitleBrush(QtGui.QBrush(QtGui.QColor("white")))

        # Hide legend and set background color
        chart.legend().hide()
        chart.setBackgroundBrush(QtGui.QColor(0, 0, 0, 0))

        # Update the existing chart view
        self._chartView.setChart(chart)

    def _calculateSliceSizes(self):
        self._sliceSizes = {self._readySlice: 0}
        for mod in self._modList:
            if self._selectedVersion in mod.getVersionList():
                self._sliceSizes[self._readySlice] += 1
            else:
                if mod.priority in self._sliceSizes:
                    self._sliceSizes[mod.priority] += 1
                else:
                    self._sliceSizes[mod.priority] = 1

    def _createSeries(self):
        label_font = QtGui.QFont()
        label_font.setPointSize(self._labelFontSize)
        darkTheme = isDarkTheme()

        # Create and populate chart series
        self._series.__init__()
        self._series.clear()

        i = 0
        for priority, count in self._sliceSizes.items():
            self._series.append(priority.name, count)
            slice = self._series.slices()[i]

            if priority == self._readySlice:
                slice.setExploded()

            priorityColor = QtGui.QColor(priority.r, priority.g, priority.b)
            slice.setColor(priorityColor)
            slice.setBorderColor(priorityColor)

            slice.setLabelVisible()
            slice.setLabelFont(label_font)
            if darkTheme:
                slice.setLabelColor(QtGui.QColor("white"))
            i += 1


# Displays basic information about a profile that when clicked, will open the details view for that profile.
# Can optionally be set to only display a + sign instead of default labels.
class ProfileButton(QtWidgets.QPushButton):
    global _scaleFactor
    
    profile:mod.Profile
    widgetNum:int

    _widgetSize = 400
    _titleFontSize = 24
    _subtitleFontSize = 20
    _plusSignFontSize = round(24 * _scaleFactor)

    _nameLabel:QtWidgets.QLabel
    _modCountLabel:QtWidgets.QLabel
    _percentReadyLabel:QtWidgets.QLabel
    _deleteBtn:QtWidgets.QPushButton

    def __init__(self, onClick, profile:mod.Profile = None, onDelete = None, widgetNum:int = None, onlyDisplayPlusSign = False):
        self.profile = profile
        self.widgetNum = widgetNum
        self._onClick = onClick
        self._onDelete = onDelete
        super().__init__()

        self.setFixedSize(round(self._widgetSize * _scaleFactor), round(self._widgetSize * _scaleFactor))
        self.clicked.connect(self._clicked)

        if onlyDisplayPlusSign:
            self.setText("+")
            font = QtGui.QFont()
            font.setPointSize(self._plusSignFontSize)
            font.setBold(True)
            self.setFont(font)
        else:
            self._nameLabel = createLabel(
                self,
                self.profile.name,
                QtCore.QRect(10, 25, self._widgetSize - 20, 150),
                fontSize=self._titleFontSize,
                bold=True,
                alignment=QtCore.Qt.AlignmentFlag.AlignCenter,
                wordWrap=True
            )

            self._modCountLabel = createLabel(
                self,
                f"{len(self.profile.modList)} mods",
                QtCore.QRect(10, 215, self._widgetSize - 20, 30),
                fontSize=self._subtitleFontSize,
                alignment=QtCore.Qt.AlignmentFlag.AlignCenter
            )

            self._percentReadyLabel = createLabel(
                self,
                f"{self.profile.getPercentReady():.2f}% ready\nfor {self.profile.selectedVersion}",
                QtCore.QRect(10, 280, self._widgetSize - 20, 60),
                fontSize=self._subtitleFontSize,
                alignment=QtCore.Qt.AlignmentFlag.AlignCenter
            )
            
            if self._onDelete and callable(self._onDelete):
                self._deleteBtn = createButton(self, "X", QtCore.QRect(self._widgetSize - 55, 5, 50, 50), self._deleteBtnClicked)

    def _clicked(self):
        if self._onClick and callable(self._onClick):
            if self.widgetNum is None:
                self._onClick()
            else:
                self._onClick(self.widgetNum)

    def _deleteBtnClicked(self):
        if self._onDelete and callable(self._onDelete):
            self._onDelete(self.widgetNum)


# Grid layout embedded in the profile select window that contains all the profile buttons.
class ProfileSelectLayout(QtWidgets.QGridLayout):
    global _scaleFactor

    _profileWidgets:list[QtWidgets.QPushButton] = [] # currently unused
    _addProfileWidget:QtWidgets.QPushButton

    _widgetSize = round(400 * _scaleFactor) # size of the profile widget (width and height)
    _widgetSpacing = round(35 * _scaleFactor) # spacing between profile widgets
    _widgetsPerRow = 4 # number of profile widgets per row
    _maxWidgets = 8 # maximum number of profile widgets
    _numWidgets = 0 # current number of profile widgets
    _rowPadding = 30 * _scaleFactor # padding between the first row of profile widgets and the top of the window

    def __init__(self, parent, onProfileClick, onCreateProfile, onProfileDelete, getProfileList):
        super().__init__(parent)
        self._onProfileClick = onProfileClick
        self._onCreateProfile = onCreateProfile
        self._onProfileDelete = onProfileDelete
        self._getProfileList = getProfileList

        self._addProfileWidget = None

        self.setSpacing(self._widgetSpacing)

    # Creates all profile widgets. Creates an add profile widget if there are no profiles
    def createWidgetRows(self):
        profileList = self._getProfileList()
            
        self._profileWidgets = []
        self._numWidgets = 0

        if (len(profileList) == 0):
            self._createAddProfileWidget()
        else:
            for profile in profileList:
                self.createProfileWidget(profile)

    # Create a new widget that will display basic information about a profile and when clicked, will open the details view for that profile
    def createProfileWidget(self, profile:mod.Profile):
        if (self._numWidgets >= self._maxWidgets):
            return

        # Create a profile widget, which is a button that will be used to open the profile
        profileWidget = ProfileButton(self._onProfileClick, profile=profile, onDelete=self._deleteProfile, widgetNum=self._numWidgets)

        # Add to list of profile widgets
        self._profileWidgets.append(profileWidget)
        self._insertWidget(profileWidget)
        self._numWidgets += 1

        self._createAddProfileWidget()

    def _deleteWidgetRows(self):
        while self.count():
            item = self.takeAt(0)
            widget = item.widget()
            if widget is not None:
                widget.setParent(None)
                widget.deleteLater()

        self._numWidgets = 0
    
    def _deleteProfile(self, numProfile):
        profileWidget = self._profileWidgets[numProfile]
        self._profileWidgets.remove(profileWidget)
        self.removeWidget(profileWidget)
        profileWidget.deleteLater()

        self._onProfileDelete(numProfile)

        self._deleteWidgetRows()
        self.createWidgetRows()

    # Creates an additional widget with a plus sign that when clicked, will create a new profile
    def _createAddProfileWidget(self):
        # delete previous profile widget
        if self._addProfileWidget:
            self._addProfileWidget.deleteLater()

        if (self._numWidgets >= self._maxWidgets):
            return

        self._addProfileWidget = ProfileButton(self._onCreateProfile, onlyDisplayPlusSign=True)
        self._insertWidget(self._addProfileWidget)

    def _insertWidget(self, profileButton:ProfileButton):
        row = self._numWidgets // self._widgetsPerRow
        col = self._numWidgets % self._widgetsPerRow
        self.addWidget(profileButton, row, col)

# ------------------------------
# HELPER FUNCTIONS FUNCTIONS
# ------------------------------

# Automatically runs when widgets is imported in another file.
def setFontelloPath():
    global _fontelloPath
    parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    _fontelloPath = os.path.join(parent_dir, "fonts", "fontello.ttf")

def _createLabelFont(fontSize:int = 0, bold = False, useSpecialSymbolFont = False):
    font = QtGui.QFont()
    
    if useSpecialSymbolFont:
        # Load custom font for special symbol
        font.setPointSize(round(_specialSymbolFontSize * _scaleFactor))
        global _fontelloPath
        font_path = _fontelloPath
        font_id = QtGui.QFontDatabase.addApplicationFont(font_path)
        if font_id != -1:
            font_families = QtGui.QFontDatabase.applicationFontFamilies(font_id)
            if font_families:
                font.setFamily(font_families[0])
    else:
        font.setPointSize(round(_labelFontSize * _scaleFactor))

    if fontSize > 0:
        font.setPointSize(round(fontSize * _scaleFactor))

    font.setBold(bold)

    return font

# Helper function for quickly making and customizing a QButton
def createButton(
        parent = None,
        btnText:str = "Button",
        geometry:QtCore.QRect = QtCore.QRect(),
        onClickFunc = None,
        objectName:str = None,
        fontSize:int = 0,
        bold = False,
        useSpecialSymbolFont = False,
        minimumWidth = 0,
        minimumHeight = 0
    ):
    if fontSize <= 0:
        fontSize = _btnFontSize
    
    font = _createLabelFont(fontSize, bold, useSpecialSymbolFont)

    button = QtWidgets.QPushButton(parent=parent)
    button.setFont(font)
    button.setText(btnText)

    scaledGeometry = QtCore.QRect(
        round(geometry.x() * _scaleFactor),
        round(geometry.y() * _scaleFactor),
        round(geometry.width() * _scaleFactor),
        round(geometry.height() * _scaleFactor)
    )
    button.setGeometry(scaledGeometry)

    if onClickFunc:
        button.clicked.connect(onClickFunc)

    if objectName:
        button.setObjectName(objectName)

    if minimumWidth > 0:
        button.setMinimumWidth(round(minimumWidth * _scaleFactor))

    if minimumHeight > 0:
        button.setMinimumHeight(round(minimumHeight * _scaleFactor))

    return button

# Helper function for quickly making and customizing a QLabel
def createLabel(
        parent = None,
        labelText:str = "Label",
        geometry:QtCore.QRect = QtCore.QRect(),
        objectName:str = None,
        fontSize:int = 0,
        bold = False,
        useSpecialSymbolFont = False,
        alignment:QtCore.Qt.AlignmentFlag = None, wordWrap = False
    ):
    font = _createLabelFont(fontSize, bold, useSpecialSymbolFont)

    label = QtWidgets.QLabel(parent=parent)
    label.setFont(font)
    label.setText(labelText)
    label.setWordWrap(wordWrap)

    scaledGeometry = QtCore.QRect(
        round(geometry.x() * _scaleFactor),
        round(geometry.y() * _scaleFactor),
        round(geometry.width() * _scaleFactor),
        round(geometry.height() * _scaleFactor)
    )
    label.setGeometry(scaledGeometry)

    if objectName != None:
        label.setObjectName(objectName)

    if alignment != None:
        label.setAlignment(alignment)

    return label

# Helper function for quickly making and customizing a QLineEdit
def createTextField(
        parent = None,
        placeholderText:str = "",
        geometry:QtCore.QRect = QtCore.QRect(),
        objectName:str = None,
        fontSize:int = 0,
        bold = False,
        useSpecialSymbolFont = False,
        alignment:QtCore.Qt.AlignmentFlag = None
    ):
    font = _createLabelFont(fontSize, bold, useSpecialSymbolFont)
    
    textField = QtWidgets.QLineEdit(parent=parent)
    textField.setFont(font)
    textField.setPlaceholderText(placeholderText)
    
    scaledGeometry = QtCore.QRect(
        round(geometry.x() * _scaleFactor),
        round(geometry.y() * _scaleFactor),
        round(geometry.width() * _scaleFactor),
        round(geometry.height() * _scaleFactor)
    )
    textField.setGeometry(scaledGeometry)

    if objectName != None:
        textField.setObjectName(objectName)

    if alignment != None:
        textField.setAlignment(alignment)

    return textField

def isDarkTheme():
    # Access Windows registry to check the theme setting
    settings = QtCore.QSettings("HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize", QtCore.QSettings.Format.NativeFormat)

    # The registry key "AppsUseLightTheme" determines the theme
    light_theme = settings.value("AppsUseLightTheme", 1, type=int)
    return light_theme == 0  # 0 means dark theme, 1 means light theme


# Automatically set fontello path when widgets is imported.
setFontelloPath()