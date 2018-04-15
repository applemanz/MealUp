import React from 'react';
import {
  ActivityIndicator,
  AsyncStorage,
  StatusBar,
  StyleSheet,
  View,
  Text,
  Image
} from 'react-native';
import { Facebook } from 'expo';
import {Button, SocialIcon, Divider} from 'react-native-elements';

import firebase from "../config/firebase";
const db = firebase.firestore();


// const auth = firebase.auth();
var provider = new firebase.auth.FacebookAuthProvider();
var userID;
var userName;
var userToken;

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday','Saturday','Sunday'];

export default class SignInScreen extends React.Component {
  static navigationOptions = {
  header: null,
  };

  componentWillMount() {
    const value = AsyncStorage.getItem('loggedIn');
      if (value === 'true') {
        console.log(value);
        this.props.navigation.navigate('Main');
      }
  }
  getFreeTimes = (id) => {
    return new Promise(resolve => {
      freetimes = new Object()
      db.collection("users").doc(id).collection('Freetime').get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            freetimes[doc.id] = doc.data().Freetime
          });
        resolve(freetimes);
      });
    })
  }

  //get users permission authorization (ret: facebook token)
  onSignInWithFacebook = async () => {
      const options = {permissions: ['public_profile', 'email', 'user_friends'],}
      const {type, token} = await Facebook.logInWithReadPermissionsAsync("159765391398008", options);
      if (type === 'success') {
        try {
          userToken = token;

          const response = await fetch(`https://graph.facebook.com/me?access_token=${token}&fields=id,name,friends`);
          const userData = await response.json();
          const friendsList = userData.friends.data;
          userName = userData.name;
          userID = userData.id;

          AsyncStorage.setItem('loggedIn', 'true');

          db.collection('users').doc(userID).get().then((doc) => {
              if (doc.exists) {
                  console.log("Document data:", doc.data());
              }
              // New user set up
              else {
                db.collection('users').doc(userID).set({
                  Name: userName,
                })
                .then(function() {
                console.log("Document successfully updated!");
                })

                // create free time arrays
                for (dofW of daysOfWeek) {
                  db.collection('users').doc(userID).collection('Freetime').doc(dofW).set({
                    Freetime: Array.from(Array(25), () => 0),
                  })
                  db.collection('users').doc(userID).collection('FreeFriends').doc(dofW).set({
                    DayOfWeek: dofW,
                  })
                }

                promises = []
                for (friend of friendsList) {
                  promises.push(this.getFreeTimes(friend.id))
                }

                Promise.all(promises).then((value)=>{
                  var friendsFreeTimes = value
                  console.log(friendsFreeTimes)
                  for (index in friendsList) {
                    var batch = db.batch();
                    for (dofW of daysOfWeek) {
                      for (i = 0; i < 25; i++) {
                        ref = db.collection('users').doc(userID).collection('FreeFriends').doc(dofW).collection(i.toString()).doc(friendsList[index].id)
                        console.log(friendsFreeTimes[index][dofW][i])
                        if (friendsFreeTimes[index][dofW][i] == 1) isFree = true
                        else isFree = false
                        batch.set(ref, {isFree: isFree})
                      }
                    }
                    // batch.commit().then(() => {})
                  }
                })


                //
                // friendFT = new Object()
                // friendFT.id = friend.id
                // friendFT.Freetime = new Object()
                // db.collection('users').doc(friend.id).collection('Freetime').get().then(function(querySnapshot) {
                //   querySnapshot.forEach(doc=>{
                //     friendFT.Freetime[doc.id] = doc.data().Freetime
                //   })
                //   friendsFreeTimes.push(friendFT)
                // })

                // create free friends collections & documents




              }
            }
          )

          for (var friend of friendsList) {
            let thisfriend = friend;
            db.collection('users').doc(userID).collection('Friends').doc(thisfriend.id).get().then((doc) => {
              if (!doc.exists) {
                console.log("Friend doesn't exist", thisfriend.name)
                // console.log(docRef.id)
                db.collection('users').doc(userID).collection('Friends').doc(thisfriend.id).set({
                  Name: thisfriend.name,
                  CanViewMe: true,
                  CanViewFriend: true,
                  numOfMeals: 0
                })
                console.log("Finish setting", thisfriend.name)
              }
              else {
                console.log("Friend exists", doc.data());
              }
            })
          }
          this.props.navigation.navigate('Main');

      }
     catch (error) {
       console.error(error);
     }
   }

  }


  // export function signInWithFacebook (fbToken, callback) {
  //     const credential = provider.credential(fbToken);
  //     auth.signInWithCredential(credential)
  //         .then((user) => getUser(user, callback))
  //         .catch((error) => callback(false, null, error));
  // }




  // Render any loading content that you like here
  render() {
    return (
      <View style={{flex:1, alignItems:'center', justifyContent:'center', backgroundColor:'#f4511e'}}>
        <Image source={require('../../assets/images/restaurant-cutlery-circular-symbol-of-a-spoon-and-a-fork-in-a-circle.png')}
                style={{height:250, width:250}}/>
        <Text style={{fontSize:40, fontWeight:'bold', marginTop:20, paddingBottom:10}}>MealUp</Text>
          <SocialIcon
            raised
            button
            type='facebook'
            style= {{width:250}}
            title='Sign In With Facebook'
            iconSize={20}
            onPress={this.onSignInWithFacebook}/>
            <Button title='Andrew' onPress={()=>{
              userID = '10210889686788547'
              userName = 'Andrew Zeng'
              this.props.navigation.navigate('Main')
            }}/>
            <Button title='Divi' onPress={()=>{
              userID = '1685311528229627'
              userName = 'Divyanshu Pachisia'
              this.props.navigation.navigate('Main')
            }}/>
            <Button title='Thomas' onPress={()=>{
              userID = '598952760450186'
              userName = 'Thomas Ferrante'
              this.props.navigation.navigate('Main')
            }}/>
      </View>
    );
  }
}

// docRef = db.collection('users').doc(userID).collection('Freetime').doc('Monday');
//
// docRef.get().then(function(doc) {
//     if (doc.exists) {
//         console.log("Document data:", doc.data());
//     } else {
//         console.log("No such document!");
//         for (dofW of daysOfWeek) {
//           db.collection('users').doc(userID).collection('Freetime').doc(dofW).set({
//             Freetime: Array.from(Array(25), () => 0),
//           })
//         }
//
//         console.log("I'm here 0")
//         // create new freeFriends object
//         freeFriends = new Object()
//         for (dofW of daysOfWeek) {
//           freeFriends[dofW] = {};
//           for (i = 0; i < 25; i++) {
//             freeFriends[dofW][i] = {}
//           }
//         }
//         console.log("I'm here 1")
//         // initialize freeFriends object
//         for (friend of friendsList) {
//           let thisfriend = friend;
//           db.collection('users').doc(thisfriend.id).collection('Freetime').get().then((querySnapshot) => {
//             console.log("I'm in then 1")
//             querySnapshot.forEach(function(doc) {
//               for (i = 0; i < 25; i++) {
//                 if (doc.data().Freetime[i] === 1) {
//                   freeFriends[doc.id][i][thisfriend.id] = true;
//                 }
//               }
//             })
//
//             // set freeFriends
//             for (dofW of daysOfWeek) {
//               db.collection('users').doc(userID).collection('NewFreeFriends').doc(dofW).set({
//                 Freefriends: freeFriends[dofW]
//               })
//             }
//             console.log("I'm here 2")
//             console.log("Freefriends", freeFriends)
//           })
//         }
//
//
//     }
// }).catch(function(error) {
//     console.log("Error getting document:", error);
// });

export {userName};
export {userID};
export {userToken};
