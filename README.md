When you clone, create a file in the root called _database.json_ with this content:

`{ "ids": {}, "tries": 1 }`

This file is the "database" for the app, and is git-ignored in order not to override the file when
pulling in updates.

Also create a file in the root called _userpw.json_ with the single username and pw as sketche below:

`{"name":"XXXXX", "pass":"YYYYY"}`

Obviously this file is also git-ignored

You need to provide ownership for your node-user for, as minimum, database.json
Alternatively, just to the full folder: chown -R USER_NAME ./student-picker

Unless this is meant for picking students for review, you should add a settings.js file to customize the UI to your needs.
