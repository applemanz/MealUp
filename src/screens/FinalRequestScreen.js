import React from 'react';
import { View, Image, Text, TouchableHighlight, Avatar, Picker, TextInput } from 'react-native';
import NavigationBar from 'navigationbar-react-native';
import {Button} from 'react-native-elements';
import { StackNavigator } from 'react-navigation';
import firebase from "../config/firebase";
import { Calendar, Permissions } from 'expo';
import { userName, userID } from '../screens/SignInScreen';

const db = firebase.firestore();

const eating_clubs = ["Cannon", "Cap", "Charter", "Cloister", "Colonial", "Cottage", "Ivy", "Quad",
"Terrace", "TI", "Tower"]
const all_options = ["Wilcox", "Wu", "Rocky", "Mathey", "Whitman", "Frist", "Forbes", "CJL", "Grad College"]
const data_flip = {'7:30 AM': 0, '8:00 AM': 1, '8:30 AM': 2, '9:00 AM': 3, '9:30 AM': 4, '10:00 AM': 5, '10:30 AM': 6,
'11:00 AM': 7, '11:30 AM': 8, '12:00 PM': 9, '12:30 PM': 10, '1:00 PM': 11, '1:30 PM': 12, '2:00 PM': 13, '2:30 PM': 14,
'3:00 PM': 15, '3:30 PM': 16, '4:00 PM': 17, '4:30 PM': 18, '5:00 PM': 19, '5:30 PM': 20, '6:00 PM': 21, '6:30 PM': 22,
'7:00 PM': 23, '7:30 PM': 24, '8:00 PM': 25, '8:30 PM': 26, '9:00 PM': 27, '9:30 PM': 28}
const late_meal_hours = ['2:00', '2:30', '3:00', '3:30', '4:00', '4:30', '8:00', '8:30', '9:00', '9:30']
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


  renderOptions = ({time}) => {
    if (late_meal_hours.indexOf(time.substring(0,4)) != -1) { // during late meal hours
      if (this.state.location == "Frist" || this.state.location == "Wilcox") {
        return (<Picker
          selectedValue = {this.state.location}
          onValueChange = {(itemValue, itemIndex) => {this.setState({location: itemValue})
          }}>
          <Picker.Item label="Frist" value="Frist" />
          <Picker.Item label="Custom Location >" value="Custom Location" />
        </Picker>);
      } else { // custom location
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
    else { // not during late meal hours
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
      } else { // custom location
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
            <Text style={{fontSize:20, fontWeight:'bold'}}>{name}</Text>
            <Text style={{fontSize:15}}>{dateobj.substring(0,10)}</Text>
            <Text style={{fontSize:15}}>{time}</Text>
          </View>
          <View style={{justifyContent: "center",alignItems: "center"}}>
               <Text>Select a Location:</Text>
          </View>
          <View style = {{marginBottom:50}}>
            { this.renderOptions({time}) }
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
            { this.renderOptions({time}) }
          </View>
    			<Button title="Submit" backgroundColor='#f4511e' borderRadius={50} raised onPress={this.submitRequest}/>
  			</View>
  		)
    }
	}

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
    data['isGroup'] = true
    if (data['Location'] != "" && data['Location'] != "Custom Location") {
      if (reschedule) {
        if (sent == 2) {
          console.log("RESCHEDULING A GROUP MEAL****************** " + reschedule)
          prevMealRef = db.collection("users").doc(userID).collection('Meals').doc(reschedule)
          prevMealRef.get().then(function(doc) {
            prevMealRefData = doc.data();
            console.log("PREV MEAL REF DATA IS " + prevMealRefData);
            if (prevMealRefData && prevMealRefData['DateTime']) {
              weekday = weekdays[prevMealRefData['DateTime'].getDay()].day
              console.log("WEEKDAY IS " + weekday)
              amPM = prevMealRefData['DateTime'].getHours() >= 12 ? "PM" : "AM"
              hours = (prevMealRefData['DateTime'].getHours() % 12 || 12) + ":" + ("0" + prevMealRefData['DateTime'].getMinutes()).slice(-2) + " " + amPM
              strTime = hours;
              index = data_flip[hours]
              console.log(hours)

              // // update freetimes
              // freetimeRef = db.collection("users").doc(userID).collection('Freetime').doc(weekday);
              // freetimeRef.get().then(function(doc) {
              //   freetimeData = doc.data();
              //   freetimeData['Freetime'][index] = 1
              //   console.log(prevMealRefData['Length'])
              //   if (prevMealRefData['Length'] === 1) {
              //     freetimeData['Freetime'][index+1] = 1
              //   }
              // // console.log("my data", freetimeData)
              // freetimeRef.update(freetimeData).then(() => {
              //   console.log("My Document updated");
              //   })
              //   .catch(function(error) {
              //     console.error("Error updating", error);
              //   });
              // })

              var freetimeRef_other = {};
              var freetimeData_other = {};
              for (let thisid in prevData['members']) {
                freetimeRef_other[thisid] = db.collection("users").doc(thisid).collection('Freetime').doc(weekday);
                freetimeRef_other[thisid].get().then(function(doc) {
                  freetimeData_other[thisid] = doc.data();
                  freetimeData_other[thisid]['Freetime'][index] = 1
                  if (prevMealRefData['Length'] === 1) {
                    freetimeData_other[thisid]['Freetime'][index+1] = 1
                  }
                  console.log("UPDATING FREETIME FOR " + thisid + " at " + weekday + " " + index)
                freetimeRef_other[thisid].update(freetimeData_other[thisid]).then(() => {
                  console.log("freetime Document updated for " + thisid);
                  })
                  .catch(function(error) {
                    console.error("Error updating", error);
                  });
                })
              }
            }
            db.collection("users").doc(userID).collection('Meals').doc(reschedule).delete().then(() => {
              console.log("Document successfully deleted!");
              for (let thisid in prevData['members']) {
                if (thisid != userID) {
                db.collection("users").doc(thisid).collection('Meals').doc(reschedule).delete()
                }
              }
            });
          });
          
          db.collection("users").doc(userID).collection('Sent Group Requests').add(data)
          .then(function(docRef) {
            for (let thisid in prevData['members']) {
              if (thisid != userID) {
              db.collection("users").doc(thisid).collection('Received Group Requests').doc(docRef.id).set(data)
              expotoken = "";
            db.collection("users").doc(thisid).get().then(function(doc) {
              expotoken = doc.data().Token;
              console.log("got token " + expotoken);

            if (expotoken !== undefined) {
              console.log("SENDING NOTIFICATION NEW GROUP MEAL REQUEST FROM " + userName + " to " + thisid);
            return fetch('https://exp.host/--/api/v2/push/send', {
              body: JSON.stringify({
                to: expotoken,
                //title: "title",
                body: `Group meal reschedule request from ${userName}!`,
                data: { message: `Group meal reschedule request from ${userName}!` },
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
            console.log("UPDATE MY OWN FREETIME " + userID + " on " + day + " at " + index)
            freetimeRef = db.collection("users").doc(userID).collection('Freetime').doc(day);
            freetimeRef.get().then(function(doc) {
              freetimeData = doc.data();
              freetimeData['Freetime'][index] = 2
              if (data['Length'] === 1) {
                freetimeData['Freetime'][index+1] = 2
              }
              console.log("my data", freetimeData)
            freetimeRef.update(freetimeData).then(() => {
              console.log("My Document updated with my freetimes for reschedule group request");
              console.log(freetimeData)
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
        else { // rescheduling sent group request
          prevMealRef = db.collection("users").doc(userID).collection('Sent Group Requests').doc(reschedule)
          prevMealRef.get().then(function(doc) {
            prevMealRefData = doc.data();
            console.log("PREV MEAL REF DATA IS " + prevMealRefData);
            if (prevMealRefData && prevMealRefData['DateTime']) {
              weekday = weekdays[prevMealRefData['DateTime'].getDay()].day
              console.log("WEEKDAY IS " + weekday)
              amPM = prevMealRefData['DateTime'].getHours() >= 12 ? "PM" : "AM"
              hours = (prevMealRefData['DateTime'].getHours() % 12 || 12) + ":" + ("0" + prevMealRefData['DateTime'].getMinutes()).slice(-2) + " " + amPM
              strTime = hours;
              index = data_flip[hours]
              console.log(hours)
              var freetimeRef_other = {};
              var freetimeData_other = {};
              for (let thisid in prevData['members']) {
                freetimeRef_other[thisid] = db.collection("users").doc(thisid).collection('Freetime').doc(weekday);
                freetimeRef_other[thisid].get().then(function(doc) {
                  freetimeData_other[thisid] = doc.data();
                  freetimeData_other[thisid]['Freetime'][index] = 1
                  if (prevMealRefData['Length'] === 1) {
                    freetimeData_other[thisid]['Freetime'][index+1] = 1
                  }
                  console.log("UPDATING FREETIME FOR " + thisid + " at " + weekday + " " + index)
                freetimeRef_other[thisid].update(freetimeData_other[thisid]).then(() => {
                  console.log("freetime Document updated for " + thisid);
                  })
                  .catch(function(error) {
                    console.error("Error updating", error);
                  });
                })
              }

            }
          db.collection("users").doc(userID).collection('Sent Group Requests').doc(reschedule).set(data)
        .then((docRef) => {
            for (let thisid in prevData['members']) {
              if (thisid != userID) {
              db.collection("users").doc(thisid).collection('Received Group Requests').doc(reschedule).set(data)
              expotoken = "";
            db.collection("users").doc(thisid).get().then(function(doc) {
              expotoken = doc.data().Token;
              console.log("got token " + expotoken);

            if (expotoken !== undefined) {
              console.log("SENDING NOTIFICATION NEW GROUP MEAL REQUEST FROM " + userName + " to " + thisid);
            return fetch('https://exp.host/--/api/v2/push/send', {
              body: JSON.stringify({
                to: expotoken,
                //title: "title",
                body: `Group meal request from ${userName}!`,
                data: { message: `Group meal request from ${userName}!` },
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
            freetimeRef.get().then(function(doc) {
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
      });
      }
      }
      else {
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
                  console.log("SENDING NOTIFICATION NEW GROUP MEAL REQUEST FROM " + userName + " to " + thisid);
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
    }

    this.props.navigation.popToTop()

  }

  submitRequest = async () => {
    prevData = this.props.navigation.state.params
    let reschedule = prevData['reschedule'];
    let sent = prevData['sent'];
    if (prevData['mealID'] && reschedule) {
      const { status } = await Permissions.getAsync('calendar');
      if (status === 'granted') {
        let mealID = prevData['mealID'];
        Calendar.deleteEventAsync(mealID);
        db.collection('users').doc(userID).update({
          [`Calendar.${reschedule}`]:firebase.firestore.FieldValue.delete()
        })
      }
    }
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
                if (reschedule == undefined) {
                expotoken = "";
                db.collection("users").doc(thisid).get().then(function(doc) {
                  expotoken = doc.data().Token;
                  console.log("got token " + expotoken);

                if (expotoken !== undefined) {
                  console.log("SENDING NOTIFICATION NEW MEAL REQUEST FROM " + userName + " to " + thisid);
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
              }
          })
          .catch(function(error) {
              console.error("Error adding document: ", error);
          })
      if (reschedule !== undefined) {
        var strTime = "";
        console.log("RESCHEDULE: " + reschedule);
        if (sent == 2) { // meal being rescheduled
          prevMealRef = db.collection("users").doc(userID).collection('Meals').doc(reschedule)
          prevMealRef.get().then(function(doc) {
            prevMealRefData = doc.data();
            console.log(prevMealRefData);
            if (prevMealRefData && prevMealRefData['DateTime']) {
              weekday = weekdays[prevMealRefData['DateTime'].getDay()].day
              console.log(weekday)
              amPM = prevMealRefData['DateTime'].getHours() >= 12 ? "PM" : "AM"
              hours = (prevMealRefData['DateTime'].getHours() % 12 || 12) + ":" + ("0" + prevMealRefData['DateTime'].getMinutes()).slice(-2) + " " + amPM
              strTime = hours;
              index = data_flip[hours]
              console.log(hours)

              // update freetimes
              freetimeRef = db.collection("users").doc(userID).collection('Freetime').doc(weekday);
              freetimeRef.get().then(function(doc) {
                freetimeData = doc.data();
                freetimeData['Freetime'][index] = 1
                console.log(prevMealRefData['Length'])
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
                for (let memberid in prevData['members']) {
                  db.collection("users").doc(memberid).collection('Meals').doc(reschedule).delete()
                 if (memberid != userID) {
                  expotoken = "";
                db.collection("users").doc(memberid).get().then(function(doc) {
                  expotoken = doc.data().Token;
                  console.log("got token " + expotoken);

                if (expotoken !== undefined) {
                  console.log("SENDING NOTIFICATION NEW MEAL REQUEST FROM " + userName + " to " + memberid);
                return fetch('https://exp.host/--/api/v2/push/send', {
                  body: JSON.stringify({
                    to: expotoken,
                    //title: "title",
                    body: `${userName} wants to reschedule your meal on ${prevMealRefData['DateTime'].toDateString().substring(0,10) + " at " + strTime}!`,
                    data: { message: `${userName} wants to reschedule your meal on ${prevMealRefData['DateTime'].toDateString().substring(0,10) + " at " + strTime}!` },
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
              }).catch(function(error) {
                console.error("Error removing document: ", error);
              });
            }
          }).catch(function(error) {
            console.error("Error updating freetime: ", error);
          })
        }
        else if (sent == true) { // sent request being rescheduled
          db.collection("users").doc(userID).collection('Sent Requests').doc(reschedule).delete().then(() => {
            console.log("Document successfully deleted!");
            for (let thisid in prevData['members']) {
              db.collection("users").doc(thisid).collection('Received Requests').doc(reschedule).delete()
              expotoken = "";
                db.collection("users").doc(thisid).get().then(function(doc) {
                  expotoken = doc.data().Token;
                  console.log("got token " + expotoken);

                if (expotoken !== undefined) {
                  console.log("SENDING NOTIFICATION NEW MEAL REQUEST FROM " + userName + " to " + thisid);
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
          }).catch(function(error) {
            console.error("Error removing document: ", error);
          });
        }
        else { // received request being rescheduled
          db.collection("users").doc(userID).collection('Received Requests').doc(reschedule).delete().then(() => {
            console.log("Document successfully deleted!");
            db.collection("users").doc(Object.keys(prevData['members'])[0]).collection('Sent Requests').doc(reschedule).delete()
            expotoken = "";
                db.collection("users").doc(Object.keys(prevData['members'])[0]).get().then(function(doc) {
                  expotoken = doc.data().Token;
                  console.log("got token " + expotoken);

                if (expotoken !== undefined) {
                  console.log("SENDING NOTIFICATION NEW MEAL REQUEST FROM " + userName + " to " + Object.keys(prevData['members'])[0]);
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
          }).catch(function(error) {
            console.error("Error removing document: ", error);
          });
        }
      }
      else console.log("NOT RESCHEDULE");
      this.props.navigation.popToTop()
    }
  }
}
