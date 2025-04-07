## Steps to run
1. Make sure you have node.js installed
2. Clone repo
3. Run command to install dependencies
```bash
npm install
# or, if you use yarn
# yarn install
```
4. Create your script file in the `outputs` directory in the project root (ex: `poem.json`)
   2.1 If needed refer to the outputs/sample.json file to see what the file format should look like
5. Add your script file name to the file-list.json
```json
[
   "poem.json",
   "sample.json"
]
```
6. Run command to start everything
```bash
npm start
# or, if you use yarn 
# yarn start
```
7. Then it should start the web server and web sockets server
8. It will show the link to navigate to on your browser (ex: http://localhost:3000)
9. To access from a device on the network do: http://your-local-ip:3000
10. To access the remote control do : http://your-local-ip:3000/control.html
* **NOTES:** 
* your-local-ip should be your machine ip address on the network
* When you navigate to the web UI you will have the chance to switch between script files (those listed in file-list.json)