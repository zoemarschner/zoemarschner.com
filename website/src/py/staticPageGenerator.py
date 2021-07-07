# this code reads project_data json file and creates a page for each project based on the json data
# additionally, a new json file dynamic_data.json is output which includes only the data
# needed to dynamically generate the project grid

import json

# returns str resulting of replacing first instance of template in string with replacement
def replaceString(template, replacement, string):
	ind = string.find(template)
	return string[:ind] + replacement + string[ind + len(template):]

# load json file
with open('../../data/project_data.json') as json_file:
	json_data = json_file.read()

data = json.loads(json_data)

# load project template
with open('projectTemplate.html') as template_file:
	projectTemplate = template_file.read()

for project in data:
	thisTemplate = str(projectTemplate)

	#set tile for page & heading
	thisTemplate = replaceString("$PAGE_TITLE", project["title"], thisTemplate)
	thisTemplate = replaceString("$TITLE", project["title"], thisTemplate)

	#add git link if present
	if "git_link" in project:
		linkString = f'<p id="git_message">View on <a href={project["git_link"]} class="ext_link">GitHub</a></p>'
		thisTemplate = replaceString("$GIT_LINK", linkString, thisTemplate)
	else:
		thisTemplate = replaceString("$GIT_LINK", "", thisTemplate)
		


	#go through body content and add
	bodyString = ""
	for component in project["body"]:
		if component["type"] == "p":
			bodyString += f'<p>{component["content"]}</p>'
		elif component["type"] == "img":
			bodyString += f'<img src="../public/img/project_images/{component["content"]}">'

	thisTemplate = replaceString("$BODY", bodyString, thisTemplate)
	
	#write to html file (and store the name in the json)
	pageTitle = []
	for char in project["title"]:
		if char == ' ':
			pageTitle.append("-")
		else:
			pageTitle.append(char)

	relLink = f'../../projects/{"".join(pageTitle)}.html'
	project["page_link"] = relLink

	newPage = open(relLink, 'w')
	newPage.write(thisTemplate)
	newPage.close()

	#remove body portion of dict since we won't need that in dynamic json data
	project.pop("body")

dynamicJsonData = json.dumps(data)

jsonFile = open("../../data/dynamic_data.json", "w")
jsonFile.write(dynamicJsonData)
jsonFile.close()
