files = ['projectTemplate.html', '../../index.html']


for file in files:
	with open(file, 'r') as f:
		contents = file.read()