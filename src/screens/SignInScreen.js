import React from 'react';
import {
  ActivityIndicator,
  AsyncStorage,
  StatusBar,
  StyleSheet,
  View,
  Text,
  Image,
  Alert
} from 'react-native';
import { Facebook, AppLoading,Permissions, Notifications } from 'expo';
import {Button, SocialIcon, Divider} from 'react-native-elements';

import firebase from "../config/firebase";
const db = firebase.firestore();
var userID;
var userName;
var userToken;
daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday','Saturday','Sunday'];

export default class SignInScreen extends React.Component {
  static navigationOptions = {
  header: null,
  };

  state = {}
  firstTime = false

  async componentWillMount() {
    // registerForPushNotificationsAsync();
    // Notifications.addListener(this._handleNotification);

    AsyncStorage.multiGet(['loggedIn', 'userID', 'userName', 'userToken'], (err, stores) => {
       let userInfo = stores.map((result) => {
         // get at each store's key/value so you can work with it
         return result[1]
       });
       console.log(userInfo)
       if (userInfo[0]==='true') {
         userID = userInfo[1]
         userName = userInfo[2]
         userToken = userInfo[3]
         this.setState({loggedIn:true})
         this.props.navigation.navigate('Main');
       }
       else {
         this.setState({loggedIn:false})
       }

     });
  }

  //get users permission authorization (ret: facebook token)
  onSignInWithFacebook = async () => {
    const options = {permissions: ['public_profile', 'email', 'user_friends']};
    const {type, token} = await Facebook.logInWithReadPermissionsAsync("159765391398008", options);
    if (type === 'success') {
      try {
        userToken = token;
        console.log(`token is ${token}`)
        const response = await fetch(`https://graph.facebook.com/me?access_token=${token}&fields=id,name,friends`);
        const userData = await response.json();
        const friendsList = userData.friends.data;
        userName = userData.name;
        userID = userData.id;
        try {
          await AsyncStorage.multiSet([['loggedIn', 'true'],['userID',userID],['userName', userName],['userToken', token]]);
        }
        catch (error) {
          console.log('error storing loggedIn')
        }

        db.collection('users').doc(userID).get().then((doc) => {
          if (!doc.exists) {
            this.firstTime = true
            console.log("First time visit");

            db.collection('users').doc(userID).set({
              Name: userName,
            }, { merge: true })
            .catch(function(error) {
            console.error("Error updating document: ", error);
            });

          }
          else {
            this.props.navigation.navigate('Main');
          }
        }).catch(function(error) {
          console.log("error detecting if doc exists", error);
        });

        for (var friend of friendsList) {
          let thisfriend = friend;
          db.collection('users').doc(userID).collection('Friends').doc(thisfriend.id).get().then(function(doc) {
            if (!doc.exists) {
              console.log("Friend doesn't exist", thisfriend.name)
              db.collection('users').doc(userID).collection('Friends').doc(thisfriend.id).set({
                Name: thisfriend.name,
                CanViewMe: true,
                CanViewFriend: true,
                numOfMeals: 0
              })
            }
          })
        }

        docRef = db.collection('users').doc(userID).collection('Freetime').doc('Monday');
        docRef.get().then((doc) => {
            if (doc.exists) {
              this.props.navigation.navigate('Main');
            }
            else {
              this.firstTime = true

              // initialize Freetimes
              for (dofW of daysOfWeek) {
                  db.collection('users').doc(userID).collection('Freetime').doc(dofW).set({
                    Freetime: Array.from(Array(25), () => 0),
                  })
                }

              // initialize  freeFriends and hasFreeFriends
              freeFriends = new Object()
              hasFreeFriends = new Object()
              for (dofW of daysOfWeek) {
                  freeFriends[dofW] = {};
                  hasFreeFriends[dofW] = {};
                  for (i = 0; i < 25; i++) {
                    freeFriends[dofW][i] = {}
                    hasFreeFriends[dofW][i] = false;
                  }
                }

              // populate freeFriends
              for (friend of friendsList) {
                  let thisfriend = friend;
                  db.collection('users').doc(thisfriend.id).collection('Freetime').get().then((querySnapshot) => {
                    // console.log("I'm in then 1")
                    querySnapshot.forEach(function(doc) {
                      for (i = 0; i < 25; i++) {
                        if (doc.data().Freetime[i] === 1) {
                          freeFriends[doc.id][i][thisfriend.id] = true;
                          hasFreeFriends[doc.id][i] = true;
                        }
                      }
                    })

                    // set freeFriends
                    for (dofW of daysOfWeek) {
                      db.collection('users').doc(userID).collection('FreeFriends').doc(dofW).set({
                        Freefriends: freeFriends[dofW]
                      })
                      db.collection('users').doc(userID).collection('hasFreeFriends').doc(dofW).set({
                        hasFreeFriends: hasFreeFriends[dofW]
                      })
                    }
                    // console.log("I'm here 2")
                    // console.log("Freefriends", freeFriends)
                  })
                }

              registerForPushNotificationsAsync();
              Notifications.addListener(this._handleNotification);
              this.props.navigation.navigate('FirstTime');
            }
        }).catch(function(error) {
            console.log("Error getting document:", error);
        });
      }
      catch (error) {
        console.error(error);
      }
    }
  };

  async registerForPushNotificationsAsync() {
    const { status: existingStatus } = await Permissions.getAsync(
      Permissions.NOTIFICATIONS
    );
    let finalStatus = existingStatus;

    // only ask if permissions have not already been determined, because
    // iOS won't necessarily prompt the user a second time.
    if (existingStatus !== 'granted') {
      // Android remote notification permissions are granted during the app
      // install, so this will only ask on iOS
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      finalStatus = status;
    }

    // Stop here if the user did not grant permissions
    if (finalStatus !== 'granted') {
      return;
    }

    // Get the token that uniquely identifies this device
    let expoToken = await Notifications.getExpoPushTokenAsync();
    console.log(expoToken);

    db.collection('users').doc(userID).set({
      Token: expoToken,
    }, { merge: true })
    .then(function() {
    console.log("Document successfully updated!");
    })
    .catch(function(error) {
    // The document probably doesn't exist.
    console.error("Error updating document: ", error);
    });
  }

  _handleNotification = (notification) => {
    console.log("origin " + notification.origin);
    console.log("data " + notification.data);
    Alert.alert(notification.data.message);
  }

  render() {
    if (this.state.loggedIn === false) {
      return (
        <View style={{flex:1, alignItems:'center', justifyContent:'center', backgroundColor:'#f4511e'}}>
          <Image source={require('../../assets/images/signin_logo_circle.png')}
                  style={{height:250, width:250}}/>
          <Text style={{fontSize:40, fontWeight:'bold', marginTop:20, paddingBottom:10, color:'#fff'}}>MealUp</Text>
            <SocialIcon
              raised
              button
              type='facebook'
              style= {{width:250, marginTop: 60}}
              title='Sign In With Facebook'
              iconSize={20}
              onPress={this.onSignInWithFacebook}/>
              {/* <Button title='Andrew' onPress={()=>{
                userID = '10210889686788547'
                userName = 'Andrew Zeng'
                // this.props.navigation.navigate('Main')
                firstTime = true
                if (firstTime == true) {
                  console.log("true")
                  this.props.navigation.navigate('FirstTime');
                } else {
                  console.log("false")
                  this.props.navigation.navigate('Main');
                }
              }}/>
              <Button title='TestUser' onPress={()=>{
                userID = '129522174550269'
                userName = 'Meal Up'
                this.props.navigation.navigate('Main')
              }}/>
              <Button title='Thomas' onPress={()=>{
                userID = '598952760450186'
                userName = 'Thomas Ferrante'
                this.props.navigation.navigate('Main')
              }}/> */}

        </View>
      );

    }
    else {
      return (
        <AppLoading/>
      )
    }
  }

}

export {userName};
export {userID};
export {userToken};
