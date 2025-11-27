import mod, json, threading, os

# Convert json data for a mod into a mod object
def _dictToMod(data):
    priorityData = data["priority"]
    priorityLevel = mod.Priority(priorityData["name"], red=priorityData["r"], green=priorityData["g"], blue=priorityData["b"])

    if "tablePosition" in data:
        tablePos = data["tablePosition"]
    else:
        tablePos = -1
        
    modObj = mod.Mod(modName=data["name"], modPriority=priorityLevel, modVersions=data["versions"], url=data["url"], modID=data["id"], tablePosition=tablePos)
    return modObj

# Convert json data for a mod profile into a mod profile object. Create each mod object on its own thread, as each will make an API call.
def _dictToModProfile(data, requireValidModURL=True):
    threadList = []
    
    newModList = []
    modListData = data["modlist"]

    def threadHelper(newMod, list, requireValidURL=True):
        modObj = _dictToMod(newMod)

        if not requireValidURL or modObj.isValid():
            list.append(modObj)

    for newMod in modListData:
        thread = threading.Thread(target=threadHelper, args=(newMod, newModList, requireValidModURL))
        threadList.append(thread)
        thread.start()

    for thread in threadList:
        thread.join()

    return mod.Profile(modList = newModList, name=data["name"], selectedVersion=data["version"])

# Open a json file, read the data, and create a list of mod profiles from it
def createProfileList(filename="mods.json"):
    appdata = os.getenv('APPDATA')
    directory = os.path.join(appdata, 'ModTracker')
    os.makedirs(directory, exist_ok=True)
    json_path = os.path.join(directory, filename)

    newProfileList = []
    try:
        with open(json_path, "r") as f:
            data = json.load(f)
            for entry in data:
                newProfileList.append(_dictToModProfile(entry, requireValidModURL=False))
    except FileNotFoundError or json.JSONDecodeError or json.decoder.JSONDecodeError:
        print("Failed to read file. No data recovered.")
        return []
    return newProfileList

# Open a json file, read the data, and create a single mod profile from it
def createProfile(filename="mods.json", rawJson = None, requireValidModURL=True):
    if rawJson:
        profile = _dictToModProfile(rawJson, requireValidModURL=requireValidModURL)
        return profile

    appdata = os.getenv('APPDATA')
    directory = os.path.join(appdata, 'ModTracker')
    os.makedirs(directory, exist_ok=True)
    json_path = os.path.join(directory, filename)

    try:
        with open(json_path, "r") as f:
            data = json.load(f)
            profile = _dictToModProfile(data, requireValidModURL=requireValidModURL)
    except FileNotFoundError or json.JSONDecodeError or json.decoder.JSONDecodeError:
        print(f"Failed to read file at {json_path}. No profile created.")
        return None
    return profile