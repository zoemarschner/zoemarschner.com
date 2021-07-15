# Personal Website

The code for my static personal website. Project and Publication data is read from a .json file by a Python script, which generates additional pages of the website. Javascript on the page also reads from the .json file and generates a dynamically laid out grid based on a recursive algorithm.

## Development

Gulp will auto-recompile and build the code for easy development. 

The main gulp command in `gulp dev` which starts an http server. When python or sass files are changed, they are recompiled. 

Running `gulp build` will build python and sass files.

(Building the python files also updates the date at the bottom of the page.)

## Deployment

In order to deploy through github pages, a new branch with the `website` subdirectory as its root must be created to do this, run the command

```
git subtree push --prefix website  origin gh-pages

```

If the `subtree push` fails mysteriously, try deleting the local & remote `gh-pages` branch with 
```
git push -d origin gh-pages
git branch -d gh-pages
``` 
and then run the above command again. [This is probably not the best way to fix this...]