# clinician-view-server-node

**IMPORTANT**
Changed Mongo Connection String to your own in database.ts

**STEPS TO GET EVERYTHING WORKING**

1. Server should be up and running on AWS, if not check the AWS section
2. Open Clinician View
3. Start VR game on unity
4. On Clinician View, join a session, add patient to the session

**AWS**

- Hosted on lightsail instance: Clinician-View-Server-Node
- Server is running in the background through `screen`
- Use `screen -r [pid] | screen -r` to connect to the running screen session
- To disconnect from the screen session use `Ctrl-a` then `d`
- To kill a screen session from multiple sessions use `screen -XS <session-id> quit` where `<session-id>` is the pid of the screen session

**AWS Git**

- Make sure to run `npm run start` before pushing changes to the repository
- To fetch newest version from the main repository, cd into the clinician-server directory and run `git fetch` command
- To start the server, run `npm run start` command in the clinician-server directory while in a screen session, then
  `Ctrl-a` then `d` to disconnect from the screen session, session should still be running

## Folders and files

- `database`: Holds MonngoDB models and functions that can be used
- `dist`: Auto generated conversionn from `.ts` to `.js`
- `interfaces`: Interfaces that can be used
- `routes`: Routes for specific endpoints
- `auth`: JWT authentication
- `index`: Main file, where server starts
- `utils`: utility functions



# Release Notes:

### 2/29/24

Updated .env and connected into student mongoDB. This is represented in a .env file that isn't committed for security reasons.

