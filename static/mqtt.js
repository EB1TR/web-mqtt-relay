clientID = "web"
mqttHOST = "192.168.33.200"
base_topic = "dtry/relay13023"
clientID += new Date().getUTCMilliseconds()
client = new Paho.MQTT.Client(mqttHOST, Number(9001), clientID);

client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;
client.onFailure = onConnectionLost;

client.connect({
    onSuccess:onConnect,
    onFailure:onConnectionLost
});

relays = {"r1": false, "r2": false, "r3": false, "r4": false, "r5": false, "r6": false, "r7": false, "r8": false}

function onConnect() {
  console.log("Connectado a MQTT.");
  $('#contenor').removeClass("FinFout")
  client.subscribe(base_topic + "/out/r1");
  client.subscribe(base_topic + "/out/r2");
  client.subscribe(base_topic + "/out/r3");
  client.subscribe(base_topic + "/out/r4");
  client.subscribe(base_topic + "/out/r5");
  client.subscribe(base_topic + "/out/r6");
  client.subscribe(base_topic + "/out/r7");
  client.subscribe(base_topic + "/out/r8");
  console.log("Suscrito a topics MQTT.");
}

function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0) {
    console.log("Conexión perdida a MQTT:"+responseObject.errorMessage);
  }
  $('#contenor').addClass("FinFout")
}

function set_ry(){
    for (const [key, value] of Object.entries(relays)) {
        topic = base_topic + "/in/" + key;
        if (value) payload = "ON" 
        else payload = "OFF"
        message = new Paho.MQTT.Message(String(payload));
        message.destinationName = topic;
        client.send(message);
    }
}

function send_command(dato){
    encl = true
    if ($("#encl option:selected" ).val() == "1") encl = false
    relays[dato] = !relays[dato];
    if (encl) {
        for (const [key, value] of Object.entries(relays)) {
            if (key != dato) {
                relays[key] = false
            }
        }
        set_ry()
    } else {
        topic = base_topic + "/in/" + dato;
        if (relays[dato]) payload = "ON";
        else payload = "OFF";
        message = new Paho.MQTT.Message(String(payload));
        message.destinationName = topic;
        client.send(message);
    }
}

function onMessageArrived(message) {
    let now = new Date();
    let ry = message.destinationName.split("/")[3]
    $('#'+ry).text(ry.toUpperCase() + ": " + message.payloadString)
    if (message.payloadString == "ON") {
        $('#'+ry).removeClass("spanoff").addClass("spanon")
        relays[ry] = true
    } else {
        $('#'+ry).removeClass("spanon").addClass("spanoff")
        relays[ry] = false
    }
    $('#ts').text(now.toLocaleString())
}
