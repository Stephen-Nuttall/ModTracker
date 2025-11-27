import sys, unittest, random, testData
from PyQt6 import QtWidgets, QtTest, QtCore

class TestModTable(testData.TestCase):
    def testModNameText(self):
        self.populateDetailsView()
        modTable = self._detailsView.getModTable()

        for i in range(len(self._data.modNames)):
            self.assertEqual(modTable.getRowNameText(i), self._data.modNames[i])

    def testModVersionsText(self):
        self.populateDetailsView()
        modTable = self._detailsView.getModTable()

        for i in range(len(self._data.modNames)):
            self.assertEqual(modTable.getRowVersionText(i), self._data.getModCurrentVersion(i))

    def testModPriorityText(self):
        self.populateDetailsView()
        modTable = self._detailsView.getModTable()

        for i in range(len(self._data.modNames)):
            if self._data.getModCurrentVersion(i) == self._data.selectedVersion:
                self.assertEqual(modTable.getRowDropdownBtnText(i), "Ready")
            else:
                self.assertEqual(modTable.getRowDropdownBtnText(i), self._data.getModPriority(i).name)

    def testModReady(self):
        self.populateDetailsView()
        modTable = self._detailsView.getModTable()
        for i in range(len(self._data.modNames)):
            self.assertEqual(modTable.getRowVersionText(i), self._data.getModCurrentVersion(i))

    def testAddMod(self):
        if self._testAPICalls is False:
            self.skipTest("API tests are off")

        self.populateDetailsView()

        modTable = self._detailsView.getModTable()
        oldNumRows = modTable.getNumRows()

        self._detailsView.simulate_enterAndAddMod("https://modrinth.com/mod/sodium")
        self._detailsView.simulate_enterAndAddMod("https://modrinth.com/mod/nether-height-expansion-mod")

        self.assertEqual(modTable.getRowNameText(modTable.getNumRows() - 2), "Sodium")
        self.assertEqual(modTable.getRowVersionText(modTable.getNumRows() - 2), self._data.latestGameVersion)
        self.assertEqual(modTable.getRowDropdownBtnText(modTable.getNumRows() - 2), "Ready")

        self.assertEqual(modTable.getRowNameText(modTable.getNumRows() - 1), "More Nether Mod")
        self.assertEqual(modTable.getRowVersionText(modTable.getNumRows() - 1), "1.21")
        self.assertEqual(modTable.getRowDropdownBtnText(modTable.getNumRows() - 1), "High Priority")

        self.assertEqual(modTable.getNumRows(), oldNumRows + 2)

    def testAddMod_EmptyTable(self):
        if self._testAPICalls is False:
            self.skipTest("API tests are off")

        modTable = self._detailsView.getModTable()
        oldNumRows = modTable.getNumRows()

        self._detailsView.simulate_enterAndAddMod("https://modrinth.com/mod/sodium")

        self.assertEqual(modTable.getRowNameText(modTable.getNumRows() - 1), "Sodium")
        self.assertEqual(modTable.getRowVersionText(modTable.getNumRows() - 1), self._data.latestGameVersion)
        self.assertEqual(modTable.getRowDropdownBtnText(modTable.getNumRows() - 1), "Ready")

        self._detailsView.simulate_enterAndAddMod("https://modrinth.com/mod/nether-height-expansion-mod")

        self.assertEqual(modTable.getRowNameText(modTable.getNumRows() - 2), "Sodium")
        self.assertEqual(modTable.getRowVersionText(modTable.getNumRows() - 2), self._data.latestGameVersion)
        self.assertEqual(modTable.getRowDropdownBtnText(modTable.getNumRows() - 2), "Ready")

        self.assertEqual(modTable.getRowNameText(modTable.getNumRows() - 1), "More Nether Mod")
        self.assertEqual(modTable.getRowVersionText(modTable.getNumRows() - 1), "1.21")
        self.assertEqual(modTable.getRowDropdownBtnText(modTable.getNumRows() - 1), "High Priority")

        self.assertEqual(modTable.getNumRows(), oldNumRows + 2)

    def testRemoveMod(self):
        self.populateDetailsView()

        modTable = self._detailsView.getModTable()
        oldNumRows = modTable.getNumRows()

        nextRowName = modTable.getRowNameText(11)
        deleteBtn = modTable.getRowDeleteBtn(10)

        QtTest.QTest.mouseClick(deleteBtn, QtCore.Qt.MouseButton.LeftButton)

        self.assertEqual(modTable.getRowNameText(10), nextRowName)
        self.assertEqual(modTable.getNumRows(), oldNumRows - 1)

    def testRemoveAllMods(self):
        self.populateDetailsView()

        modTable = self._detailsView.getModTable()
        oldNumRows = modTable.getNumRows()
        for i in range(modTable.getNumRows()):
            deleteBtn = modTable.getRowDeleteBtn(0)
            QtTest.QTest.mouseClick(deleteBtn, QtCore.Qt.MouseButton.LeftButton)
            self.assertEqual(modTable.getNumRows(), oldNumRows - i - 1)
        
        self.assertEqual(modTable.getNumRows(), 0)

    def testMoveMod(self):
        self.populateDetailsView()
        tableLength = len(self._detailsView.getModList())
        self._testRowLocations(0, tableLength, self._moveMod)

    def testSwapMod(self):
        self.populateDetailsView()
        tableLength = len(self._detailsView.getModList())
        self._testRowLocations(0, tableLength, self._swapMod)

    def _testRowLocations(self, min, max, testFunction):
        # Move/swap Up
        row1 = random.randint(min + 1, max - 1)
        row2 = random.randint(min, row1 - 1)
        testFunction(row1, row2)
        
        # Move/swap Down
        row2 = random.randint(min + 1, max - 1)
        row1 = random.randint(min, row2 - 1)
        testFunction(row1, row2)

        # Move/swap with itself
        row = random.randint(min, max - 1)
        testFunction(row, row)

    def _moveMod(self, moveFrom, moveTo):
        modTable = self._detailsView.getModTable()
        tableWidget = modTable._tableWidget

        movingRow = tableWidget.item(moveFrom, 0).text()

        i = moveFrom
        while i < moveTo:
            tableWidget.item(i, 0).setText(tableWidget.item(i+1, 0).text())
            if moveFrom < moveTo:
                i += 1
            elif moveFrom > moveTo:
                i -= 1
        tableWidget.item(moveTo, 0).setText(movingRow)

        modTable._reorderRows()
        modList = modTable.getModList()
        modList.sort()
        modTable.loadTable()

        i = moveFrom
        while i < moveTo:
            self.assertEqual(modList[i].getName(), tableWidget.cellWidget(i, 0).labelText, f"Row {i} was not moved correctly. Range: {moveFrom} -> {moveTo}")
            if moveFrom < moveTo:
                i += 1
            elif moveFrom > moveTo:
                i -= 1
        self.assertEqual(modList[moveTo].getName(), tableWidget.cellWidget(moveTo, 0).labelText, f"Row {moveTo} was not moved to the end of the range correctly. Range: {moveFrom} -> {moveTo}")

    def _swapMod(self, row1, row2):
        modTable = self._detailsView.getModTable()
        modList = modTable.getModList()

        mod1 = modList[row1]
        mod2 = modList[row2]

        modTable._swapRows(row1, row2)
        modList.sort()

        self.assertEqual(mod1, modList[row2])
        self.assertEqual(mod2, modList[row1])


if __name__ == "__main__":
    app = QtWidgets.QApplication(sys.argv)
    unittest.main(verbosity=2,failfast=True)