# a very simple program that writes all the image files 
# into a json file—because the static website cannot search through the folder.

import glob, os, json

imgdir = "../../public/img/spotlight_pictures"

os.chdir(imgdir)
data = [file for file in glob.glob("*.JPG") + glob.glob("*.jpeg")]

with open(f'manifest.json', 'w') as f:
    json.dump(data, f)