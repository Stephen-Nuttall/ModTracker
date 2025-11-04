import webbrowser, threading, json, os
import Backend.callModrinth as callModrinth, Backend.callCurseForge as callCurseForge
import Backend.loadFromJar as loadFromJar, Backend.loadFromJson as loadFromJson

class Priority(object):
    name:str
    r:int
    g:int
    b:int

    def __init__(self, newName = "New Priority Level", red = 255, green = 255, blue = 255):
        self.name = newName
        self.r = red
        self.g = green
        self.b = blue

    def createDict(self):
        return {
            "name": self.name,
            "r":self.r,
            "g":self.g,
            "b":self.b
        }

    def __str__(self):
        return f"{self.name}"
    
    def __eq__(self, other):
        if not isinstance(other, Priority):
            return False
        elif self.name == other.name and self.r == other.r and self.g == other.g and self.b == other.b:
            return True
        else:
            return False
    
    # Ensure the object can be used as a dictionary key
    def __hash__(self):
        return hash((self.name, self.r, self.g, self.b))

class Mod(object):
    priority:Priority
    _name:str
    _url:str
    _ID:int
    _versions:list[str]
    tablePosition:int

    _modrinthData:dict # False if uninitialized
    _curseforgeData:dict # False if uninitialized
    
    _curseforgeRegex = r"^https:\/\/(www\.)?curseforge\.com\/minecraft\/mc-mods\/[a-zA-Z0-9-_]+\/?$"
    _modrinthRegex = r"^https:\/\/(www\.)?modrinth\.com\/mod\/[a-zA-Z0-9-_]+\/?$"

    _requestTimeout = 10.0 # How many seconds to wait for an API call before timeout.
    
    # can pass mod info directly for testing, but can also just call with a url and it will get relevant info from the api,
    # or directlty insert raw modrinth or curseforge json data.
    def __init__(self, modName = "Untitled Mod", modID = -1, modVersions = ["No versions found"],
                 modPriority = Priority(), url:str = None, tablePosition = -1, modrinthData = None, curseforgeData = None):
        self.priority = modPriority
        self._name = modName
        self._ID = modID
        self._url = url
        self._versions = modVersions
        self.tablePosition = tablePosition
        self._modrinthData = modrinthData
        self._curseforgeData = curseforgeData
        
        if(url != None):
            self.refreshMod()

        if modrinthData:
            self._extractModrinth()
        elif curseforgeData:
            self._extractCurseforge()


    def __str__(self):
        return f"{self._name}, version: {self.getCurrentVersion()}, priority: {self.priority}"
    
    def __lt__(self, other):
        if self.tablePosition > 0 or other.tablePosition > 0:
            return self.tablePosition < other.tablePosition
        else:
            return self._name < other._name
        
    def __eq__(self, other):
        if not isinstance(other, Mod):
            return False
        else:
            return self._name == other._name and self._ID == other._ID and self._url == other._url and self._versions == other._versions

    # Getters
    def getName(self):
        return self._name
    
    def getID(self):
        return self._ID

    def getCurrentVersion(self):
        return self._versions[-1]
    
    def getVersionList(self):
        return self._versions
    
    def getURL(self):
        return self._url

    def getVersions(self):
        return self._versions
    
    def getModrinthData(self):
        return self._modrinthData
    
    def getCurseforgeData(self):
        return self._curseforgeData
    
    def getTablePosition(self):
        return self.tablePosition
    
    # A mod is considered valid if it has valid modrinth data or valid curseforge data
    def isValid(self):
        return self._modrinthData or self._curseforgeData
    
    # Verify if the URL this mod was initialized with is valid
    def verifyURL(self):
        curseforge = callModrinth.verifyURL(self._url)
        modrinth = callCurseForge.verifyURL(self._url)
        return modrinth or curseforge

    # Runs when the mod's data needs to be reset. Makes an API call and extracts the raw data
    def refreshMod(self):
        self.callAPIs()

        # If the URL is a modrinth URL, try Modrinth, then CurseForge
        # If the URL is a curseforge URL, try CurseForge, then Modrinth
        if callModrinth.verifyURL(self._url):
            if self._modrinthData:
                self._extractModrinth()
            elif self._curseforgeData:
                self._extractCurseforge()
        elif callCurseForge.verifyURL(self._url):
            if self._curseforgeData:
                self._extractCurseforge()
            elif self._modrinthData:
                self._extractModrinth()

    # Use the URL this mod was initialized with to get its data from CurseForge and Modrinth
    def callAPIs(self):
        mod_slug = self._url.rstrip("/").split("/")[-1]
        
        if callModrinth.verifyURL(self._url):
            self._modrinthData = callModrinth.modData(mod_slug)
        
        if callCurseForge.verifyURL(self._url):
            self._curseforgeData = callCurseForge.modData(mod_slug)

    # Downloads the latest version of the mod. Returns True if a mod was downloaded and False if not.
    # Returns False if unsuccessful or the download link if successful.
    def downloadMod(self, loader:str, version:str, preventDownload=False):
        mod_slug = self._url.rstrip("/").split("/")[-1]
        downloadLink = False

        if self._modrinthData:
            downloadLink = callModrinth.downloadMod(mod_slug, loader, version)
        elif self._curseforgeData:
            downloadLink = callCurseForge.downloadMod(self._curseforgeData, self._ID, loader, version)

        if downloadLink:
            if preventDownload == False:
                webbrowser.open(downloadLink)
            return downloadLink
        else:
            return False

    # Returns mod information as a dictionary
    def createDict(self):
        return {
            "priority":self.priority.createDict(),
            "name" : self._name,
            "id" : self._ID,
            "url" : self._url,
            "versions" : self._versions,
            "tablePosition" : self.tablePosition,
        }

    # Extract modrinth json data from API call
    def _extractModrinth(self):
        if not self._modrinthData:
            return None
        
        self._name = self._modrinthData["title"]
        self._ID = self._modrinthData["id"]
        self._versions = self._modrinthData["game_versions"]

    # Extract curseforge json data from API call and sort the version list
    def _extractCurseforge(self):
        if not self._curseforgeData:
            return None
        
        self._name = self._curseforgeData["name"]
        self._ID = self._curseforgeData["id"]
        self._versions = callCurseForge.sortVersionList(self._curseforgeData)

        if not self._url:
            self._url = self._curseforgeData["links"]["websiteUrl"]
    
class Profile(object):
    modList:list[Mod]
    priorityList:list[Priority]
    selectedVersion:str
    name:str
    
    def __init__(
            self, modList:list[Mod] = [],
            priorityList:list[Priority] = [
                Priority("High Priority", 255, 85, 0),
                Priority("Low Priority", 255, 255, 0)],
            selectedVersion:str = "1.21.5",
            name = "New Profile",
        ):
        # assign variables
        self.modList = modList
        self.priorityList = priorityList
        self.selectedVersion = selectedVersion
        self.name = name

    def __str__(self):
        output = f"{self.name}:\n"

        if self.modList:
            for mod in self.modList:
                output += mod.__str__() + "\n"
        else:
            output += "No mods in profile"

        return output[:-1]
    
    def getModList(self): return self.modList

    def getMod(self, index): return self.modList[index]

    def getPriorityList(self): return self.priorityList

    def getSelectedVersion(self): return self.selectedVersion

    # Adds a mod to the profile. Returns True if mod was successfully added. Otherwise, returns false.
    def addMod(self, inputString):
        try:
            newMod = Mod(url = inputString, modPriority=self.priorityList[0], tablePosition=len(self.modList))
        except IndexError:
            self.priorityList = [
                Priority("High Priority", 255, 85, 0),
                Priority("Low Priority", 255, 255, 0)]
            newMod = Mod(url = inputString, modPriority=self.priorityList[0], tablePosition=len(self.modList))
        
        if newMod.isValid():
            self.modList.append(newMod)
            return True
        else:
            return False
    
    # Removes a mod to the profile. Returns True if mod was successfully removed. Otherwise, returns false.
    def removeMod(self, index):
        try:
            mod = self.modList[index]

            if mod:
                self.modList.remove(mod)
                return True
            else:
                return False
        except IndexError:
            return False

    # Refreshes the data for each mod by making fresh API calls
    def refresh(self, selectedVersion):
        self.selectedVersion = selectedVersion

        # refresh API. Use a thread for each refresh
        threadList = []
        for curMod in self.modList:
            thread = threading.Thread(target=curMod.refreshMod)
            thread.start()

        for thread in threadList:
            thread.join()

    # Downloads every mod that is ready for the selected version.
    # Returns an list with False for each failure and the download link for each success.
    def downloadReadyMods(self, selectedModLoader, preventDownload = False):
        successful_downloads = []
        
        for mod in self.modList:
            if self.selectedVersion in mod.getVersionList():
                successful_downloads.append(mod.downloadMod(selectedModLoader, self.selectedVersion, preventDownload=preventDownload))
            else:
                successful_downloads.append(False)

        return successful_downloads
    
    # Exports the profile as a json file. Returns True if succcessful, False if not.
    def exportProfile(self, path:str, profileName:str, printDebugMessage = True):
        if path != False:
            profile = Profile(self.modList, self.priorityList, self.selectedVersion, profileName)

            if printDebugMessage:
                print(f"Exporting profile data to {path}")

            try:
                with open(path, "w") as file:
                    json.dump(profile.createDict(), file, indent=4)
            except Exception:
                print("EXCEPTION OCCURRED DURING EXPORT.")
                return False
            
            return True
        else:
            return False

    # Returns a float that represents how many of the mods in this profile are ready for the selected version, in percentage terms.
    def getPercentReady(self):
        readyMods = 0
        
        for mod in self.modList:
            if self.selectedVersion in mod.getVersionList():
                readyMods += 1
        
        if (len(self.modList) == 0):
            return 0
        else:
            return (readyMods/len(self.modList)) * 100

    # Returns profile information as a dictionary  
    def createDict(self):
        modlist = []
        for mod in self.modList:
            modlist.append(mod.createDict())

        prioritylist = []
        for priority in self.priorityList:
            prioritylist.append(priority.createDict())

        return {
            "name":self.name,
            "version":self.selectedVersion,
            "modlist":modlist,
            "priorityList":prioritylist
        }

# Manages all the user's profiles based on their interactions with the front end.
class ProfileManager():
    _profileList:list[Profile]
    _priorityList:list[Priority]
    _allowWriteToFile:bool
    
    def __init__(self, profileList:list[Profile] = [], priorityList:list[Priority] = [], allowWriteToFile = True):
        self._profileList = profileList
        self._priorityList = priorityList
        self._allowWriteToFile = allowWriteToFile

    # Getters
    def getNumProfiles(self): return len(self._profileList)

    def getProfileList(self): return self._profileList

    def getPriorityList(self): return self._priorityList

    def getProfile(self, index):
        if self._profileList:
            try:
                return self._profileList[index]
            except IndexError:
                return None
        else:
            return None

    def addProfile(self, newProfile:Profile, profileName:str = None, saveToFile = True):
        if not newProfile:
            return

        if profileName:
            newProfile.name = profileName

        self._profileList.append(newProfile)
        self.updatePriorityLists()
        self.sortModLists()

        if saveToFile and self._allowWriteToFile:
            self.saveToJson()

    def addPriority(self, newPriority:Priority):
        self._priorityList.append(newPriority)

    # Write the details of each profile to a json file
    def saveToJson(self, filename="mods.json", updatedProfile:Profile = None, editedProfileIndex = -1):
        # Update the profile that was just changed in the details view. Don't change the name
        if updatedProfile and editedProfileIndex >= 0:
            currentProfile = self._profileList[editedProfileIndex]
            oldName = currentProfile.name
            currentProfile = updatedProfile
            currentProfile.name = oldName

        if self._allowWriteToFile:
            appdata = os.getenv('APPDATA')
            directory = os.path.join(appdata, 'ModTracker')
            os.makedirs(directory, exist_ok=True)
            json_path = os.path.join(directory, filename)

            print(f"Saving data to {json_path}")
            with open(json_path, "w") as file:
                json.dump([profile.createDict() for profile in self._profileList], file, indent=4)

    def deleteProfile(self, numProfile):
        self._profileList.remove(self._profileList[numProfile])
        self.sortModLists()
        self.updatePriorityLists()
        self.saveToJson()

    def sortModLists(self):
        for profile in self._profileList:
            profile.modList.sort()

    def updatePriorityLists(self):
        for profile in self._profileList:
            for mod in profile.modList:
                if mod.priority not in self._priorityList:
                    self._priorityList.append(mod.priority)
        
        for profile in self._profileList:
            profile.priorityList = self._priorityList

    def importFromJSON(self, path:str, requireValidModURL = True):
        if path:
            return loadFromJson.createProfile(path, requireValidModURL=requireValidModURL)

    def importFromFolder(self, directory:str):
        return loadFromJar.createProfileFromFolder(directory)
    
    def createDict(self):
        profileList = []
        priorityList = []
        
        for profile in self._profileList:
            profileList.append(profile.createDict())

        for priority in self._priorityList:
            priorityList.append(priority.createDict())

        return {
            "profileList" : profileList,
            "priorityList" : priorityList
        }
