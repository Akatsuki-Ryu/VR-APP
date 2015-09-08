(function() {

	var app = angular.module('train', []);

	app.controller('seatsController', function () {


		this.images = function(i) {
			return imgs[i];
		};

		this.carriages =  function(i) {
			return carriageImages[i];
		};


		function valueOfLocation(location) {
			return locations.indexOf(location);
		}

		this.selectSeat = function (seatid) {
			selectedSeat = seats.seatid;
			isSlctd = true;
		};

		this.closeFooter = function () {
			isSlctd = true;
		};

		this.isSelected = function () {
			return isSlctd;
		};

		this.isBooked = function (seatId) {
			return typeof(seats.seatId.start) !== 'undefined' && valueOfLocation(location) <= valueOfLocation(seats.seatId.start);
		};

		this.isEmpty = function (seatId) {
			return typeof(seats.seatId.start) === 'undefined' || valueOfLocation(seats.seatId.start) <= valueOfLocation(location);
		};

	});

	var locations = ["Helsinki", "Nuuksio", "Tampere", "Oulu"];

	var seats = {
		'a1': {start: "Helsinki", end: "Oulu", asiakas: "Make"},
		"a2": {start: "Helsinki", end: "Tampere", asiakas: "Make", description: "Jatkaa laiturille kuusi"},
		"a3": {start: "Helsinki", end: "Oulu", asiakas: "Make"},
		"a4": {start: "Helsinki", end: "Tampere", asiakas: "Make", description: "Jatkaa laiturille kuusi"},
		"a5": {start: "Helsinki", end: "Oulu", asiakas: "Make"},
		"a6": {start: "Helsinki", end: "Tampere", asiakas: "Make", description: "Jatkaa laiturille kuusi"},
		"a7": {start: "Helsinki", end: "Oulu", asiakas: "Make"},
		"a8": {start: "Helsinki", end: "Tampere", asiakas: "Make", description: "Jatkaa laiturille kuusi"},
		"a9": {start: "Nuuksio", end: "Oulu", asiakas: "Make"},
		"a10": {start: "Helsinki", end: "Tampere", asiakas: "Make", description: "Jatkaa laiturille kuusi"},
		"a11": {start: "Tampere", end: "Oulu", asiakas: "Make"},
		"a54": {start: "Helsinki", end: "Tampere", asiakas: "Make", description: "Jatkaa laiturille kuusi"},
		"a13": {start: "Tampere", end: "Oulu", asiakas: "Make"},
		"a14": {start: "Helsinki", end: "Tampere", asiakas: "Make", description: "Jatkaa laiturille kuusi"},
		"a16": {start: "Helsinki", end: "Oulu", asiakas: "Make"},
		"a24": {start: "Helsinki", end: "Tampere", asiakas: "Make", description: "Jatkaa laiturille kuusi"},
		"a17": {start: "Helsinki", end: "Oulu", asiakas: "Make"},
		"a18": {start: "Helsinki", end: "Tampere", asiakas: "Make", description: "Jatkaa laiturille kuusi"}
	};

	var isSlctd = false;

	var selectedSeat = seats.a1;

	var seatImages = ["../images/red-seat.svg", "../images/green-seat.svg"];

	var carriageImages = ["../images/carriage_v_1.svg"];

})();
