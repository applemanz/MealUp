import React from 'react';
import { View, Image, Text, TouchableHighlight } from 'react-native';
import NavigationBar from 'navigationbar-react-native';
import { Avatar, Card, ListItem, Button } from 'react-native-elements';
import firebase from "../config/firebase";
import { userName, userID } from '../screens/SignInScreen';


// const db = firebase.firestore();

export default class RequestByFriendFriendScreen extends React.Component {
  static navigationOptions = {
    title: 'Friends',
  };

//   componentWillMount() {
//     friends = []
//     db.collection("users").doc(userID).collection('Friends').get().then(function(querySnapshot) {
//         querySnapshot.forEach(function(doc) {
//             friends.push({Name: doc.data().Name, url:`http://graph.facebook.com/${doc.id}/picture?type=square`})
//         });
//     });
//   }

  render() {
    return (
      <View> 
      <NavigationBar componentLeft={<View style={{flex: 1}}><TouchableHighlight onPress={() => this.props.navigation.goBack()}><Text style={{fontSize: 15, color: 'white'}}>Back</Text></TouchableHighlight></View>} componentCenter={<View style={{flex: 1}}><Text style={{fontSize: 14, color: 'white'}}>Request By Friend</Text></View>}/>
      <TouchableHighlight onPress={() => this.props.navigation.navigate('FriendChosen')}><ListItem title={"Friend 1"}/></TouchableHighlight>
      <TouchableHighlight onPress={() => this.props.navigation.navigate('FriendChosen')}><ListItem title={"Friend 2"}/></TouchableHighlight>
      {/* <Card containerStyle={{padding: 0}} >
       {
         friends.map((u, i) => {
           return (
             <TouchableHighlight onPress={() => this.props.navigation.navigate('FriendChosen')}>
             <ListItem
               key={i}
               roundAvatar
               title={u.Name}
               avatar={{uri:u.url}}
             />
             </TouchableHighlight>
           );
         })
       }
      </Card> */}
      </View>
    );
  }
}