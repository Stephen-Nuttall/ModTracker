import zipfile, json, os, tomllib, Levenshtein, callModrinth, callCurseForge, mod, threading

# Creates a mod profile by matching the jar files the user's .minecraft/mods folder with mods on modrinth and curseforge.
def createProfileFromFolder(directory:str = None, printDebug = True):
    if directory == None:
        directory = os.path.join(os.environ["APPDATA"], ".minecraft", "mods")
        
    if printDebug:
        print(f"Creating a mod object for each jar file found in {directory}...")
        
    profile = mod.Profile(name="Mods Folder")
    
    threadList = []

    def threadHelper(filename, directory, profile:mod.Profile):
        jarData = getDataFromJar(filename, directory)

        if jarData:
            data = jarData[0]
            loader = jarData[1]
        else:
            data = None
            loader = None

        if data and loader:
            modObj = createModFromJarData(data, loader)
            profile.modList.append(modObj)

    for filename in os.listdir(directory):
        thread = threading.Thread(target=threadHelper, args=(filename, directory, profile))
        threadList.append(thread)
        thread.start()

    for thread in threadList:
        thread.join()

    return profile

# Gets data and mod loader from a jar file.
# Returns a list formatted [data, mod loader]
def getDataFromJar(filename, directory):
    forge_filename = "META-INF/mods.toml"
    neoforge_filename = "META-INF/neoforge.mods.toml"
    fabric_filename = "fabric.mod.json"
    quilt_filename = "quilt.mod.json"

    data = None
    loader = None

    if filename.endswith(".jar"):
        jar_path = os.path.join(directory, filename)
    else:
        return [data, loader]

    try:
        with zipfile.ZipFile(jar_path, 'r') as jar:
            nameList = jar.namelist()

            if quilt_filename in nameList:
                with jar.open(quilt_filename) as f:
                    data = json.load(f)
                    loader = "quilt"
            elif neoforge_filename in nameList:
                with jar.open(neoforge_filename) as f:
                    data = tomllib.load(f)
                    loader = "neoforge"
            elif fabric_filename in nameList:
                with jar.open(fabric_filename) as f:
                    data = json.load(f)
                    loader = "fabric"
            elif forge_filename in nameList:
                with jar.open(forge_filename) as f:
                    data = tomllib.load(f)
                    loader = "forge"
            else:
                print(f"ERROR IMPORTING {jar_path}: None of the supported information files were found in this jar.")

            return [data, loader]
    except Exception as e:
        print(f"ERROR IMPORTING {jar_path}: {e}")

# Creates a mod object by matching a jar file's data with a mod on modrinth or curseforge.
def createModFromJarData(jarData, loader):
    modObj = None
    
    modName = getModNameFromJarData(jarData, loader)
    if not modName:
        return None
    
    siteData = searchModSites(modName)
    best_result = _closestMatch(modName, siteData)

    if best_result == siteData[1]:
        modObj = mod.Mod(curseforgeData=best_result, modPriority=mod.Priority("High Priority", 255, 85, 0))
    else:
        modObj = mod.Mod(url=f"https://modrinth.com/mod/{best_result['slug']}", modPriority=mod.Priority("High Priority", 255, 85, 0))

    return modObj

# Extracts a mod's name from a jar file's data.
def getModNameFromJarData(jarData, loader):
    match loader:
        case "forge":
            return jarData["mods"][0]["displayName"]
        case "fabric":
            return jarData.get("name")
        case "neoforge":
            return jarData["mods"][0]["displayName"]
        case "quilt":
            return jarData["quilt_loader"]["metadata"]["name"]
        case _:
            return None

# Searches for modrinth and/or curseforge data with mod's name.
# Returns a list formatted [modrinth data, curseforge data]. 
def searchModSites(modName, getModrinthData:bool = True, getCurseForgeData:bool = True):
    modrinthData = None
    curseForgeData = None

    if getModrinthData:
        modrinthData = callModrinth.searchModrinth(modName, 1)
    if getCurseForgeData:
        raw_curseForgeData = callCurseForge.searchCurseforge(modName)
        if raw_curseForgeData:
            curseForgeData = raw_curseForgeData[0]

    return [modrinthData, curseForgeData]

# Determines if the result from Modrinth or CurseForge is closer to the mod name found in the jar file using their Levenshtein distance
def _closestMatch(mod_name, siteData):
    if siteData[0] and siteData[1]:
        best = None
        best_dist = float("inf")
        for data in siteData:
            if data:
                if "title" in data:
                    dist = Levenshtein.distance(mod_name.lower(), data["title"].lower())
                elif "name" in data:
                    dist = Levenshtein.distance(mod_name.lower(), data["name"].lower())

                if dist < best_dist:
                    best = data
                    best_dist = dist
        return best
    elif siteData[0]:
        return siteData[0]
    elif siteData[1]:
        return siteData[1]
    else:
        return None
    

if __name__ == "__main__":
    print(createProfileFromFolder())