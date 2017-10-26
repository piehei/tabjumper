import os
import json
import zipfile

SKIP_LIST = [ "hot-reload.js" ]

files = os.listdir('src')
files = [ x for x in files if x not in SKIP_LIST ]
files = [ f"src/{x}" for x in files ]
print(files)


manifest = [x for x in files if "manifest" in x][0]

mjson = {}
with open(manifest, "r") as m:
    mjson = json.load(m)

print(mjson)

mjson["background"]["scripts"] = [x for x in mjson["background"]["scripts"] if x not in SKIP_LIST]

print(mjson)

name = f"releases/tabJump-{mjson['version']}.zip"

zipf = zipfile.ZipFile(name, 'w')

for f in files:
    zipf.write(f)

zipf.close()
