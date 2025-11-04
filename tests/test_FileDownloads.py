import sys, os, unittest, testData
from PyQt6 import QtWidgets


class TestFileDownloads(testData.TestCase):
    def testModrinthDownload(self):
        if self._testAPICalls is False:
            self.skipTest("API tests are off")

        self._detailsView.simulate_enterAndAddMod("https://modrinth.com/mod/entityculling")
        self._detailsView.simulate_enterAndAddMod("https://modrinth.com/mod/nether-height-expansion-mod")

        self._detailsView.getProfile().selectedVersion = "1.21.6"

        forgeResults_1 = self._detailsView.simulate_downloadMod(0)
        self.assertTrue(forgeResults_1[0])
        self.assertFalse(forgeResults_1[1])

        fabricResults_1 = self._detailsView.simulate_downloadMod(1)
        self.assertTrue(fabricResults_1[0])
        self.assertFalse(fabricResults_1[1])
        
        neoforgeResults_1 = self._detailsView.simulate_downloadMod(2)
        self.assertTrue(neoforgeResults_1[0])
        self.assertFalse(neoforgeResults_1[1])
        
        quiltResults_1 = self._detailsView.simulate_downloadMod(3)
        self.assertFalse(quiltResults_1[0])
        self.assertFalse(quiltResults_1[1])

        self._detailsView.getProfile().selectedVersion = "1.21"

        forgeResults_2 = self._detailsView.simulate_downloadMod(0)
        self.assertTrue(forgeResults_2[0])
        self.assertFalse(forgeResults_2[1])

        fabricResults_2 = self._detailsView.simulate_downloadMod(1)
        self.assertTrue(fabricResults_2[0])
        self.assertTrue(fabricResults_2[1])
        
        neoforgeResults_2 = self._detailsView.simulate_downloadMod(2)
        self.assertTrue(neoforgeResults_2[0])
        self.assertFalse(neoforgeResults_2[1])
        
        quiltResults_2 = self._detailsView.simulate_downloadMod(3)
        self.assertFalse(quiltResults_2[0])
        self.assertFalse(quiltResults_2[1])

    def testCurseforgeDownload(self):
        if self._testAPICalls is False:
            self.skipTest("API tests are off")

        self._detailsView.simulate_enterAndAddMod("https://www.curseforge.com/minecraft/mc-mods/entityculling")
        self._detailsView.simulate_enterAndAddMod("https://www.curseforge.com/minecraft/mc-mods/ice-cream-mini-sword-and-new-trades")

        self._detailsView.getProfile().selectedVersion = "1.21.6"

        forgeResults_1 = self._detailsView.simulate_downloadMod(0)
        self.assertTrue(forgeResults_1[0])
        self.assertFalse(forgeResults_1[1])

        fabricResults_1 = self._detailsView.simulate_downloadMod(1)
        self.assertTrue(fabricResults_1[0])
        self.assertFalse(fabricResults_1[1])
        
        neoforgeResults_1 = self._detailsView.simulate_downloadMod(2)
        self.assertTrue(neoforgeResults_1[0])
        self.assertFalse(neoforgeResults_1[1])
        
        quiltResults_1 = self._detailsView.simulate_downloadMod(3)
        self.assertFalse(quiltResults_1[0])
        self.assertFalse(quiltResults_1[1])

        self._detailsView.getProfile().selectedVersion = "1.20.1"

        forgeResults_2 = self._detailsView.simulate_downloadMod(0)
        self.assertTrue(forgeResults_2[0])
        self.assertTrue(forgeResults_2[1])

        fabricResults_2 = self._detailsView.simulate_downloadMod(1)
        self.assertTrue(fabricResults_2[0])
        self.assertFalse(fabricResults_2[1])
        
        neoforgeResults_2 = self._detailsView.simulate_downloadMod(2)
        self.assertFalse(neoforgeResults_2[0])
        self.assertFalse(neoforgeResults_2[1])
        
        quiltResults_2 = self._detailsView.simulate_downloadMod(3)
        self.assertFalse(quiltResults_2[0])
        self.assertFalse(quiltResults_2[1])

if __name__ == "__main__":
    app = QtWidgets.QApplication(sys.argv)
    unittest.main(verbosity=2,failfast=True)