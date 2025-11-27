import sys, os, unittest, testData, json
from PyQt6 import QtWidgets

base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '.'))
parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(parent_dir)

import mod

class TestImportExport(testData.TestCase):
    createSelectView = True

    def testExport(self):
        profile = mod.Profile(self._data.constructModList(), self._data.priorityList, self._data.selectedVersion, "Test Profile")
        profileDict = profile.createDict()  # dictionary to test against

        self._detailsView.loadNewData(profile)
        self._detailsView.simulate_export(self._fileName)

        try:
            with open(f"{self._fileName}", "r") as f:
                outputDict = json.load(f)  # dictionary from output file.
                self.assertEqual(profileDict, outputDict)  # test if before and after dictionaries match
        except FileNotFoundError:
            self.fail("Output file could not be found.")

    def testImport(self):
        profile = mod.Profile(self._data.constructModList(), self._data.priorityList, self._data.selectedVersion, "Test Profile")
        
        self._selectView.simulate_import(f"{base_dir}\\testProfile.json", requireValidModURL=False)
        importedProfile = self._selectView.getProfile(0)

        self.assertIsNotNone(importedProfile)
        self.assertEqual(profile.modList[0], importedProfile.modList[0])

if __name__ == "__main__":
    app = QtWidgets.QApplication(sys.argv)
    unittest.main(verbosity=2,failfast=True)