import React from 'react';
import { View, Image, Text, TouchableHighlight } from 'react-native';
import NavigationBar from 'navigationbar-react-native';
import { Avatar, Card, ListItem, Button } from 'react-native-elements';
import firebase from "../config/firebase";
import { userName, userID } from '../screens/SignInScreen';

const db = firebase.firestore();

export default class RequestByFriendScreen extends React.Component {

  state = {friends: []};

  componentDidMount() {
    friend = this.state.friends.slice(0);
    db.collection("users").doc(userID).collection('Friends').get().then((querySnapshot) => {
        querySnapshot.forEach(function(doc) {
            friend.push({Name: doc.data().Name, url:`http://graph.facebook.com/${doc.id}/picture?type=square`, id: doc.id})
        });
        this.setState({friends:friend});
    });
  }


  _onPress = (name, id, url) => {
    this.props.navigation.navigate('FriendChosen', {
      name: name,
      id: id,
      url:url
    });
  }


render() {
  console.log("in render")
  console.log(this.state.friends.length)
    return (
      <View>
      <NavigationBar componentLeft={<View style={{flex: 1}}><TouchableHighlight onPress={() => this.props.navigation.goBack()}><Text style={{fontSize: 15, color: 'white'}}>Back</Text></TouchableHighlight></View>} componentCenter={<View style={{flex: 1}}><Text style={{fontSize: 14, color: 'white'}}>Request By Friend</Text></View>}/>
      <Card containerStyle={{padding: 0}} >
       {
         this.state.friends.map((u, i) => {
           return (
             <ListItem
               key={i}
               roundAvatar
               title={u.Name}
               avatar={{uri:u.url}}
               onPress={() => this._onPress(u.Name,u.id, u.url)}
             />
           );
         })
       }
      </Card>
      </View>
    );
  }
}
