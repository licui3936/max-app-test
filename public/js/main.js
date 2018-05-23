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
var appQty = 1, timeout, stopped = false;
function onMain() {
  const app = fin.desktop.Application.getCurrent();
  fin.desktop.System.showDeveloperTools(app.uuid, app.uuid);
  fin.desktop.System.getVersion(version => {
    const ofVersion = document.querySelector("#of-version");
    ofVersion.innerText = version;
	});
}

function createApplications() {
	appNum = parseInt(document.querySelector("#appNumber").value);
	if(appNum > 0)
		createApps();
	else {
		// Recursively run a new app after receiving
// 'alive' signal from newly created app
		fin.desktop.InterApplicationBus.subscribe(
			'*',
			'alive',
			function(message) {
				//console.log(message);
					clearTimeout(timeout);
					/*updateTest({data: {
							'Created applications': Number(message)}
					});*/
					totalNum = document.querySelector("#totalAppNum");
					totalNum.innerText = Number(message);
					// Lower cpu consumption
					setTimeout(function() {
						//console.log('create one');
							createApp2();
					}, 1);
			}
	);
		createApp2();
}
}
function createApps() {
	//totalNum = document.querySelector("#totalAppNum");
	//const appNum = parseInt(document.querySelector("#appNumber").value);
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
		//totalNum.innerText = total;
		app.run();

		if(appNum === 0 || isNaN(appNum)) {
			fin.desktop.InterApplicationBus.publish('alive', appName);
		}
		else {
			app.isRunning((running) => {
				if(isRunning) {
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

