import sys, unittest, testData
from PyQt6 import QtWidgets, QtGui

class TestPieChart(testData.TestCase):
    def testEmptyWindow(self):
        chart = self._detailsView.getPieChart()
        sliceList = list(chart.getSliceSizes().keys())

        self.assertEqual(len(sliceList), 1)
        self.assertEqual(chart.getSliceSizes().get(sliceList[0]), 0)

    def testPrepopulatedWindow(self):
        self.populateDetailsView()
        chart = self._detailsView.getPieChart()
        sliceList = list(chart.getSliceSizes().keys())

        self.assertEqual(len(sliceList), 3)
        self.assertEqual(chart.getSliceSizes().get(sliceList[0]), 7)
        self.assertEqual(chart.getSliceSizes().get(sliceList[1]), 9)
        self.assertEqual(chart.getSliceSizes().get(sliceList[2]), 7)

    def testAddMod_ReadyEmpty(self):
        if self._testAPICalls is False:
            self.skipTest("API tests are off")

        chart = self._detailsView.getPieChart()
        sliceList = list(chart.getSliceSizes().keys())

        self._detailsView.simulate_enterAndAddMod("https://modrinth.com/mod/sodium")

        self.assertEqual(len(sliceList), 1)
        self.assertEqual(chart.getSliceSizes().get(sliceList[0]), 1)

    def testAddMod_ReadyPrepopulated(self):
        if self._testAPICalls is False:
            self.skipTest("API tests are off")

        self.populateDetailsView()
        chart = self._detailsView.getPieChart()
        sliceList = list(chart.getSliceSizes().keys())

        self._detailsView.simulate_enterAndAddMod("https://modrinth.com/mod/sodium")

        self.assertEqual(len(sliceList), 3)
        self.assertEqual(chart.getSliceSizes().get(sliceList[0]), 8)
        self.assertEqual(chart.getSliceSizes().get(sliceList[1]), 9)
        self.assertEqual(chart.getSliceSizes().get(sliceList[2]), 7)

    def testAddMod_PreExistingPriority(self):
        if self._testAPICalls is False:
            self.skipTest("API tests are off")

        self.populateDetailsView()
        chart = self._detailsView.getPieChart()
        sliceList = list(chart.getSliceSizes().keys())

        self._detailsView.simulate_enterAndAddMod("https://modrinth.com/mod/nether-height-expansion-mod")

        self.assertEqual(self._detailsView.getModTable().getNumRows(), 24)

        self.assertEqual(len(sliceList), 3)
        self.assertEqual(chart.getSliceSizes().get(sliceList[0]), 7)
        self.assertEqual(chart.getSliceSizes().get(sliceList[1]), 10)
        self.assertEqual(chart.getSliceSizes().get(sliceList[2]), 7)

    def testAddNewPriority(self):
        newPriorityName = "New Priority"
        newPriorityColor = QtGui.QColor(255, 255, 255)

        self.populateDetailsView()
        chart = self._detailsView.getPieChart()
        sliceList = list(chart.getSliceSizes().keys())
        modTable = self._detailsView.getModTable()

        for modIndex in range(0, 2):
            # priorityName = newPriorityName + f" {modIndex}"
            sliceList = list(chart.getSliceSizes().keys())

            oldPriority = modTable.getRowDropdownBtnText(modIndex)
            oldSliceLength = len(sliceList)
            oldSliceSizes = []
            for i in range(len(sliceList)):
                oldSliceSizes.append(chart.getSliceSizes().get(sliceList[i]))
            
            modTable.getRowDropdownBtn(modIndex).clickDropdownOption(2, newPriorityName, newPriorityColor)

            sliceList = list(chart.getSliceSizes().keys())
            if oldPriority == "Ready":
                self.assertEqual(modTable.getRowDropdownBtnText(modIndex), "Ready")
                self.assertEqual(len(sliceList), oldSliceLength)
            else:
                self.assertEqual(modTable.getRowDropdownBtnText(modIndex), newPriorityName)
                self.assertEqual(len(sliceList), oldSliceLength + 1)
            self.assertEqual(modTable.getModList()[modIndex].priority.name, newPriorityName)

if __name__ == "__main__":
    app = QtWidgets.QApplication(sys.argv)
    unittest.main(verbosity=2)