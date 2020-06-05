console.log("hello world :o");
let interval;
let totalDistance = 0;

// cache the DOM
const status_div = document.getElementById("status");
const start_div = document.getElementById("start");
const stop_div = document.getElementById("stop");
const delete_div = document.getElementById("delete");
const distance_span = document.getElementById("distance");

// given the lat lon of two pts, returns the distance between in METERS
function distance(lat1, lon1, lat2, lon2) {
	const R = 6378.137;
	const dLat = lat2 * Math.PI / 180 - lat1 * Math.PI / 180;
	const dLon = lon2 * Math.PI / 180 - lon1 * Math.PI / 180;
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	const d = R * c;
	return d * 1000;
}

// returns the date in the form (3 June 2020 @3:35)
function getCurrentDate() {
	const months = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December"
	];
	const date = new Date();
	const year = date.getFullYear().toString();
	const month = months[date.getMonth()].toString();
	const day = date.getDate().toString();
	let hour = date.getHours();
	let period;

	if (hour > 12) {
		hour = (hour % 12).toString();
		period = "PM";
	} else {
		period = "AM";
		hour = hour.toString();
	}

	const minute = date.getMinutes().toString();

	// 3 June 2020 @3:35
	return `${day} ${month} ${year} @${hour}:${minute}${period}`;
}

async function logDistance(distance) {
	const date = getCurrentDate();
	const data = { distance, date };
	console.log(data);

	const options = {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(data)
	};

	// send the added dream to server
	const response = await fetch("/distance", options);
	const responseJSON = await response.json();
	console.log(responseJSON);
}

// function that returns a lat lon object { lat: 50.2323, lon: 21.234234 }
function returnLocation() {
	const promise = new Promise((resolve, reject) => {
		if ("geolocation" in navigator) {
			/* geolocation is available */
			navigator.geolocation.getCurrentPosition((position) => {
				const lat = position.coords.latitude;
				const lon = position.coords.longitude;
				const data = { lat, lon };
				resolve(data);
			});
		} else {
			/* geolocation IS NOT available */
			console.log("not availibale");
			reject("geolocation not availible");
		}
	});
	return promise;
}

// starts logging location when clicked
start_div.addEventListener("click", async () => {
	// reset total dist to 0
	totalDistance = 0;
	let previousPosition;

	// say starting up then when a location is received, say run in progress
	status_div.textContent = "Starting Up...";
	let currentPosition = await returnLocation();
	status_div.textContent = "Run in Progress";

	// every 3sec
	interval = setInterval(async () => {
		// set current to previous and update current
		previousPosition = currentPosition;
		currentPosition = await returnLocation();

		// determine distance between current and previous
		const distanceInterval = distance(
			previousPosition.lat,
			previousPosition.lon,
			currentPosition.lat,
			currentPosition.lon
		);

		// add the distance to the total count
		totalDistance += distanceInterval;

		// update the distance DOM element on webpage
		distance_span.textContent = parseInt(totalDistance);
	}, 3000);
});

// stops logging location when clicked
stop_div.addEventListener("click", () => {
	// stops the setInterval function
	clearInterval(interval);
	console.log(totalDistance);

	// sends the total distance to the server
	logDistance(totalDistance);

	// updates the status to Run complete
	status_div.textContent = "Run Complete";
});

// sends a request to server to delete database
delete_div.addEventListener("click", async () => {
	const data = { toDo: "delete" };

	const options = {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(data)
	};

	// send the added dream to server
	const response = await fetch("/delete", options);
	const responseJSON = await response.json();
	console.log(responseJSON);
});
