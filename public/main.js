(function() {

	/**
	** Hardcoded data
	**/

	var locations = ["HELSINKI", "HÄMEENLINNA", "TAMPERE", "KOKKOLA", "OULU"];

	var app = angular.module('train', ['ngAnimate']);

	/**
	** Socket
	**/

	app.factory('socket', function ($rootScope) {
		var socket = io.connect();
		return {
			on: function (eventName, callback) {
				socket.on(eventName, function () {
					var args = arguments;
					$rootScope.$apply(function () {
						callback.apply(socket, args);
					});
				});
			},
			emit: function (eventName, data, callback) {
				socket.emit(eventName, data, function () {
					var args = arguments;
					$rootScope.$apply(function () {
						if (callback) {
							callback.apply(socket, args);
						}
					});
				})
			}
		};
	});

/*
	app.directive('moveMe' function($animate) {
		return function ($scope, element, attrs) {
			scope.$watch(attrs.hideMe, function(newVal) {
				if(newVal) {
					$animate.addClass(element, "move")
				} else {
					$animate.removeClass(element, "move")
				}
			})
		}
	})

	app.animation(".move", function() {
		return {
			addClass: function(element, className) {
				TweenMax.to(element, 1, {opacity: 0})
			},
			removeClass: function(element, className) {
				TweenMax.to(element, 1, {opacity: 1})

			},			
		}
	})
*/
	
	/**
	** Main Controller
	**/

	app.controller('SeatsController', ['socket', function(socket) {

		var controller = this;
		this.seats = {};
		this.locationIndex = 0;
		this.locationData = ["HELSINKI", "HÄMEENLINNA", "TAMPERE", "KOKKOLA", "OULU"];
		this.locationMap = {"HELSINKI": 0, "HÄMEENLINNA": 1, "TAMPERE": 2, "KOKKOLA": 3, "OULU": 4};
		this.idConverter = {};
		this.demoIsGoing = false;
		this.restartingData = false;
		this.pageIndex = 0;


		this.dataRestart = function() {
			this.restartingData = true; 
			this.closeFooter();
			this.demoIsGoing = false;
			this.booleanCarriages[this.pageIndex] = false;
			this.booleanCarriages[0] = true;
			this.pageIndex = 0;
			var reset = {};
			for(var seat in this.seats){
				if(this.seats.hasOwnProperty(seat)) {
					console.log(seat);
					reset[seat] = {id: seat, number: this.seats[seat].number}
					console.log(reset[seat]); 	
				}
				
			}
			this.seats = {}; 
			this.seats = reset;
			console.log(this.seats);
			console.log('restart');
			this.locationIndex = 0;
			socket.emit('newData')
		}


		this.closeFooter = function () {
			this.isSelected = false;
		};


		this.generateSeatData = function(carriage, part, row, seat) {
			if(carriage !== "t"+carriageIterator) {
				console.log("helllo");
				carriageIterator++;
				seatNumber = 0;
			}
			seatNumber ++;
			var newId = nextId();
			if(this.seats.hasOwnProperty(newId)) {
				this.seats[newId]["number"] = seatNumber;
			} else {
				this.seats[newId] = {number: seatNumber};
			}
			this.idConverter[carriage + part + row + seat] = newId;
			this.carriageArray[carriageIterator -1].seats.push(newId);

			return newId;
		};

		this.hasTask = function(id) {

			return this.seats !== undefined && this.seats[id].description !== undefined && this.location === this.seats[id].start.toUpperCase();
		};


		this.selectedSeatIsEmpty = function() {
			console.log()
			if(this.selectedSeat === undefined) {
				return false;
			} else {
				return !(this.selectedSeat.start !== undefined && this.locationIndex >= this.locationMap[this.selectedSeat.start] && this.locationIndex < this.locationMap[this.selectedSeat.end]);
			}
		};

		this.buySeat = function(locatn){
			if(locatn !== undefined) {
				this.selectedSeat.start = this.location;
				this.selectedSeat.end = locatn;
				socket.emit('seatBought', this.selectedSeat);
				this.closeFooter();
			}

		};

		this.launchDemo = function() {
			console.log("launchDemo");
			this.demoIsGoing = true;
			socket.emit('isGoing', true);
			this.moveDown(0);
		}

		this.location = locations[this.locationIndex];

		this.travelSection = locations[this.locationIndex] + " - " + locations[1];

		this.image = seatImages;

		this.carriagesImages =  carriageImages;

		this.carriageArray = carriageArray;

		this.emptySeats = function(carriageNumber) {
			var seatList = carriageArray[carriageNumber-1].seats;
			var result = 0;
			for(var i in seatList){
				var sId = seatList[i];
				if(this.seats[sId].start === undefined  || (this.locationIndex < valueOfLocation(this.seats[sId].start) || this.locationIndex >= valueOfLocation(this.seats[sId].end))) { result++; }
			}
			return result;
		};

		this.tasks = function(carriageNumber) {
			var seatList = carriageArray[carriageNumber-1].seats;
			var taskId = [];
			for(var i in seatList){
				var sId = seatList[i];
				if(this.seats[sId].start !== undefined && this.locationIndex === valueOfLocation(this.seats[sId].start) && this.seats[sId].description !== undefined) { taskId.push(sId); }
			}
			return taskId;
		};


		function valueOfLocation(loctn) {
			if(loctn===undefined) {
				return undefined;
			} else {
				return locations.indexOf(loctn);
			}
		};

		this.selectedSeat = this.seats[2];


		this.seatSelect = function (carriage, part, row, seat) {

			var seatId = this.idConverter[carriage + part + row + seat];
			var bool = this.selectedSeat !== this.seats[seatId];
			this.selectedSeat = this.seats[seatId];
			console.log(this.selectedSeat);
			this.searchButtonIsClicked = false;
			this.searchingIsGoing = false;
			this.isSelected = !this.isSelected || bool;
		};

		this.changeLocation = function() {
						this.searchingIsGoing = false;
			if(this.locationIndex < (locations.length - 2)) {
				socket.emit('nextConnection');
				controller.locationIndex++;
				controller.location = locations[controller.locationIndex];
				controller.travelSection = locations[controller.locationIndex] + " - " + locations[controller.locationIndex + 1];
			} else if(this.locationIndex === (locations.length - 2)) {
				this.travelSection = "Kiitos Matkasta!"
				socket.emit('nextConnection');
				controller.dataRestart();
			}
		};

		this.isSelected = false;

		this.isBooked = function (carriage, part, row, seat) {
			var seatId = this.idConverter[carriage+part+row+seat];
			var result = this.seats[seatId].start !== undefined && this.locationIndex >= this.locationMap[this.seats[seatId].start] && this.locationIndex < this.locationMap[this.seats[seatId].end];
			if(this.seats[seatId].end !== undefined && !result) {
				//console.log(this.locationIndex >= this.locationMap[this.seats[seatId].start]);
				//console.log("ola " + this.seats[seatId].end + " " + this.locationMap[this.seats[seatId].end]);
			}
			return result;
		};


		this.canTravel = function(boolean) {
			var lastLocIndex = locations.length;
			if(this.locationIndex  === lastLocIndex-1) {
				return [];
			}
			//console.log(this.selectedSeat);
			console.log(this.locationIndex);
			if(this.selectedSeat !== undefined && this.selectedSeat.next !== undefined) {
				console.log(valueOfLocation(this.selectedSeat.next) < this.locationIndex);	
			} else {
				console.log('ei nextiä');
			}
			
			if(!boolean && this.selectedSeat !== undefined && (this.selectedSeat.next !== undefined && valueOfLocation(this.selectedSeat.next) > this.locationIndex)) {
				lastLocIndex = valueOfLocation(this.selectedSeat.next) + 1;
			}
			var result = locations.slice(this.locationIndex +1, lastLocIndex);
			return result;
		};


		this.searchingIsGoing = false;
		this.seatSection = [];
		this.searchButtonIsClicked = false;
		this.searchClicked = function() {
			this.searchButtonIsClicked = !this.searchButtonIsClicked;
		};

		this.showFreeSeatsFromCarriage = function(travelLocation) {
			console.log("adsf");
			var carriageId = "t" + this.pageIndex;
			var index = 0;
			for(var seatIndex in this.seatSection) {
				var seatId = this.seatSection[seatIndex];
				this.seats[seatId].isFreeFromSearchingRange = false;
			}
			this.seatSection = [];
			console.log(this.carriageArray);
			for(var i in this.carriageArray) {
				if(this.carriageArray[i].id === carriageId) {
					
					this.seatSection = this.carriageArray[i].seats;
					index = i;
				}
			}
			var counter = 0;
			
			for (var seatIndex in this.seatSection) {
				var seatId = this.seatSection[seatIndex];
				if (!(this.seats[seatId].start !== undefined && this.locationIndex  >= valueOfLocation(this.seats[seatId].start) && this.locationIndex  < valueOfLocation(this.seats[seatId].end)) && (this.seats[seatId].next === undefined || valueOfLocation(travelLocation) <= valueOfLocation(this.seats[seatId].next))) {
					this.seats[seatId].isFreeFromSearchingRange = true;
					counter ++;
				}
			}
			this.searchingIsGoing = true
		};

		this.isValid = function(seatId){
			return this.searchingIsGoing && this.seats[seatId].isFreeFromSearchingRange;
		};

		this.nextIsDefined = function(){
			if(this.selectedSeat === undefined) {
				return false;
			} else {
				return this.selectedSeat.next !== undefined && valueOfLocation(this.selectedSeat.next) > this.locationIndex;
			}
		};

		this.booleanCarriages = [true, false, false, false, false];

		this.isNotLastCarriage = function(index) {
			console.log(index < this.booleanCarriages.size);
			return index < this.booleanCarriages.size;
		}

		this.moveDown = function(index) {
			this.searchingIsGoing = false;
			this.pageIndex++;
			this.closeFooter()
			this.booleanCarriages[index] = false;
			this.booleanCarriages[index + 1] = true;
		} 

		this.moveUp = function(index) {
			this.searchingIsGoing = false;
			this.closeFooter()
			this.pageIndex--;
			this.booleanCarriages[index] = false;
			this.booleanCarriages[index - 1] = true;
		}

		/* Tracking carriage
		*/

		this.nextCarriage = function(index) {
			return index !== 3;
		}

		this.consoleTest = function(text) {
			console.log(text);
		}



		socket.on("locationIndex", function(data) {
			console.log('locationIndex');
			controller.locationIndex = data;
			if(data < (locations.length - 2)) {
				controller.locationIndex = data;
				controller.location = locations[controller.locationIndex];
				controller.travelSection = locations[controller.locationIndex] + " - " + locations[controller.locationIndex + 1];
			} else {
				controller.demoIsGoing = false;
				controller.travelSection = "Kiitos matkasta!";
				controller.closeFooter()
				controller.booleanCarriages[controller.pageIndex] = false;
				controller.booleanCarriages[0] = true;
				controller.pageIndex = 0;
				controller.travelSection = "Kiitos Matkasta!"
			}
		});


		socket.on("seatData", function(data) {
			console.log("SeatData");
			console.log(data);
			for(var key in data) {
				if(data.hasOwnProperty(key)) {
					for(prop in data[key]) {
						if(data[key].hasOwnProperty(prop)){
							controller.seats[key][prop] = data[key][prop];
						}
					}
				}
			}
			console.log(controller.seats);
			console.log("Uusi Data");
			controller.closeFooter()

			controller.restartingData = true; 
		});

		socket.on('nextConnection', function(data){
			console.log("nextConnection");
			controller.locationIndex++;
			controller.location = locations[controller.locationIndex];
			controller.travelSection = locations[controller.locationIndex] + " - " + locations[controller.locationIndex + 1];
			for(var key in data) {
				if(data.hasOwnProperty(key)) {
					for(prop in data[key]) {
						if(data[key].hasOwnProperty(prop)){
							if(controller.seats[key].description !== undefined){
								controller.seats[key].description = undefined
							}
							controller.seats[key][prop] = data[key][prop];
						}
					}
				}
			}
		});

		socket.on('seatBought', function(data) {
			console.log('seatBought');
			controller.seats[data.id] = data;
		});



		socket.on('isGoing', function(data){
			console.log("isgoing");
			if(data) {
				console.log("jpi");
				controller.demoIsGoing = true;
			} else {
				this.demoIsGoing = false;
				controller.dataRestart();
			}	
		});


	}]);

	/*
	app.factory('Seats', function($resource){
		var seatServer = $resource('/seatData');
		return {
			seatsQuery: function() {
				return seatServert.query();
			}
		};

	});*/




	/**
	 * Generate  SeatData helper
	 * */

	var seatNumber=0;
	var carriageIterator = 1;
	var iteratorId = 0;

	function nextId() {
		iteratorId++;
		return iteratorId;
	}

	/**
	 * Train Structure
	 * */

		//Carriage 1
	var row1 = ["A"];
	var row2 = ["A","B"];
	var row3 = ["A","B","C"];
	var row4 = ["A","B","C","D"];

	var c1p1 = {id: "p1", size: new Array(1), row: row2};
	var c1p2 = {id: "p2", size: new Array(13), row: row4};
	var c1p3 = {id: "p3", size: new Array(3), row: row3};

	var c1Parts = [c1p1, c1p2, c1p3];

	var t1 = {id: "t1", parts: c1Parts, seats: []};

	//Carriage 2

	var c2p1 = {id: "p1", size: new Array(20), row: row4};

	var c2Parts = [c2p1];

	var t2 = {id: "t2", parts: c2Parts, seats: []};

	//carriage 3

	var c3p1 = {id: "p1", size: new Array(5), row: row2};
	var c3p2 = {id: "p2", size: new Array(1), row: row2};
	var c3p3 = {id: "p3", size: new Array(11), row: row4};

	var c3Parts = [c3p1, c3p2, c3p3];

	var t3 = {id: "t3", parts: c3Parts, seats: []};

	//carriage 4

	var c4p1 = {id: "p1", size: new Array(1), row: row2};
	var c4p2 = {id: "p2", size: new Array(2), row: row3};
	var c4p3 = {id: "p3", size: new Array(2), row: row2};
	var c4p4 = {id: "p4", size: new Array(15), row: row4};

	var c4Parts = [c4p1, c4p2, c4p3, c4p4];

	var t4 = {id: "t4", parts: c4Parts, seats: []};


	var carriageArray = [t1, t2, t3, t4];


	/**Image data TODO
	 * */

	var seatImages = ["/images/red-seat.svg", "/images/green-seat.svg", "/images/vr-logo.png", "/images/startpicture.jpg"];

	var carriageImages = ["/images/carriage_fix_1.svg", "/images/carriage_fix_2.svg", "/images/carriage_fix_3.svg", "/images/carriage_fix_4.svg"];

})();
