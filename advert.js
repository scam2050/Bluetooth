var bleno = require('bleno');
var fs = require('fs');
var sys = require('sys');
var child_process = require('child_process');
var Descriptor = bleno.Descriptor;
var descriptor = new Descriptor({
     uuid: '2901',
      value: 'test write' // static value, must be of type Buffer or string if set
});

var Characteristic = bleno.Characteristic;
var myrun;
var cmdstr;
var running=0;
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
	var keywrd = args[0];
	var speed = parseInt(args[1]);
	var time = parseInt(args[2]);
	if(args[0]=="run" && running==0){
	    console.log('speed is: ' + speed);
	    console.log('turning time is: ' + time);
//	    console.log(cmdstr);
	     //   myrun = exec(cmdstr);
	    //myrun = child_process.spawn('java',['-classpath','./SmartCar:classes:/opt/pi4j/lib/'*'','1000','1000']);
	    myrun = child_process.spawn('./run',[speed, time],{detached: true});
	    console.log('process is: ' +myrun.pid);
	    running=1;
	}
	else if(args[0]=="stop" && running==1){
	    console.log('killing process: ' + myrun.pid);
	    process.kill(-myrun.pid); // first kill the original process
	    // next stop the car
	   
	    myrun = child_process.spawn('./run',['0', '0'],{detached: true});
	    console.log('stopping car with process:' + myrun.pid);
	    running =0;
	    // now kill the stop process
//	    process.kill(-myrun.pid);
	}
//	fs.writeFile("command.txt",str); 
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
