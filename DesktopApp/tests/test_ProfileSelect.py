import sys, os, unittest, testData
from PyQt6 import QtWidgets, QtTest, QtCore, QtGui

# Add the parent directory to the Python path
parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(parent_dir)

import mod

class TestProfileSelectView(testData.TestCase):
    createDetailsView = False
    createSelectView = True

    def testCreateWindow(self):
        self.assertIsNotNone(self._selectView)

    def testAddProfile(self):
        testDataProfile = mod.Profile(self._data.constructModList())
        manualProfile = mod.Profile(
            [mod.Mod("Mod 1", -1, ["1.19.2", "1.21.1"], mod.Priority("custom priority level 1")),
            mod.Mod("Mod 2", -1, ["1.21.1", "1.21.3"], mod.Priority("custom priority level 2")),
            mod.Mod("Mod 3", -1, ["1.16.4", "1.19.2"], mod.Priority("custom priority level 3"))]
        )
        emptyProfile = mod.Profile()

        self._selectView.addProfile(testDataProfile, profileName="New Profile", saveToFile=False)
        self._selectView.addProfile(manualProfile, profileName="New Profile", saveToFile=False)
        self._selectView.addProfile(emptyProfile, profileName="New Profile", saveToFile=False)
        
        profileList = self._selectView.getProfileList()
        priorityList = self._selectView.getPriorityList()

        self.assertEqual(len(profileList), 3)
        self.assertEqual(len(priorityList), 5)

        self.assertEqual(profileList[0], testDataProfile)
        self.assertEqual(profileList[1], manualProfile)
        self.assertEqual(profileList[2], emptyProfile)

    def testOpenDetailsView(self):
        testDataProfile = mod.Profile(self._data.constructModList())
        self._selectView.addProfile(testDataProfile, profileName="New Profile", saveToFile=False)

        QtTest.QTest.mouseClick(self._selectView._layout._profileWidgets[0], QtCore.Qt.MouseButton.LeftButton)

        self.assertIsNotNone(self._detailsView)

        modTable = self._detailsView.getModTable()
        modList = self._data.modNames

        for i in range(len(self._data.modNames)):
            self.assertEqual(modTable.getRowNameText(i), modList[i], f"Element #{i} of {len(modList)} (0 indexed)")

    def testAddPriorityLevel(self):
        newPriorityName = "New Priority"
        newPriorityColor = QtGui.QColor(255, 255, 255)
        
        testDataProfile = mod.Profile(self._data.constructModList())
        self._selectView.addProfile(testDataProfile, profileName="New Profile")
        QtTest.QTest.mouseClick(self._selectView._layout._profileWidgets[0], QtCore.Qt.MouseButton.LeftButton)

        priorityList = self._selectView.getPriorityList()
        self.assertEqual(len(priorityList), 2)
        
        modTable = self._detailsView.getModTable()
        dropdownBtn = modTable.getRowDropdownBtn(0)
        dropdownBtn.clickDropdownOption(2, newPriorityName, newPriorityColor)

        priorityList = self._selectView.getPriorityList()
        self.assertEqual(len(priorityList), 3)
        self.assertEqual(priorityList[2].name, newPriorityName)

    def testAddTooManyProfiles(self):
        # max amount of profiles is 8. There should only be 8 widgets, even if there's 9 profiles.
        profileList = [mod.Profile(), mod.Profile(), mod.Profile(), mod.Profile(),
                       mod.Profile(), mod.Profile(), mod.Profile(), mod.Profile(), mod.Profile()]

        for profile in profileList:
            self._selectView.addProfile(profile, profileName="New Profile", saveToFile=False)

        self.assertEqual(len(self._selectView._layout._profileWidgets), 8)
        self.assertFalse(self._selectView._layout._addProfileWidget.isHidden())

    def testDeleteProfile(self):
        profile1 = mod.Profile()
        profile2 = mod.Profile()

        self._selectView.addProfile(profile1, profileName="New Profile", saveToFile=False)
        self._selectView.addProfile(profile2, profileName="New Profile", saveToFile=False)

        self._selectView._layout._deleteProfile(0)

        profileList = self._selectView.getProfileList()
        widgetList = self._selectView._layout._profileWidgets

        self.assertEqual(profileList[0], profile2)
        self.assertNotIn(profile1, profileList)
        self.assertEqual(len(widgetList), 1)

if __name__ == "__main__":
    app = QtWidgets.QApplication(sys.argv)
    unittest.main(verbosity=2,failfast=True)