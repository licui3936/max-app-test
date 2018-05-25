//register service worker
//navigator.serviceWorker.register("../serviceworker.js");

//event listeners.
document.addEventListener("DOMContentLoaded", () => {
  if (typeof fin != "undefined") {
    fin.desktop.main(onMain);
  } else {
    ofVersion.innerText =
      "OpenFin is not available - you are probably running in a browser.";
  }
});

//Once the DOM has loaded and the OpenFin API is ready
let total = 0;
let totalNum = null;
let appNum;
let appQty = 1, timeout, stopped = false;
function onMain() {
	const app = fin.desktop.Application.getCurrent();
  	fin.desktop.System.showDeveloperTools(app.uuid, app.uuid);
  	fin.desktop.System.getVersion(version => {
		const ofVersion = document.querySelector("#of-version");
		ofVersion.innerText = version;
	});

	const win = fin.desktop.Window.getCurrent();
	win.addEventListener("close-requested", () => {
		let otherAppsClosed = false;

		fin.desktop.System.getAllApplications((applicationInfoList) => {
			let length = applicationInfoList.length;
			// closing apps
			applicationInfoList.forEach((applicationInfo, index) => {
				if(applicationInfo.isRunning && applicationInfo.uuid !== 'AppTest') {
					if(index === length -1 ) {
						otherAppsClosed = true;
					}
				 	let subapp = fin.desktop.Application.wrap(applicationInfo.uuid);
					//subapp.close(true);
					subapp.terminate();
				}
				if(length === 1 || otherAppsClosed) {
					// close main one
					//app.close(true);
					app.terminate();
				}
			});
		});
	}, () => {
		console.log('The registration was successful');
	}, (reason) => {
		console.log("failure: " + reason);
	});

}

function createApplications() {
	appNum = parseInt(document.querySelector("#appNumber").value);
	totalNum = document.querySelector("#totalAppNum");
	if(appNum > 0)
		createApps();
	else {
		// Recursively run a new app after receiving
		// 'alive' signal from newly created app
		fin.desktop.InterApplicationBus.subscribe(
			'*',
			'alive',
			function(message) {
				clearTimeout(timeout);

				totalNum.innerText = Number(message);
				// Lower cpu consumption
				setTimeout(function() {
						createApp2();
				}, 1);
			}
		);
		createApp2();
	}
}

function createApps() {
	let total = 0;
	for(var i=0;i<appNum;i++){
		const appName = "app" + i;
		let num = i;
		setTimeout(() => {
			this.createApp(appName, num);
		}, 1);
	}
}


function createApp(appName, num) {
	let left = num % 10 === 0 ? 300 : ((num % 10 * 100) + 300);
	let	top = (Math.floor(num / 10) * 100) + 50;
	//console.log('num=' + num + ' top=' + top + ' left=' + left);
	let opt = {
		name: appName,
		uuid: appName,
		url: document.URL.substring(0, document.URL.lastIndexOf("/") + 1) + 'emptyApp.html',
		mainWindowOptions: {
			defaultWidth: 100,
			defaultHeight: 100,
			defaultTop: top,
      		defaultLeft: left,
			autoShow: true
		}
	};


	let app = new fin.desktop.Application(opt, () => {
		app.run();

		if(appNum === 0 || isNaN(appNum)) {
			fin.desktop.InterApplicationBus.publish('alive', appName);
		}
		else {
			app.isRunning((running) => {
				if(running) {
					total++;
					totalNum.innerText = total;
				}
			});
		}
	});
}


// Create a new app
function createApp2() {
	// Window configuration
	var uuid = String(++appQty);
	var name = String(appQty);

	//utils.createApp(args);
	if(!stopped)
		createApp(uuid, appQty);

	// Stop the test if a new app is
	// not created within 3 seconds
	/*timeout = setTimeout(function() {
			stopped = true;
	}, 3000);*/

}

function createWindows() {
	let winNum = parseInt(document.querySelector("#winNumber").value);
	
	for(var i=0;i<winNum;i++){
		const winName = "childWin" + i;
		let index = i;
		setTimeout(() => {
			this.createWindow(winName, index);
		}, 1);
	}
}

function createWindow(windowName, index) {
	let left = index % 10 === 0 ? 300 : ((index % 10 * 100) + 300);
	let	top = (Math.floor(index / 10) * 100) + 50;
	console.log('index=' + index + ' top=' + top + ' left=' + left);
	var win = new fin.desktop.Window({
		name: windowName,
		url: "about:blank",
		defaultWidth: 100,
		defaultHeight: 100,
		defaultTop: top,
		defaultLeft: left,
		frame: true,
		resizable: false,
		state: "normal",
		autoShow: true
	});
}

