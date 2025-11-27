import sys, unittest, testData
from PyQt6 import QtWidgets, QtGui

class TestDropdownBtn(testData.TestCase):
    def testChangeModPriority(self):
        newPriorityName = "New Priority"
        newPriorityColor = QtGui.QColor(255, 255, 255)
        
        self.populateDetailsView()
        modTable = self._detailsView.getModTable()

        for i in range(modTable.getNumRows()):
            oldPriority = modTable.getRowDropdownBtnText(i)
            if oldPriority is None:
                self.fail(
                    "Attempted to access a row in the mod table that doesn't exist! " +
                    f"Index accessed: {i}. Number of table rows: {modTable.getNumRows()}"
                )

            dropdownBtn = modTable.getRowDropdownBtn(i)

            if oldPriority == "Ready":
                dropdownBtn.clickDropdownOption(0)
                self.assertEqual(modTable.getRowDropdownBtnText(i), "Ready")
            elif oldPriority == "Low Priority":
                dropdownBtn.clickDropdownOption(0)
                self.assertEqual(modTable.getRowDropdownBtnText(i), "High Priority")
            elif oldPriority == "High Priority":
                dropdownBtn.clickDropdownOption(1)
                self.assertEqual(modTable.getRowDropdownBtnText(i), "Low Priority")

    def testAddModPriority(self):
        newPriorityName = "New Priority"
        newPriorityColor = QtGui.QColor(255, 255, 255)

        self.populateDetailsView()
        modTable = self._detailsView.getModTable()
        for i in range(modTable.getNumRows()):
            oldPriority = modTable.getRowDropdownBtnText(i)
            if oldPriority is None:
                self.fail(
                    "Attempted to access a row in the mod table that doesn't exist! " +
                    f"Index accessed: {i}. Number of table rows: {modTable.getNumRows()}"
                )

            modTable.getRowDropdownBtn(i).clickDropdownOption(2, newPriorityName, newPriorityColor)

            if oldPriority == "Ready":
                self.assertEqual(modTable.getRowDropdownBtnText(i), "Ready")
            else:
                self.assertEqual(modTable.getRowDropdownBtnText(i), newPriorityName)

if __name__ == "__main__":
    app = QtWidgets.QApplication(sys.argv)
    unittest.main(verbosity=2, failfast=True)