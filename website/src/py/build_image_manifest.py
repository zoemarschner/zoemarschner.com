# a very simple program that writes all the image files 
# into a json file—because the static website cannot search through the folder.

import glob, os, json

imgdir = "../../public/img/spotlight_pictures"

os.chdir(imgdir)
data = [file for file in glob.glob("*.JPG") + glob.glob("*.jpeg") + glob.glob("*.jpg")]


# change combining characters --> non combining, 
# seems to be required to get encoding of uri in live version to work
u_char = {'a': '\u00e4', 'o': '\u00f6', 'u': '\u00fc'}
reform_data = []
for file in data:
    reform_file = ""
    for i in range(len(file)-1):
        if file[i+1] == '̈':
            reform_file += u_char[file[i]]
        elif file[i] != '̈':
            reform_file += file[i]
    reform_data.append(reform_file + file[-1])

with open(f'manifest.json', 'w') as f:
    json.dump(reform_data, f)