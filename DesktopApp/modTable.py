from PyQt6 import QtCore, QtGui, QtWidgets
import mod, widgets


# Manages the data displayed in the mod table and tells ModTable_Widget what to display.
class tableManager():
    # The PyQt6 table widget we are managing
    _tableWidget:'tableWidget'
    # The parent object this widget is attached to
    _parentWidget:QtWidgets.QWidget

    # The list of mod to display
    _modList:list[mod.Mod]
    # The list of priority levels
    _priorityList:list[mod.Priority]
    # The selected version for this profile
    _selectedVersion:str
    
    def __init__(self, parent:QtWidgets.QWidget, modList:list[mod.Mod], priorityList:list[mod.Priority], selectedVersion:str, reloadFunc, saveFunc):
        self._parentWidget = parent
        self._modList = modList
        self._priorityList = priorityList
        self._selectedVersion = selectedVersion
        self._reloadFunc = reloadFunc
        self._saveFunc = saveFunc
        self._tableWidget = tableWidget(self._parentWidget, self._onRowRemoved, self._updateRowOrder, self._reloadFunc)
        self.loadTable()

    def loadNewData(self, modList, priorityList, selectedVersion):
        self._modList = modList
        self._priorityList = priorityList
        self._selectedVersion = selectedVersion
        self.loadTable()

    def createDict(self):
        dict = {}
        for mod in self._modList:
            dict.append(mod.createDict())
        return dict

    def loadTable(self, selectedVersion:str = ""):
        if selectedVersion != "":
            self._selectedVersion = selectedVersion

        self._tableWidget.loadTable(len(self._modList))
        self._tableWidget.setAllRows(self._modList, self._selectedVersion, self._priorityList)

    def reloadTableRow(self, rowNum:int):
        self._tableWidget.setRow(rowNum, self._modList[rowNum], self._selectedVersion, self._priorityList)

    # Getters
    def getModList(self): return self._modList

    def getTableWidget(self): return self._tableWidget

    def getRowNameText(self, rowNum:int):
        if 0 <= rowNum < self._tableWidget.rowCount():
            return self._tableWidget.cellWidget(rowNum, 0).labelText
    
    def getRowVersionText(self, rowNum:int):
        if 0 <= rowNum < self._tableWidget.rowCount():
            return self._tableWidget.item(rowNum, 1).text()

    def getRowDropdownBtnText(self, rowNum:int):
        if 0 <= rowNum < self._tableWidget.rowCount():
            return self._tableWidget.cellWidget(rowNum, 2).text()

    def getRowDropdownBtn(self, rowNum:int):
        return self._tableWidget.getRowDropdownBtn(rowNum)
        
    def getRowDeleteBtn(self, rowNum:int):
        if 0 <= rowNum < self._tableWidget.rowCount():
            return self._tableWidget.cellWidget(rowNum, 3)
    
    def getNumRows(self): return self._tableWidget.rowCount()
    
    def clickRowDeleteBtn(self, rowNum:int):
        if 0 <= rowNum < self._tableWidget.rowCount():
            self._tableWidget.cellWidget(rowNum, 3).click()

    # removes a mod from the table and mod list
    def _onRowRemoved(self, rowNum:int):
        mod = self._modList[rowNum]
        self._modList.remove(mod)

        self._reloadFunc()
        if callable(self._saveFunc):
            self._saveFunc()

    # Updates the tablePosition of each mod to match their row's position in _tableWidget.
    # Called after a drag and drop operation.
    def _updateRowOrder(self):
        sourceRow = self._tableWidget.getSourceRow()
        destinationRow = self._tableWidget.getDestinationRow()
        sourceRowItem = self._tableWidget.item(self._tableWidget.getSourceRow(), 0)

        if not sourceRowItem:
            self._swapRows(sourceRow, destinationRow)
        else:
            self._reorderRows()

        # apply updates
        self._modList.sort()
        self.loadTable()
        self._reloadFunc()

    def _reorderRows(self):
        # for each row (if row is valid), make the corresponding mod's tablePosition match the row's position
        for rowNum in range(self._tableWidget.rowCount()):
            nameWidget = self._tableWidget.cellWidget(rowNum, 0)
            if nameWidget:
                nameWidget.modObj.tablePosition = rowNum
            else:  # an invalid row was found. Stop.
                break

    def _swapRows(self, sourceRow:int, destinationRow:int):
        sourceMod = None
        destinationMod = None

        for modObj in self._modList:
            if modObj.tablePosition == sourceRow:
                sourceMod = modObj
            if modObj.tablePosition == destinationRow:
                destinationMod = modObj

        # destinationMod = self._getModFromRow(destinationRow)
        
        if sourceMod and destinationMod:
            sourceMod.tablePosition = destinationRow
            destinationMod.tablePosition = sourceRow
        else:
            print(f"Failed to swap rows {sourceRow} and {destinationRow}, whose mods were {sourceMod} and {destinationMod}")


# Displays the data held in ModTable_Manager and handles user interaction with the mod table.
class tableWidget(QtWidgets.QTableWidget):
    _appInstance = QtWidgets.QApplication.instance()
    if _appInstance:
        _primaryScreen = _appInstance.primaryScreen()
        _scaleFactor = 1 / _primaryScreen.devicePixelRatio()
    else:
        _scaleFactor = 1

    _parentWidget:QtWidgets.QWidget
    _dropdownBtnList:list['PriorityDropdownManager'] = []
     
    _tableLength = round(1000 * _scaleFactor)
    _tableHeight = round(900 * _scaleFactor)
    _headingHeight = round(40 * _scaleFactor)
    _numColumns = 4
    _columnNames = ["Mod Name", "Latest Version", "Ready/Priority", ""]
    _columnWidths = [
            round(500 * _scaleFactor), 
            round(160 * _scaleFactor), 
            round(250 * _scaleFactor), 
            round(10 * _scaleFactor)
        ]
    _rowHeight = round(50 * _scaleFactor)

    # The font size for everything in the table
    _fontSize = round(14 * _scaleFactor)

    def __init__(self, parent, onRemoveRow=None, onDropCallback=None, reloadFunc=None):
        super().__init__(parent)
        self._parentWidget = parent
        self._onRemoveRow = onRemoveRow
        self._onDropCallback = onDropCallback
        self._reloadFunc = reloadFunc

        self._last_hovered_row = -1
        self._source_row = -1  # The row index where the current drag originated. Set on mouse press.
        self._destination_row = -1  # The row index where the current drag will end. Set on drop.

        self.setGeometry(QtCore.QRect(0, 0, self._tableLength, self._tableHeight))
        self.setObjectName("tableWidget")
        self.setColumnCount(self._numColumns)

        self.setDragDropOverwriteMode(False)
        self.setDragDropMode(QtWidgets.QAbstractItemView.DragDropMode.InternalMove)
        self.setSelectionBehavior(QtWidgets.QAbstractItemView.SelectionBehavior.SelectRows)
        self.setSelectionMode(QtWidgets.QAbstractItemView.SelectionMode.SingleSelection)

    def loadTable(self, rowCount:int):
        # set the row count to make the amount of mods in the list
        self.setRowCount(rowCount)

        # prepare font
        font = QtGui.QFont()
        font.setPointSize(self._fontSize)
        self.setFont(font)

        # configure headings
        for col in range(self._numColumns):
            item = QtWidgets.QTableWidgetItem()
            font = QtGui.QFont()
            font.setPointSize(round(18 * self._scaleFactor))
            item.setFont(font)
            item.setText(self._columnNames[col])
            self.setHorizontalHeaderItem(col, item)
            self.setColumnWidth(col, self._columnWidths[col])

    def setAllRows(self, modList, selectedVersion:str, priorityList):
        for rowNum, mod in enumerate(modList):
            self.setRow(rowNum, mod, selectedVersion, priorityList)

    def setRow(self, rowNum:int, mod:mod.Mod, selectedVersion:str, priorityList):
        self.setRowHeight(rowNum, self._rowHeight)
        
        self._setRowName(rowNum, mod)
        self._setRowVersion(rowNum, mod)
        self._createDropdownBtn(rowNum, mod, selectedVersion, priorityList)
        self._createDeleteBtn(rowNum)

    def removeTableRow(self, rowNum:int):
        self.removeRow(rowNum)
        self._dropdownBtnList.pop(rowNum)
        
        if callable(self._onRemoveRow):
            self._onRemoveRow(rowNum)

    def getRowDropdownBtn(self, rowNum:int):
        if 0 <= rowNum < len(self._dropdownBtnList):
            return self._dropdownBtnList[rowNum]
        
    def clearDropdownList(self):
        self._dropdownBtnList.clear()

    def _createBaseItem(self):
        item = QtWidgets.QTableWidgetItem()

        # create font object and set its font size
        font = QtGui.QFont()
        font.setPointSize(self._fontSize)
        item.setFont(font)

        return item

    def _setRowName(self, rowNum:int, mod:mod.Mod):
        item = self._createBaseItem()

        nameItem = tableNameCell(mod)
        self.setCellWidget(rowNum, 0, nameItem)

        item.setFlags(item.flags() & ~QtCore.Qt.ItemFlag.ItemIsEditable)
        self.setItem(rowNum, 0, item)

    def _setRowVersion(self, rowNum:int, mod:mod.Mod):
        item = self._createBaseItem()

        item.setText(mod.getCurrentVersion())

        item.setFlags(item.flags() & ~QtCore.Qt.ItemFlag.ItemIsEditable)
        self.setItem(rowNum, 1, item)

    # creates a button that opens the priority dropdown menu
    def _createDropdownBtn(self, rowNum:int, mod:mod.Mod, selectedVersion:str, priorityList):
        isReady = selectedVersion in mod.getVersionList()
        dropdownBtn = PriorityDropdownManager(self._parentWidget, mod, priorityList, self._reloadFunc, rowNum, isReady, self._fontSize)
        self.setCellWidget(rowNum, 2, dropdownBtn.getButtonWidget())
        self._dropdownBtnList.append(dropdownBtn)

    def _createDeleteBtn(self, rowNum:int):
        deleteBtn = QtWidgets.QPushButton("X")
        deleteBtn.clicked.connect(lambda : self.removeTableRow(rowNum))
        self.setCellWidget(rowNum, 3, deleteBtn)

    def mousePressEvent(self, event: QtGui.QMouseEvent) -> None:
        try:
            pos = event.position().toPoint()
        except Exception:
            pos = event.pos()

        idx = self.indexAt(pos)
        self._source_row = idx.row() if idx.isValid() else -1

        super().mousePressEvent(event)

    def dropEvent(self, event: QtGui.QDropEvent) -> None:
        try:
            pos = event.position().toPoint()
        except Exception:
            pos = event.pos()

        idx = self.indexAt(pos)
        self._destination_row = idx.row() if idx.isValid() else self.rowCount()
        # print(f"{self._source_row} -> {self._destination_row}")

        super().dropEvent(event)

        if callable(self._onDropCallback):
            try:
                self._onDropCallback()
            except Exception:
                pass

    def getDestinationRow(self): return self._destination_row

    def getSourceRow(self): return self._source_row


# Represents the first cell of a row in the mod table.
# Displays the mod's name and "open link in browser" icon, as well as holds the mod object.
class tableNameCell(QtWidgets.QWidget):
    modObj:mod.Mod
    labelText:str
    _textFontSize = 14
    _iconFontSize = 12

    def __init__(self, modObj:mod.Mod):
        self.modObj = modObj
        super().__init__()

        # Create "open link in browser" icon
        icon_label = widgets.createLabel(labelText="  ", fontSize=self._iconFontSize, useSpecialSymbolFont=True)
        icon_label.setTextInteractionFlags(QtCore.Qt.TextInteractionFlag.TextBrowserInteraction)
        icon_label.setCursor(QtCore.Qt.CursorShape.PointingHandCursor)

        # Make icon clickable (open URL)
        def open_url():
            url = self.modObj.getURL()
            if url:
                QtGui.QDesktopServices.openUrl(QtCore.QUrl(url))
        icon_label.mousePressEvent = lambda event: open_url()

        # Name label to show mod name
        name_label = widgets.createLabel(labelText=self.modObj.getName(),fontSize=self._textFontSize)

        # Layout for both labels
        hbox = QtWidgets.QHBoxLayout()
        hbox.setContentsMargins(0, 0, 0, 0)
        hbox.setSpacing(2)  # Reduce spacing

        icon_label.setSizePolicy(QtWidgets.QSizePolicy.Policy.Fixed, QtWidgets.QSizePolicy.Policy.Fixed)
        name_label.setSizePolicy(QtWidgets.QSizePolicy.Policy.Fixed, QtWidgets.QSizePolicy.Policy.Fixed)

        hbox.addWidget(icon_label)
        hbox.addWidget(name_label)
        hbox.addStretch(1)  # Push content to the left

        self.setLayout(hbox)

        self.labelText = self.modObj.getName()


# Manages the dropdown menu that appears in the third column of the table which allows
# the user to select a priorty level, or create a new priority level.
class PriorityDropdownManager():
    _dropdownWidget:widgets.DropdownBtn

    _parentWidget:QtWidgets.QWidget
    _mod:mod.Mod
    _priorityList:list[mod.Priority]
    _rowNum:int
    _fontSize:int

    def __init__(self, parentWidget:QtWidgets.QWidget, mod:mod.Mod, priorityList:list[mod.Priority],
                 refreshFunc, rowNum:int, isReady:bool, fontSize:int):
        # set attributes
        self._parentWidget = parentWidget
        self._mod = mod
        self._priorityList = priorityList
        self._refreshFunc = refreshFunc
        self._rowNum = rowNum
        self._fontSize = fontSize

        # run setup functions
        self._createDropdownWidget()
        self._customizeAppearance(isReady)

    def clickDropdownOption(self, index, priorityName:str = None, priorityColor:QtGui.QColor = None):
        menuWidget = self._dropdownWidget.getMenuWidget()
        listLength = len(menuWidget.actions()) - 1

        if 0 <= index < listLength:
            self._changeModPriority(index)
        elif index == listLength:
            if priorityName:
                self._addModPriority(priorityName, priorityColor)
            else:
                self._showPrompts()

    def getDropdownWidget(self):
        return self._dropdownWidget

    def getButtonWidget(self):
        return self._dropdownWidget.getButtonWidget()
    
    def getMenuWidget(self):
        return self._dropdownWidget.getMenuWidget()

    def _createDropdownWidget(self):
        dropdownOptions = []
        for priorityLevel in self._priorityList:
            dropdownOptions.append(priorityLevel.name)
        dropdownOptions.append("Add Priority Level")

        try:
            curPriorityIndex = self._priorityList.index(self._mod.priority)
        except ValueError:
            curPriorityIndex = 0

        self._dropdownWidget = widgets.DropdownBtn(self._parentWidget, dropdownOptions, self.clickDropdownOption, selectedOption=curPriorityIndex, includeCarrot=False)

    def _customizeAppearance(self, isReady:bool):
        if (isReady):
            backgroundColor = QtGui.QColor(0, 255, 0)
            self._dropdownWidget.setCustomButtonText("Ready")
        else:
            priority = self._mod.priority
            priorityColor = QtGui.QColor(priority.r, priority.g, priority.b)
            backgroundColor = priorityColor
        
        self._dropdownWidget.setStyleSheet(backgroundColor.name())

    def _changeModPriority(self, index, refreshEverything = False):
        self._mod.priority = self._priorityList[index]

        if self._refreshFunc and callable(self._refreshFunc):
            self._refreshFunc(self._rowNum, refreshEverything)

    def _showPrompts(self):
        inputStr, okPressed = QtWidgets.QInputDialog.getText(self._parentWidget, "Create new priority level", "Priority name:")
        
        if okPressed:
            selectedColor = QtWidgets.QColorDialog.getColor()
            if (selectedColor.isValid()):
                self._addModPriority(inputStr, selectedColor)

    def _addModPriority(self, modName:str, color:QtGui.QColor):
        if not modName:
            modName = "New Priority Level"

        self._priorityList.append(mod.Priority(modName,color.red(), color.green(), color.blue()))
        self._changeModPriority(len(self._priorityList) - 1, True)  # select new priority level
