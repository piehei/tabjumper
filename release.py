import os
import json
import zipfile

SKIP_LIST = [ "hot-reload.js" ]

files = os.listdir('src')
files = [ x for x in files if x not in SKIP_LIST ]
files = [ f"src/{x}" for x in files ]
sub_dirs = [ x for x in files if os.path.isdir(x) ]

# TODO: convert to some recursive form
#       currently this understands only one sub dir
files += [ f"{x}/{f}" for x in sub_dirs for f in os.listdir(x) ]

manifest = [x for x in files if "manifest" in x][0]
files = [ x for x in files if "manifest" not in x]

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

zipf.writestr("src/manifest.json", json.dumps(mjson))
zipf.close()
