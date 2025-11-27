import sys, os, unittest, testData

# Add the parent directory to the Python path
parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(parent_dir)

import mod

class TestAPICalls(testData.TestCase):
    createWindow = False
    createDetailsView = False

    def testModrinthCall(self):
        if self._testAPICalls is False:
            self.skipTest("API tests are off")

        modObj1 = mod.Mod(url ="https://modrinth.com/mod/sodium")
        modObj2 = mod.Mod(url = "https://modrinth.com/mod/fabric-api")
        modObj3 = mod.Mod(url = "https://modrinth.com/mod/cloth-config")
        modObj4 = mod.Mod(url = "https://www.curseforge.com/minecraft/mc-mods/sodium") # on both sites

        self.assertNotEqual(modObj1.getModrinthData(), False)
        self.assertNotEqual(modObj2.getModrinthData(), False)
        self.assertNotEqual(modObj3.getModrinthData(), False)
        self.assertNotEqual(modObj4.getCurseforgeData(), False)

    def testCurseforgeCall(self):
        if self._testAPICalls is False:
            self.skipTest("API tests are off")

        modObj1 = mod.Mod(url = "https://www.curseforge.com/minecraft/mc-mods/sodium") # on both sites
        modObj2 = mod.Mod(url = "https://www.curseforge.com/minecraft/mc-mods/ice-cream-mini-sword-and-new-trades") # only on curseforge

        self.assertNotEqual(modObj1.getCurseforgeData(), False)
        self.assertNotEqual(modObj2.getCurseforgeData(), False)
         
    def testVersion(self):
        if self._testAPICalls is False:
            self.skipTest("API tests are off")

        modObj1 = mod.Mod(url ="https://modrinth.com/mod/sodium")
        modObj2 = mod.Mod(url = "https://modrinth.com/mod/fabric-api")
        modObj3 = mod.Mod(url = "https://modrinth.com/mod/dynamic-fps")
        modObj4 = mod.Mod(url = "https://www.curseforge.com/minecraft/mc-mods/sodium") # on both sites
        modObj5 = mod.Mod(url = "https://www.curseforge.com/minecraft/mc-mods/ice-cream-mini-sword-and-new-trades") # only on curseforge

        self.assertEqual(modObj1.getCurrentVersion(), self._data.latestGameVersion)
        # self.assertEqual(modObj2.getCurrentVersion(), "25w17a") # updates too often
        self.assertEqual(modObj3.getCurrentVersion(), self._data.latestGameVersion)
        self.assertEqual(modObj4.getCurrentVersion(), self._data.latestGameVersion)
        self.assertEqual(modObj5.getCurrentVersion(), "1.20.1")

    def testName(self):
        if self._testAPICalls is False:
            self.skipTest("API tests are off")

        modObj1 = mod.Mod(url ="https://modrinth.com/mod/sodium")
        modObj2 = mod.Mod(url = "https://modrinth.com/mod/fabric-api")
        modObj3 = mod.Mod(url = "https://modrinth.com/mod/cloth-config")
        modObj4 = mod.Mod(url = "https://www.curseforge.com/minecraft/mc-mods/sodium") # on both sites
        modObj5 = mod.Mod(url = "https://www.curseforge.com/minecraft/mc-mods/ice-cream-mini-sword-and-new-trades") # only on curseforge
        modObj6 = mod.Mod(url = "https://www.curseforge.com/minecraft/mc-mods/worldedit") # if the API call is done wrong, it will fetch a modpack called Worldedit+ with the same slug
        invalidModObj = mod.Mod(url = "https://www.curseforge.com/minecrafods/sodium") # broken URL

        self.assertEqual(modObj1.getName(), "Sodium")
        self.assertEqual(modObj2.getName(), "Fabric API")
        self.assertEqual(modObj3.getName(), "Cloth Config API")
        self.assertEqual(modObj4.getName(), "Sodium")
        self.assertEqual(modObj5.getName(), "Ice Cream, Mini Sword And New Trades!")
        self.assertEqual(modObj6.getName(), "WorldEdit")
        self.assertEqual(invalidModObj.getName(), "Untitled Mod")

    def testUrl(self):
        if self._testAPICalls is False:
            self.skipTest("API tests are off")

        modObj1 = mod.Mod(url ="https://modrinth.com/mod/sodium")
        modObj2 = mod.Mod(url = "https://modrinth.com/mod/fabric-api")
        modObj3 = mod.Mod(url = "https://modrinth.com/mod/cloth-config")
        modObj4 = mod.Mod(url = "https://www.curseforge.com/minecraft/mc-mods/sodium") # on both sites
        modObj5 = mod.Mod(url = "https://www.curseforge.com/minecraft/mc-mods/ice-cream-mini-sword-and-new-trades") # only on curseforge

        self.assertEqual(modObj1.getURL(), "https://modrinth.com/mod/sodium")
        self.assertEqual(modObj2.getURL(), "https://modrinth.com/mod/fabric-api")
        self.assertEqual(modObj3.getURL(), "https://modrinth.com/mod/cloth-config")
        self.assertEqual(modObj4.getURL(), "https://www.curseforge.com/minecraft/mc-mods/sodium") # on both sites
        self.assertEqual(modObj5.getURL(), "https://www.curseforge.com/minecraft/mc-mods/ice-cream-mini-sword-and-new-trades") # on both sites

    def testValidUrl(self):
        if self._testAPICalls is False:
            self.skipTest("API tests are off")

        modObj1 = mod.Mod(url ="https://modrinth.com/mod/sodium")
        modObj2 = mod.Mod(url = "https://modrinth.com/mod/fabric-api")
        modObj3 = mod.Mod(url = "https://modrinth.com/mod/cloth-config")
        modObj4 = mod.Mod(url = "https://www.curseforge.com/minecraft/mc-mods/sodium") # on both sites
        modObj5 = mod.Mod(url = "https://www.curseforge.com/minecraft/mc-mods/ice-cream-mini-sword-and-new-trades") # only on curseforge
        invalidModObj = mod.Mod(url = "https://www.curseforge.com/minecrafods/sodium") # broken URL

        self.assertTrue(modObj1.verifyURL())
        self.assertTrue(modObj2.verifyURL())
        self.assertTrue(modObj3.verifyURL())
        self.assertTrue(modObj4.verifyURL())
        self.assertTrue(modObj5.verifyURL())

        self.assertFalse(invalidModObj.verifyURL())

    def testModSave(self):
        if self._testAPICalls is False:
            self.skipTest("API tests are off")

        modObj1 = mod.Mod(url ="https://modrinth.com/mod/sodium")
        modObj2 = mod.Mod(url = "https://modrinth.com/mod/fabric-api")
        modObj3 = mod.Mod(url = "https://modrinth.com/mod/cloth-config")
        modObj4 = mod.Mod(url = "https://www.curseforge.com/minecraft/mc-mods/sodium") # on both sites
        modObj5 = mod.Mod(url = "https://www.curseforge.com/minecraft/mc-mods/ice-cream-mini-sword-and-new-trades") # only on curseforge

        dict1 = modObj1.createDict()
        dict2 = modObj2.createDict()
        dict3 = modObj3.createDict()
        dict4 = modObj4.createDict()
        dict5 = modObj5.createDict()

        self.assertEqual(dict1["name"], modObj1.getName())
        self.assertEqual(dict1["id"], modObj1.getID())
        self.assertEqual(dict1["url"], modObj1.getURL())
        self.assertEqual(dict1["versions"], modObj1.getVersions())

        self.assertEqual(dict2["name"], modObj2.getName())
        self.assertEqual(dict2["id"], modObj2.getID())
        self.assertEqual(dict2["url"], modObj2.getURL())
        self.assertEqual(dict2["versions"], modObj2.getVersions())

        self.assertEqual(dict3["name"], modObj3.getName())
        self.assertEqual(dict3["id"], modObj3.getID())
        self.assertEqual(dict3["url"], modObj3.getURL())
        self.assertEqual(dict3["versions"], modObj3.getVersions())

        self.assertEqual(dict4["name"], modObj4.getName())
        self.assertEqual(dict4["id"], modObj4.getID())
        self.assertEqual(dict4["url"], modObj4.getURL())
        self.assertEqual(dict4["versions"], modObj4.getVersions())

        self.assertEqual(dict5["name"], modObj5.getName())
        self.assertEqual(dict5["id"], modObj5.getID())
        self.assertEqual(dict5["url"], modObj5.getURL())
        self.assertEqual(dict5["versions"], modObj5.getVersions())

if __name__ == "__main__":
    unittest.main(verbosity=2,failfast=True)