from datetime import datetime

now = datetime.now()

files = ['projectTemplate.html', '../../index.html', '../../projects.html']
new_contents = [];
now_str = now.strftime("%B %Y")
update_str = "last updated"
for file in files:
	with open(file, 'r') as f:
		contents = f.read()
		ind = contents.find(update_str)
		ind2 = contents.find('<',ind)
		new = contents[:ind + len(update_str) + 1] + now_str + contents[ind2:]
		new_contents.append(new)

for file, content in zip(files, new_contents):
	with open(file, 'w') as f:
		f.write(content)
