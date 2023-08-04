# a very simple program that writes all the image files 
# into a json file—because the static website cannot search through the folder.

import glob, os, json

imgdir = "../../public/img/spotlight_pictures"

os.chdir(imgdir)
data = [file for file in glob.glob("*.JPG") + glob.glob("*.jpeg") + glob.glob("*.jpg")]

# fix unicode encoding errors with umlauts
enc_data = []
for file in data:
    mappings = [(u"ä", "%C3%A4"), (u"ö", "%C3%B6"), (u"ü", "%C3%BC")]
    for charmap in mappings:
        file = file.replace(*charmap)
    enc_data.append(file)

with open(f'manifest.json', 'w') as f:
    json.dump(enc_data, f)