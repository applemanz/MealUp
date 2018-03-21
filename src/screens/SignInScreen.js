import React from 'react';
import {
  ActivityIndicator,
  AsyncStorage,
  StatusBar,
  StyleSheet,
  View,
  Text,
} from 'react-native';
import { Facebook } from 'expo';
import {Button, SocialIcon, Divider} from 'react-native-elements';

import firebase from "../config/firebase";
require("firebase/firestore");

const auth = firebase.auth();
const provider = firebase.auth.FacebookAuthProvider();

export default class SignInScreen extends React.Component {
  static navigationOptions = {
    title: 'MealUp Login',
  };

  constructor(props) {
    super(props);
  }

  componentWillMount() {
    const value = AsyncStorage.getItem('loggedIn');
      if (value === 'true') {
        console.log(value);
        this.props.navigation.navigate('Main');
      }
  }


  //get users permission authorization (ret: facebook token)
  onSignInWithFacebook = async () => {
      const options = {permissions: ['public_profile', 'email', 'user_friends'],}
      const {type, token} = await Facebook.logInWithReadPermissionsAsync("159765391398008", options);
      if (type === 'success') {
        try {
          AsyncStorage.setItem('userToken', token);

          const response = await fetch(`https://graph.facebook.com/me?access_token=${token}&fields=id,name,friends`);
          const userData = await response.json();
          const friendsList = userData.friends.data;
          const userName = userData.name;
          const userID = userData.id;
          console.log(userName);
          console.log(userID);

          AsyncStorage.setItem('loggedIn', 'true');
          const credential = provider.credential(token);
          auth.signInWithCredential(credential);

          const database = firebase.firestore();

          database.collection('newUsers').add({
            id: userID,
            name: userName,
          })
          .then(function(docRef) {
            console.log("Document wrriten with ID", docRef.iD);
          })
          .catch(function(error) {
          console.error("Error adding document: ", error);
          });

          this.props.navigation.navigate('Main');

          } catch (error) {
            console.error(error);
          }

      }
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
      <View >
        <View>
          <SocialIcon
            raised
            button
            type='facebook'
            title='LOGIN WITH FACEBOOK'
            iconSize={19}
            // style={[styles.containerView, styles.socialButton]}
            // fontStyle={styles.buttonText}
            onPress={this.onSignInWithFacebook}/>
        </View>
      </View>
    );
  }
}
