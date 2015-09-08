angular.module('train.data', ['ngResource']).factory('Seats', ['$resource', function($resource){

    var seatServer = $resource('/seatData');
    return {
        seatsQuery: function() {
            return seatServert.query();
        }
    };

}]);

//$resource('/locatoinIndex').query();
//$resource('/locations').query();