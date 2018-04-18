import React from 'react';
import { View, Image, Text, TouchableHighlight, Avatar, Picker, TextInput } from 'react-native';
import NavigationBar from 'navigationbar-react-native';
import {Button} from 'react-native-elements';
import { StackNavigator } from 'react-navigation';
import firebase from "../config/firebase";
import { userName, userID } from '../screens/SignInScreen';

//import Expo from 'expo-server-sdk';
/*
// Create a new Expo SDK client
let expo = new Expo();*/

const db = firebase.firestore();

const eating_clubs = ["Cannon", "Cap", "Charter", "Cloister", "Colonial", "Cottage", "Ivy", "Quad",
"Terrace", "TI", "Tower"]
const all_options = ["Wilcox", "Wu", "Rocky", "Mathey", "Whitman", "Frist", "Forbes", "CJL", "Grad College"]
const data_flip = {'7:30 AM': 0, '8:00 AM': 1, '8:30 AM': 2, '9:00 AM': 3, '9:30 AM': 4, '10:00 AM': 5, '10:30 AM': 6,
'11:00 AM': 7, '11:30 AM': 8, '12:00 PM': 9, '12:30 PM': 10, '1:00 PM': 11, '1:30 PM': 12, '2:00 PM': 13, '2:30 PM': 14,
'3:00 PM': 15, '3:30 PM': 16, '4:00 PM': 17, '4:30 PM': 18, '5:00 PM': 19, '5:30 PM': 20, '6:00 PM': 21, '6:30 PM': 22,
'7:00 PM': 23, '7:30 PM': 24}
const weekdays = [
{key:0, day:'Sunday'}, {key:1, day:'Monday'}, {key:2, day:'Tuesday'}, {key:3, day:'Wednesday'}, {key:4, day:'Thursday'},
{key:5, day:'Friday'}, {key:6, day:'Saturday'}
]

export default class FinalRequestScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { params } = navigation.state;
    return {
      title: 'Meal Request',
    }
  };

  state = {location: "Wilcox"}
  
  sendPushNotification() {
    return fetch('https://exp.host/--/api/v2/push/send', {
      body: JSON.stringify({
        to: "ExponentPushToken[VhFOv-EQXaoL8oG2Tf_haQ]",
        title: "title",
        body: "body",
        data: { message: `hello` },
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });
  }


  renderOptions() {
    if (this.state.location == "Eating Clubs") {
      return (<View>
        <Picker
        selectedValue = {"Cannon"}
        onValueChange = {(itemValue, itemIndex) => {this.setState({location: itemValue})
        }}>
        <Picker.Item label="Cannon" value="Cannon" />
        <Picker.Item label="Cap" value="Cap" />
        <Picker.Item label="Charter" value="Charter" />
        <Picker.Item label="Cloister" value="Cloister" />
        <Picker.Item label="Colonial" value="Colonial" />
        <Picker.Item label="Cottage" value="Cottage" />
        <Picker.Item label="Ivy" value="Ivy" />
        <Picker.Item label="Quad" value="Quad" />
        <Picker.Item label="Terrace" value="Terrace" />
        <Picker.Item label="TI" value="TI" />
        <Picker.Item label="Tower" value="Tower" />
      </Picker>
      <Button title="< Back" backgroundColor='#f4511e' borderRadius={50} raised onPress={() => {this.setState({location: "Wilcox"})}}/>
      </View>);
    } else if (eating_clubs.indexOf(this.state.location) != -1) {
      return (<View>
      <Picker
        selectedValue = {this.state.location}
        onValueChange = {(itemValue, itemIndex) => {this.setState({location: itemValue})
        }}>
        <Picker.Item label="Cannon" value="Cannon" />
        <Picker.Item label="Cap" value="Cap" />
        <Picker.Item label="Charter" value="Charter" />
        <Picker.Item label="Cloister" value="Cloister" />
        <Picker.Item label="Colonial" value="Colonial" />
        <Picker.Item label="Cottage" value="Cottage" />
        <Picker.Item label="Ivy" value="Ivy" />
        <Picker.Item label="Quad" value="Quad" />
        <Picker.Item label="Terrace" value="Terrace" />
        <Picker.Item label="TI" value="TI" />
        <Picker.Item label="Tower" value="Tower" />
      </Picker>
      <Button title="< Back" backgroundColor='#f4511e' borderRadius={50} raised onPress={() => {this.setState({location: "Wilcox"})}}/>
      </View>);
    } else if (all_options.indexOf(this.state.location) != -1) {
      return (<Picker
        selectedValue = {this.state.location}
        onValueChange = {(itemValue, itemIndex) => {this.setState({location: itemValue})
        }}>
        <Picker.Item label="Wilcox" value="Wilcox" />
        <Picker.Item label="Wu" value="Wu" />
        <Picker.Item label="Rocky" value="Rocky" />
        <Picker.Item label="Mathey" value="Mathey" />
        <Picker.Item label="Whitman" value="Whitman" />
        <Picker.Item label="Frist" value="Frist" />
        <Picker.Item label="Forbes" value="Forbes" />
        <Picker.Item label="CJL" value="CJL" />
        <Picker.Item label="Grad College" value="Grad College" />
        <Picker.Item label="Eating Clubs >" value="Eating Clubs" />
        <Picker.Item label="Custom Location >" value="Custom Location" />
      </Picker>);
    } else {
      return (<View>
      <TextInput
        style = {{height: 40, borderWidth: 0.5, backgroundColor: 'white', margin: 20, padding: 10}}
        onChangeText = {(text) => this.setState({location: text})}
        // value = {this.state.location}
        maxLength = {40}
        placeholder = {"Type your custom location..."}
      />
      <Button title="< Back" backgroundColor='#f4511e' borderRadius={50} raised onPress={() => {this.setState({location: "Wilcox"})}}/>
      </View>);
    }
  }

	render() {
		const { params } = this.props.navigation.state;
		const name = params ? params.name : null;
    const members = params ? params.members : null;
    const time = params ? params.time : null;
    const dateobj = params ? params.dateobj : null;
    const length = params ? params.length : null;
    const isGroup = params.isGroup ? true : false;
    urls = []
    for (memberID in members) {
      urls.push(`http://graph.facebook.com/${memberID}/picture?type=large`)
    }
    urls.push(`http://graph.facebook.com/${userID}/picture?type=large`)
    if (isGroup) {
      return (
        <View style = {{flex:1}}>
          <View style={{justifyContent: "center",alignItems: "center",padding:30}}>
            <View style={{flexDirection:'row', overflow: 'hidden', paddingRight:10, borderRadius:50}} >
                  <View style={{overflow: 'hidden', borderTopLeftRadius: 50, borderBottomLeftRadius: 50}}>
                    <Image
                      style={{width: 50, height: 100,}}
                      source={{uri:urls[0]}} />
                  </View>
                  <View style ={{overflow: 'hidden', borderTopRightRadius: 50, borderBottomRightRadius: 50}}>
                    <Image
                      style={{width: 50, height: 50, }}
                      source={{uri:urls[1]}} />
                    <Image
                      style={{width: 50, height: 50, }}
                      source={{uri:urls[2]}}/>
                  </View>
                </View>
                { name.includes("without") ? (
                  <View>
                    <Text style={{fontSize:20, fontWeight:'bold', textAlign: 'center'}}>{name.split("without ")[0] + "without"}</Text>
                    <Text style={{fontSize:20, fontWeight:'bold', textAlign: 'center'}}>{name.split("without ")[1]}</Text>
                  </View>
                ) : (
            <Text style={{fontSize:20, fontWeight:'bold'}}>{name}</Text>
                )}
            <Text style={{fontSize:15}}>{dateobj.substring(0,10)}</Text>
            <Text style={{fontSize:15}}>{time}</Text>
          </View>
          <View style={{justifyContent: "center",alignItems: "center"}}>
               <Text>Select a Location:</Text>
          </View>
          <View style = {{marginBottom:50}}>
            { this.renderOptions() }
          </View>
          <Button title="Submit" backgroundColor='#f4511e' borderRadius={50} raised onPress={this.submitGroupRequest}/>
        </View>
      )
    }
    else {
      return (
  			<View style = {{flex:1}}>
    			<View style={{justifyContent: "center",alignItems: "center",padding:30}}>
      			<Image
               		style={{width: 100, height: 100, borderRadius: 50}}
               		source={{uri: `http://graph.facebook.com/${Object.keys(members)[0]}/picture?type=large`}}
             		/>
      			<Text style={{fontSize:20, fontWeight:'bold'}}>{name.split(" ")[0]}</Text>
            <Text style={{fontSize:15}}>{dateobj.substring(0,10)}</Text>
      			<Text style={{fontSize:15}}>{time}</Text>
    			</View>
    			<View style={{justifyContent: "center",alignItems: "center"}}>
    			     <Text>Select a Location:</Text>
    			</View>
          <View style = {{marginBottom:50}}>
            { this.renderOptions() }
          </View>
    			<Button title="Submit" backgroundColor='#f4511e' borderRadius={50} raised onPress={this.submitRequest}/>
  			</View>
  		)
    }
	}

  // reschedule group request
  submitGroupRequest = () => {
    prevData = this.props.navigation.state.params
    reschedule = prevData['reschedule'];
    sent = prevData['sent'];
    data = new Object()
    members = prevData['members']
    for (memberID in members) {
      if (memberID != userID)
        members[memberID] = {name: members[memberID], accepted: false, declined: false}
      else
        members[memberID] = {name: members[memberID], accepted: true, declined: false}
    }
    data['members'] = members
    data['initiator'] = userID
    data['groupName'] = prevData['name']
    data['Location'] = this.state.location
    data['DateTime'] = new Date(prevData['dateobj'])
    data['Length'] = prevData['length']
    data['TimeString'] = prevData['time']
    if (data['Location'] != "" && data['Location'] != "Custom Location") {
      db.collection("users").doc(userID).collection('Sent Group Requests').add(data)
          .then((docRef) => {
              console.log("Document written with ID: ", docRef.id);
              for (let thisid in prevData['members']) {
                if (thisid != userID) {
                db.collection("users").doc(thisid).collection('Received Group Requests').doc(docRef.id).set(data)
                expotoken = "";
                db.collection("users").doc(thisid).get().then(function(doc) {
                  expotoken = doc.data().Token;
                  console.log("got token " + expotoken);

                if (expotoken !== undefined) {
                return fetch('https://exp.host/--/api/v2/push/send', {
                  body: JSON.stringify({
                    to: expotoken,
                    //title: "title",
                    body: `New group meal request from ${userName}!`,
                    data: { message: `New group meal request from ${userName}!` },
                  }),
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  method: 'POST',
                });
                }

                }).catch(function(error) {
                  console.log("Error getting document:", error);
                });
              }
              }
              day = weekdays[data['DateTime'].getDay()].day
              amPM = data['DateTime'].getHours() >= 12 ? "PM" : "AM"
              hours = (data['DateTime'].getHours() % 12 || 12) + ":" + ("0" + data['DateTime'].getMinutes()).slice(-2) + " " + amPM
              index = data_flip[hours]

              // update freetimes
              freetimeRef = db.collection("users").doc(userID).collection('Freetime').doc(day);
              freetimeRef.get().then((doc) => {
                freetimeData = doc.data();
                freetimeData['Freetime'][index] = 2
                if (data['Length'] === 1) {
                  freetimeData['Freetime'][index+1] = 2
                }
                // console.log("my data", freetimeData)
              freetimeRef.set(freetimeData).then(() => {
                console.log("My Document updated");
                })
                .catch(function(error) {
                  console.error("Error updating", error);
                });
              })
          })
          .catch(function(error) {
              console.error("Error adding document: ", error);
          });
    }





    this.props.navigation.popToTop()

  }

  submitRequest = () => {
    somePushTokens = [];
    prevData = this.props.navigation.state.params
    reschedule = prevData['reschedule'];
    sent = prevData['sent'];
    data = new Object()
    data['FriendName'] = prevData['name']
    data['FriendID'] = Object.keys(prevData['members'])[0]
    if (this.state.location == "Eating Clubs") {
      data['Location'] = "Cannon"
    } else {
      data['Location'] = this.state.location
    }
    data['DateTime'] = new Date(prevData['dateobj'])
    data['Length'] = prevData['length']
    data['TimeString'] = prevData['time']
    if (data['Location'] != "" && data['Location'] != "Custom Location") {
      db.collection("users").doc(userID).collection('Sent Requests').add(data)
          .then(function(docRef) {
              console.log("Document written with ID: ", docRef.id);
              data['FriendName'] = userName
              data['FriendID'] = userID
              for (let thisid in prevData['members']) {
                db.collection("users").doc(thisid).collection('Received Requests').doc(docRef.id).set(data)
                expotoken = "";
                db.collection("users").doc(thisid).get().then(function(doc) {
                  expotoken = doc.data().Token;
                  console.log("got token " + expotoken);

                if (expotoken !== undefined) {
                return fetch('https://exp.host/--/api/v2/push/send', {
                  body: JSON.stringify({
                    to: expotoken,
                    //title: "title",
                    body: `New meal request from ${userName}!`,
                    data: { message: `New meal request from ${userName}!` },
                  }),
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  method: 'POST',
                });
                }

                }).catch(function(error) {
                  console.log("Error getting document:", error);
                });


              }
          })
          .catch(function(error) {
              console.error("Error adding document: ", error);
          })
      if (reschedule !== undefined) {
        console.log("RESCHEDULE: " + reschedule);
        if (sent == 2) { // meal being rescheduled
          prevMealRef = db.collection("users").doc(userID).collection('Meals').doc(reschedule)
          prevMealRef.get().then(function(doc) {
            prevMealRefData = doc.data();
            if (prevMealRefData && prevMealRefData['DateTime']) {
              weekday = weekdays[prevMealRefData['DateTime'].getDay()].day
              amPM = prevMealRefData['DateTime'].getHours() >= 12 ? "PM" : "AM"
              hours = (prevMealRefData['DateTime'].getHours() % 12 || 12) + ":" + ("0" + prevMealRefData['DateTime'].getMinutes()).slice(-2) + " " + amPM
              index = data_flip[hours]

              // update freetimes
              freetimeRef = db.collection("users").doc(userID).collection('Freetime').doc(weekday);
              freetimeRef.get().then(function(doc) {
                freetimeData = doc.data();
                freetimeData['Freetime'][index] = 1
                if (prevMealRefData['Length'] === 1) {
                  freetimeData['Freetime'][index+1] = 1
                }
              // console.log("my data", freetimeData)
              freetimeRef.update(freetimeData).then(() => {
                console.log("My Document updated");
                })
                .catch(function(error) {
                  console.error("Error updating", error);
                });
              })

              for (let thisid in prevData['members']) {
                freetimeRef_other = db.collection("users").doc(thisid).collection('Freetime').doc(weekday);
                freetimeRef_other.get().then(function(doc) {
                  freetimeData_other = doc.data();
                  freetimeData_other['Freetime'][index] = 1
                  if (prevMealRefData['Length'] === 1) {
                    freetimeData_other['Freetime'][index+1] = 1
                  }
                // console.log(freetimeData_other)
                freetimeRef_other.update(freetimeData_other).then(() => {
                  console.log("Document updated");
                  })
                  .catch(function(error) {
                    console.error("Error updating", error);
                  });
                })
              }
              db.collection("users").doc(userID).collection('Meals').doc(reschedule).delete().then(() => {
                console.log("Document successfully deleted!");
                for (let memberid in prevData['members'])
                  db.collection("users").doc(memberid).collection('Meals').doc(reschedule).delete()
              }).catch(function(error) {
                console.error("Error removing document: ", error);
              });
            }
          }).catch(function(error) {
            console.error("Error updating freetime: ", error);
          })
        }
        else if (sent == true) {
          db.collection("users").doc(userID).collection('Sent Requests').doc(reschedule).delete().then(() => {
            console.log("Document successfully deleted!");
            for (let thisid in prevData['members'])
              db.collection("users").doc(thisid).collection('Received Requests').doc(reschedule).delete()
          }).catch(function(error) {
            console.error("Error removing document: ", error);
          });
        }
        else {
          db.collection("users").doc(userID).collection('Received Requests').doc(reschedule).delete().then(() => {
            console.log("Document successfully deleted!");
            db.collection("users").doc(Object.keys(prevData['members'])[0]).collection('Sent Requests').doc(reschedule).delete()
          }).catch(function(error) {
            console.error("Error removing document: ", error);
          });
        }
      }
      else console.log("NOT RESCHEDULE");

      // Create the messages that you want to send to clents
/*let messages = [];
for (let pushToken of somePushTokens) {
  // Each push token looks like ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]

  // Check that all your push tokens appear to be valid Expo push tokens
  if (!Expo.isExpoPushToken(pushToken)) {
    console.error(`Push token ${pushToken} is not a valid Expo push token`);
    continue;
  }

  // Construct a message (see https://docs.expo.io/versions/latest/guides/push-notifications.html)
  messages.push({
    to: pushToken,
    sound: 'default',
    body: 'New meal request!',
    //data: { withSome: 'data' },
  })
}

// The Expo push notification service accepts batches of notifications so
// that you don't need to send 1000 requests to send 1000 notifications. We
// recommend you batch your notifications to reduce the number of requests
// and to compress them (notifications with similar content will get
// compressed).
let chunks = expo.chunkPushNotifications(messages);

(async () => {
  // Send the chunks to the Expo push notification service. There are
  // different strategies you could use. A simple one is to send one chunk at a
  // time, which nicely spreads the load out over time:
  for (let chunk of chunks) {
    try {
      let receipts = await expo.sendPushNotificationsAsync(chunk);
      console.log(receipts);
    } catch (error) {
      console.error(error);
    }
  }
})();*/

      this.props.navigation.popToTop()
    }
  }
}
