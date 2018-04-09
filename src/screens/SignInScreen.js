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

  //get users permission authorization (ret: facebook token)
  onSignInWithFacebook = async () => {
      // const options = {permissions: ['public_profile', 'email', 'user_friends'],}
      // const {type, token} = await Facebook.logInWithReadPermissionsAsync("159765391398008", options);
      // if (type === 'success') {
      //   try {
      //     userToken = token;
      //
      //     const response = await fetch(`https://graph.facebook.com/me?access_token=${token}&fields=id,name,friends`);
      //     const userData = await response.json();
      //     const friendsList = userData.friends.data;
      //     console.log(friendsList);
      //     userName = userData.name;
      //     userID = userData.id;
      //     console.log(userName);
      //     console.log(userID);
      //
      //     AsyncStorage.setItem('loggedIn', 'true');
      //
          // const originalSend = XMLHttpRequest.prototype.send;
          // XMLHttpRequest.prototype.send = function(body) {
          //   if (body === '') {
          //     originalSend.call(this);
          //   } else {
          //     originalSend.call(this, body);
          //   }
          // };
      //
      //     // const credential = provider.credential(token);
      //     // auth.signInWithCredential(credential);
      //     db.collection('users').doc(userID).set({
      //       Name: userName,
      //     }, { merge: true })
      //     .then(function() {
      //     console.log("Document successfully updated!");
      //     })
      //     .catch(function(error) {
      //     // The document probably doesn't exist.
      //     console.error("Error updating document: ", error);
      //     });
      //
      //     for (var friend of friendsList) {
      //       db.collection('users').doc(userID).collection('Friends').doc(friend.id).set({
      //         Name: friend.name,
      //         CanViewMe: true,
      //         CanViewFriend: true,
      //         numOfMeals: 0
      //       })
      //     }
      //     daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday','Saturday','Sunday'];
      //
      //     var docRef = db.collection('users').doc(userID).collection('Freetime').doc('Monday');
      //
      //     docRef.get().then(function(doc) {
      //         if (doc.exists) {
      //             console.log("Document data:", doc.data());
      //         } else {
      //             console.log("No such document!");
      //             for (dofW of daysOfWeek) {
      //               db.collection('users').doc(userID).collection('Freetime').doc(dofW).set({
      //                 Freetime: Array.from(Array(25), () => false),
      //               })
      //             }
      //         }
      //     }).catch(function(error) {
      //         console.log("Error getting document:", error);
      //     });

          userID = '10210889686788547'
          userName = 'Andrew Zeng'
          this.props.navigation.navigate('Main');
      //
      //     } catch (error) {
      //       console.error(error);
      //     }
      //
      // }
  };


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
      </View>
    );
  }
}

export {userName};
export {userID};
export {userToken};
