# Making Changes to jsbin

```
# add remote for jsbin fork
$ git remote add jsbin https://github.com/jasonsanjose/jsbin.git

# submit changes to jsbin fork
# note that the main branch in the fork repo is named jsbin-app
$ git subtree push --prefix=lib/jsbin jsbin _your_user_name_/_feature_branch_name_

# pulling changes from jsbin fork
$ git subtree pull --prefix=lib/jsbin jsbin jsbin-app
```