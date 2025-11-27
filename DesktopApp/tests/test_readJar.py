import sys, os, unittest, testData

jar_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), './testJars'))
parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(parent_dir)

import loadFromJar, mod

class TestReadJar(testData.TestCase):
    createWindow = False
    createDetailsView = False

    def testExampleModsFolder(self):
        if self._testAPICalls is False:
            self.skipTest("API tests are off")

        # --------------------------------------------------------------------------------------------------------------------------------------------
        # NOTE: The correct mods for "Fusion (Connected Textures)" and "Ice Cream, Mini Sword And New Trades!" cannot be found using this method.
        #
        # This is because the name in their toml/json files is different from what they are named on Modrinth and CurseForge,
        # so a different mod comes up first in search results.
        # - Fusion is simply named "Fusion" in its toml/json files, but named "Fusion (Connected Textures)" on Modrinth and CurseForge.
        # - The ice cream one is called "RandonMod" in its mods.toml, but "Ice Cream, Mini Sword And New Trades!" on CurseForge.
        #
        # Because this is an expected result, the test searches for the "Fusion" and "RandomMod" instead of "Fusion (Connected Textures)" and
        # "Ice Cream, Mini Sword And New Trades!"
        #--------------------------------------------------------------------------------------------------------------------------------------------
        expectedMods = [
            mod.Mod(url="https://modrinth.com/mod/cloth-config"),                   # Cloth Config
            mod.Mod(url="https://modrinth.com/mod/commandkeys"),                    # Command Keys
            mod.Mod(url="https://modrinth.com/mod/dynamic-fps"),                    # Dynamic FPS
            mod.Mod(url="https://modrinth.com/mod/entityculling"),                  # Entity Culling
            mod.Mod(url="https://modrinth.com/mod/fusion-connected-textures"),      # Fusion (Connected Textures)
            mod.Mod(url="https://www.curseforge.com/minecraft/mc-mods/ice-cream-mini-sword-and-new-trades"), # Ice Cream, Mini Sword And New Trades!
            mod.Mod(url="https://modrinth.com/mod/fusion"),                         # Fusion [expected result for Fusion (Connected Textures)]
            mod.Mod(url="https://www.curseforge.com/minecraft/mc-mods/randommod"),  # RandomMod [expected result for Ice Cream, Mini Sword And New Trades!]
            mod.Mod(url="https://modrinth.com/mod/lambdynamiclights"),              # LambDynamicLights
            mod.Mod(url="https://modrinth.com/mod/nether-height-expansion-mod"),    # More Nether
            mod.Mod(url="https://modrinth.com/mod/sodium"),                         # Sodium
        ]

        newProfile = loadFromJar.createProfileFromFolder(jar_dir, printDebug=False)
        
        for modObj in newProfile.modList:
            self.assertIn(modObj, expectedMods)

if __name__ == "__main__":
    unittest.main(verbosity=2,failfast=True)