var bleno = require('bleno');
var fs = require('fs');
var Descriptor = bleno.Descriptor;
var descriptor = new Descriptor({
     uuid: '2901',
      value: 'test write' // static value, must be of type Buffer or string if set
});

var Characteristic = bleno.Characteristic;
var characteristic = new Characteristic({
    uuid:  '01010101010101010101010101010111',
    properties: ['write', 'writeWithoutResponse','notify'],
  //  value: 'ff', // optional static value, must be of type Buffer
    descriptors: [ descriptor ],
    onWriteRequest: function(data, offset, withoutResponse, callback) {
    console.log('************************');
	console.log('We got: ' + data); // THIS BIT HERE is where we get data
	var str = data.toString('utf8');
	var args = str.split(":");	 
	var speed = parseInt(args[0]);
	var time = parseInt(args[1]);
	 console.log('speed is: ' + speed);
	console.log('time is: ' +time);
	fs.writeFile("command.txt",str);
//	fs.close();
     
   callback(Characteristic.RESULT_SUCCESS);
    }
       });
var PrimaryService = bleno.PrimaryService;
var primaryService = new PrimaryService({
   //   uuid: 'fffffffffffffffffffffffffffffff0',
        uuid:  '01010101010101010101010101010101',
    characteristics: [ characteristic ]
   
  });
var services = [ primaryService ];
bleno.on('advertisingStart', function(error){
		        console.log('on -> advertisingStart: ' + (error ? 'error ' + error : 'success'));
		if(!error){
			   
			  bleno.setServices( services );
			  }
 });
bleno.on('stateChange', function(state) {
	 console.log('BLE stateChanged to: ' + state);
	 if (state === 'poweredOn') {
//	    bleno.startAdvertising('maypi',['fffffffffffffffffffffffffffffff0']);
	    bleno.startAdvertising('maypi',['01010101010101010101010101010101']);
	    } else {
	      bleno.stopAdvertising();
            }
});
